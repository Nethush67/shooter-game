"use strict";

import * as U from './utils.js';
import { Input, DEFAULT_BINDINGS } from './input.js';
import { Renderer } from './renderer.js';
import { UI } from './ui.js?v=6';
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

// 100 unique achievements with funny names - no loops, all hardcoded
// 100 Unique Achievements - Perfectly Paced from Early to End Game
// 100 Unique Achievements - Perfectly Paced from Early to End Game
// 100 Unique Achievements - 100% Native Tracking Guarantee
const ACHIEVEMENTS = [
  // --- TIER 1: THE BASICS (0-15 Mins) ---
  { id: "first_blood", name: "First Blood", description: "Defeat your first enemy." },
  { id: "level_5", name: "Getting Started", description: "Reach Level 5." },
  { id: "survive_1m", name: "Just A Minute", description: "Survive for 1 minute." },
  { id: "first_upgrade", name: "Tinkerer", description: "Spend your first upgrade point." },
  { id: "die_quick", name: "Skill Issue", description: "Die within the first 30 seconds." },
  { id: "level_10", name: "Double Digits", description: "Reach Level 10." },
  { id: "evolved", name: "Evolved", description: "Perform your first Class Evolution." },
  { id: "run_kills_100", name: "Crowd Control", description: "Defeat 100 enemies in one run." },
  { id: "survive_3m", name: "Finding Your Footing", description: "Survive for 3 minutes." },
  { id: "max_one_stat", name: "Specialist", description: "Max out any stat to Level 10." },
  { id: "lucky_7", name: "Lucky Number 7", description: "Hold 7 unspent upgrade points at once." },
  { id: "hoarder", name: "Hoarder", description: "Hold 5 unspent upgrade points at once." },
  { id: "survive_5m", name: "Is It Over Yet?", description: "Survive for 5 minutes." },
  { id: "pacifist_1m", name: "Pacifist", description: "Survive the first 1 minute without killing anything." },
  { id: "untouchable_1m", name: "Untouchable", description: "Survive for 1 minute without taking damage." },
  { id: "run_kills_500", name: "The Janitor", description: "Defeat 500 enemies in one run." },
  { id: "level_20", name: "Rising Star", description: "Reach Level 20." },
  { id: "level_15", name: "Stepping Up", description: "Reach Level 15." },
  { id: "tier_3_class", name: "Final Form", description: "Reach a Tier 3 class." },
  { id: "survive_10m", name: "Professional Procrastinator", description: "Survive for 10 minutes." },

  // --- TIER 2: FOCUSED BUILDS & CHALLENGES (15-60 Mins) ---
  { id: "max_health", name: "Chonky Boy", description: "Max out the Health stat." },
  { id: "max_speed", name: "I'm Fast AF Boi", description: "Max out the Speed stat." },
  { id: "max_regen", name: "Troll Blood", description: "Max out the Regeneration stat." },
  { id: "max_damage", name: "Heavy Hitter", description: "Max out the Damage stat." },
  { id: "max_fire_rate", name: "Machine Gunner", description: "Max out the Fire Rate stat." },
  { id: "max_shield", name: "Steel Wall", description: "Max out the Shield stat." },
  { id: "max_size", name: "Screen Filler", description: "Max out Projectile Size." },
  { id: "max_pierce", name: "Needle Threader", description: "Max out Penetration." },
  { id: "run_kills_1000", name: "John Wick's Intern", description: "Defeat 1,000 enemies in one run." },
  { id: "level_30", name: "Arena Champion", description: "Reach Level 30." },
  { id: "velocity_t3", name: "Velocity Mastery", description: "Reach Tier 3 in the Velocity branch." },
  { id: "titan_t3", name: "Titan Mastery", description: "Reach Tier 3 in the Titan branch." },
  { id: "swarm_t3", name: "Swarm Mastery", description: "Reach Tier 3 in the Swarm branch." },
  { id: "orbit_t3", name: "Orbit Mastery", description: "Reach Tier 3 in the Orbit branch." },
  { id: "survive_15m", name: "Marathon Runner", description: "Survive for 15 minutes." },
  { id: "close_shave", name: "Close Shave", description: "Survive with less than 5% HP." },
  { id: "glass_cannon_20", name: "Glass Cannon", description: "Reach Level 20 with ZERO Health upgrades." },
  { id: "pacifist_2m", name: "Zen Master", description: "Survive the first 2 minutes without killing anything." },
  { id: "untouchable_3m", name: "Can't Touch This", description: "Survive for 3 minutes without taking damage." },
  { id: "three_max_stats", name: "Synergy", description: "Max out 3 different stats in a single run." },
  { id: "hoarder_pro", name: "Dragon's Hoard", description: "Hold 15 unspent upgrade points at once." },
  { id: "run_kills_2500", name: "Crowd Favorite", description: "Defeat 2,500 enemies in one run." },
  { id: "level_35", name: "Unstoppable", description: "Reach Level 35." },
  { id: "level_40", name: "Dominator", description: "Reach Level 40." },
  { id: "survive_20m", name: "The 20-Minute Club", description: "Survive for 20 minutes." },

  // --- TIER 3: LATE GAME MASTERY (1-5 Hours) ---
  { id: "run_kills_5000", name: "Delete Button", description: "Defeat 5,000 enemies in one run." },
  { id: "level_50", name: "Halfway There", description: "Reach Level 50." },
  { id: "five_max_stats", name: "Overpowered", description: "Max out 5 different stats in a single run." },
  { id: "glass_cannon_40", name: "Fragile but Deadly", description: "Reach Level 40 with ZERO Health upgrades." },
  { id: "untouchable_5m", name: "Matrix Dodge", description: "Survive for 5 minutes without taking damage." },
  { id: "speedrun_20", name: "Speed Demon", description: "Reach Level 20 in under 4 minutes." },
  { id: "pacifist_3m", name: "Ultimate Pacifist", description: "Survive the first 3 minutes without killing anything." },
  { id: "level_45", name: "Veteran", description: "Reach Level 45." },
  { id: "level_60", name: "Legendary", description: "Reach Level 60." },
  { id: "run_kills_7500", name: "Extinction Event", description: "Defeat 7,500 enemies in one run." },
  { id: "survive_25m", name: "Endurance Test", description: "Survive for 25 minutes." },
  { id: "all_stats_5", name: "Jack of All Trades", description: "Reach Level 5 in every single stat." },
  { id: "level_70", name: "Mythic", description: "Reach Level 70." },
  { id: "run_kills_10000", name: "One Man Army", description: "Defeat 10,000 enemies in one run." },
  { id: "survive_30m", name: "The 30-Minute Stand", description: "Survive for 30 minutes." },

  // --- MAPS & PROGRESSION ---
  { id: "play_desert", name: "Sand in my Boots", description: "Play a run on the Desert Map." },
  { id: "play_ice", name: "Frostbite", description: "Play a run on the Ice Map." },
  { id: "play_volcano", name: "The Floor is Lava", description: "Play a run on the Volcano Map." },
  { id: "win_standard", name: "Standard Victory", description: "Survive 5 minutes on the Standard Map." },
  { id: "win_desert", name: "Desert Victory", description: "Survive 5 minutes on the Desert Map." },
  { id: "win_ice", name: "Ice Victory", description: "Survive 5 minutes on the Ice Map." },
  { id: "win_volcano", name: "Volcano Victory", description: "Survive 5 minutes on the Volcano Map." },
  { id: "lifetime_kills_1k", name: "Warming up the Blade", description: "Defeat 1,000 enemies total across all runs." },
  { id: "lifetime_kills_5k", name: "Getting Serious", description: "Defeat 5,000 enemies total across all runs." },
  { id: "lifetime_kills_10k", name: "Career Reaper", description: "Defeat 10,000 enemies total across all runs." },
  { id: "lifetime_kills_25k", name: "Pest Control", description: "Defeat 25,000 enemies total across all runs." },
  { id: "lifetime_kills_50k", name: "I See Dead Pixels", description: "Defeat 50,000 enemies total across all runs." },
  { id: "lifetime_kills_100k", name: "One Million... No Wait", description: "Defeat 100,000 enemies total across all runs." },
  { id: "survive_7m", name: "Lucky Number 7", description: "Survive for 7 minutes." },
  { id: "survive_12m", name: "A Dozen Minutes", description: "Survive for 12 minutes." },
  { id: "survive_17m", name: "Getting Sweaty", description: "Survive for 17 minutes." },
  { id: "survive_22m", name: "Deep Dive", description: "Survive for 22 minutes." },
  { id: "classes_unlocked_5", name: "Class Act", description: "Unlock 5 different classes." },
  { id: "classes_unlocked_10", name: "Multi-Talented", description: "Unlock 10 different classes." },
  { id: "classes_unlocked_all", name: "Full Pokédex", description: "Unlock every base class in the game." },

  // --- TIER 4: THE LEGENDARY GRIND (5+ Hours) ---
  { id: "level_80", name: "Immortal", description: "Reach Level 80." },
  { id: "level_90", name: "Demi-God", description: "Reach Level 90." },
  { id: "level_100", name: "Century Club", description: "Reach Level 100." },
  { id: "run_kills_15000", name: "Apocalypse", description: "Defeat 15,000 enemies in one run." },
  { id: "survive_40m", name: "Time is a Circle", description: "Survive for 40 minutes." },
  { id: "survive_50m", name: "What year is it?", description: "Survive for 50 minutes." },
  { id: "survive_60m", name: "The Eternalist", description: "Survive for 60 minutes." },
  { id: "all_stats_10", name: "God Mode", description: "Reach Level 10 in every single stat in one run." },
  { id: "glass_cannon_50", name: "Untouchable God", description: "Reach Level 50 with ZERO Health upgrades." },
  { id: "speedrun_30", name: "Light Speed", description: "Reach Level 30 in under 8 minutes." },
  { id: "pacifist_5m", name: "Ascended Pacifist", description: "Survive 5 minutes without killing anything." },
  { id: "untouchable_10m", name: "Ghost", description: "Survive for 10 minutes without taking damage." },
  { id: "survive_35m", name: "Marathon Master", description: "Survive for 35 minutes." },
  { id: "level_120", name: "Game Tester", description: "Find a way to reach Level 120." },
  { id: "achievements_50", name: "Halfway Done", description: "Unlock 50 achievements." },
  { id: "achievements_75", name: "Completionist in Training", description: "Unlock 75 achievements." },
  { id: "achievements_90", name: "Almost There", description: "Unlock 90 achievements." },
  { id: "achievements_98", name: "The Legend", description: "Unlock 98 achievements." },
  { id: "achievements_99", name: "The Penultimate", description: "Unlock 99 achievements." },
  { id: "achievements_100", name: "The Completionist", description: "Unlock all other 99 achievements. You did it!" }
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
    this.totalDamageDealt = 0;

    // Achievement tracking flags
    this.hasTakenDamage = false;
    this.runStartedWithZeroKills = true;
    this.closeShaveUnlocked = false;

    this.input.setPauseHandler(() => this.togglePause());
    this.ui.bind(this);
    this.ui.updateSettingsUI(this.settings, this.input.bindings);
    this.svg.addEventListener("pointerdown", (event) => this.handleArenaPointer(event));
    // FAIL-SAFE ACHIEVEMENT TRACKER: Runs once every second independently of the game loop
    setInterval(() => {
      if (typeof this.checkAchievements === 'function') {
        this.checkAchievements();
      }
    }, 1000);
  }


  start() {
    this.ui.showLoading();
    requestAnimationFrame(this.loop);
    window.setTimeout(() => {
      this.state = State.MENU;
      this.ui.showMenu(Boolean(this.saveData.currentRun), this);
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
      bestClassName: "Basic",
      totalPointsSpent: 0,
      totalXpCollected: 0,
      lifetimeXpCollected: 0,
      totalPlayTime: 0,
      achievementsMenuOpens: 0,
      gameOverCount: 0,
      unlockedMaps: ["standard"],
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
    this.saveData.achievementsMenuOpens += 1;
    this.persistSave();
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
      this.ui.showMenu(false, this);
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
      this.ui.showMenu(false, this);
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
    this.hasTakenDamage = false;
    this.runStartedWithZeroKills = true;
    this.closeShaveUnlocked = false;
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
    this.runStartedWithZeroKills = (run.kills || 0) === 0;
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
    this.ui.showMenu(Boolean(this.saveData.currentRun), this);
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

    // Check achievements during gameplay
    this.checkAchievements();

    if (this.elapsed >= VICTORY_TIME) this.finishRun(true);
    if (this.player.hp <= 0) this.finishRun(false);
  }

  addXp(value) {
    if (this.state !== State.PLAYING) return;
    this.xp += value;
    this.saveData.totalXpCollected += value;
    if (this.xp >= this.xpRequired) {
      this.xp -= this.xpRequired;
      this.level += 1;
       this.stats.points += 1;
       this.xpRequired = XP.requiredForLevel(this.level);
       if (this.level >= 5) this.unlockAchievement("level_5");
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
    this.unlockAchievement("evolved");
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
      const damageDealt = projectile.damage;
      this.totalDamageDealt += damageDealt;
      this.saveData.bestDamage = Math.max(this.saveData.bestDamage || 0, this.totalDamageDealt);
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
    this.runStartedWithZeroKills = false;
    this.saveData.totalKills += 1;
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
    this.saveData.totalPointsSpent += 1;
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
    this.saveData.totalPlayTime += this.elapsed;
    if (!victory) this.saveData.gameOverCount += 1;
    this.saveData.currentRun = null;
    this.persistSave();
    this.ui.hideLevelUp();
    
    // Check die_quick after state change
    if (!victory && this.elapsed <= 30) {
      this.unlockAchievement("die_quick");
    }
    
    this.ui.showGameOver(this, victory);
    this.audio.play(victory ? "victory" : "gameOver");
  }

  unlockAchievement(id) {
    if (this.saveData.achievements.includes(id)) return;
    const achievement = ACHIEVEMENTS.find((item) => item.id === id);
    if (!achievement) return;
    this.saveData.achievements.push(id);
    this.persistSave();
    this.ui.showToast("Achievement Unlocked", achievement.name);
  }

checkAchievements() {
     // Only process achievements if we have started playing or died
     if (!this.state || (this.state !== State.PLAYING && this.state !== State.GAME_OVER)) return;

     // Shared safe variables (Defaults to 0 or empty to prevent crashes)
     const elapsed = this.elapsed || 0;
     const kills = this.kills || 0;
     const level = this.level || 1;
     const hp = this.player?.hp || 0;
     const maxHp = this.player?.maxHp || 100;
     const points = this.stats?.points || 0;
     const stats = this.stats?.levels || {};
     
     const lifetimeKills = this.saveData?.totalKills || kills; 
     const unlockedClasses = this.saveData?.unlocks?.classes || [];
     const maxedStatsCount = Object.values(stats).filter(v => v >= 10).length;
     const upgradedStatCount = Object.values(stats).filter(v => v > 0).length;

     // --- 1. LEVEL & PROGRESSION ---
     if (level >= 5) this.unlockAchievement("level_5");
     if (level >= 10) this.unlockAchievement("level_10");
     if (level >= 15) this.unlockAchievement("level_15");
     if (level >= 20) this.unlockAchievement("level_20");
     if (level >= 30) this.unlockAchievement("level_30");
     if (level >= 35) this.unlockAchievement("level_35");
     if (level >= 40) this.unlockAchievement("level_40");
     if (level >= 45) this.unlockAchievement("level_45");
     if (level >= 50) this.unlockAchievement("level_50");
     if (level >= 60) this.unlockAchievement("level_60");
     if (level >= 70) this.unlockAchievement("level_70");
     if (level >= 80) this.unlockAchievement("level_80");
     if (level >= 90) this.unlockAchievement("level_90");
     if (level >= 100) this.unlockAchievement("level_100");
     if (level >= 120) this.unlockAchievement("level_120");

     // --- 2. KILLS ---
     if (kills >= 1) this.unlockAchievement("first_blood");
     if (kills >= 100) this.unlockAchievement("run_kills_100");
     if (kills >= 500) this.unlockAchievement("run_kills_500");
     if (kills >= 1000) this.unlockAchievement("run_kills_1000");
     if (kills >= 2500) this.unlockAchievement("run_kills_2500");
     if (kills >= 5000) this.unlockAchievement("run_kills_5000");
     if (kills >= 7500) this.unlockAchievement("run_kills_7500");
     if (kills >= 10000) this.unlockAchievement("run_kills_10000");
     if (kills >= 15000) this.unlockAchievement("run_kills_15000");

     // --- 3. SURVIVAL TIME ---
     if (elapsed >= 60) this.unlockAchievement("survive_1m");
     if (elapsed >= 180) this.unlockAchievement("survive_3m");
     if (elapsed >= 300) this.unlockAchievement("survive_5m");
     if (elapsed >= 420) this.unlockAchievement("survive_7m");
     if (elapsed >= 600) this.unlockAchievement("survive_10m");
     if (elapsed >= 720) this.unlockAchievement("survive_12m");
     if (elapsed >= 900) this.unlockAchievement("survive_15m");
     if (elapsed >= 1020) this.unlockAchievement("survive_17m");
     if (elapsed >= 1200) this.unlockAchievement("survive_20m");
     if (elapsed >= 1320) this.unlockAchievement("survive_22m");
     if (elapsed >= 1500) this.unlockAchievement("survive_25m");
     if (elapsed >= 1800) this.unlockAchievement("survive_30m");
     if (elapsed >= 2100) this.unlockAchievement("survive_35m");
     if (elapsed >= 2400) this.unlockAchievement("survive_40m");
     if (elapsed >= 3000) this.unlockAchievement("survive_50m");
     if (elapsed >= 3600) this.unlockAchievement("survive_60m");

     // --- 4. GAME STATE (die_quick checked after finishRun) ---

     // --- 5. STAT MAXING & UPGRADES ---
     if (upgradedStatCount >= 1) this.unlockAchievement("first_upgrade");

     const healthLvl = stats.health || 0;
     if (healthLvl >= 10) this.unlockAchievement("max_health");
     if ((stats.speed || 0) >= 10) this.unlockAchievement("max_speed");
     if ((stats.regen || 0) >= 10) this.unlockAchievement("max_regen");
     if ((stats.damage || 0) >= 10) this.unlockAchievement("max_damage");
     if ((stats.fireRate || 0) >= 10) this.unlockAchievement("max_fire_rate");
     if ((stats.shield || 0) >= 10) this.unlockAchievement("max_shield");
     if ((stats.size || 0) >= 10) this.unlockAchievement("max_size");
     if ((stats.pierce || 0) >= 10) this.unlockAchievement("max_pierce");

     if (maxedStatsCount >= 1) this.unlockAchievement("max_one_stat");
     if (maxedStatsCount >= 3) this.unlockAchievement("three_max_stats");
     if (maxedStatsCount >= 5) this.unlockAchievement("five_max_stats");
     if (maxedStatsCount >= 8) this.unlockAchievement("all_stats_10");

     if (Object.values(stats).every(v => v >= 5)) this.unlockAchievement("all_stats_5");

     if (level >= 20 && healthLvl === 0) this.unlockAchievement("glass_cannon_20");
     if (level >= 40 && healthLvl === 0) this.unlockAchievement("glass_cannon_40");
     if (level >= 50 && healthLvl === 0) this.unlockAchievement("glass_cannon_50");

     // --- 6. CHALLENGES ---
     if (points >= 5) this.unlockAchievement("hoarder");
     if (points >= 7) this.unlockAchievement("lucky_7");
     if (points >= 15) this.unlockAchievement("hoarder_pro");

     // Pacifist: check that we've never killed anything from start
     if (elapsed >= 60 && this.runStartedWithZeroKills && kills === 0) this.unlockAchievement("pacifist_1m");
     if (elapsed >= 120 && this.runStartedWithZeroKills && kills === 0) this.unlockAchievement("pacifist_2m");
     if (elapsed >= 180 && this.runStartedWithZeroKills && kills === 0) this.unlockAchievement("pacifist_3m");
     if (elapsed >= 300 && this.runStartedWithZeroKills && kills === 0) this.unlockAchievement("pacifist_5m");
     
     // Untouchable: check that we've never taken damage
     if (elapsed >= 60 && !this.hasTakenDamage && hp >= maxHp) this.unlockAchievement("untouchable_1m");
     if (elapsed >= 180 && !this.hasTakenDamage && hp >= maxHp) this.unlockAchievement("untouchable_3m");
     if (elapsed >= 300 && !this.hasTakenDamage && hp >= maxHp) this.unlockAchievement("untouchable_5m");
     if (elapsed >= 600 && !this.hasTakenDamage && hp >= maxHp) this.unlockAchievement("untouchable_10m");

     if (hp > 0 && hp <= maxHp * 0.05 && !this.closeShaveUnlocked) {
       this.closeShaveUnlocked = true;
       this.unlockAchievement("close_shave");
     }
     if (level >= 20 && elapsed <= 240) this.unlockAchievement("speedrun_20");
     if (level >= 30 && elapsed <= 480) this.unlockAchievement("speedrun_30");

     // --- 7. CLASSES & MAPS ---
     const tier = this.player?.classDef?.tier || 0;
     const classId = this.player?.classDef?.id || "";
     const mapId = this.currentMap?.id || "";

     if (tier >= 1) this.unlockAchievement("evolved");
     if (tier >= 3) this.unlockAchievement("tier_3_class");
     if (classId.includes("velocity") && tier >= 3) this.unlockAchievement("velocity_t3");
     if (classId.includes("titan") && tier >= 3) this.unlockAchievement("titan_t3");
     if (classId.includes("swarm") && tier >= 3) this.unlockAchievement("swarm_t3");
     if (classId.includes("orbit") && tier >= 3) this.unlockAchievement("orbit_t3");

     if (mapId === "desert") this.unlockAchievement("play_desert");
     if (mapId === "ice") this.unlockAchievement("play_ice");
     if (mapId === "volcano") this.unlockAchievement("play_volcano");
     
     if (elapsed >= 300) {
         if (mapId === "standard") this.unlockAchievement("win_standard");
         if (mapId === "desert") this.unlockAchievement("win_desert");
         if (mapId === "ice") this.unlockAchievement("win_ice");
         if (mapId === "volcano") this.unlockAchievement("win_volcano");
     }

     // --- 8. LIFETIME STATS (Saves across runs) ---
     if (lifetimeKills >= 1000) this.unlockAchievement("lifetime_kills_1k");
     if (lifetimeKills >= 5000) this.unlockAchievement("lifetime_kills_5k");
     if (lifetimeKills >= 10000) this.unlockAchievement("lifetime_kills_10k");
     if (lifetimeKills >= 25000) this.unlockAchievement("lifetime_kills_25k");
     if (lifetimeKills >= 50000) this.unlockAchievement("lifetime_kills_50k");
     if (lifetimeKills >= 100000) this.unlockAchievement("lifetime_kills_100k");

     if (unlockedClasses.length >= 5) this.unlockAchievement("classes_unlocked_5");
     if (unlockedClasses.length >= 10) this.unlockAchievement("classes_unlocked_10");
     if (unlockedClasses.length >= 15) this.unlockAchievement("classes_unlocked_all");

     // --- 9. COMPLETIONIST MILESTONES ---
     const totalUnlocked = this.saveData?.achievements?.length || 0;
     if (totalUnlocked >= 50) this.unlockAchievement("achievements_50");
     if (totalUnlocked >= 75) this.unlockAchievement("achievements_75");
     if (totalUnlocked >= 90) this.unlockAchievement("achievements_90");
     if (totalUnlocked >= 98) this.unlockAchievement("achievements_98");
     if (totalUnlocked >= 99) this.unlockAchievement("achievements_99");
     
     // Automatically granted when all 99 others are earned
     if (totalUnlocked === 99 && !this.saveData.achievements.includes("achievements_100")) {
       this.unlockAchievement("achievements_100");
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
