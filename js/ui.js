"use strict";

import * as U from './utils.js';
import { Maps } from './maps.js';
import { ClassesAPI as Classes } from './classes.js';
import { Stats } from './stats.js';

class UI {
  constructor() {
    this.hpFill = this.el("hpFill");
    this.hpText = this.el("hpText");
    this.xpFill = this.el("xpFill");
    this.xpText = this.el("xpText");
    this.levelText = this.el("levelText");
    this.classText = this.el("classText");
    this.mapText = this.el("mapText");
    this.timeText = this.el("timeText");
    this.fpsText = this.el("fpsText");
    this.scoreText = this.el("scoreText");
    this.menuBestScore = this.el("menuBestScore");
    this.gameOverBestScore = this.el("bestScoreDisplay");
    this.playerMenuButton = this.el("playerMenuButton");
    this.upgradePointsText = this.el("upgradePointsText");
    this.statBars = this.el("statBars");
    this.loadingOverlay = this.el("loadingOverlay");
    this.menuOverlay = this.el("menuOverlay");
    this.tutorialOverlay = this.el("tutorialOverlay");
    this.levelOverlay = this.el("levelOverlay");
    this.choiceGrid = this.el("levelChoices");
    this.mapOverlay = this.el("mapOverlay");
    this.mapChoices = this.el("mapChoices");
    this.settingsOverlay = this.el("settingsOverlay");
    this.pauseOverlay = this.el("pauseOverlay");
    this.achievementsOverlay = this.el("achievementsOverlay");
    this.creditsOverlay = this.el("creditsOverlay");
    this.confirmOverlay = this.el("confirmOverlay");
    this.gameOverOverlay = this.el("gameOverOverlay");
    this.finalStats = this.el("finalStats");
    this.summaryDetails = this.el("summaryDetails");
    this.summaryEyebrow = this.el("summaryEyebrow");
    this.summaryTitle = this.el("summaryTitle");
    this.pauseStats = this.el("pauseStats");
    this.achievementToast = this.el("achievementToast");
    this.lastFpsUpdate = 0;
    this.frameCount = 0;
    this.previousOverlay = "menu";
    this._levelUpTimer = null;
    // Wire up the Reset Data Button
    const resetBtn = document.getElementById("resetDataButton");
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.showConfirm(
          "Wipe Save Data?", 
          "This will permanently delete all achievements, stats, and unlocked classes. Are you sure?", 
          () => {
            localStorage.removeItem("arenaEvolutionSave");
            localStorage.removeItem("arenaEvolutionSettings");
            window.location.reload(); // Reloads the game completely fresh
          }
        );
      });
    }

    // Ensure the cancel button on the confirm overlay works
    const cancelBtn = document.getElementById("confirmCancelButton");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.hideConfirm());
    }
  }


  el(id) {
    return document.getElementById(id);
  }

  bind(game) {
    const bindClick = (id, handler) => {
      const el = this.el(id);
      if (el) el.addEventListener("click", handler);
      else console.warn(`[UI] Missing element: #${id}`);
    };

    bindClick("startButton", () => game.startRun());
    bindClick("continueButton", () => game.continueRun());
    bindClick("achievementsButton", () => game.openAchievements());
    bindClick("settingsButton", () => game.openSettings("menu"));
    bindClick("creditsButton", () => game.openCredits());
    bindClick("quitButton", () => this.showToast("Browser Build", "Quit is disabled for the web version."));
    bindClick("restartButton", () => game.startRun());
    bindClick("summaryMenuButton", () => game.returnToMenu());
    bindClick("resumeButton", () => game.resume());
    bindClick("pauseSettingsButton", () => game.openSettings("pause"));
    bindClick("saveQuitButton", () => game.saveAndQuit());
    bindClick("settingsCloseButton", () => game.closeSettings());
    bindClick("achievementsCloseButton", () => game.closeAchievements());
    bindClick("creditsCloseButton", () => game.closeCredits());
    bindClick("tutorialCloseButton", () => game.closeTutorial());
    bindClick("confirmCancelButton", () => game.closeConfirm());

    if (this.playerMenuButton) this.playerMenuButton.addEventListener("click", () => game.openMapChooser());
    else console.warn("[UI] Missing element: #playerMenuButton");

    this.buildStats(game);
    this.buildMaps(game);
    this.bindSettings(game);
  }

  bindSettings(game) {
    this.settingsOverlay.querySelectorAll(".toggle-switch").forEach((btn) => {
      btn.addEventListener("click", () => {
        const setting = btn.dataset.setting;
        const next = btn.getAttribute("aria-pressed") !== "true";
        game.updateSetting(setting, next);
      });
    });

    this.settingsOverlay.querySelectorAll("[data-range-setting]").forEach((range) => {
      range.addEventListener("input", () => {
        const divisor = range.dataset.rangeSetting === "mouseSensitivity" ? 100 : 100;
        game.updateSetting(range.dataset.rangeSetting, Number(range.value) / divisor);
      });
    });

    this.settingsOverlay.querySelectorAll("[data-select-setting]").forEach((select) => {
      select.addEventListener("change", () => game.updateSetting(select.dataset.selectSetting, select.value));
    });

    this.settingsOverlay.querySelectorAll("[data-settings-tab]").forEach((tab) => {
      tab.addEventListener("click", () => this.showSettingsTab(tab.dataset.settingsTab));
    });

    this.settingsOverlay.querySelectorAll("[data-bind]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const action = btn.dataset.bind;
        btn.classList.add("listening");
        btn.querySelector("strong").textContent = "...";
        game.waitForRebind(action, (key) => {
          btn.classList.remove("listening");
          btn.querySelector("strong").textContent = keyLabel(key);
          this.showToast("Key Bound", `${actionLabel(action)} set to ${keyLabel(key)}`);
        });
      });
    });
  }

  updateSettingsUI(settings, bindings) {
    this.settingsOverlay.querySelectorAll(".toggle-switch").forEach((btn) => {
      const setting = btn.dataset.setting;
      const value = Boolean(settings[setting]);
      btn.setAttribute("aria-pressed", String(value));
      btn.querySelector(".toggle-label").textContent = value ? "On" : "Off";
    });
    this.settingsOverlay.querySelectorAll("[data-range-setting]").forEach((range) => {
      range.value = Math.round((settings[range.dataset.rangeSetting] || 0) * 100);
    });
    this.settingsOverlay.querySelectorAll("[data-select-setting]").forEach((select) => {
      select.value = settings[select.dataset.selectSetting] || "normal";
    });
    this.settingsOverlay.querySelectorAll("[data-bind]").forEach((btn) => {
      const key = bindings[btn.dataset.bind];
      btn.querySelector("strong").textContent = keyLabel(key);
    });
    this.fpsText.classList.toggle("hidden", !settings.fpsCounter);
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
    this.updateScore(game);
    if (game.settings.fpsCounter) this.updateFPS(now);
  }

  updateFPS(now) {
    this.frameCount += 1;
    if (now - this.lastFpsUpdate >= 1000) {
      this.fpsText.textContent = `${Math.round(this.frameCount * 1000 / (now - this.lastFpsUpdate))} FPS`;
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  }

  hideAllOverlays() {
    [
      this.loadingOverlay,
      this.menuOverlay,
      this.tutorialOverlay,
      this.levelOverlay,
      this.mapOverlay,
      this.settingsOverlay,
      this.pauseOverlay,
      this.achievementsOverlay,
      this.creditsOverlay,
      this.confirmOverlay,
      this.gameOverOverlay
    ].forEach((overlay) => overlay?.classList.add("hidden"));
  }

  showLoading() {
    this.hideAllOverlays();
    this.loadingOverlay.classList.remove("hidden");
  }

showMenu(canContinue, game) {
    this.hideAllOverlays();
    this.menuOverlay.classList.remove("hidden");
    const contBtn = this.el("continueButton");
    if (contBtn) contBtn.disabled = !canContinue;
    const best = (game && game.saveData && game.saveData.bestDamage) || 0;
    this.menuBestScore.textContent = Math.floor(best).toLocaleString();
  }

  showTutorial() {
    this.tutorialOverlay.classList.remove("hidden");
  }

  hideTutorial() {
    this.tutorialOverlay.classList.add("hidden");
  }

  hideMenu() {
    this.menuOverlay.classList.add("hidden");
    this.gameOverOverlay.classList.add("hidden");
  }

  showSettings(game, source) {
    this.previousOverlay = source || "menu";
    this.updateSettingsUI(game.settings, game.input.bindings);
    this.showSettingsTab("audio");
    this.settingsOverlay.classList.remove("hidden");
  }

  hideSettings() {
    this.settingsOverlay.classList.add("hidden");
  }

  showPause(game) {
    this.pauseStats.textContent = `${game.player.classDef.name}, level ${game.level}, ${U.secondsToClock(game.elapsed)} survived.`;
    this.pauseOverlay.classList.remove("hidden");
  }

  hidePause() {
    this.pauseOverlay.classList.add("hidden");
  }

  buildStats(game) {
    this.statBars.innerHTML = "";
    Object.keys(Stats.definitions).forEach((id) => {
      const def = Stats.definitions[id];
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
      row.querySelector(".stat-upgrade-btn").addEventListener("click", () => game.spendStat(id));
      this.statBars.appendChild(row);
    });
  }

  updateStats(game) {
    const canUpgrade = game.stats.points > 0;
    Object.keys(Stats.definitions).forEach((id) => {
      const def = Stats.definitions[id];
      const level = game.stats.levels[id] || 0;
      const row = this.statBars.querySelector(`[data-stat="${id}"]`);
      if (!row) return;
      row.querySelector(".stat-fill").style.width = `${(level / def.cap) * 100}%`;
      row.querySelector(".stat-level").textContent = `${level}/${def.cap}`;
      row.querySelector(".stat-tooltip").textContent = `${def.description}: ${def.value(level)}`;
      row.querySelector(".stat-upgrade-btn").disabled = !(canUpgrade && level < def.cap);
    });
  }

  buildMaps(game) {
    this.mapChoices.innerHTML = "";
    Maps.list().forEach((map) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "map-card";
      card.dataset.map = map.id;
      card.innerHTML = `
        ${Maps.icon(map)}
        <h3>${map.name}</h3>
        <p>${map.shortDesc}</p>
      `;
      card.addEventListener("click", () => game.selectMap(map.id));
      this.mapChoices.appendChild(card);
    });
  }

  showMapChooser(game) {
    this.mapChoices.querySelectorAll(".map-card").forEach((card, index) => {
      card.classList.toggle("active-map", card.dataset.map === game.currentMap.id);
      card.style.animation = "none";
      card.offsetHeight;
      card.style.animation = `map-fade-in 300ms ease ${index * 45}ms backwards`;
    });
    this.mapOverlay.classList.remove("hidden");
  }

  hideMapChooser() {
    this.mapOverlay.classList.add("hidden");
  }

  showLevelUp(choices, onChoose) {
    const validChoices = (choices || []).filter((c) => c && c.id && c.name);
    const fallbackIds = ["velocity", "titan", "swarm", "orbit"];
    const renderChoices = (validChoices.length ? validChoices : fallbackIds.map((id) => Classes.get(id))).slice(0, 4);
    while (renderChoices.length < 4) renderChoices.push(Classes.get(fallbackIds[renderChoices.length]));
    this.choiceGrid.innerHTML = "";

    renderChoices.forEach((choice, index) => {
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
        clearTimeout(this._levelUpTimer);
        card.classList.add("selecting");
        window.setTimeout(() => onChoose(choice.id), 120);
      });
      this.choiceGrid.appendChild(card);
    });

    this.levelOverlay.classList.remove("hidden");
    this._levelUpTimer = setTimeout(() => onChoose(renderChoices[0].id), 15000);
  }

  hideLevelUp() {
    clearTimeout(this._levelUpTimer);
    this.levelOverlay.classList.add("hidden");
  }

