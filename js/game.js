"use strict";

import * as U from './utils.js';
import { Input, DEFAULT_BINDINGS } from './input.js';
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
const SAVE_KEY = "arenaEvolutionSave";
const SETTINGS_KEY = "arenaEvolutionSettings";
const BINDINGS_KEY = "arenaEvolutionBindings";
const VICTORY_TIME = 300;

const CORE_ACHIEVEMENTS = [
  { id: "first_run", name: "First Deployment", description: "Start your first run." },
  { id: "first_evolution", name: "Evolved", description: "Choose a new combat class." },
  { id: "level_five", name: "Operational", description: "Reach level 5 in a run." },
  { id: "hundred_kills", name: "Crowd Control", description: "Defeat 100 enemies across all runs." },
  { id: "survivor", name: "Five Minute Stand", description: "Survive for five minutes." }
];

const ACHIEVEMENT_SERIES = [
  ["rookie", "Rookie Contract", "Complete arena contract tier"],
  ["survival", "Survival Record", "Push a run past survival benchmark"],
  ["evolution", "Evolution Archive", "Document class evolution branch"],
  ["marksman", "Marksman Trial", "Maintain pressure with precision fire"],
  ["swarm", "Swarm Control", "Clear hostile density milestone"],
  ["titan", "Titan Protocol", "Win heavy weapon engagement trial"],
  ["orbit", "Orbit Mastery", "Hold space with orbital weapons"],
  ["map", "Arena Passport", "Deploy into map operation"],
  ["collector", "Core Collector", "Recover XP core cache"],
  ["veteran", "Veteran Log", "Record career combat milestone"],
  ["flawless", "Flawless Segment", "Survive a clean combat segment"],
  ["speed", "Velocity Drill", "Complete movement pressure test"],
  ["economy", "Upgrade Economy", "Invest in stat development"],
  ["danger", "Danger Close", "Survive high-pressure contact"],
  ["boss", "Elite Contact", "Handle priority enemy engagement"],
  ["endurance", "Endurance File", "Extend long-run operation"],
  ["weapon", "Weapon License", "Field-test advanced weapon pattern"],
  ["hazard", "Hazard Pay", "Survive hostile arena condition"],
  ["archive", "Studio Archive", "Unlock historical combat record"]
];

const ACHIEVEMENTS = [
  ...CORE_ACHIEVEMENTS,
  ...Array.from({ length: 95 }, (_, index) => {
    const tier = index + 1;
    const series = ACHIEVEMENT_SERIES[index % ACHIEVEMENT_SERIES.length];
    return {
      id: `${series[0]}_${String(tier).padStart(2, "0")}`,
      name: `${series[1]} ${tier}`,
      description: `${series[2]} ${tier}.`
    };
  })
];

class Game {
  constructor() {
    this.arena = { width: 2800, height: 2800 };
    this.svg = document.getElementById("gameSvg");
    this.settings = this.loadSettings();
    this.input = new Input(this.svg, this.loadBindings());
    this.renderer = new Renderer(this.svg, this.arena);
    this.ui = new UI();
    this.player = new Player(this.arena);
    this.projectilePool = Projectiles.createPool(900);
    this.enemyPool = Enemies.createPool(220);
    this.xpPool = XP.createPool(320);
    this.particlePool = createParticlePool(620);
    this.state = State.BOOT;
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
    this.pendingMapId = null;
    this.kills = 0;
    this.floaters = [];
    this.bestClassName = this.player.classDef.name;
    this.achievementList = ACHIEVEMENTS;
    this.saveData = this.loadSave();
    this.audio = new AudioBus(this.settings);
    this.loop = this.loop.bind(this);

    this.input.setPauseHandler(() => this.togglePause());
    this.ui.bind(this);
    this.ui.updateSettingsUI(this.settings, this.input.bindings);
    this.svg.addEventListener("pointerdown", (event) => this.handleArenaPointer(event));
  }

  start() {
    this.ui.showLoading();
    requestAnimationFrame(this.loop);
    window.setTimeout(() => {
      this.state = State.MENU;
      this.ui.showMenu(Boolean(this.saveData.currentRun));
      this.audio.startMusic();
      if (!this.saveData.seenTutorial) this.ui.showTutorial();
    }, 320);
  }

