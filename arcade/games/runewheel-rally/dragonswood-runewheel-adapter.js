(function () {
  "use strict";

  function bridge() {
    try {
      if (window.parent && window.parent !== window && window.parent.DragonswoodRunewheelBridge) {
        return window.parent.DragonswoodRunewheelBridge;
      }
      if (window.opener && window.opener.DragonswoodRunewheelBridge) {
        return window.opener.DragonswoodRunewheelBridge;
      }
      return window.DragonswoodRunewheelBridge || null;
    } catch (_) {
      return null;
    }
  }

  function emit(name, detail) {
    window.dispatchEvent(new CustomEvent(name, { detail: detail }));
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(
          name === "dragonswood:arcade-result"
            ? { type: name, payload: detail }
            : { type: name, detail: detail },
          window.location.origin
        );
      }
    } catch (_) {}
  }

  window.DragonswoodRunewheelAdapter = Object.freeze({
    getPlayer: function () {
      var host = bridge();
      return host && typeof host.getPlayer === "function" ? host.getPlayer() : null;
    },
    started: function (detail) {
      var host = bridge();
      if (host && typeof host.onStarted === "function") host.onStarted(detail);
      emit("dragonswood:runewheel-started", detail);
    },
    checkpoint: function (detail) {
      var host = bridge();
      if (host && typeof host.onCheckpoint === "function") host.onCheckpoint(detail);
      emit("dragonswood:runewheel-checkpoint", detail);
    },
    complete: function (detail) {
      var host = bridge();
      if (host && typeof host.recordRaceResult === "function") {
        Promise.resolve(host.recordRaceResult(detail)).catch(function () {});
      }
      emit("dragonswood:runewheel-complete", detail);
      emit("dragonswood:arcade-result", {
        schemaVersion: 1,
        gameId: "runewheel-rally",
        gameVersion: 5,
        resultId: detail.resultId,
        completed: true,
        result: detail
      });
    },
    exit: function () {
      var host = bridge();
      if (host && typeof host.close === "function") host.close();
      else history.back();
    }
  });
})();
