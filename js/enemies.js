"use strict";

import * as U from './utils.js';
import { Maps } from './maps.js';
import { Projectiles } from './projectiles.js';

const EnemyTypes = {
  // --- REGULAR ENEMIES ---
  chaser: {
    name: "Chaser", fill: "#ff6777", stroke: "#ffd5db", radius: 18, hp: 36, speed: 112, damage: 8, xp: 14, shape: "triangle", unlock: 0, weight: 10
  },
  fast: {
    name: "Fast", fill: "#f6c75e", stroke: "#fff3c6", radius: 14, hp: 24, speed: 210, damage: 7, xp: 12, shape: "diamond", unlock: 18, weight: 6
  },
  tank: {
    name: "Tank", fill: "#a789ff", stroke: "#eee6ff", radius: 29, hp: 110, speed: 82, damage: 15, xp: 34, shape: "hex", unlock: 36, weight: 4
  },
  ranger: {
    name: "Ranger", fill: "#61a8ff", stroke: "#dcecff", radius: 21, hp: 58, speed: 96, damage: 7, xp: 25, shape: "square", unlock: 55, weight: 5, ranged: true, range: 470, cadence: 1.45
  },
  swarm: {
    name: "Swarm", fill: "#55f0d0", stroke: "#d9fff8", radius: 10, hp: 14, speed: 255, damage: 5, xp: 8, shape: "diamond", unlock: 12, weight: 7
  },
  bruiser: {
    name: "Bruiser", fill: "#ff9f6e", stroke: "#ffe6cf", radius: 24, hp: 82, speed: 105, damage: 13, xp: 28, shape: "hex", unlock: 28, weight: 5
  },
  splitter: {
    name: "Splitter", fill: "#c9b7ff", stroke: "#f2ecff", radius: 19, hp: 48, speed: 145, damage: 9, xp: 22, shape: "diamond", unlock: 42, weight: 5
  },
  skirmisher: {
    name: "Skirmisher", fill: "#7ff59b", stroke: "#e5ffe9", radius: 16, hp: 34, speed: 190, damage: 8, xp: 18, shape: "triangle", unlock: 50, weight: 6, ranged: true, range: 330, cadence: 1.05
  },
  mortar: {
    name: "Mortar", fill: "#f6c75e", stroke: "#fff3c6", radius: 26, hp: 72, speed: 68, damage: 14, xp: 36, shape: "square", unlock: 68, weight: 4, ranged: true, range: 620, cadence: 2.25
  },
  warden: {
    name: "Warden", fill: "#9fe8ff", stroke: "#e5f8ff", radius: 31, hp: 150, speed: 70, damage: 18, xp: 48, shape: "hex", unlock: 84, weight: 3
  },
  blade: {
    name: "Blade", fill: "#f5f7fb", stroke: "#ffffff", radius: 17, hp: 44, speed: 225, damage: 11, xp: 24, shape: "triangle", unlock: 98, weight: 5
  },
  leech: {
    name: "Leech", fill: "#ff6777", stroke: "#ffd5db", radius: 15, hp: 38, speed: 175, damage: 10, xp: 20, shape: "diamond", unlock: 112, weight: 5
  },
  sentry: {
    name: "Sentry", fill: "#a789ff", stroke: "#eee6ff", radius: 23, hp: 66, speed: 84, damage: 12, xp: 32, shape: "square", unlock: 130, weight: 4, ranged: true, range: 520, cadence: 0.92
  },
  titan: {
    name: "Titan", fill: "#ff5268", stroke: "#ffd2d9", radius: 39, hp: 260, speed: 55, damage: 25, xp: 75, shape: "hex", unlock: 155, weight: 2
  },

  // --- 5-MINUTE BOSSES ---
  vanguard: { 
    name: "The Vanguard", fill: "#ff3333", stroke: "#ffaaaa", radius: 45, hp: 1000, speed: 70, damage: 25, xp: 800, shape: "hex", unlock: 0, weight: 0 
  },
  storm_bringer: { 
    name: "The Storm-Bringer", fill: "#3333ff", stroke: "#aaaaff", radius: 40, hp: 1500, speed: 110, damage: 30, xp: 1200, shape: "diamond", unlock: 0, weight: 0 
  },
  colossus: { 
    name: "The Colossus", fill: "#8833ff", stroke: "#ddaaff", radius: 65, hp: 2500, speed: 50, damage: 45, xp: 2000, shape: "square", unlock: 0, weight: 0 
  },
  voidweaver: { 
    name: "The Voidweaver", fill: "#33ff33", stroke: "#aaffaa", radius: 35, hp: 3000, speed: 90, damage: 35, xp: 3000, shape: "triangle", unlock: 0, weight: 0, ranged: true, range: 400, cadence: 0.6 
  },
  executioner: { 
    name: "The Executioner", fill: "#ff8833", stroke: "#ffddaa", radius: 50, hp: 4000, speed: 130, damage: 60, xp: 5000, shape: "hex", unlock: 0, weight: 0 
  }
};

