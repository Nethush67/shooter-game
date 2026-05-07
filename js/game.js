"use strict";

import * as U from './utils.js';
import { Input } from './input.js';
import { Renderer } from './renderer.js';
import { UI } from './ui.js';
import { Player } from './player.js';
import { Projectiles } from './projectiles.js';
import { Enemies } from './enemies.js';
import { XP } from './xp.js';
import { Maps } from './maps.js';
import { ClassesAPI as Classes } from './classes.js';
import { Stats } from './stats.js';

const State = U.State;

  class Game {
    constructor() {
      this.arena = { width: 2800, height: 2800 };
      this.svg = document.getElementById("gameSvg");
      this.input = new Input(this.svg);
      this.renderer = new Renderer(this.svg, this.arena);
      this.ui = new UI();
      this.player = new Player(this.arena);
      this.projectilePool = Projectiles.createPool(700);
      this.enemyPool = Enemies.createPool(180);
      this.xpPool = XP.createPool(260);
      this.particlePool = createParticlePool(520);
      this.state = State.MENU;
      this.previousState = State.MENU;
      this.currentMap = Maps.get("standard");
      this.stats = Stats.createState();
      this.statEffects = Stats.effects(this.stats);
      this.elapsed = 0;
      this.level = 1;
      this.xp = 0;
      this.xpRequired = XP.requiredForLevel(this.level);
      this.spawnTimer = 0;
      this.shake = 0;
      this.lastTime = performance.now();
      this.settings = this.loadSettings();
      this.pendingMapId = null;
      this.ui.bind(this);
      this.ui.updateSettingsUI(this.settings);
      this.svg.addEventListener("pointerdown", (event) => this.handleArenaPointer(event));
      this.ui.showMenu();
      this.loop = this.loop.bind(this);
    }

    loadSettings() {
      const defaults = {
        sound: false,
        screenShake: true,
        performanceMode: false,
        fpsCounter: false
      };
      try {
        const saved = localStorage.getItem("arenaSettings");
        return saved ? Object.assign(defaults, JSON.parse(saved)) : defaults;
      } catch (e) {
        return defaults;
      }
    }

    saveSettings() {
      try {
        localStorage.setItem("arenaSettings", JSON.stringify(this.settings));
      } catch (e) {
        // Ignore localStorage errors
      }
    }

    start() {
      requestAnimationFrame(this.loop);
    }

    startRun(mapId) {
      if (mapId) {
        this.currentMap = Maps.get(mapId);
      }
      this.state = State.PLAYING;
      this.elapsed = 0;
      this.level = 1;
      this.xp = 0;
      this.xpRequired = XP.requiredForLevel(this.level);
      this.spawnTimer = 0;
      this.shake = 0;
      this.stats = Stats.createState();
      this.statEffects = Stats.effects(this.stats);
      this.player.reset(this.arena);
      clearPool(this.projectilePool);
      clearPool(this.enemyPool);
      clearPool(this.xpPool);
      clearPool(this.particlePool);
      this.ui.hideMenu();
      this.ui.hideLevelUp();
      this.ui.hideMapChooser();
      this.renderer.buildArena(this.currentMap);
      for (let i = 0; i < 4; i += 1) {
        Enemies.spawn(this, "chaser");
      }
      this.ui.update(this);
    }

    loop(now) {
      const rawDt = Math.min(0.033, (now - this.lastTime) / 1000 || 0);
      this.lastTime = now;
      if (this.state === State.PLAYING) {
        this.step(rawDt);
      }
      this.renderer.render(this);
      this.ui.update(this, now);
      requestAnimationFrame(this.loop);
    }

    get effectiveShake() {
      return this.settings.screenShake ? this.shake : 0;
    }

    step(dt) {
      this.elapsed += dt;
      this.shake = Math.max(0, this.shake - dt * 18);
      this.statEffects = Stats.effects(this.stats);

      this.player.update(this, dt);
      Enemies.updateDirector(this, dt);
      Enemies.update(this, dt);
      Projectiles.update(this, dt);
      this.updateEnemySeparation(dt);
      this.resolveCollisions();
      XP.update(this, dt);
      updateParticles(this.particlePool, dt);

      if (this.player.hp <= 0) {
        this.state = State.GAME_OVER;
        this.ui.showGameOver(this);
      }
    }

    addXp(value) {
      if (this.state !== State.PLAYING) return;
      this.xp += value;
      if (this.xp >= this.xpRequired) {
        this.xp -= this.xpRequired;
        this.level += 1;
        this.stats.points += 1;
        this.xpRequired = XP.requiredForLevel(this.level);
        this.pauseForLevelUp();
      }
    }

    pauseForLevelUp() {
      // SAFETY: Only trigger from actual level up, not from other sources
      if (this.state === State.LEVEL_UP_PAUSED) {
        console.warn("[Game] Already in level up state, ignoring duplicate trigger");
        return;
      }
      
      this.state = State.LEVEL_UP_PAUSED;
      
      // Get choices and validate
      let choices = Classes.getChoices(this.player.classId, this.level);
      
      // Validate we have exactly 4 valid choices
      const validChoices = (choices || []).filter(c => c && c.id && c.name);
      
      if (validChoices.length !== 4) {
        console.error("[Game] Invalid choices from getChoices:", validChoices.length, "- forcing fallback");
        // Force fallback to 4 core classes
        choices = ["velocity", "titan", "swarm", "orbit"].map(id => Classes.get(id));
      }
      
      // Only show UI if we have valid choices
      if (!choices || choices.filter(c => c && c.id).length !== 4) {
        console.error("[Game] CRITICAL: No valid choices available, emergency resume");
        this.state = State.PLAYING;
        return;
      }
      
      this.ui.showLevelUp(choices, (classId) => this.chooseClass(classId));
    }

    chooseClass(classId) {
      // SAFETY: Validate classId before applying
      if (!classId || typeof classId !== "string") {
        console.error("[Game] Invalid classId:", classId, "- using fallback");
        classId = "velocity";
      }
      
      // Validate the class exists
      const classDef = Classes.get(classId);
      if (!classDef || !classDef.id) {
        console.error("[Game] Class not found:", classId, "- using fallback");
        classId = "velocity";
      }
      
      this.player.setClass(classId);
      this.createBurst(this.player.x, this.player.y, 110, this.player.classDef.accent, 34);
      this.ui.hideLevelUp();
      this.state = State.PLAYING;
    }

    resolveCollisions() {
      this.projectilePool.items.forEach((projectile) => {
        if (!projectile.active) return;
        if (projectile.owner === "player") {
          this.collidePlayerProjectile(projectile);
        } else {
          this.collideEnemyProjectile(projectile);
        }
      });

      this.enemyPool.items.forEach((enemy) => {
        if (!enemy.active) return;
        const distance = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
        if (distance < enemy.radius + this.player.radius) {
          if (this.player.damage(enemy.damage, this)) {
            this.shake = Math.max(this.shake, 9);
            this.createBurst(this.player.x, this.player.y, 48, "#ff6777", 9);
          }
        }
      });
    }

    collidePlayerProjectile(projectile) {
      this.enemyPool.items.forEach((enemy) => {
        if (!enemy.active || !projectile.active || projectile.hits.has(enemy.id)) return;
        const radius = enemy.radius + projectile.radius;
        if (U.dist2(enemy, projectile) > radius * radius) return;
        projectile.hits.add(enemy.id);
        Enemies.damage(enemy, projectile.damage, projectile.type);
        Projectiles.onHit(this, projectile, projectile.x, projectile.y);
        this.shake = Math.max(this.shake, projectile.config.hitShake || 2);
        this.createBurst(enemy.x, enemy.y, enemy.radius * 0.8, projectile.config.fill, 5);
        if (enemy.hp <= 0) this.killEnemy(enemy);
      });
    }

    collideEnemyProjectile(projectile) {
      const radius = projectile.radius + this.player.radius;
      if (U.dist2(projectile, this.player) > radius * radius) return;
      if (this.player.damage(projectile.damage, this)) {
        this.shake = Math.max(this.shake, projectile.config.hitShake || 5);
        this.createBurst(this.player.x, this.player.y, 52, "#ff6777", 10);
      }
      projectile.active = false;
    }

    killEnemy(enemy) {
      if (!enemy.active) return;
      enemy.active = false;
      XP.drop(this, enemy.x, enemy.y, enemy.xp);
      this.createBurst(enemy.x, enemy.y, enemy.radius * 2, enemy.config.fill, 14);
    }

    damageEnemiesInRadius(x, y, radius, amount, sourceId) {
      this.enemyPool.items.forEach((enemy) => {
        if (!enemy.active) return;
        const hitRadius = radius + enemy.radius;
        if ((enemy.areaSource === sourceId && enemy.areaStamp === this.elapsed) || U.dist2(enemy, { x, y }) > hitRadius * hitRadius) return;
        enemy.areaSource = sourceId;
        enemy.areaStamp = this.elapsed;
        Arena.Enemies.damage(enemy, amount, "explosive");
        if (enemy.hp <= 0) this.killEnemy(enemy);
      });
    }

    applyKnockback(x, y, radius, amount) {
      this.enemyPool.items.forEach((enemy) => {
        if (!enemy.active) return;
        const dx = enemy.x - x;
        const dy = enemy.y - y;
        const dist = Math.hypot(dx, dy);
        if (dist > radius || dist < 1) return;
        const force = (1 - dist / radius) * amount;
        const nx = dx / dist;
        const ny = dy / dist;
        enemy.x += nx * force;
        enemy.y += ny * force;
      });
    }

    updateEnemySeparation(dt) {
      const items = this.enemyPool.items;
      for (let i = 0; i < items.length; i += 1) {
        const a = items[i];
        if (!a.active) continue;
        for (let j = i + 1; j < items.length; j += 1) {
          const b = items[j];
          if (!b.active) continue;
          const min = a.radius + b.radius + 4;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d >= min) continue;
          const push = (min - d) * 0.5 * dt * 10;
          const nx = dx / d;
          const ny = dy / d;
          a.x -= nx * push;
          a.y -= ny * push;
          b.x += nx * push;
          b.y += ny * push;
        }
      }
    }

    createBurst(x, y, radius, color, count) {
      for (let i = 0; i < count; i += 1) {
        const angle = U.rand(0, Math.PI * 2);
        const speed = U.rand(60, 240) + radius;
        this.particlePool.acquire({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: U.rand(2.5, 7.5),
          color,
          life: U.rand(0.28, 0.66)
        });
      }
    }

    spendStat(id) {
      if (Stats.spend(this.stats, id)) {
        this.statEffects = Stats.effects(this.stats);
        this.player.applyStats(this, 0);
        this.createBurst(this.player.x, this.player.y, 44, this.player.classDef.accent, 10);
      }
    }

    openMapChooser() {
      if (this.state !== State.PLAYING && this.state !== State.MENU && this.state !== State.GAME_OVER) return;
      this.previousState = this.state;
      this.state = State.MAP_PAUSED;
      this.ui.showMapChooser(this);
    }

    selectMap(mapId) {
      this.currentMap = Maps.get(mapId);
      this.ui.hideMapChooser();
      this.startRun(mapId);
    }

    handleArenaPointer(event) {
      if (this.state !== State.PLAYING) return;
      const point = this.renderer.screenToWorld(event.clientX, event.clientY);
      const radius = this.player.radius + 12;
      if (U.dist2(point, this.player) <= radius * radius) {
        this.openMapChooser();
      }
    }
  }

  function createParticlePool(size) {
    return new U.Pool(size, (index) => ({
      id: index,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      radius: 3,
      life: 1,
      maxLife: 1,
      color: "#ffffff",
      el: null
    }), (p, cfg) => {
      p.x = cfg.x;
      p.y = cfg.y;
      p.vx = cfg.vx;
      p.vy = cfg.vy;
      p.radius = cfg.radius;
      p.life = cfg.life;
      p.maxLife = cfg.life;
      p.color = cfg.color;
    });
  }

  function updateParticles(pool, dt) {
    pool.items.forEach((p) => {
      if (!p.active) return;
      p.life -= dt;
      p.vx *= Math.max(0, 1 - 3 * dt);
      p.vy *= Math.max(0, 1 - 3 * dt);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0) p.active = false;
    });
  }

  function clearPool(pool) {
    pool.items.forEach((item) => {
      item.active = false;
      if (item.el) item.el.setAttribute("display", "none");
    });
  }

export { Game };
