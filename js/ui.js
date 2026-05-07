"use strict";

import * as U from './utils.js';
import { Maps } from './maps.js';
import { ClassesAPI as Classes } from './classes.js';

class UI {
    constructor() {
      this.hpFill = document.getElementById("hpFill");
      this.hpText = document.getElementById("hpText");
      this.xpFill = document.getElementById("xpFill");
      this.xpText = document.getElementById("xpText");
      this.levelText = document.getElementById("levelText");
      this.classText = document.getElementById("classText");
      this.mapText = document.getElementById("mapText");
      this.timeText = document.getElementById("timeText");
      this.fpsText = document.getElementById("fpsText");
      this.playerMenuButton = document.getElementById("playerMenuButton");
      this.upgradePointsText = document.getElementById("upgradePointsText");
      this.statBars = document.getElementById("statBars");
      this.menuOverlay = document.getElementById("menuOverlay");
      this.levelOverlay = document.getElementById("levelOverlay");
      this.choiceGrid = document.getElementById("levelChoices");
      this.mapOverlay = document.getElementById("mapOverlay");
      this.mapChoices = document.getElementById("mapChoices");
      this.settingsOverlay = document.getElementById("settingsOverlay");
      this.settingsButton = document.getElementById("settingsButton");
      this.settingsCloseButton = document.getElementById("settingsCloseButton");
      this.gameOverOverlay = document.getElementById("gameOverOverlay");
      this.finalStats = document.getElementById("finalStats");
      this.startButton = document.getElementById("startButton");
      this.restartButton = document.getElementById("restartButton");
      this.lastFpsUpdate = 0;
      this.frameCount = 0;
    }

    bind(game) {
      this.startButton.addEventListener("click", () => game.openMapChooser());
      this.restartButton.addEventListener("click", () => game.startRun());
      this.playerMenuButton.addEventListener("click", () => game.openMapChooser());
      this.settingsButton.addEventListener("click", () => this.showSettings(game));
      this.settingsCloseButton.addEventListener("click", () => this.hideSettings());
      this.buildStats(game);
      this.buildMaps(game);
      this.bindSettings(game);
    }

    bindSettings(game) {
      this.settingsOverlay.querySelectorAll(".toggle-switch").forEach((btn) => {
        btn.addEventListener("click", () => {
          const setting = btn.dataset.setting;
          const current = btn.getAttribute("aria-pressed") === "true";
          const next = !current;
          btn.setAttribute("aria-pressed", next);
          btn.querySelector(".toggle-label").textContent = next ? "On" : "Off";
          game.settings[setting] = next;
          game.saveSettings();
          if (setting === "fpsCounter") {
            this.fpsText.classList.toggle("hidden", !next);
          }
        });
      });
    }

    updateSettingsUI(settings) {
      this.settingsOverlay.querySelectorAll(".toggle-switch").forEach((btn) => {
        const setting = btn.dataset.setting;
        const value = settings[setting];
        btn.setAttribute("aria-pressed", value);
        btn.querySelector(".toggle-label").textContent = value ? "On" : "Off";
      });
      this.fpsText.classList.toggle("hidden", !settings.fpsCounter);
    }

    showSettings(game) {
      this.updateSettingsUI(game.settings);
      this.settingsOverlay.classList.remove("hidden");
    }

    hideSettings() {
      this.settingsOverlay.classList.add("hidden");
    }

    update(game, now) {
      const hpPercent = Math.max(0, game.player.hp / game.player.maxHp) * 100;
      const xpPercent = Math.max(0, game.xp / game.xpRequired) * 100;
      this.hpFill.style.width = `${hpPercent}%`;
      this.hpText.textContent = `${Math.ceil(game.player.hp)}`;
      this.xpFill.style.width = `${Math.min(100, xpPercent)}%`;
      this.xpText.textContent = `${Math.floor(Math.min(100, xpPercent))}%`;
      this.levelText.textContent = game.level;
      this.classText.textContent = game.player.classDef.name;
      this.mapText.textContent = game.currentMap.name;
      this.timeText.textContent = U.secondsToClock(game.elapsed);
      this.upgradePointsText.textContent = game.stats.points;
      this.updateStats(game);
      this.updateFPS(now);
    }

    updateFPS(now) {
      this.frameCount++;
      if (now - this.lastFpsUpdate >= 1000) {
        const fps = Math.round(this.frameCount * 1000 / (now - this.lastFpsUpdate));
        this.fpsText.textContent = `${fps} FPS`;
        this.frameCount = 0;
        this.lastFpsUpdate = now;
      }
    }

    showMenu() {
      this.menuOverlay.classList.remove("hidden");
      this.levelOverlay.classList.add("hidden");
      this.mapOverlay.classList.add("hidden");
      this.gameOverOverlay.classList.add("hidden");
    }

    hideMenu() {
      this.menuOverlay.classList.add("hidden");
      this.gameOverOverlay.classList.add("hidden");
    }

    buildStats(game) {
      this.statBars.innerHTML = "";
      Object.keys(Arena.Stats.definitions).forEach((id) => {
        const def = Arena.Stats.definitions[id];
        const row = document.createElement("div");
        row.className = "stat-row";
        row.dataset.stat = id;
        row.innerHTML = `
          <span class="stat-name">${def.label}</span>
          <span class="stat-track"><span class="stat-fill"></span></span>
          <span class="stat-level">0/${def.cap}</span>
          <button type="button" class="stat-upgrade-btn" data-stat-btn="${id}" aria-label="Upgrade ${def.label}">
            <svg viewBox="0 0 12 12"><path d="M6 2 L6 10 M2 6 L10 6"/></svg>
          </button>
          <span class="stat-tooltip">${def.description}: ${def.value(1)}</span>
        `;
        const btn = row.querySelector(".stat-upgrade-btn");
        btn.addEventListener("click", () => game.spendStat(id));
        this.statBars.appendChild(row);
      });
    }

