import { makeSpriteAppearance } from "./sprite-appearance.js?v=dragon-path-4";
import { ARENA, heroPoint, clamp } from "./battle-geometry.js?v=dragon-path-4";
import { drawEnemyEffects } from "./enemy-effects.js?v=dragon-path-4";
import { warriorPose as suppliedWarriorPose } from "./warrior-effects.js?v=dragon-path-4";
import { blastPose } from "./mage-blast.js?v=dragon-path-4";

export class HeroActor {
  constructor(scene, definition, masterKey, { reducedMotion = false, appearance = { skin:"medium", hair:"brown", eyes:"blue" } } = {}) {
    this.scene = scene;
    this.definition = definition;
    this.metadata = definition.views.back;
    this.reducedMotion = reducedMotion;
    this.x = ARENA.heroX;
    this.y = ARENA.floor;
    this.scale =
      ARENA.heroHeight / (this.metadata.anchor[1] - this.metadata.topY);
    this.height = ARENA.heroHeight;
    this.elapsed = 0;
    this.motion = "idle";
    this.disposed = false;
    const texture = makeSpriteAppearance(
      scene,
      masterKey,
      "daily-hero-rear",
      this.metadata,
      appearance,
    );
    this.width = texture.width * this.scale;
    this.shadow = scene.add
      .ellipse(
        this.x,
        this.y + 4,
        ARENA.heroShadowWidth,
        ARENA.heroShadowHeight,
        0x081919,
        0.38,
      )
      .setDepth(2);
    const origin = [
      this.metadata.anchor[0] / texture.width,
      this.metadata.anchor[1] / texture.height,
    ];
    this.sprite = scene.add
      .image(this.x, this.y, texture.key)
      .setOrigin(...origin)
      .setDepth(5);
    this.flash = scene.add
      .image(this.x, this.y, texture.key)
      .setOrigin(...origin)
      .setTint(0xff5555)
      .setTintMode(globalThis.Phaser.TintModes.FILL)
      .setAlpha(0)
      .setDepth(6);
    this.effects = scene.add.graphics().setDepth(9);
    this.listener = (_time, delta) => this.update(delta);
    scene.events.on("update", this.listener);
    this.render();
  }
  get duration() {
    return { idle: 2400, attack: this.definition.class === 'mage' ? 2100 : 1900, hurt: 1050, heal: 1800 }[this.motion];
  }
  get target() {
    return { x: this.x, y: this.y - this.height * 0.5 };
  }
  play(motion, { onComplete, onImpact, target } = {}) {
    if (this.disposed) return;
    this.motion = motion;
    this.elapsed = 0;
    this.onComplete = onComplete;
    this.onImpact = onImpact;
    this.attackTarget = target;
    this.impactSent = false;
    this.render();
  }
  update(delta) {
    if (this.disposed || (this.reducedMotion && this.motion === "idle")) return;
    this.elapsed += Math.max(0, Math.min(delta, 100));
    if (
      this.motion === "attack" &&
      !this.impactSent &&
      this.elapsed >= this.duration * 0.63
    ) {
      this.impactSent = true;
      this.onImpact?.();
    }
    if (this.elapsed >= this.duration) {
      if (this.motion === "idle") this.elapsed %= this.duration;
      else {
        const complete = this.onComplete;
        this.play("idle");
        complete?.();
        return;
      }
    }
    this.render();
  }
  render() {
    const p = clamp(this.elapsed / this.duration),
      wave = Math.sin(p * Math.PI * 2);
    let pose = { x: 0, y: 0, angle: 0 },
      flash = 0;
    if (this.motion === "attack") {
      const authored = this.definition.class === 'mage' ? blastPose(p) : suppliedWarriorPose(p, this.metadata.weaponKind);
      pose = { x: authored.rootX, y: authored.rootY, angle: authored.rootAngle };
    }
    else if (this.motion === "hurt") {
      const strength = Math.sin(p * Math.PI) * (1 - p);
      pose = {
        x: -Math.sin(p * Math.PI * 10) * 5 * strength,
        y: 0,
        angle: -3 * strength,
      };
      flash = Math.pow(Math.abs(Math.sin(p * Math.PI * 3)), 3.2) * 0.8;
    } else if (this.motion === "heal") pose.y = -5 * Math.sin(p * Math.PI);
    else if (!this.reducedMotion)
      pose = { x: wave * 0.45, y: wave * 0.6, angle: wave * 0.14 };
    // The authored rear faces left. Negative X scale reflects rear, foot registration
    // and weapon origin together; this is never a front sprite used as a fake back.
    const transform = {
      x: this.x + pose.x,
      y: this.y + pose.y,
      angle: pose.angle,
      scaleX: -this.scale,
      scaleY: this.scale,
    };
    for (const sprite of [this.sprite, this.flash])
      sprite
        .setPosition(transform.x, transform.y)
        .setAngle(transform.angle)
        .setScale(transform.scaleX, transform.scaleY);
    this.flash.setAlpha(flash);
    const origin = heroPoint(
      this.metadata.weaponTip || this.metadata.staffTip,
      this.metadata.anchor,
      transform,
    );
    drawEnemyEffects(
      this.effects,
      this.motion,
      this.elapsed,
      { attackStyle: this.definition.class === 'mage' ? 'spell' : /spear|pike|lance|polearm|trident/i.test(this.metadata.weaponKind || '') ? 'thrust' : 'slash', effectColor: this.definition.alignment === 'dark' ? '#c278ff' : this.definition.family === 'Starfire' ? '#ffac42' : this.definition.class === 'mage' ? '#46caff' : '#ffd080', isBoss: false },
      {
        x: transform.x,
        y: transform.y,
        width: this.width,
        height: this.height,
        origin,
        duration: this.duration,
        target: this.attackTarget,
      },
    );
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.scene.events.off("update", this.listener);
    for (const item of [this.sprite, this.flash, this.shadow, this.effects])
      item.destroy();
  }
}
