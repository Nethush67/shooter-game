"use strict";

import * as U from './utils.js';
  const DEG = Math.PI / 180;

  const ProjectileTypes = {
    standard: { fill: "#55f0d0", stroke: "#d9fff8", pierce: 0, drag: 0, hitShake: 3 },
    rapid: { fill: "#8dffe9", stroke: "#ffffff", pierce: 0, drag: 0, hitShake: 2 },
    pellet: { fill: "#ffb06e", stroke: "#fff0dc", pierce: 0, drag: 0.18, hitShake: 2 },
    explosive: { fill: "#f6c75e", stroke: "#fff4bf", pierce: 0, drag: 0.05, explodeRadius: 86, hitShake: 8 },
    sniper: { fill: "#f5f7fb", stroke: "#9fe8ff", pierce: 4, drag: 0, hitShake: 7 },
    rail: { fill: "#9fe8ff", stroke: "#ffffff", pierce: 8, drag: 0, beam: true, hitShake: 8 },
    seeker: { fill: "#7ff59b", stroke: "#e5ffe9", pierce: 0, drag: 0, homing: 6.2, hitShake: 4 },
    needle: { fill: "#ff6777", stroke: "#ffe1e5", pierce: 3, drag: 0, hitShake: 3 },
    pulse: { fill: "#61a8ff", stroke: "#dcf0ff", pierce: 2, drag: 0.05, hitShake: 3 },
    orbit: { fill: "#61a8ff", stroke: "#ffffff", pierce: 99, orbit: true, orbitDistance: 86, orbitSpeed: 4.4, hitShake: 2 },
    blade: { fill: "#f6c75e", stroke: "#ffffff", pierce: 2, drag: 0.36, spin: true, hitShake: 4 },
    star: { fill: "#ff6777", stroke: "#ffffff", pierce: 1, drag: 0.02, spin: true, hitShake: 3 },
    arc: { fill: "#c9b7ff", stroke: "#ffffff", pierce: 2, drag: 0, hitShake: 4 },
    wave: { fill: "#55f0d0", stroke: "#ffffff", pierce: 4, drag: 0.15, waveMotion: true, waveAmp: 30, waveFreq: 2, hitShake: 3 },
    shock: { fill: "#f5f7fb", stroke: "#61a8ff", pierce: 4, drag: 0.22, expand: 34, hitShake: 5 },
    venom: { fill: "#7ff59b", stroke: "#e8ffec", pierce: 3, drag: 0, poison: true, hitShake: 3 },
    enemyBolt: { fill: "#ff6777", stroke: "#ffe1e5", pierce: 0, drag: 0, hitShake: 4 },
    // New types for 5-layer class tree
    burst: { fill: "#55f0d0", stroke: "#d9fff8", pierce: 0, drag: 0, hitShake: 3 },
    spray: { fill: "#9fe8ff", stroke: "#ffffff", pierce: 0, drag: 0.12, hitShake: 2 },
    chaos: { fill: "#c9b7ff", stroke: "#ffffff", pierce: 0, drag: 0.08, hitShake: 2 },
    minigun: { fill: "#55f0d0", stroke: "#8dffe9", pierce: 0, drag: 0, rampDamage: true, hitShake: 2 },
    heavy: { fill: "#f6c75e", stroke: "#fff4bf", pierce: 1, drag: 0.02, knockback: 1.5, hitShake: 5 },
    beam: { fill: "#9fe8ff", stroke: "#ffffff", pierce: 99, drag: 0, beam: true, hitShake: 8 },
    piercing: { fill: "#f5f7fb", stroke: "#9fe8ff", pierce: 5, drag: 0, hitShake: 5 },
    impact: { fill: "#ff9f6e", stroke: "#ffe6cf", pierce: 1, drag: 0, firstHitBonus: 0.5, hitShake: 4 },
    siege: { fill: "#f6c75e", stroke: "#fff4bf", pierce: 2, drag: 0.02, knockback: 2, hitShake: 10 },
    cluster: { fill: "#ff6777", stroke: "#ffd5db", pierce: 0, drag: 0.05, cluster: true, miniCount: 4, hitShake: 6 },
    inferno: { fill: "#a789ff", stroke: "#f2ecff", pierce: 0, drag: 0.08, fireZone: true, hitShake: 4 },
    side: { fill: "#a789ff", stroke: "#eee6ff", pierce: 1, drag: 0, hitShake: 3 },
    rear: { fill: "#ff6777", stroke: "#ffd5db", pierce: 1, drag: 0, hitShake: 3 },
    dual: { fill: "#61a8ff", stroke: "#dcecff", pierce: 0, drag: 0, hitShake: 3 },
    spread: { fill: "#ff9f6e", stroke: "#ffe6cf", pierce: 0, drag: 0.1, hitShake: 3 },
    triple: { fill: "#61a8ff", stroke: "#dcecff", pierce: 0, drag: 0, hitShake: 3 },
    quad: { fill: "#ff9f6e", stroke: "#ffe6cf", pierce: 0, drag: 0, hitShake: 3 },
    penta: { fill: "#55f0d0", stroke: "#d9fff8", pierce: 0, drag: 0, hitShake: 2 },
    hex: { fill: "#f6c75e", stroke: "#fff4bf", pierce: 0, drag: 0, hitShake: 3 },
    hepta: { fill: "#61a8ff", stroke: "#dcecff", pierce: 0, drag: 0, hitShake: 2 },
    octo: { fill: "#ff6777", stroke: "#ffd5db", pierce: 0, drag: 0, hitShake: 2 }
  };

  function createPool(size) {
    return new U.Pool(size, (index) => ({
      id: index,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      angle: 0,
      radius: 4,
      baseRadius: 4,
      damage: 1,
      life: 1,
      age: 0,
      owner: "player",
      type: "standard",
      config: ProjectileTypes.standard,
      pierceLeft: 0,
      hits: new Set(),
      el: null
    }), resetProjectile);
  }

  function resetProjectile(p, cfg) {
    const typeConfig = ProjectileTypes[cfg.type] || ProjectileTypes.standard;
    const config = Object.assign({}, typeConfig, cfg);
    const sizeMultiplier = cfg.sizeMultiplier || 1;
    p.x = cfg.x;
    p.y = cfg.y;
    p.angle = cfg.angle;
    p.vx = Math.cos(cfg.angle) * (cfg.speed || 0);
    p.vy = Math.sin(cfg.angle) * (cfg.speed || 0);
    p.radius = (cfg.radius || 4) * sizeMultiplier;
    p.baseRadius = p.radius;
    p.damage = cfg.damage || 1;
    p.life = cfg.life || 1;
    p.age = 0;
    p.owner = cfg.owner || "player";
    p.type = cfg.type || "standard";
    p.config = config;
    p.pierceLeft = cfg.pierce !== undefined ? cfg.pierce : config.pierce;
    p.orbitAngle = cfg.orbitAngle || cfg.angle;
    p.orbitDistance = cfg.orbitDistance || config.orbitDistance || config.radius || 80;
    p.hits.clear();
  }

  function spawn(pool, cfg) {
    return pool.acquire(cfg);
  }

  // Pattern-based firing system with debug validation
  function fireWeapon(game, player, classDef) {
    const aim = player.aimAngle + ((classDef.weapon.spin ? player.weaponPhase : 0) * DEG);

    classDef.weapon.salvos.forEach((shot, salvoIndex) => {
      // Skip non-weapon salvos (like dash, blink)
      if (shot.type === "dash" || shot.type === "blink") return;

      // Build list of bullets to fire based on pattern
      const bullets = buildBulletList(shot, aim);

      const pattern = shot.pattern || inferPattern(shot);
      const expected = getExpectedBulletCount(shot);
      if (bullets.length !== expected && game.settings?.debugMode) {
        console.error(`[FIRE ERROR] ${classDef.id}: Expected ${expected} bullets, got ${bullets.length}`);
      }

      // Fire with burst timing
      const burstCount = shot.burstCount || 1;
      const burstDelay = shot.burstDelay || 0;

      for (let burst = 0; burst < burstCount; burst += 1) {
        const delay = burst * burstDelay;
        const fireBurst = () => {
          bullets.forEach((bullet, bulletIndex) => {
            emitFromBarrel(game, player, shot, bullet.angle, bullet.barrel || { side: 0, forward: 35 }, salvoIndex * 100 + burst * 10 + bulletIndex);
          });
        };

        if (delay > 0) {
          setTimeout(fireBurst, delay * 1000);
        } else {
          fireBurst();
        }
      }
    });
  }

  // Build list of bullets with exact angles/positions based on pattern
  function buildBulletList(shot, baseAngle) {
    const bullets = [];
    const pattern = shot.pattern || inferPattern(shot);
    const offsetAngle = (shot.angleOffset || 0) * DEG;
    const totalAngle = baseAngle + offsetAngle;

    switch (pattern) {
      case "cone": {
        // Evenly spread bullets across spread angle
        const count = shot.radial || shot.count || 1;
        const spread = (shot.spread || 0) * DEG;
        for (let i = 0; i < count; i += 1) {
          const t = count === 1 ? 0 : i / (count - 1);
          const angleOffset = -spread / 2 + spread * t;
          bullets.push({ angle: totalAngle + angleOffset });
        }
        break;
      }

      case "radial": {
        // 360° evenly distributed
        const count = shot.count || 1;
        for (let i = 0; i < count; i += 1) {
          const angle = totalAngle + (Math.PI * 2 * i) / count;
          bullets.push({ angle });
        }
        break;
      }

      case "side": {
        // Exactly 90° and -90° from aim
        bullets.push({ angle: totalAngle + Math.PI / 2 });
        bullets.push({ angle: totalAngle - Math.PI / 2 });
        break;
      }

      case "cross": {
        // 0°, 90°, 180°, -90° (4 directions)
        bullets.push({ angle: totalAngle });
        bullets.push({ angle: totalAngle + Math.PI / 2 });
        bullets.push({ angle: totalAngle + Math.PI });
        bullets.push({ angle: totalAngle - Math.PI / 2 });
        break;
      }

      case "barrels": {
        // One bullet per barrel at base angle
        const barrels = shot.barrels || [{ side: 0, forward: 35 }];
        barrels.forEach((barrel) => {
          bullets.push({ angle: totalAngle, barrel });
        });
        break;
      }

      case "single":
      default: {
        // Single bullet forward
        bullets.push({ angle: totalAngle });
        break;
      }
    }

    return bullets;
  }

  // Infer pattern from shot properties (for backwards compatibility)
  function inferPattern(shot) {
    if (shot.radial && shot.radial > 0) return "radial";
    if (shot.barrels && shot.barrels.length > 1) return "barrels";
    if (shot.count && shot.count > 1 && shot.spread > 0) return "cone";
    if (shot.count && shot.count > 1) return "radial";
    return "single";
  }

  // Calculate expected bullet count for validation
  function getExpectedBulletCount(shot) {
    const pattern = shot.pattern || inferPattern(shot);

    switch (pattern) {
      case "cone": return shot.count || 1;
      case "radial": return shot.radial || shot.count || 1;
      case "side": return 2;
      case "cross": return 4;
      case "barrels": return (shot.barrels || [{ side: 0, forward: 35 }]).length;
      case "single": return 1;
      default: return 1;
    }
  }

  function emitFromBarrel(game, player, shot, angle, barrel, seed) {
    const forward = barrel.forward || 0;
    const side = barrel.side || 0;
    const fx = Math.cos(angle);
    const fy = Math.sin(angle);
    const sx = Math.cos(angle + Math.PI / 2);
    const sy = Math.sin(angle + Math.PI / 2);
    spawn(game.projectilePool, {
      owner: "player",
      type: shot.type,
      x: player.x + fx * forward + sx * side,
      y: player.y + fy * forward + sy * side,
      angle,
      speed: shot.speed,
      damage: shot.damage * game.statEffects.damageMultiplier,
      radius: shot.type === "orbit" ? (shot.projectileRadius || 9) : shot.radius,
      life: shot.life || 1.1,
      pierce: ((ProjectileTypes[shot.type] || ProjectileTypes.standard).pierce || 0) + game.statEffects.extraPierce,
      sizeMultiplier: game.statEffects.projectileSizeMultiplier,
      orbitAngle: angle + seed * 0.8,
      orbitDistance: shot.orbitDistance || (shot.type === "orbit" ? shot.radius : undefined),
      explodeRadius: shot.explodeRadius,
      knockback: shot.knockback,
      cluster: shot.cluster,
      miniCount: shot.miniCount,
      miniRadius: shot.miniRadius,
      miniDamage: shot.miniDamage,
      fireZone: shot.fireZone,
      zoneRadius: shot.zoneRadius
    });
  }

  function update(game, dt) {
    game.projectilePool.items.forEach((p) => {
      if (!p.active) return;
      p.age += dt;
      p.life -= dt;

      if (p.config.orbit && p.owner === "player") {
        p.orbitAngle += p.config.orbitSpeed * dt;
        p.x = game.player.x + Math.cos(p.orbitAngle) * p.orbitDistance;
        p.y = game.player.y + Math.sin(p.orbitAngle) * p.orbitDistance;
      } else {
        if (p.config.homing && p.owner === "player") {
          steerTowardNearestEnemy(game, p, dt);
        }
        const drag = Math.max(0, 1 - (p.config.drag || 0) * dt);
        p.vx *= drag;
        p.vy *= drag;

        // Wave motion for wave-type projectiles
        if (p.config.waveMotion) {
          const speed = Math.hypot(p.vx, p.vy);
          const baseAngle = Math.atan2(p.vy, p.vx);
          const waveAmp = p.config.waveAmp || 30;
          const waveFreq = p.config.waveFreq || 2;
          const waveOffset = Math.sin(p.age * waveFreq * Math.PI * 2) * waveAmp * dt;
          const perpX = -Math.sin(baseAngle);
          const perpY = Math.cos(baseAngle);
          p.x += p.vx * dt + perpX * waveOffset;
          p.y += p.vy * dt + perpY * waveOffset;
          p.angle = baseAngle + Math.cos(p.age * waveFreq * Math.PI * 2) * 0.3;
        } else {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
        }
      }

      if (p.config.expand) {
        p.radius = p.baseRadius + p.age * p.config.expand;
      }

      if (p.life <= 0 || p.x < -120 || p.y < -120 || p.x > game.arena.width + 120 || p.y > game.arena.height + 120) {
        p.active = false;
      }
    });
  }

  function steerTowardNearestEnemy(game, p, dt) {
    let target = null;
    let best = 900 * 900;
    game.enemyPool.items.forEach((enemy) => {
      if (!enemy.active) return;
      const d = U.dist2(p, enemy);
      if (d < best) {
        best = d;
        target = enemy;
      }
    });
    if (!target) return;
    const current = Math.atan2(p.vy, p.vx);
    const desired = U.angleTo(p, target);
    let delta = desired - current;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    const next = current + U.clamp(delta, -p.config.homing * dt, p.config.homing * dt);
    const speed = Math.hypot(p.vx, p.vy);
    p.vx = Math.cos(next) * speed;
    p.vy = Math.sin(next) * speed;
    p.angle = next;
  }

  function onHit(game, projectile, x, y) {
    const config = projectile.config;

    // Standard explosion
    if (config.explodeRadius) {
      game.damageEnemiesInRadius(x, y, config.explodeRadius, projectile.damage * 0.72, projectile.id);
      game.createBurst(x, y, config.explodeRadius, config.fill, 14);
    }

    // Cluster bomb - spawn mini explosions
    if (config.cluster && config.miniCount) {
      for (let i = 0; i < config.miniCount; i += 1) {
        const angle = (Math.PI * 2 * i) / config.miniCount;
        const dist = config.miniRadius || 30;
        const mx = x + Math.cos(angle) * dist;
        const my = y + Math.sin(angle) * dist;
        game.damageEnemiesInRadius(mx, my, config.miniRadius || 25, config.miniDamage || 10, projectile.id);
        game.createBurst(mx, my, 15, config.fill, 6);
      }
    }

    // Fire zone - create persistent damage area
    if (config.fireZone) {
      game.damageEnemiesInRadius(x, y, config.zoneRadius || 40, projectile.damage * 0.5, projectile.id);
      game.createBurst(x, y, config.zoneRadius || 40, "#a789ff", 10);
    }

    // Knockback effect
    if (config.knockback) {
      game.applyKnockback(x, y, config.knockback * 50, projectile.damage * 0.3);
    }

    if (projectile.pierceLeft <= 0) {
      projectile.active = false;
    } else {
      projectile.pierceLeft -= 1;
    }
  }

export const Projectiles = {
  types: ProjectileTypes,
  createPool,
  spawn,
  fireWeapon,
  update,
  onHit
};