  loadSettings() {
    const defaults = {
      masterVolume: 0.85,
      musicVolume: 0.38,
      sfxVolume: 0.7,
      muteAll: false,
      menuMusic: true,
      screenShake: true,
      performanceMode: false,
      fpsCounter: false,
      fullscreen: false,
      resolutionScale: 1,
      mouseSensitivity: 1,
      autoAimAssist: false,
      difficulty: "normal",
      damageNumbers: true,
      autoPickup: true,
      screenFlash: true,
      debugMode: false
    };
    return Object.assign(defaults, readJson(SETTINGS_KEY, {}));
  }

  loadBindings() {
    return Object.assign({}, DEFAULT_BINDINGS, readJson(BINDINGS_KEY, {}));
  }

  loadSave() {
    return Object.assign({
      version: 1,
      seenTutorial: false,
      achievements: [],
      unlocks: { maps: ["standard"], classes: ["basic"] },
      totalKills: 0,
      bestTime: 0,
      bestLevel: 1,
      currentRun: null
    }, readJson(SAVE_KEY, {}));
  }

  persistSettings() {
    writeJson(SETTINGS_KEY, this.settings);
    writeJson(BINDINGS_KEY, this.input.bindings);
    this.audio.applySettings(this.settings);
    if (this.state === State.MENU) this.audio.startMusic();
  }

  persistSave() {
    writeJson(SAVE_KEY, this.saveData);
  }

  updateSetting(setting, value) {
    this.settings[setting] = value;
    if (setting === "fullscreen") this.setFullscreen(Boolean(value));
    if (setting === "resolutionScale") document.documentElement.style.setProperty("--resolution-scale", String(value || 1));
    this.persistSettings();
    this.ui.updateSettingsUI(this.settings, this.input.bindings);
    this.audio.play("ui");
  }

