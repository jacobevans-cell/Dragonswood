// Optional investigation view. The parent supplies the complete, accessible
// evidence list; this scene never grades, saves, or contains a case solution.
import { layoutCaseScene } from "./ccf-scene-layout.js?v=dragon-path-10";

const PHASER_VERSION = "4.2.1";
const PHASER_URL = "/Dragonswood/learning-portal/public/vendor/phaser-4.2.1.min.js";
const PHASER_INTEGRITY = "sha256-ZjSLG1FB5Jt9XrvmiM3ctQLqscsA8hxThoalssWr5N4=";
let libraryPromise;
let sceneNumber = 0;

function loadPhaser() {
  if (window.Phaser?.VERSION === PHASER_VERSION)
    return Promise.resolve(window.Phaser);
  if (libraryPromise) return libraryPromise;
  libraryPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = PHASER_URL;
    script.integrity = PHASER_INTEGRITY;
    script.async = true;
    let finished = false;
    const finish = (error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      script.onload = script.onerror = null;
      if (error) {
        script.remove();
        reject(error);
      } else resolve(window.Phaser);
    };
    const timer = setTimeout(
      () => finish(new Error("Scene library timeout")),
      8000,
    );
    script.onload = () =>
      finish(
        window.Phaser?.VERSION === PHASER_VERSION
          ? null
          : new Error("Unexpected scene library version"),
      );
    script.onerror = () => finish(new Error("Scene library unavailable"));
    document.head.append(script);
  }).catch((error) => {
    libraryPromise = null;
    throw error;
  });
  return libraryPromise;
}

function localImage(value) {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value, location.href);
    return url.origin === location.origin && /^https?:$/.test(url.protocol)
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function evidenceSet(value, allowed) {
  const values =
    value instanceof Set ? [...value] : Array.isArray(value) ? value : [];
  return new Set(values.filter((id) => allowed.has(id)));
}

/**
 * @param {object} options
 * @param {HTMLElement} options.root Dedicated container for this optional scene.
 * @param {object} options.caseFile Public case data, including evidence records.
 * @param {(id: string) => void} options.onInspect Opens the parent's evidence view.
 * @returns {Promise<{destroy: Function, update: Function, select: Function}>}
 *
 * update({inspected, selectedEvidenceId}) mirrors parent state without saving it.
 * select(id) highlights a record without calling onInspect or marking it read.
 * Every visible pin needs scenePosition: {x, y} in source-image coordinates.
 * An optional labelSide: "above" keeps the wide-screen label above that pin.
 * Missing anchors stay in the accessible evidence list, never in invented spots.
 */