showAchievements(game) {
    const list = this.el("achievementsList");
    const countText = this.el("achievementCountText");
    const unlockedIds = new Set(game.saveData.achievements);
    
    // Calculate how many of the *total* achievements have been unlocked
    const unlockedCount = game.achievementList.filter(a => unlockedIds.has(a.id)).length;
    
    // Update the counter to show out of the full 100
    countText.textContent = `${unlockedCount} / ${game.achievementList.length} unlocked`;
    list.innerHTML = "";
    
    // Iterate over the FULL achievement list to build the UI
    game.achievementList.forEach((achievement, index) => {
      const unlocked = unlockedIds.has(achievement.id);
      const item = document.createElement("article");
      
      // Use locked-achievement class for unearned achievements
      item.className = `achievement-card ${unlocked ? "unlocked" : "locked-achievement"}`;
      
      // Always show the real name and description - no text masking
      item.innerHTML = `
        <em class="achievement-index">#${String(index + 1).padStart(3, "0")}</em>
        <strong>${achievement.name}</strong>
        <span>${achievement.description}</span>
      `;
      list.appendChild(item);
    });
    this.achievementsOverlay.classList.remove("hidden");
  }

  hideAchievements() {
    this.achievementsOverlay.classList.add("hidden");
  }

  showCredits() {
    this.creditsOverlay.classList.remove("hidden");
  }

  hideCredits() {
    this.creditsOverlay.classList.add("hidden");
  }

