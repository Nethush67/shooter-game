"use strict";

export const SVG_NS = "http://www.w3.org/2000/svg";

export const State = {
  MENU: "MENU",
  PLAYING: "PLAYING",
  MAP_PAUSED: "MAP_PAUSED",
  LEVEL_UP_PAUSED: "LEVEL_UP_PAUSED",
  GAME_OVER: "GAME_OVER"
};

export class Pool {
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

export function createSvg(tag, attrs) {
  const el = document.createElementNS(SVG_NS, tag);
  setAttrs(el, attrs);
  return el;
}

export function setAttrs(el, attrs) {
  if (!attrs) return el;
  Object.keys(attrs).forEach((key) => {
    if (attrs[key] !== undefined && attrs[key] !== null) {
      el.setAttribute(key, attrs[key]);
    }
  });
  return el;
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function rand(min, max) {
  return min + Math.random() * (max - min);
}

export function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

export function choice(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function dist2(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function angleTo(a, b) {
  return Math.atan2(b.y - a.y, b.x - a.x);
}

export function normalize(x, y) {
  const length = Math.hypot(x, y) || 1;
  return { x: x / length, y: y / length };
}

export function pointFromAngle(angle, distance) {
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance
  };
}

export function secondsToClock(seconds) {
  const whole = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(whole / 60);
  const remain = whole % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remain).padStart(2, "0")}`;
}

export function shuffle(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
