(function () {
  "use strict";

  function bridge() {
    try {
      if (window.parent && window.parent !== window && window.parent.DragonswoodRuneballBridge) {
        return window.parent.DragonswoodRuneballBridge;
      }
      if (window.opener && window.opener.DragonswoodRuneballBridge) {
        return window.opener.DragonswoodRuneballBridge;
      }
      return window.DragonswoodRuneballBridge || null;
    } catch (_) {
      return null;
    }
  }

  function emit(name, detail) {
    window.dispatchEvent(new CustomEvent(name, { detail: detail }));
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(name === "dragonswood:arcade-result" ? { type: name, payload: detail } : { type: name, detail: detail }, window.location.origin);
      }
    } catch (_) {}
  }

  window.DragonswoodRuneballAdapter = Object.freeze({
    getPlayer: function () {
      var host = bridge();
      return host && typeof host.getPlayer === "function" ? host.getPlayer() : null;
    },
    started: function (detail) {
      var host = bridge();
      if (host && typeof host.onStarted === "function") host.onStarted(detail);
      emit("dragonswood:runeball-started", detail);
    },
    complete: function (detail) {
      var host = bridge();
      if (host && typeof host.recordMatchResult === "function") {
        Promise.resolve(host.recordMatchResult(detail)).catch(function () {});
      }
      emit("dragonswood:runeball-complete", detail);
      emit("dragonswood:arcade-result", { schemaVersion: 1, gameId: "runeball-arena", gameVersion: 6, resultId: detail.resultId, completed: true, result: detail });
    },
    exit: function () {
      var host = bridge();
      if (host && typeof host.close === "function") host.close();
      else history.back();
    }
  });
})();
