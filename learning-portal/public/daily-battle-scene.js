// Optional presentation layer: no answers, grading, HP, rewards or profile writes.
import { loadActorSelection, actorPalette } from "./battle-actors/actor-selection.js?v=dragon-path-9";
import { publicResources } from "./public-resources.js?v=dragon-path-9";
import { createPetActor } from "./battle-actors/pet-actor.js?v=dragon-path-9";
import { HeroActor } from "./battle-actors/hero-actor.js?v=dragon-path-9";
import { createEnemyActor } from "./battle-actors/enemy-actor.js?v=dragon-path-9";
import {
  prepareSpritePixels,
  recolorSpritePixels,
} from "./battle-actors/sprite-appearance.js?v=dragon-path-9";
import {
  ARENA,
  arenaBackgroundFrame,
  enemyFacing,
} from "./battle-actors/battle-geometry.js?v=dragon-path-9";

const PHASER_URL = "/Dragonswood/learning-portal/public/vendor/phaser-4.2.1.min.js";
const PHASER_INTEGRITY = "sha256-ZjSLG1FB5Jt9XrvmiM3ctQLqscsA8hxThoalssWr5N4=";
const ASSET_BASE = "/Dragonswood/learning-portal/public/assets/daily-battle/";
let libraryPromise,
  manifestPromise,
  serial = 0;

function phaserLibrary() {
  if (window.Phaser?.VERSION === "4.2.1") return Promise.resolve(window.Phaser);
  if (libraryPromise) return libraryPromise;
  libraryPromise = new Promise((resolve, reject) => {
    // CCF may already be loading this exact vendored library. Attach to its tag.
    let script = [...document.scripts].find(
      (item) => new URL(item.src || location.href).pathname === PHASER_URL,
    );
    const owned = !script;
    if (!script) {
      script = document.createElement("script");
      script.src = PHASER_URL;
      script.integrity = PHASER_INTEGRITY;
      script.async = true;
    }
    let done = false;
    const finish = (error) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      script.removeEventListener("load", onload);
      script.removeEventListener("error", onerror);
      if (error) {
        if (owned) script.remove();
        reject(error);
      } else resolve(window.Phaser);
    };
    const onload = () =>
      finish(
        window.Phaser?.VERSION === "4.2.1"
          ? null
          : new Error("Unexpected battle engine version"),
      );
    const onerror = () => finish(new Error("Battle engine unavailable"));
    const timer = setTimeout(
      () => finish(new Error("Battle engine load timed out")),
      8000,
    );
    script.addEventListener("load", onload);
    script.addEventListener("error", onerror);
    if (owned) document.head.append(script);
  }).catch((error) => {
    libraryPromise = null;
    throw error;
  });
  return libraryPromise;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    let done = false;
    const finish = (error) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      image.onload = image.onerror = null;
      error ? reject(error) : resolve(image);
    };
    const timer = setTimeout(
      () => finish(new Error("Battle artwork timed out")),
      8000,
    );
    image.onload = () => finish();
    image.onerror = () => finish(new Error("Battle artwork unavailable"));
    image.src = url;
  });
}

function enemyManifest() {
  if (!manifestPromise)
    manifestPromise = fetch(`${ASSET_BASE}enemy-manifest.json`, {
      signal: AbortSignal.timeout(8000),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Enemy collection unavailable");
        return response.json();
      })
      .then((data) => publicResources(data))
      .then((data) => new Map(data.enemies.map((enemy) => [enemy.id, enemy])))
      .catch((error) => {
        manifestPromise = null;
        throw error;
      });
  return manifestPromise;
}

/**
 * root is an empty, dedicated stage element. All questions/status stay in HTML.
 * play returns after presentation finishes or is safely skipped/cancelled.
 * A failure leaves a still illustration; it never prevents the next question.
 */
