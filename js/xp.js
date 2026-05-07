"use strict";

import * as U from './utils.js';

  function createPool(size) {
    return new U.Pool(size, (index) => ({
      id: index,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      value: 1,
      radius: 7,
      pulse: 0,
      el: null
    }), resetOrb);
  }

  function resetOrb(orb, cfg) {
    orb.x = cfg.x;
    orb.y = cfg.y;
    orb.vx = U.rand(-70, 70);
    orb.vy = U.rand(-70, 70);
    orb.value = cfg.value || 1;
    orb.radius = U.clamp(5 + Math.sqrt(orb.value) * 0.8, 6, 13);
    orb.pulse = U.rand(0, Math.PI * 2);
  }

  function drop(game, x, y, amount) {
    const chunks = U.clamp(Math.ceil(amount / 18), 1, 5);
    for (let i = 0; i < chunks; i += 1) {
      const angle = U.rand(0, Math.PI * 2);
      const distance = U.rand(0, 34);
      game.xpPool.acquire({
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance,
        value: Math.ceil(amount / chunks)
      });
    }
  }

  function update(game, dt) {
    game.xpPool.items.forEach((orb) => {
      if (!orb.active) return;
      orb.pulse += dt * 5;
      const distance = Math.hypot(game.player.x - orb.x, game.player.y - orb.y);
      if (distance < 210) {
        const pull = (1 - distance / 210) * 780;
        orb.vx += ((game.player.x - orb.x) / Math.max(distance, 1)) * pull * dt;
        orb.vy += ((game.player.y - orb.y) / Math.max(distance, 1)) * pull * dt;
      }
      orb.vx *= Math.max(0, 1 - 2.2 * dt);
      orb.vy *= Math.max(0, 1 - 2.2 * dt);
      orb.x += orb.vx * dt;
      orb.y += orb.vy * dt;

      if (distance < game.player.radius + orb.radius + 4) {
        orb.active = false;
        game.addXp(orb.value);
        game.createBurst(orb.x, orb.y, 28, "#55f0d0", 5);
      }
    });
  }

  function requiredForLevel(level) {
    return Math.round(72 * Math.pow(level, 1.35));
  }

export const XP = {
  createPool,
  drop,
  update,
  requiredForLevel
};
