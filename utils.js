(function (Arena) {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";

  const State = {
    MENU: "MENU",
    PLAYING: "PLAYING",
    MAP_PAUSED: "MAP_PAUSED",
    LEVEL_UP_PAUSED: "LEVEL_UP_PAUSED",
    GAME_OVER: "GAME_OVER"
  };

  class Pool {
    constructor(size, factory, reset) {
      this.items = Array.from({ length: size }, (_, index) => {
        const item = factory(index);
        item.active = false;
        return item;
      });
      this.reset = reset;
    }

    acquire(config) {
      for (let i = 0; i < this.items.length; i += 1) {
        const item = this.items[i];
        if (!item.active) {
          item.active = true;
          this.reset(item, config);
          return item;
        }
      }
      return null;
    }

    activeItems() {
      return this.items.filter((item) => item.active);
    }
  }

  function createSvg(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    setAttrs(el, attrs);
    return el;
  }

  function setAttrs(el, attrs) {
    if (!attrs) return el;
    Object.keys(attrs).forEach((key) => {
      if (attrs[key] !== undefined && attrs[key] !== null) {
        el.setAttribute(key, attrs[key]);
      }
    });
    return el;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function randInt(min, max) {
    return Math.floor(rand(min, max + 1));
  }

  function choice(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function dist2(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  function angleTo(a, b) {
    return Math.atan2(b.y - a.y, b.x - a.x);
  }

  function normalize(x, y) {
    const length = Math.hypot(x, y) || 1;
    return { x: x / length, y: y / length };
  }

  function pointFromAngle(angle, distance) {
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance
    };
  }

  function secondsToClock(seconds) {
    const whole = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(whole / 60);
    const remain = whole % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remain).padStart(2, "0")}`;
  }

  function shuffle(list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  Arena.Utils = {
    SVG_NS,
    State,
    Pool,
    createSvg,
    setAttrs,
    clamp,
    lerp,
    rand,
    randInt,
    choice,
    dist2,
    angleTo,
    normalize,
    pointFromAngle,
    secondsToClock,
    shuffle
  };
})(window.Arena = window.Arena || {});
