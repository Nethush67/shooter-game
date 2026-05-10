"use strict";

import * as U from './utils.js';
import { ClassesAPI as Classes } from './classes.js';
import { Projectiles } from './projectiles.js';

class Player {
    constructor(arena) {
      this.reset(arena);
    }

    reset(arena) {
      this.x = arena.width / 2;
      this.y = arena.height / 2;
      this.radius = 24;
      this.baseMaxHp = 120;
      this.baseSpeed = 285;
      this.maxHp = this.baseMaxHp;
      this.speed = this.baseSpeed;
      this.hp = this.maxHp;
      this.invuln = 0;
      this.classId = "basic";
      this.classDef = Classes.get(this.classId);
      this.fireCooldown = 0;
      this.aimAngle = 0;
      this.weaponPhase = 0;
      this.flash = 0;
      this.pulse = 0;
    }

    setClass(classId) {
      this.classId = classId;
      this.classDef = Classes.get(classId);
      this.fireCooldown = Math.min(this.fireCooldown, 0.12);
      this.flash = 0.28;
    }

    update(game, dt) {
      this.applyStats(game, dt);
      const move = game.input.movementVector();
      this.x = U.clamp(this.x + move.x * this.speed * dt, this.radius, game.arena.width - this.radius);
      this.y = U.clamp(this.y + move.y * this.speed * dt, this.radius, game.arena.height - this.radius);

      const aimWorld = game.renderer.screenToWorld(game.input.mouse.x, game.input.mouse.y);
      this.aimAngle = Math.atan2(aimWorld.y - this.y, aimWorld.x - this.x);
      if (game.settings.autoAimAssist) {
        const assisted = nearestEnemyAngle(game, this, 520);
        if (assisted !== null) this.aimAngle = U.lerpAngle ? U.lerpAngle(this.aimAngle, assisted, 0.22) : blendAngle(this.aimAngle, assisted, 0.22);
      }
      this.weaponPhase += (this.classDef.weapon.spin || 0) * dt;

      this.fireCooldown -= dt;
      if (this.fireCooldown <= 0) {
        Projectiles.fireWeapon(game, this, this.classDef);
        this.fireCooldown += this.classDef.weapon.cadence * game.statEffects.cooldownMultiplier;
      }

      this.invuln = Math.max(0, this.invuln - dt);
      this.flash = Math.max(0, this.flash - dt);
      this.pulse += dt * 4;
    }

    applyStats(game, dt) {
      const effects = game.statEffects;
      const oldMax = this.maxHp;
      this.maxHp = this.baseMaxHp + effects.maxHpBonus;
      if (this.maxHp > oldMax) {
        this.hp += this.maxHp - oldMax;
      }
      this.hp = U.clamp(this.hp + effects.regenPerSecond * dt, 0, this.maxHp);
      this.speed = this.baseSpeed * effects.speedMultiplier * classMobility(this.classDef);
    }

    damage(amount, game) {
      if (this.invuln > 0) return false;
      const shielded = game ? amount * game.statEffects.damageTakenMultiplier : amount;
      this.hp = Math.max(0, this.hp - shielded);
      this.invuln = 0.45;
      this.flash = 0.18;
      return true;
    }
  }

  function classMobility(classDef) {
    const weapon = classDef.weapon;
    if (weapon.salvos.some((shot) => shot.type === "explosive" || shot.type === "rail")) return 0.94;
    if (weapon.salvos.some((shot) => shot.type === "sniper")) return 0.97;
    return 1;
  }

  function nearestEnemyAngle(game, player, range) {
    let target = null;
    let best = range * range;
    game.enemyPool.items.forEach((enemy) => {
      if (!enemy.active) return;
      const d = U.dist2(player, enemy);
      if (d < best) {
        best = d;
        target = enemy;
      }
    });
    return target ? U.angleTo(player, target) : null;
  }

  function blendAngle(from, to, t) {
    let delta = to - from;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    return from + delta * t;
  }

export { Player };
