"use strict";

import * as U from './utils.js';

const DEFAULT_BINDINGS = {
  up: "w",
  down: "s",
  left: "a",
  right: "d",
  pause: "escape"
};

class Input {
  constructor(target, bindings) {
    this.keys = new Set();
    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2, down: false };
    this.target = target;
    this.bindings = Object.assign({}, DEFAULT_BINDINGS, bindings || {});
    this.rebindRequest = null;
    this.pauseHandler = null;
    this.bind();
  }

  bind() {
    window.addEventListener("keydown", (event) => {
      const key = normalizeKey(event.key);
      if (this.rebindRequest) {
        event.preventDefault();
        const request = this.rebindRequest;
        this.rebindRequest = null;
        this.bindings[request.action] = key;
        request.done(key);
        return;
      }
      this.keys.add(key);
      if (key === this.bindings.pause && this.pauseHandler) {
        event.preventDefault();
        this.pauseHandler();
      }
    });

    window.addEventListener("keyup", (event) => {
      this.keys.delete(normalizeKey(event.key));
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

  setPauseHandler(handler) {
    this.pauseHandler = handler;
  }

  waitForRebind(action, done) {
    this.rebindRequest = { action, done };
  }

  movementVector() {
    let x = 0;
    let y = 0;
    if (this.keys.has(this.bindings.left) || this.keys.has("arrowleft")) x -= 1;
    if (this.keys.has(this.bindings.right) || this.keys.has("arrowright")) x += 1;
    if (this.keys.has(this.bindings.up) || this.keys.has("arrowup")) y -= 1;
    if (this.keys.has(this.bindings.down) || this.keys.has("arrowdown")) y += 1;

    const pad = navigator.getGamepads ? Array.from(navigator.getGamepads()).find(Boolean) : null;
    if (pad) {
      x += Math.abs(pad.axes[0]) > 0.18 ? pad.axes[0] : 0;
      y += Math.abs(pad.axes[1]) > 0.18 ? pad.axes[1] : 0;
    }
    return U.normalize(x, y);
  }
}

function normalizeKey(key) {
  return key === " " ? " " : key.toLowerCase();
}

export { Input, DEFAULT_BINDINGS };
