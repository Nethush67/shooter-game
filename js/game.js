"use strict";

import * as U from './utils.js';
import { Input, DEFAULT_BINDINGS } from './input.js';
import { Renderer } from './renderer.js';
import { UI } from './ui.js?v=5';
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
const ACHIEVEMENTS = [
  // --- TIER 1: THE BASICS (0-30 Mins) ---
  { id: "first_blood", name: "First Blood", description: "Defeat your very first enemy." },
  { id: "level_up", name: "Level Up!", description: "Reach Level 5 in a single run." },
  { id: "first_upgrade", name: "Window Shopping", description: "Spend your first upgrade point." },
  { id: "double_digits", name: "Double Digits", description: "Reach Level 10." },
  { id: "evolved", name: "Evolved", description: "Perform your first Class Evolution." },
  { id: "just_warming_up", name: "Just Warming Up", description: "Survive for 1 minute." },
  { id: "stayin_alive", name: "Stayin' Alive", description: "Survive for 2 minutes." },
  { id: "wrong_way", name: "Wrong Way", description: "Walk into the arena border 10 times." },
  { id: "oopsies", name: "Oopsies", description: "Take damage from a Boss enemy." },
  { id: "shiny", name: "Shiny!", description: "Find a rare, large XP drop." },
  { id: "tourist", name: "Tourist", description: "Play on at least two different maps." },
  { id: "crowd_control", name: "Crowd Control", description: "Defeat 100 total enemies." },
  { id: "home_for_dinner", name: "Home for Dinner", description: "Complete an arena successfully." },
  { id: "one_more_run", name: "One More Run", description: "Die within the first 30 seconds." },
  { id: "hoarder", name: "Hoarder", description: "Hold 5 unspent upgrade points at once." },
  { id: "lucky_number_7", name: "Lucky Number 7", description: "Reach Level 7 with 7 upgrade points." },
  { id: "pacifist_mostly", name: "Pacifist... Mostly", description: "Survive 1 minute without killing anything." },
  { id: "social_distancing", name: "Social Distancing", description: "Go 2 minutes without an enemy touching you." },
  { id: "collateral_damage", name: "Collateral Damage", description: "Kill 10 enemies with one explosion." },
  { id: "heavy_hitter", name: "Heavy Hitter", description: "Deal over 200% base damage." },
  { id: "close_shave", name: "Close Shave", description: "Survive with less than 5% HP." },
  { id: "how_are_you_not_dead", name: "How are you not dead?", description: "Survive a hit with exactly 1 HP remaining." },
  { id: "speedrun", name: "Speedrun", description: "Reach Level 10 in under 2 minutes." },
  { id: "look_at_me_now", name: "Look at me now", description: "Change your class 3 times in one run." },
  { id: "technician", name: "Technician", description: "Spend 1 minute total in the upgrade menu." },

  // --- TIER 2: THE COMBATANT (30 Mins - 2 Hours) ---
  { id: "janitor", name: "The Janitor", description: "Defeat 500 total enemies." },
  { id: "quarter_life_crisis", name: "Quarter Life Crisis", description: "Reach Level 25." },
  { id: "is_it_over_yet", name: "Is it over yet?", description: "Survive for 5 minutes." },
  { id: "boss_slayer_1", name: "Scrap Metal", description: "Defeat your first Boss." },
  { id: "class_act", name: "Class Act", description: "Unlock 3 different classes." },
  { id: "maxed_out", name: "Maxed Out", description: "Max out any stat to Level 10." },
  { id: "jack_of_all_trades", name: "Jack of All Trades", description: "Have all stats at Level 5." },
  { id: "chonky_boy", name: "Chonky Boy", description: "Reach 300 Max HP." },
  { id: "im_fast_af_boi", name: "I'm Fast AF Boi", description: "Reach 150% Movement Speed." },
  { id: "vampire", name: "Vampire", description: "Reach 5.0 HP/sec Regeneration." },
  { id: "machine_gunner", name: "Machine Gunner", description: "Maximize your Fire Rate." },
  { id: "steel_wall", name: "Steel Wall", description: "Maximize your Damage Reduction." },
  { id: "screen_filler", name: "Screen Filler", description: "Reach +60% Projectile Size." },
  { id: "wealthy", name: "Wealthy", description: "Collect 1,000 XP gems in one run." },
  { id: "map_master", name: "Map Master", description: "Play every map at least once." },
  { id: "frequent_flyer", name: "Frequent Flyer", description: "Move a total distance of 100,000 units." },
  { id: "medic", name: "Medic!", description: "Regenerate 500 HP total." },
  { id: "shields_up", name: "Shields Up", description: "Block 500 damage with your shield." },
  { id: "explorer", name: "Explorer", description: "Visit every corner of the arena." },
  { id: "nothing_personal", name: "Nothing Personal", description: "Kill an enemy while they are off-screen." },
  { id: "tank_buster", name: "Tank Buster", description: "Defeat 250 Tank enemies." },
  { id: "swatter", name: "Swatter", description: "Defeat 500 Fast enemies." },
  { id: "chaser_chaser", name: "Chaser Chaser", description: "Defeat 1,000 Chaser enemies." },
  { id: "ranger_danger", name: "Ranger Danger", description: "Defeat 500 Ranger enemies." },
  { id: "variety_is_life", name: "Variety is Life", description: "Use 10 different weapons." },

  // --- TIER 3: THE SPECIALIST (2 - 5 Hours) ---
  { id: "john_wick_intern", name: "John Wick's Intern", description: "Defeat 1,000 total enemies." },
  { id: "professional_procrastinator", name: "Professional Procrastinator", description: "Survive for 10 minutes." },
  { id: "halfway_there", name: "Halfway There", description: "Reach Level 50." },
  { id: "full_house", name: "Full House", description: "Max out 3 stats in one run." },
  { id: "needle_threader", name: "Needle Threader", description: "Reach +5 Penetration." },
  { id: "turtle_power", name: "Turtle Power", description: "Survive 3 minutes without moving." },
  { id: "iron_will", name: "Iron Will", description: "Survive a run on the Volcano map for 10 minutes." },
  { id: "cold_blooded", name: "Cold Blooded", description: "Survive a run on the Ice map for 10 minutes." },
  { id: "desert_mirage", name: "Desert Mirage", description: "Survive a run on the Desert map for 10 minutes." },
  { id: "final_form_implemented", name: "Final Form", description: "Reach a Tier 3 class." },
  { id: "velocity_junkie", name: "Velocity Junkie", description: "Reach Tier 3 in the Velocity branch." },
  { id: "titan_of_industry", name: "Titan of Industry", description: "Reach Tier 3 in the Titan branch." },
  { id: "swarm_intelligence", name: "Swarm Intelligence", description: "Reach Tier 3 in the Swarm branch." },
  { id: "orbiting_sun", name: "Orbiting Sun", description: "Reach Tier 3 in the Orbit branch." },
  { id: "multi_talented", name: "Multi-Talented", description: "Unlock 10 different classes." },
  { id: "boomer", name: "Boomer", description: "Survive 5 minutes using only Explosive weapons." },
  { id: "sniper_elite", name: "Sniper Elite", description: "Survive 5 minutes using only Sniper weapons." },
  { id: "personal_space", name: "Personal Space", description: "Survive 5 minutes using only Orbit weapons." },
  { id: "boss_what_boss", name: "Boss? What Boss?", description: "Defeat a Boss enemy in under 5 seconds." },
  { id: "sniping_service", name: "Sniping Service", description: "Kill 5 enemies with a single Railgun shot." },
  { id: "bullet_hell", name: "Bullet Hell", description: "Fire 10,000 projectiles total." },
  { id: "untouchable", name: "Untouchable", description: "Kill 100 enemies without taking any damage." },
  { id: "living_on_a_prayer", name: "Living on a Prayer", description: "Survive 1 minute with less than 10 HP." },
  { id: "wait_thats_illegal", name: "Wait, that's illegal", description: "Reach Level 20 without firing a shot." },
  { id: "infinite_ammo", name: "Infinite Ammo", description: "Fire for 60 seconds without stopping." },

  // --- TIER 4 & 5: THE ELITE LEGEND (5+ Hours) ---
  { id: "delete_button", name: "Delete Button", description: "Defeat 10,000 total enemies." },
  { id: "pest_control", name: "Pest Control", description: "Defeat 50,000 total enemies." },
  { id: "dead_pixels", name: "I See Dead Pixels", description: "Defeat 100,000 total enemies." },
  { id: "career_reaper", name: "Career Choice: Reaper", description: "Defeat 250,000 total enemies." },
  { id: "one_million_no_wait", name: "One Million... No Wait", description: "Defeat 1,000,000 total enemies." },
  { id: "marathon_runner", name: "Marathon Runner", description: "Survive for 20 minutes." },
  { id: "leg_day", name: "Leg Day", description: "Survive for 30 minutes." },
  { id: "time_is_a_circle", name: "Time Is A Circle", description: "Survive for 45 minutes." },
  { id: "the_eternalist", name: "The Eternalist", description: "Survive for 60 minutes." },
  { id: "grandmaster", name: "Grandmaster", description: "Reach Level 75." },
  { id: "i_have_ascended", name: "I Have Ascended", description: "Reach Level 100." },
  { id: "big_spender", name: "Big Spender", description: "Spend 500 upgrade points total." },
  { id: "perfectionist", name: "Perfectionist", description: "Have all stats at Level 10." },
  { id: "glass_cannon", name: "Glass Cannon", description: "Reach Level 30 with no Health upgrades." },
  { id: "overpowered", name: "Overpowered", description: "Max out 5 stats in one run." },
  { id: "god_mode", name: "God Mode", description: "Max out all stats AND reach Level 100." },
  { id: "magician", name: "Magician", description: "Collect 10,000 XP gems total." },
  { id: "game_over", name: "Game Over?", description: "Reach the Game Over screen 20 times." },
  { id: "persistence", name: "Persistence", description: "Play for a total of 5 hours." },
  { id: "devs_best_friend", name: "Dev's Best Friend", description: "Open the achievements menu 50 times." },
  { id: "elite_hunter", name: "Elite Hunter", description: "Defeat 25 Bosses total." },
  { id: "completionist_phase1", name: "Completionist Phase 1", description: "Unlock 20 different classes." },
  { id: "almost_there", name: "Almost There", description: "Unlock 90 achievements." },
  { id: "the_legend", name: "The Legend", description: "Unlock 98 achievements." },
  { id: "the_penultimate", name: "The Penultimate", description: "Unlock 99 achievements." },
  { id: "the_completionist", name: "The Completionist", description: "Unlock all other 99 achievements." }
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
    // Shared safe variables to prevent undefined crashes
    const lifetimeKills = this.saveData.totalKills || 0;
    const unlockedClasses = this.saveData.unlockedClasses || [];
    const unlockedMaps = this.saveData.unlockedMaps || [];
    const pointsSpent = this.saveData.totalPointsSpent || 0;

    // --- TIER 1: THE BASICS ---
    if (this.kills >= 1) this.unlockAchievement("first_blood");
    if (this.stats.level >= 5) this.unlockAchievement("level_up");
    if (pointsSpent >= 1) this.unlockAchievement("first_upgrade");
    if (this.stats.level >= 10) this.unlockAchievement("double_digits");
    if (unlockedClasses.length > 1) this.unlockAchievement("evolved");
    if (this.elapsed >= 60) this.unlockAchievement("just_warming_up");
    if (this.elapsed >= 120) this.unlockAchievement("stayin_alive");
    if ((this.player.borderHits || 0) >= 10) this.unlockAchievement("wrong_way");
    if ((this.player.lastBossDamageTime || 0) > 0) this.unlockAchievement("oopsies");
    if (this.player.foundRareXp) this.unlockAchievement("shiny");
    if (unlockedMaps.length >= 2) this.unlockAchievement("tourist");
    if (lifetimeKills >= 100) this.unlockAchievement("crowd_control");
    if (this.state === U.State.VICTORY) this.unlockAchievement("home_for_dinner");
    if (this.state === U.State.GAME_OVER && this.elapsed <= 30) this.unlockAchievement("one_more_run");
    if (this.stats.points >= 5) this.unlockAchievement("hoarder");
    if (this.stats.level === 7 && this.stats.points === 7) this.unlockAchievement("lucky_number_7");
    if (this.elapsed >= 60 && this.kills === 0) this.unlockAchievement("pacifist_mostly");
    if (this.elapsed >= 120 && !(this.player.lastDamageTime || 0)) this.unlockAchievement("social_distancing");
    if ((this.player.maxMultiKill || 0) >= 10 || this.kills >= 150) this.unlockAchievement("collateral_damage");
    if ((this.statEffects.damageMultiplier || 1) >= 2.0) this.unlockAchievement("heavy_hitter");
    if (this.player.hp > 0 && this.player.hp <= this.player.maxHp * 0.05) this.unlockAchievement("close_shave");
    if (this.player.hp === 1) this.unlockAchievement("how_are_you_not_dead");
    if (this.stats.level >= 10 && this.elapsed <= 120) this.unlockAchievement("speedrun");
    if ((this.player.classChanges || 0) >= 3) this.unlockAchievement("look_at_me_now");
    if ((this.player.menuTime || 0) >= 60) this.unlockAchievement("technician");

    // --- TIER 2: THE COMBATANT ---
    if (lifetimeKills >= 500) this.unlockAchievement("janitor");
    if (this.stats.level >= 25) this.unlockAchievement("quarter_life_crisis");
    if (this.elapsed >= 300) this.unlockAchievement("is_it_over_yet");
    if ((this.saveData.bossesKilled || 0) >= 1) this.unlockAchievement("boss_slayer_1");
    if (unlockedClasses.length >= 3) this.unlockAchievement("class_act");
    if (Object.values(this.stats.levels).some(l => l >= 10)) this.unlockAchievement("maxed_out");
    if (Object.values(this.stats.levels).every(l => l >= 5)) this.unlockAchievement("jack_of_all_trades");
    if (this.player.maxHp >= 300) this.unlockAchievement("chonky_boy");
    if ((this.statEffects.speedMultiplier || 1) >= 1.5) this.unlockAchievement("im_fast_af_boi");
    if ((this.statEffects.regenPerSecond || 0) >= 5.0) this.unlockAchievement("vampire");
    if ((this.statEffects.cooldownMultiplier || 1) <= 0.6) this.unlockAchievement("machine_gunner");
    if ((this.statEffects.damageTakenMultiplier || 1) <= 0.65) this.unlockAchievement("steel_wall");
    if ((this.statEffects.projectileSizeMultiplier || 1) >= 1.6) this.unlockAchievement("screen_filler");
    if ((this.player.gemsCollected || 0) >= 1000 || this.stats.level >= 30) this.unlockAchievement("wealthy");
    if (unlockedMaps.length >= 5) this.unlockAchievement("map_master");
    if ((this.saveData.lifetimeDistance || 0) >= 100000) this.unlockAchievement("frequent_flyer");
    if ((this.saveData.totalRegenerated || 0) >= 500) this.unlockAchievement("medic");
    if ((this.saveData.totalDamageBlocked || 0) >= 500) this.unlockAchievement("shields_up");
    if ((this.player.cornersVisited || 0) >= 4) this.unlockAchievement("explorer");
    if ((this.player.offScreenKills || 0) >= 1 || lifetimeKills >= 1500) this.unlockAchievement("nothing_personal");
    if ((this.saveData.tanksKilled || 0) >= 250) this.unlockAchievement("tank_buster");
    if ((this.saveData.fastKilled || 0) >= 500) this.unlockAchievement("swatter");
    if ((this.saveData.chasersKilled || 0) >= 1000) this.unlockAchievement("chaser_chaser");
    if ((this.saveData.rangersKilled || 0) >= 500) this.unlockAchievement("ranger_danger");
    if ((this.saveData.weaponsUsed || 0) >= 10) this.unlockAchievement("variety_is_life");

    // --- TIER 3: THE SPECIALIST ---
    if (lifetimeKills >= 1000) this.unlockAchievement("john_wick_intern");
    if (this.elapsed >= 600) this.unlockAchievement("professional_procrastinator");
    if (this.stats.level >= 50) this.unlockAchievement("halfway_there");
    if (Object.values(this.stats.levels).filter(l => l >= 10).length >= 3) this.unlockAchievement("full_house");
    if ((this.statEffects.extraPierce || 0) >= 5) this.unlockAchievement("needle_threader");
    if (this.elapsed >= 180 && !(this.player.hasMoved || false)) this.unlockAchievement("turtle_power");
    if (this.elapsed >= 600 && this.currentMap && this.currentMap.id === "volcano") this.unlockAchievement("iron_will");
    if (this.elapsed >= 600 && this.currentMap && this.currentMap.id === "ice") this.unlockAchievement("cold_blooded");
    if (this.elapsed >= 600 && this.currentMap && this.currentMap.id === "desert") this.unlockAchievement("desert_mirage");
    if (this.player.classDef && this.player.classDef.tier >= 3) this.unlockAchievement("final_form_implemented");
    if (unlockedClasses.includes("velocity_tier_3")) this.unlockAchievement("velocity_junkie");
    if (unlockedClasses.includes("titan_tier_3")) this.unlockAchievement("titan_of_industry");
    if (unlockedClasses.includes("swarm_tier_3")) this.unlockAchievement("swarm_intelligence");
    if (unlockedClasses.includes("orbit_tier_3")) this.unlockAchievement("orbiting_sun");
    if (unlockedClasses.length >= 10) this.unlockAchievement("multi_talented");
    if (this.player.explosiveOnlyRun && this.elapsed > 300) this.unlockAchievement("boomer");
    if (this.player.sniperOnlyRun && this.elapsed > 300) this.unlockAchievement("sniper_elite");
    if (this.player.orbitOnlyRun && this.elapsed > 300) this.unlockAchievement("personal_space");
    if ((this.player.fastBossKill || 0) >= 1) this.unlockAchievement("boss_what_boss");
    if ((this.player.sniperMultiKill || 0) >= 5) this.unlockAchievement("sniping_service");
    if ((this.player.projectilesFired || 0) >= 10000) this.unlockAchievement("bullet_hell");
    if (this.kills >= 100 && !(this.player.lastDamageTime || 0)) this.unlockAchievement("untouchable");
    if (this.elapsed >= 60 && this.player.hp < 10) this.unlockAchievement("living_on_a_prayer");
    if (this.stats.level >= 20 && this.kills === 0) this.unlockAchievement("wait_thats_illegal");
    if (this.player.lastFireTime && this.elapsed - this.player.lastFireTime >= 60) this.unlockAchievement("infinite_ammo");

    // --- TIER 4 & 5: THE ELITE LEGEND ---
    if (lifetimeKills >= 10000) this.unlockAchievement("delete_button");
    if (lifetimeKills >= 50000) this.unlockAchievement("pest_control");
    if (lifetimeKills >= 100000) this.unlockAchievement("dead_pixels");
    if (lifetimeKills >= 250000) this.unlockAchievement("career_reaper");
    if (lifetimeKills >= 1000000) this.unlockAchievement("one_million_no_wait");
    if (this.elapsed >= 1200) this.unlockAchievement("marathon_runner");
    if (this.elapsed >= 1800) this.unlockAchievement("leg_day");
    if (this.elapsed >= 2700) this.unlockAchievement("time_is_a_circle");
    if (this.elapsed >= 3600) this.unlockAchievement("the_eternalist");
    if (this.stats.level >= 75) this.unlockAchievement("grandmaster");
    if (this.stats.level >= 100) this.unlockAchievement("i_have_ascended");
    if (pointsSpent >= 500) this.unlockAchievement("big_spender");
    if (Object.values(this.stats.levels).every(l => l >= 10)) this.unlockAchievement("perfectionist");
    if (this.stats.level >= 30 && this.stats.levels.health === 0) this.unlockAchievement("glass_cannon");
    if (Object.values(this.stats.levels).filter(l => l >= 10).length >= 5) this.unlockAchievement("overpowered");
    
    // God mode requires Max Level AND Maxed out upgrade tree
    if (Object.values(this.stats.levels).every(l => l >= 10) && this.stats.level >= 100) {
        this.unlockAchievement("god_mode");
    }

    if ((this.saveData.lifetimeXpCollected || 0) >= 10000) this.unlockAchievement("magician");
    if ((this.saveData.gameOverCount || 0) >= 20) this.unlockAchievement("game_over");
    if ((this.saveData.totalPlayTime || 0) >= 18000) this.unlockAchievement("persistence");
    if ((this.saveData.achievementsMenuOpens || 0) >= 50) this.unlockAchievement("devs_best_friend");
    if ((this.saveData.bossesKilled || 0) >= 25) this.unlockAchievement("elite_hunter");
    if (unlockedClasses.length >= 20) this.unlockAchievement("completionist_phase1");
    if (this.saveData.achievements.length >= 90) this.unlockAchievement("almost_there");
    if (this.saveData.achievements.length >= 98) this.unlockAchievement("the_legend");
    if (this.saveData.achievements.length >= 99) this.unlockAchievement("the_penultimate");
    
    // Triggers when 99 other achievements are already logged in saveData
    if (this.saveData.achievements.length === 99) this.unlockAchievement("the_completionist");
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
