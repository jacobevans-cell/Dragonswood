(function () {
  "use strict";

  function resolveBridge() {
    try {
      if (window.parent && window.parent !== window && window.parent.DragonswoodStarfallBridge) {
        return window.parent.DragonswoodStarfallBridge;
      }
    } catch (_error) {}
    try {
      if (window.opener && window.opener.DragonswoodStarfallBridge) {
        return window.opener.DragonswoodStarfallBridge;
      }
    } catch (_error) {}
    return window.DragonswoodStarfallBridge || null;
  }

  if (window.STARFALL_CONFIG && window.location.protocol !== "file:") {
    window.STARFALL_CONFIG.parentOrigin = window.location.origin;
  }

  window.DragonswoodBridge = {
    getPlayer() {
      const bridge = resolveBridge();
      return bridge && typeof bridge.getPlayer === "function" ? bridge.getPlayer() : null;
    },
    onGameEvent(type, payload) {
      const bridge = resolveBridge();
      if (!bridge) return;
      if (type === "starfall:run-start" && typeof bridge.onStarted === "function") {
        bridge.onStarted(payload);
      }
      if (type === "starfall:run-complete" && typeof bridge.recordRunResult === "function") {
        bridge.recordRunResult(payload);
      }
      if (type === "starfall:exit" && typeof bridge.close === "function") {
        bridge.close();
      }
    },
  };
})();