export async function mountCaseScene({
  root,
  caseFile,
  onInspect,
  inspected = [],
  selectedEvidenceId = null,
  reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")
    .matches ?? true,
}) {
  if (!(root instanceof HTMLElement))
    throw new TypeError("A scene root is required");
  const evidence = Array.isArray(caseFile?.evidence)
    ? caseFile.evidence.filter((item) => typeof item.id === "string")
    : [];
  const allowed = new Set(evidence.map((item) => item.id));
  let read = evidenceSet(inspected, allowed);
  let selected = allowed.has(selectedEvidenceId) ? selectedEvidenceId : null;
  let game;
  let currentScene;
  let observer;
  let bootTimer;
  let disposed = false;
  let failed = false;
  const wrapper = document.createElement("div");
  wrapper.className = "ccf-scene-enhancement";
  const stage = document.createElement("div");
  stage.className = "ccf-scene-stage";
  Object.assign(stage.style, {
    position: "relative",
    width: "100%",
    overflow: "hidden",
    borderRadius: "14px",
    background: "#171322",
    border: "1px solid #51415f",
  });
  const note = document.createElement("p");
  note.className = "small ccf-scene-note";
  note.setAttribute("role", "status");
  note.textContent =
    "Opening your investigation scene. You can use the evidence buttons below now.";
  wrapper.append(stage, note);
  root.append(wrapper);

  const dimensions = () => {
    const width = Math.max(
      240,
      Math.round(stage.getBoundingClientRect().width || 640),
    );
    return {
      width,
      height: Math.round(Math.min(600, Math.max(360, width * 0.61))),
    };
  };
  const destroyGame = () => {
    observer?.disconnect();
    observer = null;
    clearTimeout(bootTimer);
    currentScene = null;
    if (game) {
      game.destroy(true);
      game = null;
    }
  };
  const fallback = () => {
    if (disposed || failed) return;
    failed = true;
    destroyGame();
    stage.hidden = true;
    wrapper.dataset.sceneState = "fallback";
    note.textContent =
      "The scene could not open on this device. All the same evidence is available in the buttons below. You can complete the whole case there.";
  };
  const controller = {
    destroy() {
      if (disposed) return;
      disposed = true;
      destroyGame();
      wrapper.remove();
    },
    update(next = {}) {
      if (disposed) return;
      if (Object.hasOwn(next, "inspected"))
        read = evidenceSet(next.inspected, allowed);
      if (Object.hasOwn(next, "selectedEvidenceId"))
        selected = allowed.has(next.selectedEvidenceId)
          ? next.selectedEvidenceId
          : null;
      currentScene?.drawRecords();
    },
    select(id) {
      controller.update({ selectedEvidenceId: id });
    },
  };

  try {
    const Phaser = await loadPhaser();
    if (!wrapper.isConnected) {
      controller.destroy();
      return controller;
    }
    if (
      !document.createElement("canvas").getContext("2d") ||
      !evidence.length
    ) {
      fallback();
      return controller;
    }
    const imageUrl = localImage(
      caseFile.publicSceneImage || caseFile.sceneImage,
    );
    const sceneKey = `CaseInvestigation-${++sceneNumber}`;
    class Investigation extends Phaser.Scene {
      constructor() {
        super(sceneKey);
      }
      preload() {
        if (imageUrl) this.load.image("setting", imageUrl, { timeout: 5000 });
      }
      create() {
        if (disposed || failed || !wrapper.isConnected) return;
        try {
          if (!this.textures.exists("setting")) {
            fallback();
            return;
          }
          currentScene = this;
          this.records = this.add.container(0, 0);
          this.drawRecords();
          if (failed) return;
          const canvas = this.sys.game.canvas;
          // The adjacent DOM controls are the keyboard and screen-reader view.
          canvas.setAttribute("aria-hidden", "true");
          canvas.tabIndex = -1;
          canvas.style.display = "block";
          canvas.style.maxWidth = "100%";
          canvas.style.touchAction = "pan-y";
          wrapper.dataset.sceneState = "ready";
          clearTimeout(bootTimer);
        } catch {
          fallback();
        }
      }
      drawRecords() {
        if (!this.records || disposed || failed) return;
        this.records.removeAll(true);
        const width = this.scale.width;
        const height = this.scale.height;
        const illustration = this.add.image(width / 2, height / 2, "setting");
        const layout = layoutCaseScene({
          width,
          height,
          imageWidth: illustration.width,
          imageHeight: illustration.height,
          evidence,
        });
        if (!layout.bounds || !layout.markers.length) {
          illustration.destroy();
          fallback();
          return;
        }
        // The image and every pin share this exact contained rectangle.
        illustration.setScale(layout.bounds.scale);
        this.records.add(illustration);
        this.records.add(
          this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x120f20,
            0.18,
          ),
        );
        const incompleteMap = layout.markers.length !== evidence.length;
        note.textContent =
          "Tap a numbered pin at its related object or location. Mint pins are inspected; the gold ring marks your current record. " +
          (layout.showLabels
            ? "The illustration helps you find the supplied records; use those records as evidence. "
            : "Match each number to its titled evidence button below. ") +
          (incompleteMap
            ? "Some records have no mapped location; open those with the evidence buttons below."
            : "All records are also available in the evidence buttons below.");
        const plaque = this.add.rectangle(
          width / 2,
          28,
          Math.min(width - 24, 380),
          35,
          0x171322,
          0.93,
        );
        this.records.add(plaque);
        this.records.add(
          this.add
            .text(width / 2, 28, "INVESTIGATION • FOLLOW THE EVIDENCE", {
              fontFamily: "Segoe UI, sans-serif",
              fontSize: width < 410 ? "10px" : "12px",
              color: "#edc879",
              fontStyle: "bold",
            })
            .setOrigin(0.5),
        );
        layout.markers.forEach(({ index, x, y, labelSide }) => {
          const item = evidence[index];
          const isRead = read.has(item.id);
          const isSelected = selected === item.id;
          const pin = this.add.container(x, y);
          const disk = this.add
            .circle(0, 0, layout.pinRadius, 0x201a32, 0.68)
            .setStrokeStyle(
              isSelected ? 2 : 1.25,
              isSelected ? 0xedc879 : isRead ? 0x8fe1cc : 0xedc879,
            );
          const ring = this.add
            .circle(0, 0, layout.pinRadius + 3, 0x201a32, 0)
            .setStrokeStyle(1, 0xedc879, isSelected ? 0.85 : 0);
          const number = this.add
            .text(0, 0, String(index + 1), {
              fontFamily: "Segoe UI, sans-serif",
              fontSize: layout.showLabels ? "14px" : "12px",
              fontStyle: "bold",
              color: isRead ? "#8fe1cc" : "#edc879",
            })
            .setOrigin(0.5);
          pin.add([ring, disk, number]);
          // Keep the clickable area generous even when the visible badge is
          // small enough to leave the illustrated object easy to inspect.
          const hitSize = Math.max(44, layout.pinRadius * 2 + 12);
          pin.setSize(hitSize, hitSize).setInteractive({ useHandCursor: true });
          const enter = () => {
            if (!isSelected) ring.setStrokeStyle(1, 0xedc879, 0.65);
          };
          const leave = () => {
            ring.setStrokeStyle(1, 0xedc879, isSelected ? 0.85 : 0);
          };
          const open = () => {
            if (disposed || failed) return;
            // Opening a record is the parent's responsibility. A click alone
            // is deliberately not a saved read or a completion event here.
            selected = item.id;
            this.drawRecords();
            if (typeof onInspect === "function") onInspect(item.id);
          };
          pin.on("pointerover", enter);
          pin.on("pointerout", leave);
          pin.on("pointerup", open);
          this.records.add(pin);
          // Narrow views keep anchored circles. Titles remain in the adjacent
          // DOM list instead of being rearranged into a misleading canvas grid.
          if (layout.showLabels) {
            const above = labelSide === "above";
            const labelOffset = layout.pinRadius + 12;
            const labelY = y + (above ? -labelOffset : labelOffset);
            const label = this.add
              .text(x, labelY, item.title || `Record ${index + 1}`, {
                fontFamily: "Segoe UI, sans-serif",
                fontSize: "12px",
                color: "#f5f0e8",
                align: "center",
                wordWrap: { width: 130 },
                padding: { x: 6, y: 4 },
                backgroundColor: "#171322",
              })
              .setOrigin(0.5, above ? 1 : 0);
            // A label may shift inside the viewport; its pin never moves off
            // the authored object. A short leader keeps that relation clear.
            const labelX = Phaser.Math.Clamp(
              x,
              label.width / 2 + 5,
              width - label.width / 2 - 5,
            );
            label.x = labelX;
            if (Math.abs(labelX - x) > 1) {
              const leader = this.add.graphics();
              leader.lineStyle(1, 0xedc879, 0.85);
              leader.lineBetween(
                x,
                y + (above ? -layout.pinRadius : layout.pinRadius),
                labelX,
                labelY,
              );
              this.records.add(leader);
            }
            label.setInteractive({ useHandCursor: true });
            label.on("pointerover", enter);
            label.on("pointerout", leave);
            label.on("pointerup", open);
            this.records.add(label);
          }
        });
      }
    }
    const size = dimensions();
    stage.style.height = `${size.height}px`;
    bootTimer = setTimeout(fallback, 9000);
    game = new Phaser.Game({
      type: Phaser.CANVAS,
      parent: stage,
      width: size.width,
      height: size.height,
      backgroundColor: "#171322",
      banner: false,
      audio: { noAudio: true },
      // Phaser's default XHR image path decodes through a blob: URL. Load the
      // same-origin illustration directly so it respects our existing img-src
      // policy without adding blob: or weakening the page's protection.
      loader: { imageLoadType: "HTMLImageElement" },
      input: {
        keyboard: false,
        touch: { capture: false },
        mouse: { preventDefaultWheel: false },
      },
      scale: { mode: Phaser.Scale.NONE },
      // The board has no ambient animation, camera movement, or flashing.
      // A lower tick limit is sufficient for the reduced-motion view.
      fps: { target: reducedMotion ? 20 : 30, limit: reducedMotion ? 20 : 30 },
      render: { antialias: true },
      scene: [Investigation],
    });
    if (typeof ResizeObserver === "function") {
      observer = new ResizeObserver(() => {
        if (!game || disposed || failed || !wrapper.isConnected) return;
        const next = dimensions();
        if (
          game.scale.width === next.width &&
          game.scale.height === next.height
        )
          return;
        stage.style.height = `${next.height}px`;
        game.scale.resize(next.width, next.height);
        currentScene?.drawRecords();
      });
      observer.observe(root);
    }
  } catch {
    fallback();
  }
  return controller;
}
