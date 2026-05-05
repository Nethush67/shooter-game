(function (Arena) {
  "use strict";

  window.addEventListener("DOMContentLoaded", () => {
    const game = new Arena.Game();
    Arena.game = game;
    game.start();
  });
})(window.Arena = window.Arena || {});
