"use strict";

// Import all modules
import * as Utils from './utils.js';
import { Classes, ClassesAPI } from './classes.js';
import { Stats } from './stats.js';
import { Maps } from './maps.js';
import { Projectiles } from './projectiles.js';
import { Input } from './input.js';
import { Player } from './player.js';
import { Enemies } from './enemies.js';
import { XP } from './xp.js';
import { Renderer } from './renderer.js';
import { UI } from './ui.js';
import { Game } from './game.js';

// Create Arena namespace for HTML onclick handlers and backward compatibility
window.Arena = {
  Utils,
  Classes: ClassesAPI,
  Stats,
  Maps,
  Projectiles,
  Input,
  Player,
  Enemies,
  XP,
  Renderer,
  UI,
  Game
};

// Initialize game when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  try {
    const game = new Game();
    window.Arena.game = game;
    game.start();
    console.log("[Arena] Game initialized successfully");
  } catch (error) {
    console.error("[Arena] Failed to initialize game:", error);
    document.body.innerHTML = `<div style="color:red;padding:20px;font-family:sans-serif">
      <h2>Game Load Error</h2>
      <p>Failed to load the game. Please check the console for details.</p>
      <pre>${error.message}</pre>
    </div>`;
  }
});
