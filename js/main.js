"use strict";

import { Game } from './game.js?v=11';

window.addEventListener("DOMContentLoaded", () => {
  try {
    const game = new Game();
    game.start();
  } catch (error) {
    console.error("[Arena] Failed to initialize game:", error);
    document.body.innerHTML = `<div style="color:red;padding:20px;font-family:sans-serif">
      <h2>Game Load Error</h2>
      <p>Failed to load the game. Please check the console for details.</p>
      <pre>${error.message}</pre>
    </div>`;
  }
});