  setFullscreen(enabled) {
    if (enabled && !document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {
        this.settings.fullscreen = false;
        this.persistSettings();
      });
    } else if (!enabled && document.fullscreenElement) {
      document.exitFullscreen?.();
    }
  }

  waitForRebind(action, done) {
    this.input.waitForRebind(action, (key) => {
      this.persistSettings();
      done(key);
    });
  }

  openSettings(source) {
    if (this.state === State.PLAYING) this.pause();
    this.previousState = this.state;
    this.state = State.SETTINGS;
    this.ui.showSettings(this, source);
    this.audio.play("open");
  }

  closeSettings() {
    this.ui.hideSettings();
    this.state = this.previousState === State.PAUSED ? State.PAUSED : State.MENU;
    this.audio.play("close");
  }

  openAchievements() {
    this.previousState = this.state;
    this.state = State.ACHIEVEMENTS;
    this.ui.showAchievements(this);
    this.audio.play("open");
  }

  closeAchievements() {
    this.ui.hideAchievements();
    this.state = State.MENU;
    this.audio.play("close");
  }

  openCredits() {
    this.previousState = this.state;
    this.state = State.CREDITS;
    this.ui.showCredits();
    this.audio.play("open");
  }

  closeCredits() {
    this.ui.hideCredits();
    this.state = State.MENU;
    this.audio.play("close");
  }

  closeTutorial() {
    this.saveData.seenTutorial = true;
    this.persistSave();
    this.ui.hideTutorial();
    this.audio.play("ui");
  }

  exportSave() {
    const payload = {
      exportedAt: new Date().toISOString(),
      save: this.saveData,
      settings: this.settings,
      bindings: this.input.bindings
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "arena-evolution-save.json";
    link.click();
    URL.revokeObjectURL(url);
    this.ui.showToast("Save Exported", "Your save JSON was downloaded.");
    this.audio.play("ui");
  }

  importSave(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(String(reader.result || "{}"));
        if (payload.save) this.saveData = Object.assign(this.loadSave(), payload.save);
        if (payload.settings) this.settings = Object.assign(this.loadSettings(), payload.settings);
        if (payload.bindings) this.input.bindings = Object.assign({}, DEFAULT_BINDINGS, payload.bindings);
        this.persistSave();
        this.persistSettings();
        this.ui.updateSettingsUI(this.settings, this.input.bindings);
        this.ui.showToast("Save Imported", "Settings and progress restored.");
      } catch (error) {
        this.ui.showToast("Import Failed", "That file was not a valid save export.");
      }
    };
    reader.readAsText(file);
  }

  confirmResetSave() {
    this.ui.showConfirm("Reset Save", "Delete progression, achievements, unlocks, and the current run?", () => {
      localStorage.removeItem(SAVE_KEY);
      this.saveData = this.loadSave();
      this.ui.hideConfirm();
      this.ui.showMenu(false);
      this.ui.showToast("Save Reset", "Progression data has been cleared.");
    });
  }

  confirmClearCache() {
    this.ui.showConfirm("Reset Game", "Clear save data, settings, keybinds, and cached game preferences?", () => {
      [SAVE_KEY, SETTINGS_KEY, BINDINGS_KEY].forEach((key) => localStorage.removeItem(key));
      this.settings = this.loadSettings();
      this.input.bindings = this.loadBindings();
      this.saveData = this.loadSave();
      this.persistSettings();
      this.ui.hideConfirm();
      this.ui.showMenu(false);
      this.ui.showToast("Game Reset", "Local data has been restored to defaults.");
    });
  }

  closeConfirm() {
    this.ui.hideConfirm();
    this.audio.play("close");
  }

  openMapChooser() {
    if (![State.PLAYING, State.MENU, State.GAME_OVER, State.VICTORY].includes(this.state)) return;
    this.previousState = this.state;
    if (this.state === State.PLAYING) this.state = State.MAP_PAUSED;
    this.ui.showMapChooser(this);
    this.audio.play("open");
  }

  selectMap(mapId) {
    this.currentMap = Maps.get(mapId);
    this.ui.hideMapChooser();
    this.startRun(mapId);
  }

  startRun(mapId) {
    if (mapId) this.currentMap = Maps.get(mapId);
    this.state = State.PLAYING;
    this.audio.stopMusic();
    this.elapsed = 0;
    this.level = 1;
    this.xp = 0;
    this.xpRequired = XP.requiredForLevel(this.level);
    this.spawnTimer = 0;
    this.shake = 0;
    this.kills = 0;
    this.stats = Stats.createState();
    this.statEffects = Stats.effects(this.stats);
    this.player.reset(this.arena);
    clearPool(this.projectilePool);
    clearPool(this.enemyPool);
    clearPool(this.xpPool);
    clearPool(this.particlePool);
    this.ui.hideAllOverlays();
    this.renderer.buildArena(this.currentMap);
    for (let i = 0; i < 4; i += 1) Enemies.spawn(this, "chaser");
    this.unlockAchievement("first_run");
    this.saveCurrentRun();
    this.ui.update(this, performance.now());
    this.audio.play("start");
  }

  continueRun() {
    const run = this.saveData.currentRun;
    if (!run) {
      this.ui.showToast("No Save", "Start a new run from Play.");
      return;
    }
    this.startRun(run.mapId);
    this.elapsed = run.elapsed || 0;
    this.level = run.level || 1;
    this.xp = run.xp || 0;
    this.stats = Object.assign(Stats.createState(), run.stats || {});
    this.stats.levels = Object.assign(Stats.createState().levels, run.stats?.levels || {});
    this.statEffects = Stats.effects(this.stats);
    this.player.setClass(run.classId || "basic");
    this.player.hp = U.clamp(run.hp || this.player.maxHp, 1, this.player.maxHp);
    this.kills = run.kills || 0;
    this.bestClassName = this.player.classDef.name;
    this.audio.play("start");
  }

  saveCurrentRun() {
    if (![State.PLAYING, State.PAUSED, State.MAP_PAUSED, State.LEVEL_UP_PAUSED].includes(this.state)) return;
    this.saveData.currentRun = {
      mapId: this.currentMap.id,
      elapsed: this.elapsed,
      level: this.level,
      xp: this.xp,
      stats: this.stats,
      classId: this.player.classId,
      hp: this.player.hp,
      kills: this.kills
    };
    this.persistSave();
  }

  saveAndQuit() {
    this.saveCurrentRun();
    this.returnToMenu();
  }

  returnToMenu() {
    this.state = State.MENU;
    this.ui.showMenu(Boolean(this.saveData.currentRun));
    this.audio.startMusic();
    this.audio.play("close");
  }

  togglePause() {
    if (this.state === State.PLAYING) this.pause();
    else if (this.state === State.PAUSED) this.resume();
    else if (this.state === State.MAP_PAUSED) {
      this.ui.hideMapChooser();
      this.state = this.previousState === State.PLAYING ? State.PLAYING : State.MENU;
    }
  }

  pause() {
    if (this.state !== State.PLAYING) return;
    this.state = State.PAUSED;
    this.saveCurrentRun();
    this.ui.showPause(this);
    this.audio.play("open");
  }

  resume() {
    if (this.state !== State.PAUSED && this.state !== State.SETTINGS) return;
    this.ui.hidePause();
    this.ui.hideSettings();
    this.state = State.PLAYING;
    this.lastTime = performance.now();
    this.audio.play("close");
  }

  loop(now) {
    const rawDt = Math.min(0.033, (now - this.lastTime) / 1000 || 0);
    this.lastTime = now;
    if (this.state === State.PLAYING) this.step(rawDt);
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
    updateFloaters(this.floaters, dt);

    if (this.elapsed >= VICTORY_TIME) this.finishRun(true);
    if (this.player.hp <= 0) this.finishRun(false);
    if (this.elapsed >= 300) this.unlockAchievement("survivor");
  }

  addXp(value) {
    if (this.state !== State.PLAYING) return;
    this.xp += value;
    if (this.xp >= this.xpRequired) {
      this.xp -= this.xpRequired;
      this.level += 1;
      this.stats.points += 1;
      this.xpRequired = XP.requiredForLevel(this.level);
      if (this.level >= 5) this.unlockAchievement("level_five");
      this.pauseForLevelUp();
      this.audio.play("level");
    }
  }

  pauseForLevelUp() {
    if (this.state === State.LEVEL_UP_PAUSED) return;
    this.state = State.LEVEL_UP_PAUSED;
    let choices = Classes.getChoices(this.player.classId, this.level);
    if (!choices || choices.length < 1) choices = ["velocity", "titan", "swarm", "orbit"].map((id) => Classes.get(id));
    this.ui.showLevelUp(choices, (classId) => this.chooseClass(classId));
  }

  chooseClass(classId) {
    const classDef = Classes.get(classId || "velocity");
    this.player.setClass(classDef.id);
    this.bestClassName = this.player.classDef.name;
    this.createBurst(this.player.x, this.player.y, 110, this.player.classDef.accent, 34);
    this.saveData.unlocks.classes = Array.from(new Set([...(this.saveData.unlocks.classes || []), classDef.id]));
    this.unlockAchievement("first_evolution");
    this.ui.hideLevelUp();
    this.state = State.PLAYING;
    this.audio.play("select");
    this.persistSave();
  }

  resolveCollisions() {
    this.projectilePool.items.forEach((projectile) => {
      if (!projectile.active) return;
      if (projectile.owner === "player") this.collidePlayerProjectile(projectile);
      else this.collideEnemyProjectile(projectile);
    });

    this.enemyPool.items.forEach((enemy) => {
      if (!enemy.active) return;
      const distance = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
      if (distance < enemy.radius + this.player.radius && this.player.damage(enemy.damage, this)) {
        this.shake = Math.max(this.shake, 9);
        this.createBurst(this.player.x, this.player.y, 48, "#ff6777", 9);
        this.audio.play("playerHit");
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
      if (this.settings.damageNumbers) this.floaters.push({ x: enemy.x, y: enemy.y - enemy.radius, value: Math.round(projectile.damage), color: projectile.config.fill, life: 0.65, maxLife: 0.65, el: null });
      Projectiles.onHit(this, projectile, projectile.x, projectile.y);
      this.shake = Math.max(this.shake, projectile.config.hitShake || 2);
      this.createBurst(enemy.x, enemy.y, enemy.radius * 0.8, projectile.config.fill, 5);
      this.audio.play("enemyHit");
      if (enemy.hp <= 0) this.killEnemy(enemy);
    });
  }

  collideEnemyProjectile(projectile) {
    const radius = projectile.radius + this.player.radius;
    if (U.dist2(projectile, this.player) > radius * radius) return;
    if (this.player.damage(projectile.damage, this)) {
      this.shake = Math.max(this.shake, projectile.config.hitShake || 5);
      this.createBurst(this.player.x, this.player.y, 52, "#ff6777", 10);
      this.audio.play("playerHit");
    }
    projectile.active = false;
  }

  killEnemy(enemy) {
    if (!enemy.active) return;
    enemy.active = false;
    this.kills += 1;
    this.saveData.totalKills += 1;
    if (this.saveData.totalKills >= 100) this.unlockAchievement("hundred_kills");
    XP.drop(this, enemy.x, enemy.y, enemy.xp);
    this.createBurst(enemy.x, enemy.y, enemy.radius * 2, enemy.config.fill, 14);
    this.audio.play("pickup");
  }

  damageEnemiesInRadius(x, y, radius, amount, sourceId) {
    this.enemyPool.items.forEach((enemy) => {
      if (!enemy.active) return;
      const hitRadius = radius + enemy.radius;
      if ((enemy.areaSource === sourceId && enemy.areaStamp === this.elapsed) || U.dist2(enemy, { x, y }) > hitRadius * hitRadius) return;
      enemy.areaSource = sourceId;
      enemy.areaStamp = this.elapsed;
      Enemies.damage(enemy, amount, "explosive");
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
      enemy.x += (dx / dist) * force;
      enemy.y += (dy / dist) * force;
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
        a.x -= (dx / d) * push;
        a.y -= (dy / d) * push;
        b.x += (dx / d) * push;
        b.y += (dy / d) * push;
      }
    }
  }

  createBurst(x, y, radius, color, count) {
    if (this.settings.performanceMode) count = Math.ceil(count * 0.45);
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
    if (!Stats.spend(this.stats, id)) return;
    this.statEffects = Stats.effects(this.stats);
    this.player.applyStats(this, 0);
    this.createBurst(this.player.x, this.player.y, 44, this.player.classDef.accent, 10);
    this.audio.play("select");
  }

  handleArenaPointer(event) {
    if (this.state !== State.PLAYING) return;
    const point = this.renderer.screenToWorld(event.clientX, event.clientY);
    const radius = this.player.radius + 12;
    if (U.dist2(point, this.player) <= radius * radius) this.openMapChooser();
  }

  finishRun(victory) {
    if (![State.PLAYING, State.LEVEL_UP_PAUSED].includes(this.state)) return;
    this.state = victory ? State.VICTORY : State.GAME_OVER;
    this.saveData.bestTime = Math.max(this.saveData.bestTime, this.elapsed);
    this.saveData.bestLevel = Math.max(this.saveData.bestLevel, this.level);
    this.saveData.currentRun = null;
    this.persistSave();
    this.ui.hideLevelUp();
    this.ui.showGameOver(this, victory);
    this.audio.play("gameOver");
  }

  unlockAchievement(id) {
    if (this.saveData.achievements.includes(id)) return;
    const achievement = ACHIEVEMENTS.find((item) => item.id === id);
    if (!achievement) return;
    this.saveData.achievements.push(id);
    this.persistSave();
    this.ui.showToast("Achievement Unlocked", achievement.name);
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

function updateFloaters(floaters, dt) {
  for (let i = floaters.length - 1; i >= 0; i -= 1) {
    const floater = floaters[i];
    floater.life -= dt;
    floater.y -= 38 * dt;
    if (floater.life <= 0) {
      if (floater.el) floater.el.remove();
      floaters.splice(i, 1);
    }
  }
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Storage may be unavailable in strict private contexts; the game still runs.
  }
}

class AudioBus {
  constructor(settings) {
    this.settings = settings;
    this.ctx = null;
    this.music = null;
  }

  applySettings(settings) {
    this.settings = settings;
    if (this.music?.gain) {
      this.music.gain.gain.value = this.musicVolume();
    }
    if (!settings.menuMusic || settings.muteAll || this.musicVolume() <= 0) this.stopMusic();
  }

  musicVolume() {
    if (this.settings.muteAll) return 0;
    return Number(this.settings.masterVolume || 0) * Number(this.settings.musicVolume || 0) * 0.035;
  }

  sfxVolume() {
    if (this.settings.muteAll) return 0;
    return Number(this.settings.masterVolume || 0) * Number(this.settings.sfxVolume || 0);
  }

  startMusic() {
    if (!this.settings.menuMusic || this.music || this.musicVolume() <= 0) return;
    try {
      this.ctx = this.ctx || new AudioContext();
      const osc = this.ctx.createOscillator();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 110;
      lfo.frequency.value = 0.08;
      lfoGain.gain.value = 18;
      gain.gain.value = this.musicVolume();
      lfo.connect(lfoGain).connect(osc.frequency);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start();
      lfo.start();
      this.music = { osc, lfo, gain };
    } catch (error) {
      this.music = null;
    }
  }

  stopMusic() {
    if (!this.music) return;
    try {
      this.music.osc.stop();
      this.music.lfo.stop();
    } catch (error) {
      // Already stopped.
    }
    this.music = null;
  }

  play(kind) {
    const volume = this.sfxVolume();
    if (volume <= 0) return;
    try {
      this.ctx = this.ctx || new AudioContext();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const tones = {
        ui: 420,
        open: 260,
        close: 190,
        start: 520,
        level: 760,
        select: 620,
        pickup: 900,
        enemyHit: 180,
        playerHit: 120,
        gameOver: 90
      };
      osc.type = kind === "gameOver" ? "sawtooth" : "triangle";
      osc.frequency.value = tones[kind] || 440;
      gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, volume * 0.045), this.ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.12);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.14);
    } catch (error) {
      // Audio is a polish layer; browser autoplay policies should not block play.
    }
  }
}

export { Game, ACHIEVEMENTS };