export async function mountDailyBattleScene({
  root,
  enemyId = "briar-goblin-scout",
  heroId, petId, appearance,
  reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")
    .matches ?? true,
} = {}) {
  if (!(root instanceof HTMLElement))
    throw new TypeError("Daily Battle needs a stage element");
  const palette = actorPalette(appearance);
  let disposed = false,
    game,
    scene,
    hero,
    pet,
    heroDefinition, petDefinition, petImage,
    enemy,
    enemies,
    swapEpoch = 0;
  let currentId = enemyId,
    activeMotion,
    bootTimer,
    backgroundImage,
    heroMaster,
    fallbackHero;
  let bootReject, resizeObserver, visibilityObserver, offscreen = false;
  const wrapper = document.createElement("div");
  wrapper.className = "daily-battle-scenery";
  Object.assign(wrapper.style, {
    position: "relative",
    width: "100%",
    aspectRatio: `${ARENA.width} / ${ARENA.height}`,
    overflow: "hidden",
    background: `#122c29 url("${ASSET_BASE}forest-arena.png") center / cover no-repeat`,
    isolation: "isolate",
  });
  const still = document.createElement("canvas");
  still.width = ARENA.width;
  still.height = ARENA.height;
  still.setAttribute("aria-hidden", "true");
  Object.assign(still.style, {
    position: "absolute",
    inset: "0",
    width: "100%",
    height: "100%",
  });
  const gameRoot = document.createElement("div");
  Object.assign(gameRoot.style, { position: "absolute", inset: "0" });
  wrapper.append(still, gameRoot);
  root.append(wrapper);
  root.dataset.sceneState = "loading";
  wrapper.setAttribute("role", "img");
  const describe = () =>
    wrapper.setAttribute(
      "aria-label",
      `Forest ruins battle arena. ${heroDefinition?.family || "Your adventurer"} stands on the left${petDefinition ? ` with ${petDefinition.name} beside them` : ""}, facing ${enemies?.get(currentId)?.name || "the creature"} on the right.`,
    );
  describe();

  const settleMotion = () => {
    if (!activeMotion) return;
    const active = activeMotion;
    activeMotion = null;
    clearTimeout(active.timer);
    if (!disposed) {
      hero?.play("idle");
      pet?.play("idle");
      enemy?.play("idle");
    }
    active.resolve();
  };
  const destroyGame = () => {
    resizeObserver?.disconnect();
    resizeObserver = null;
    clearTimeout(bootTimer);
    settleMotion();
    hero?.dispose();
    pet?.dispose();
    enemy?.dispose();
    hero = pet = enemy = scene = null;
    if (game) {
      const previous = game;
      game = null;
      previous.destroy(true);
    }
  };
  const visibility = () => {
    if (document.hidden || offscreen) {
      settleMotion();
      scene?.scene.pause();
    } else if (scene?.sys.isPaused()) scene.scene.resume();
  };
  document.addEventListener("visibilitychange", visibility);
  if (typeof IntersectionObserver === 'function') {
    visibilityObserver = new IntersectionObserver(entries => {
      offscreen = !entries[0]?.isIntersecting;
      visibility();
    });
    visibilityObserver.observe(wrapper);
  }

  function prepareStillHero() {
    if (fallbackHero || !heroMaster) return;
    const metadata = heroDefinition.views.back,
      [x, y, width, height] = metadata.frame || [0, 0, heroMaster.naturalWidth, heroMaster.naturalHeight];
    fallbackHero = document.createElement("canvas");
    fallbackHero.width = width;
    fallbackHero.height = height;
    const context = fallbackHero.getContext("2d", { willReadFrequently: true });
    context.drawImage(heroMaster, x, y, width, height, 0, 0, width, height);
    const data = context.getImageData(0, 0, width, height);
    data.data.set(
      recolorSpritePixels(
        prepareSpritePixels(data.data, width, height, metadata),
        palette,
      ),
    );
    context.putImageData(data, 0, 0);
  }
  async function drawStill(id, epoch = swapEpoch) {
    const definition = enemies?.get(id);
    if (!definition || disposed) return;
    if (disposed || epoch !== swapEpoch) return;
    prepareStillHero();
    const context = still.getContext("2d");
    context.clearRect(0, 0, ARENA.width, ARENA.height);
    if (backgroundImage) {
      const background = arenaBackgroundFrame(
        backgroundImage.naturalWidth,
        backgroundImage.naturalHeight,
      );
      context.drawImage(
        backgroundImage,
        background.x,
        background.y,
        background.width,
        background.height,
      );
    }
    const shadow = (x, width) => {
      context.fillStyle = "#08191960";
      context.beginPath();
      context.ellipse(
        x,
        ARENA.floor + 4,
        width / 2,
        ARENA.heroShadowHeight / 2,
        0,
        0,
        Math.PI * 2,
      );
      context.fill();
    };
    shadow(ARENA.heroX, ARENA.heroShadowWidth);
    const m = heroDefinition.views.back,
      scale = ARENA.heroHeight / (m.anchor[1] - m.topY);
    if (fallbackHero) {
      context.save();
      context.translate(ARENA.heroX, ARENA.floor);
      context.scale(-scale, scale);
      context.drawImage(fallbackHero, -m.anchor[0], -m.anchor[1]);
      context.restore();
    }
    if (petDefinition && petImage) {
      const b = petDefinition.views.front.bounds;
      const scale = Math.min(ARENA.petHeight / b.height, ARENA.petMaxWidth / b.width);
      shadow(ARENA.petX, b.width * scale * 0.61);
      context.drawImage(petImage, b.x, b.y, b.width, b.height,
        ARENA.petX - b.width * scale / 2, ARENA.floor - b.height * scale,
        b.width * scale, b.height * scale);
    }
    // Keep the selected hero visible even if this enemy image cannot load.
    const image = await loadImage(definition.path);
    if (disposed || epoch !== swapEpoch) return;
    const b = definition.bounds,
      factor = Math.min(
        (definition.isBoss ? ARENA.bossHeight : ARENA.enemyHeight) / b.height,
        ARENA.enemyMaxWidth / b.width,
      );
    shadow(ARENA.enemyX, b.width * factor * 0.61);
    context.save();
    context.translate(ARENA.enemyX, ARENA.floor);
    context.scale(enemyFacing(definition), 1);
    context.drawImage(
      image,
      b.x,
      b.y,
      b.width,
      b.height,
      (-b.width * factor) / 2,
      -b.height * factor,
      b.width * factor,
      b.height * factor,
    );
    context.restore();
  }

  const controller = {
    async play(outcome) {
      if (!["correct", "incorrect", "recovery"].includes(outcome))
        throw new TypeError("Unknown battle presentation");
      settleMotion();
      if (disposed || reducedMotion || document.hidden || offscreen || !hero || !enemy)
        return;
      return new Promise((resolve) => {
        const token = {
          resolve,
          timer: setTimeout(() => {
            if (activeMotion === token) settleMotion();
          }, 4200),
        };
        activeMotion = token;
        const valid = () => activeMotion === token && !disposed;
        const complete = () => {
          if (valid()) settleMotion();
        };
        const actorMotion = (actor, motion, options = {}) => new Promise(done => {
          if (!actor) return done();
          actor.play(motion, { ...options, onComplete: done });
        });
        const target = { x: enemy.x, y: enemy.y - enemy.height * 0.5 };
        if (outcome === "recovery") {
          Promise.all([actorMotion(hero, "heal"), actorMotion(pet, "heal")]).then(complete);
        } else if (outcome === "correct") {
          let reaction = Promise.resolve();
          Promise.all([
            actorMotion(hero, "attack", { target, onImpact: () => {
              if (valid()) reaction = actorMotion(enemy, "hurt");
            }}),
            actorMotion(pet, "attack", { target }),
          ]).then(() => reaction).then(complete);
        } else {
          let reaction = Promise.resolve();
          actorMotion(enemy, "attack", { target: hero.target, onImpact: () => {
            if (valid()) reaction = Promise.all([actorMotion(hero, "hurt"), actorMotion(pet, "hurt")]);
          }}).then(() => reaction).then(complete);
        }
      });
    },
    async setEnemy(id) {
      if (disposed) return;
      const definition = enemies?.get(id);
      if (!definition) throw new TypeError("Unknown enemy");
      if (id === currentId && enemy) return;
      settleMotion();
      currentId = id;
      describe();
      const epoch = ++swapEpoch;
      const stillTask = drawStill(id, epoch).catch(() => {});
      if (scene) {
        try {
          const next = await createEnemyActor(scene, definition, {
            x: ARENA.enemyX,
            y: ARENA.floor,
            height: definition.isBoss ? ARENA.bossHeight : ARENA.enemyHeight,
            maxWidth: ARENA.enemyMaxWidth,
            depth: 4,
            direction: -1,
            reducedMotion,
          });
          if (disposed || epoch !== swapEpoch) next.dispose();
          else {
            enemy?.dispose();
            enemy = next;
          }
        } catch (error) {
          if (!disposed && epoch === swapEpoch) {
            destroyGame();
            gameRoot.hidden = true;
            still.hidden = false;
            still.style.display = "block";
            root.dataset.sceneState = "still";
          }
        }
      }
      await stillTask;
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      ++swapEpoch;
      bootReject?.(new Error("Battle scene was closed"));
      destroyGame();
      document.removeEventListener("visibilitychange", visibility);
      visibilityObserver?.disconnect();
      wrapper.remove();
      if (fallbackHero) {
        fallbackHero.width = fallbackHero.height = 0;
        fallbackHero = null;
      }
      backgroundImage = heroMaster = petImage = null;
    },
    get ready() {
      return !disposed && root.dataset.sceneState === "ready";
    },
  };

  try {
    const selected = await loadActorSelection({ heroId, petId });
    heroDefinition = selected.hero;
    petDefinition = selected.pet;
    enemies = await enemyManifest();
    if (!enemies.has(currentId)) throw new Error("Unknown battle creature");
    describe();
    [backgroundImage, heroMaster, petImage] = await Promise.all([
      loadImage(`${ASSET_BASE}forest-arena.png`),
      loadImage(heroDefinition.views.back.path),
      petDefinition ? loadImage(petDefinition.views.front.path).catch(() => null) : null,
    ]);
    await drawStill(currentId);
    if (!wrapper.isConnected) {
      controller.destroy();
      return controller;
    }
    if (reducedMotion) {
      root.dataset.sceneState = "still";
      return controller;
    }
    const Phaser = await phaserLibrary();
    if (disposed) return controller;
    await new Promise((resolve, reject) => {
      bootReject = reject;
      bootTimer = setTimeout(
        () => reject(new Error("Battle scene startup timed out")),
        12000,
      );
      class BattleScene extends Phaser.Scene {
        constructor() {
          super(`daily-battle-${++serial}`);
        }
        create() {
          scene = this;
          try {
            const canvas = this.sys.game.canvas;
            canvas.setAttribute("aria-hidden", "true");
            canvas.tabIndex = -1;
            canvas.style.touchAction = "pan-y";
            canvas.style.display = "block";
            this.textures.addImage("daily-forest", backgroundImage);
            this.textures.addImage("daily-hero-master", heroMaster);
            const background = arenaBackgroundFrame(
              backgroundImage.naturalWidth,
              backgroundImage.naturalHeight,
            );
            this.add
              .image(background.x, background.y, "daily-forest")
              .setOrigin(0)
              .setDisplaySize(background.width, background.height)
              .setDepth(0);
            this.add
              .rectangle(
                ARENA.width / 2,
                ARENA.height - 12,
                ARENA.width,
                24,
                0x071a1c,
                0.13,
              )
              .setDepth(1);
            hero = new HeroActor(this, heroDefinition, "daily-hero-master", {
              reducedMotion, appearance: palette,
            });
            const petReady = petDefinition ? createPetActor(this, petDefinition, {
              view: 'back', x: ARENA.petX, y: ARENA.floor,
              height: ARENA.petHeight, maxWidth: ARENA.petMaxWidth,
              depth: 6, direction: 1, reducedMotion,
            }).then(actor => {
              if (disposed || !scene) actor.dispose(); else pet = actor;
            }) : Promise.resolve();
            Promise.all([controller.setEnemy(currentId), petReady]).then(() => {
              if (disposed || !scene || !enemy)
                return reject(new Error("Battle actors unavailable"));
              clearTimeout(bootTimer);
              resolve();
            }, reject);
          } catch (error) {
            reject(error);
          }
        }
      }
      game = new Phaser.Game({
        type: Phaser.CANVAS,
        width: ARENA.width,
        height: ARENA.height,
        parent: gameRoot,
        transparent: true,
        banner: false,
        audio: { noAudio: true },
        input: {
          keyboard: false,
          touch: { capture: false },
          mouse: { preventDefaultWheel: false },
        },
        fps: {
          target: reducedMotion ? 20 : 40,
          limit: reducedMotion ? 20 : 40,
        },
        render: { antialias: true, roundPixels: false },
        loader: { imageLoadType: "HTMLImageElement" },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: ARENA.width,
          height: ARENA.height,
        },
        scene: BattleScene,
      });
      if (typeof ResizeObserver === "function") {
        resizeObserver = new ResizeObserver(() => {
          if (!disposed && game?.isBooted) game.scale.refresh();
        });
        resizeObserver.observe(wrapper);
      }
    });
    bootReject = null;
    if (!disposed) {
      still.hidden = true;
      still.style.display = "none";
      root.dataset.sceneState = "ready";
      visibility();
    }
  } catch (error) {
    bootReject = null;
    if (!disposed) {
      destroyGame();
      gameRoot.hidden = true;
      still.hidden = false;
      still.style.display = "block";
      root.dataset.sceneState = "still";
      wrapper.setAttribute(
        "aria-label",
        `${wrapper.getAttribute("aria-label")} Still illustration mode. The questions remain available.`,
      );
    }
  }
  return controller;
}