function createPool(size) {
  return new U.Pool(size, (index) => ({
    id: index,
    type: "chaser",
    config: EnemyTypes.chaser,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    hp: 1,
    maxHp: 1,
    radius: 16,
    speed: 100,
    damage: 10,
    xp: 10,
    flash: 0,
    attackCooldown: 0,
    poison: 0,
    poisonTick: 0,
    el: null,
    isBoss: false // Tracks if it's a boss
  }), resetEnemy);
}

function resetEnemy(enemy, cfg) {
  const def = EnemyTypes[cfg.type] || EnemyTypes.chaser;
  const hpScale = cfg.hpScale || 1;
  enemy.type = cfg.type;
  enemy.config = def;
  enemy.x = cfg.x;
  enemy.y = cfg.y;
  enemy.vx = 0;
  enemy.vy = 0;
  enemy.radius = def.radius;
  enemy.speed = def.speed * (cfg.speedScale || 1);
  enemy.damage = def.damage * (cfg.damageScale || 1);
  
  // Apply HP overrides (specifically for Bosses)
  enemy.maxHp = cfg.hp ? cfg.hp : (def.hp * hpScale);
  enemy.hp = enemy.maxHp;
  
  enemy.xp = Math.round(def.xp * (0.9 + hpScale * 0.18) * (cfg.xpScale || 1));
  enemy.flash = 0;
  enemy.attackCooldown = U.rand(0.2, def.cadence || 1.2);
  enemy.poison = 0;
  enemy.poisonTick = 0;
  enemy.isBoss = cfg.isBoss || false;
}

function spawn(game, type) {
  const elapsed = game.elapsed;
  const map = game.currentMap || Maps.get("standard");
  const difficulty = game.settings?.difficulty || "normal";
  const difficultyScale = difficulty === "easy"
    ? { hp: 0.82, speed: 0.92, damage: 0.75, xp: 1.1 }
    : difficulty === "hard"
      ? { hp: 1.22, speed: 1.08, damage: 1.28, xp: 1.18 }
      : { hp: 1, speed: 1, damage: 1, xp: 1 };
      
  const phase = Math.min(1, elapsed / 240);
  const hpScale = Math.min(3.4, (1 + Math.pow(elapsed / 95, 1.35) * 0.34) * map.hpScale * difficultyScale.hp);
  const speedScale = (1 + Math.min(0.32, phase * 0.32)) * map.speedScale * difficultyScale.speed;
  const angle = U.rand(0, Math.PI * 2);
  const distance = U.rand(720, 980);
  const x = U.clamp(game.player.x + Math.cos(angle) * distance, 40, game.arena.width - 40);
  const y = U.clamp(game.player.y + Math.sin(angle) * distance, 40, game.arena.height - 40);
  
  return game.enemyPool.acquire({
    type,
    x,
    y,
    hpScale,
    speedScale,
    damageScale: (1 + Math.min(0.55, elapsed * 0.0028)) * map.damageScale * difficultyScale.damage,
    xpScale: map.xpScale * difficultyScale.xp
  });
}

function pickType(game) {
  const elapsed = game.elapsed;
  const map = game.currentMap || Maps.get("standard");
  const available = Object.keys(EnemyTypes)
    .map((id) => Object.assign({ id }, EnemyTypes[id]))
    .filter((def) => elapsed >= def.unlock && def.weight > 0) // Ensures bosses (weight 0) don't random spawn
    .map((def) => Object.assign({}, def, {
      phaseWeight: def.weight * phaseWeight(def, elapsed) * (map.weightModifiers[def.id] || 1)
    }));
    
  const total = available.reduce((sum, def) => sum + def.phaseWeight, 0);
  let roll = U.rand(0, total);
  for (let i = 0; i < available.length; i += 1) {
    roll -= available[i].phaseWeight;
    if (roll <= 0) return available[i].id;
  }
  return "chaser";
}

