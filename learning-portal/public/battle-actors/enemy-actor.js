import {
  MOTIONS,
  clamp,
  durationFor,
  poseAt,
  validateDefinition,
} from "./motion.js?v=dragon-path-5";
import { drawEnemyEffects } from "./enemy-effects.js?v=dragon-path-5";
import { enemyFacing } from "./battle-geometry.js?v=dragon-path-5";
const gameAssets = new WeakMap();
let serial = 0;
async function acquire(scene, url, bounds) {
  let entries = gameAssets.get(scene.game);
  if (!entries) {
    entries = new Map();
    gameAssets.set(scene.game, entries);
  }
  let entry = entries.get(url);
  if (!entry) {
    entry = { key: `dw-enemy-${++serial}`, refs: 0 };
    entries.set(url, entry);
    entry.ready = new Promise((resolve, reject) => {
      const img = new Image();
      let settled = false;
      const finish = (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        img.onload = img.onerror = null;
        error ? reject(error) : resolve(img);
      };
      const timer = setTimeout(
        () => finish(new Error("Enemy image timeout")),
        8000,
      );
      img.onload = () => finish();
      img.onerror = () =>
        finish(new Error(`Enemy image could not load: ${url}`));
      img.src = url;
    }).then((img) => {
      if (
        !scene.sys?.settings ||
        !scene.sys.isActive() ||
        !scene.game?.textures
      )
        throw new Error("Enemy scene closed while loading");
      if (
        bounds.x + bounds.width > img.naturalWidth ||
        bounds.y + bounds.height > img.naturalHeight
      )
        throw new Error(`Sprite bounds exceed source: ${url}`);
      const texture = scene.game?.textures.addImage(entry.key, img);
      texture.add("body", 0, bounds.x, bounds.y, bounds.width, bounds.height);
      return texture;
    });
  }
  entry.refs++;
  const release = () => {
    if (--entry.refs === 0) {
      if (scene.game?.textures?.exists(entry.key))
        scene.game?.textures.remove(entry.key);
      if (entries.get(url) === entry) entries.delete(url);
    }
  };
  try {
    await entry.ready;
    return { key: entry.key, release };
  } catch (error) {
    release();
    throw error;
  }
}
/** Load one complete enemy sprite. Play animation without a separate frame sheet. */
export async function createEnemyActor(scene, definition, options = {}) {
  validateDefinition(definition);
  const url = new URL(
    definition.path,
    options.assetBase || new URL("../", import.meta.url),
  ).href;
  const asset = await acquire(scene, url, definition.bounds);
  if (!scene.sys?.settings || !scene.sys.isActive()) {
    asset.release();
    throw new Error("Enemy scene is no longer active");
  }
  return new EnemyActor(scene, definition, asset, options);
}
class EnemyActor {
  constructor(scene, definition, asset, options) {
    this.facing = enemyFacing(definition, options.direction ?? -1);
    this.reducedMotion = Boolean(options.reducedMotion);
    this.scene = scene;
    this.definition = definition;
    this.asset = asset;
    this.options = options;
    this.disposed = false;
    this.x = options.x ?? 330;
    this.y = options.y ?? 510;
    const b = definition.bounds;
    this.scale = Math.min(
      (options.height ?? 410) / b.height,
      (options.maxWidth ?? 390) / b.width,
    );
    this.width = b.width * this.scale;
    this.height = b.height * this.scale;
    this.shadow = scene.add
      .ellipse(this.x, this.y + 6, this.width * 0.61, 22, 0x07141d, 0.37)
      .setDepth(options.depth ?? 0);
    this.sprite = scene.add
      .image(this.x, this.y, asset.key, "body")
      .setOrigin(0.5, 1)
      .setScale(this.scale)
      .setDepth((options.depth ?? 0) + 1);
    this.flash = scene.add
      .image(this.x, this.y, asset.key, "body")
      .setOrigin(0.5, 1)
      .setScale(this.scale)
      .setTint(0xff3e45)
      .setTintMode(globalThis.Phaser.TintModes.FILL)
      .setAlpha(0)
      .setDepth((options.depth ?? 0) + 2);
    this.effects = scene.add.graphics().setDepth((options.depth ?? 0) + 3);
    this.elapsed = 0;
    this.motion = "idle";
    this.loop = true;
    this.paused = false;
    this.speed = 1;
    this.impactSent = false;
    this.completeSent = false;
    this.listener = (_time, delta) => this.update(delta);
    scene.events.on("update", this.listener);
    this.shutdown = () => this.dispose();
    scene.events.once("shutdown", this.shutdown);
    this.render();
  }
  get duration() {
    return durationFor(this.motion, this.definition.attackStyle);
  }
  get progress() {
    return clamp(this.elapsed / this.duration);
  }
  play(
    motion,
    { loop = motion === "idle", onComplete, onImpact, target } = {},
  ) {
    if (this.disposed) throw new Error("Enemy actor was disposed");
    if (!MOTIONS.includes(motion))
      throw new Error(`Unknown enemy motion: ${motion}`);
    this.motion = motion;
    this.loop = loop;
    this.elapsed = 0;
    this.impactSent = false;
    this.completeSent = false;
    this.onComplete = onComplete;
    this.onImpact = onImpact;
    this.target = target;
    this.render();
    return this;
  }
  seek(progress) {
    this.elapsed = clamp(progress) * this.duration;
    this.render();
    return this;
  }
  setPaused(value) {
    this.paused = Boolean(value);
    return this;
  }
  update(delta) {
    if (
      this.disposed ||
      this.paused ||
      (this.reducedMotion && this.motion === "idle")
    )
      return;
    this.elapsed += Math.max(0, Math.min(delta, 100)) * this.speed;
    const p = this.progress;
    if (this.motion === "attack" && !this.impactSent && p >= 0.63) {
      this.impactSent = true;
      (this.onImpact || this.options.onImpact)?.(this.definition);
    }
    if (this.elapsed >= this.duration) {
      if (this.loop) {
        this.elapsed %= this.duration;
        this.impactSent = false;
        this.completeSent = false;
      } else {
        this.elapsed = this.duration;
        if (!this.completeSent) {
          this.completeSent = true;
          const callback = this.onComplete;
          this.render();
          callback?.(this);
          return;
        }
      }
    }
    this.render();
  }
  render() {
    if (this.disposed) return;
    const d = this.definition,
      pose = poseAt(
        this.motion,
        this.reducedMotion && this.motion === "idle" ? 0 : this.elapsed,
        d,
      );
    pose.x *= this.facing;
    pose.angle *= this.facing;
    const a = (pose.angle * Math.PI) / 180;
    const px = this.x + pose.x,
      py = this.y + pose.y;
    for (const sprite of [this.sprite, this.flash])
      sprite
        .setPosition(px, py)
        .setScale(
          this.scale * this.facing * pose.scaleX,
          this.scale * pose.scaleY,
        )
        .setAngle(pose.angle);
    this.flash.setAlpha(pose.red);
    this.shadow.setScale(1 - pose.y * 0.002).setAlpha(d.floating ? 0.25 : 0.37);
    const lx =
        (d.effectOrigin.x - 0.5) * this.width * pose.scaleX * this.facing,
      ly = (d.effectOrigin.y - 1) * this.height * pose.scaleY;
    const origin = {
      x: px + lx * Math.cos(a) - ly * Math.sin(a),
      y: py + lx * Math.sin(a) + ly * Math.cos(a),
    };
    drawEnemyEffects(this.effects, this.motion, this.elapsed, d, {
      x: px,
      y: py,
      width: this.width,
      height: this.height,
      origin,
      duration: this.duration,
      target: this.target,
    });
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.scene.events.off("update", this.listener);
    this.scene.events.off("shutdown", this.shutdown);
    this.sprite.destroy();
    this.flash.destroy();
    this.shadow.destroy();
    this.effects.destroy();
    this.asset.release();
  }
}