showGameOver(game, victory) {
    this.summaryEyebrow.textContent = victory ? "Victory" : "Run Ended";
    this.summaryTitle.textContent = victory ? "Extraction Complete" : "Extraction Failed";
    this.finalStats.textContent = `You survived ${U.secondsToClock(game.elapsed)} and reached level ${game.level} as ${game.player.classDef.name}.`;
    this.summaryDetails.innerHTML = `
      <span><strong>${game.kills}</strong>Kills</span>
      <span><strong>${game.bestClassName}</strong>Final Class</span>
      <span><strong>${game.currentMap.name}</strong>Map</span>
    `;
    const best = game.saveData.bestDamage || 0;
    this.gameOverBestScore.textContent = Math.floor(best).toLocaleString();
    this.gameOverOverlay.classList.remove("hidden");
  }

showToast(title, body) {
    // Remove any existing achievement notifications
    const existing = document.querySelector('.achievement-notification');
    if (existing) {
        existing.remove();
    }

    // Create achievement notification element
    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.innerHTML = `
        <strong>Achievement Unlocked!</strong>
        <span>${body}</span>
    `;

    // Add to body
    document.body.appendChild(notification);

    // Trigger slide-in animation
    requestAnimationFrame(() => {
        notification.classList.add('visible', 'slide-in');
    });

    // Auto-remove after animation completes (4 seconds total)
    setTimeout(() => {
        notification.classList.add('slide-out');
        notification.addEventListener('animationend', () => {
            notification.remove();
        }, { once: true });
    }, 4000);
}

  showSettingsTab(id) {
    this.settingsOverlay.querySelectorAll("[data-settings-tab]").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.settingsTab === id);
    });
    this.settingsOverlay.querySelectorAll("[data-settings-page]").forEach((page) => {
      page.classList.toggle("active", page.dataset.settingsPage === id);
    });
  }

  showConfirm(title, text, onAccept) {
    this.el("confirmTitle").textContent = title;
    this.el("confirmText").textContent = text;
    const accept = this.el("confirmAcceptButton");
    accept.replaceWith(accept.cloneNode(true));
    const nextAccept = this.el("confirmAcceptButton");
    nextAccept.addEventListener("click", onAccept);
    this.confirmOverlay.classList.remove("hidden");
  }

  hideConfirm() {
    this.confirmOverlay.classList.add("hidden");
  }

  updateScore(game) {
    if (this.scoreText) {
      this.scoreText.textContent = `SCORE: ${Math.floor(game.totalDamageDealt).toLocaleString()}`;
      // Cool animation: pulse + color shift + slight scale
      this.scoreText.style.transform = 'scale(1.1)';
      this.scoreText.style.transition = 'all 0.3s ease';
      this.scoreText.style.color = 'var(--gold)';
      this.scoreText.style.textShadow = '0 0 15px rgba(246,199,94,0.6)';
      
      // Reset after animation
      setTimeout(() => {
        this.scoreText.style.transform = 'scale(1)';
        this.scoreText.style.color = 'var(--cyan)';
        this.scoreText.style.textShadow = '0 0 12px rgba(85,240,208,0.4)';
      }, 300);
    }
  }
}

function keyLabel(key) {
  if (!key) return "-";
  if (key === " ") return "Space";
  if (key === "escape") return "Esc";
  return key.length === 1 ? key.toUpperCase() : key.replace(/^arrow/, "Arrow ");
}

function actionLabel(action) {
  return ({ up: "Up", down: "Down", left: "Left", right: "Right", pause: "Pause" })[action] || action;
}

export { UI };