    updateStats(game) {
      const canUpgrade = game.stats.points > 0;
      Object.keys(Arena.Stats.definitions).forEach((id) => {
        const def = Arena.Stats.definitions[id];
        const level = game.stats.levels[id];
        const row = this.statBars.querySelector(`[data-stat="${id}"]`);
        if (!row) return;
        const fill = row.querySelector(".stat-fill");
        const levelText = row.querySelector(".stat-level");
        const btn = row.querySelector(".stat-upgrade-btn");
        const tooltip = row.querySelector(".stat-tooltip");

        const newWidth = `${(level / def.cap) * 100}%`;
        if (fill.style.width !== newWidth) {
          fill.style.width = newWidth;
          fill.classList.add("stat-fill-anim");
          setTimeout(() => fill.classList.remove("stat-fill-anim"), 150);
        }
        levelText.textContent = `${level}/${def.cap}`;
        tooltip.textContent = `${def.description}: ${def.value(level)}`;
        const btnEnabled = canUpgrade && level < def.cap;
        btn.disabled = !btnEnabled;
      });
    }

    buildMaps(game) {
      this.mapChoices.innerHTML = "";
      Maps.list().forEach((map) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "map-card";
        card.dataset.map = map.id;
        card.setAttribute("onclick", `window.Arena.game.selectMap('${map.id}')`);
        card.innerHTML = `
          ${Maps.icon(map)}
          <h3>${map.name}</h3>
          <p>${map.shortDesc}</p>
        `;
        const choose = () => game.selectMap(map.id);
        card.addEventListener("click", choose);
        card.addEventListener("pointerup", choose);
        this.mapChoices.appendChild(card);
      });
    }

    showMapChooser(game) {
      this.mapChoices.querySelectorAll(".map-card").forEach((card, index) => {
        card.classList.toggle("active-map", card.dataset.map === game.currentMap.id);
        card.style.animation = "none";
        card.offsetHeight;
        card.style.animation = `map-fade-in 300ms ease ${index * 60}ms backwards`;
      });
      this.mapOverlay.classList.remove("hidden");
    }

    hideMapChooser() {
      this.mapOverlay.classList.add("hidden");
    }

    showLevelUp(choices, onChoose) {
      // SAFETY: Validate choices - must be exactly 4 valid options
      const validChoices = (choices || []).filter(c => c && c.id && c.name);
      
      if (validChoices.length !== 4) {
        console.error("[UI] Invalid choices count:", validChoices.length, "- using fallback");
        // FALLBACK: Always provide the 4 core classes
        const fallbackIds = ["velocity", "titan", "swarm", "orbit"];
        choices = fallbackIds.map(id => Classes.get(id)).filter(Boolean);
      } else {
        choices = validChoices;
      }

      // Clear and render
      this.choiceGrid.innerHTML = "";
      
      // Render all 4 cards BEFORE showing headers
      const cards = [];
      choices.slice(0, 4).forEach((choice, index) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "choice-card level-card-anim";
        card.style.animationDelay = `${index * 60}ms`;
        card.dataset.classId = choice.id;
        card.innerHTML = `
          ${Classes.cardIcon(choice)}
          <h3>${choice.name}</h3>
          <p>${choice.description}</p>
        `;
        card.addEventListener("click", () => {
          if (this._levelUpTimer) {
            clearTimeout(this._levelUpTimer);
            this._levelUpTimer = null;
          }
          card.classList.add("selecting");
          window.setTimeout(() => onChoose(choice.id), 120);
        });
        this.choiceGrid.appendChild(card);
        cards.push(card);
      });

      // Only show overlay if we successfully rendered 4 cards
      if (cards.length !== 4) {
        console.error("[UI] Failed to render 4 cards, aborting level up");
        this.choiceGrid.innerHTML = "";
        onChoose("velocity"); // Emergency fallback
        return;
      }

      // Show the UI
      this.levelOverlay.classList.remove("hidden");

      // AUTO-SELECT: 5 second timeout to prevent softlock
      this._levelUpTimer = setTimeout(() => {
        console.warn("[UI] Auto-selecting Velocity Core after timeout");
        onChoose("velocity");
      }, 5000);

      // ANTI-SOFTLOCK GUARD: Check after 1 second if UI is responsive
      setTimeout(() => {
        if (!this.levelOverlay.classList.contains("hidden")) {
          const clickableCards = this.choiceGrid.querySelectorAll("button.choice-card");
          if (clickableCards.length === 0) {
            console.error("[UI] No clickable cards detected, emergency resume");
            this.hideLevelUp();
            onChoose("velocity");
          }
        }
      }, 1000);
    }

    hideLevelUp() {
      if (this._levelUpTimer) {
        clearTimeout(this._levelUpTimer);
        this._levelUpTimer = null;
      }
      this.levelOverlay.classList.add("hidden");
    }

    showGameOver(game) {
      this.finalStats.textContent = `You survived ${U.secondsToClock(game.elapsed)} and reached level ${game.level} as ${game.player.classDef.name}.`;
      this.gameOverOverlay.classList.remove("hidden");
    }
  }

export { UI };