function phaseWeight(def, elapsed) {
  if (elapsed < 45 && def.unlock > 18) return 0.25;
  if (elapsed < 90 && def.radius >= 30) return 0.55;
  if (elapsed > 120 && (def.ranged || def.radius >= 24)) return 1.35;
  if (elapsed > 170 && def.unlock >= 84) return 1.55;
  return 1;
}

function updateDirector(game, dt) {
   game.spawnTimer -= dt;
   if (game.spawnTimer > 0) return;

   const map = game.currentMap || Maps.get("standard");
   const difficulty = game.settings?.difficulty || "normal";
   const difficultyRate = difficulty === "easy" ? 0.7 : difficulty === "hard" ? 1.3 : 1;
   const pressure = 1 + Math.pow(Math.min(1, game.elapsed / 300), 1.2) * 1.2; // Reduced pressure growth
   const interval = Math.max(0.8, (2.5 / pressure) / (map.spawnRate * difficultyRate)); // Increased base interval
   game.spawnTimer = interval;

   const activeEnemies = game.enemyPool.items.filter((e) => e.active).length;
   if (activeEnemies >= 25) return; // Reduced max active enemies

   // Limit enemy variety - only spawn from early/mid game enemies until later
   const maxUnlock = Math.min(60, Math.floor(game.elapsed / 2)); // Slower unlock progression
   const count = Math.min(2, 1 + Math.floor(game.elapsed / 180)); // Reduced spawn frequency
   for (let i = 0; i < count; i += 1) {
     spawn(game, pickType(game));
   }
 }

function update(game, dt) {
  game.enemyPool.items.forEach((enemy) => {
    if (!enemy.active) return;
    const toPlayer = U.angleTo(enemy, game.player);
    const distance = Math.hypot(game.player.x - enemy.x, game.player.y - enemy.y);
    const wantsRange = enemy.config.ranged && distance < enemy.config.range;
    const desiredSpeed = wantsRange ? enemy.speed * (distance < enemy.config.range * 0.65 ? -0.55 : 0.15) : enemy.speed;
    
    enemy.vx = U.lerp(enemy.vx, Math.cos(toPlayer) * desiredSpeed, 6 * dt);
    enemy.vy = U.lerp(enemy.vy, Math.sin(toPlayer) * desiredSpeed, 6 * dt);
    enemy.x = U.clamp(enemy.x + enemy.vx * dt, enemy.radius, game.arena.width - enemy.radius);
    enemy.y = U.clamp(enemy.y + enemy.vy * dt, enemy.radius, game.arena.height - enemy.radius);
    enemy.flash = Math.max(0, enemy.flash - dt);

    updatePoison(enemy, dt);
    if (enemy.config.ranged) updateRanger(game, enemy, dt, toPlayer, distance);
  });
}

function updatePoison(enemy, dt) {
  if (enemy.poison <= 0) return;
  enemy.poison -= dt;
  enemy.poisonTick -= dt;
  if (enemy.poisonTick <= 0) {
    enemy.hp -= 3;
    enemy.flash = 0.08;
    enemy.poisonTick = 0.28;
  }
}

function updateRanger(game, enemy, dt, angle, distance) {
  enemy.attackCooldown -= dt;
  if (distance > enemy.config.range || enemy.attackCooldown > 0) return;
  enemy.attackCooldown = enemy.config.cadence * U.rand(0.84, 1.16);
  Projectiles.spawn(game.projectilePool, {
    owner: "enemy",
    type: "enemyBolt",
    x: enemy.x + Math.cos(angle) * (enemy.radius + 12),
    y: enemy.y + Math.sin(angle) * (enemy.radius + 12),
    angle,
    speed: 360 + game.elapsed * 1.2,
    damage: enemy.damage,
    radius: 6,
    life: 2.4
  });
  game.createBurst(enemy.x, enemy.y, 32, enemy.config.fill, 5);
}

function damage(enemy, amount, projectileType) {
  enemy.hp -= amount;
  enemy.flash = 0.11;
  if (projectileType === "venom") {
    enemy.poison = Math.max(enemy.poison, 1.6);
  }
}

export const Enemies = {
  EnemyTypes: EnemyTypes, // Required so `game.js` can call `Enemies.EnemyTypes[bossId]`
  types: EnemyTypes,      // Kept for backward compatibility
  createPool,
  spawn,
  pickType,
  updateDirector,
  update,
  damage
};