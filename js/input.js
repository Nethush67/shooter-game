(function (Arena) {
  "use strict";

  class Input {
    constructor(target) {
      this.keys = new Set();
      this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, down: false };
      this.target = target;
      this.bind();
    }

    bind() {
      window.addEventListener("keydown", (event) => {
        this.keys.add(event.key.toLowerCase());
      });
      window.addEventListener("keyup", (event) => {
        this.keys.delete(event.key.toLowerCase());
      });
      window.addEventListener("blur", () => this.keys.clear());
      this.target.addEventListener("pointermove", (event) => {
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
      });
      this.target.addEventListener("pointerdown", (event) => {
        this.mouse.down = true;
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;
      });
      window.addEventListener("pointerup", () => {
        this.mouse.down = false;
      });
      this.target.addEventListener("contextmenu", (event) => event.preventDefault());
    }

    movementVector() {
      let x = 0;
      let y = 0;
      if (this.keys.has("a") || this.keys.has("arrowleft")) x -= 1;
      if (this.keys.has("d") || this.keys.has("arrowright")) x += 1;
      if (this.keys.has("w") || this.keys.has("arrowup")) y -= 1;
      if (this.keys.has("s") || this.keys.has("arrowdown")) y += 1;
      return Arena.Utils.normalize(x, y);
    }
  }

  Arena.Input = Input;
})(window.Arena = window.Arena || {});
