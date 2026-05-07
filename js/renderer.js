"use strict";

import * as U from './utils.js';
import { Maps } from './maps.js';

class Renderer {
    constructor(svg, arena) {
      this.svg = svg;
      this.arena = arena;
      this.layers = {
        defs: document.getElementById("svgDefs"),
        arena: document.getElementById("arenaLayer"),
        xp: document.getElementById("xpLayer"),
        projectiles: document.getElementById("projectileLayer"),
        enemies: document.getElementById("enemyLayer"),
        particles: document.getElementById("particleLayer"),
        player: document.getElementById("playerLayer"),
        effects: document.getElementById("effectLayer")
      };
      this.view = { x: 0, y: 0, w: 1280, h: 720 };
      this.playerEl = null;
      this.playerClassId = "";
      this.buildArena(Maps.get("standard"));
      window.addEventListener("resize", () => this.resize());
      this.resize();
    }

    resize() {
      const rect = this.svg.getBoundingClientRect();
      const aspect = Math.max(0.8, rect.width / Math.max(1, rect.height));
      this.view.h = 720;
      this.view.w = this.view.h * aspect;
    }

    buildArena(map) {
      const theme = (map || Arena.Maps.get("normal")).theme;
      this.layers.arena.innerHTML = "";
      this.layers.arena.appendChild(U.createSvg("rect", {
        x: 0,
        y: 0,
        width: this.arena.width,
        height: this.arena.height,
        fill: theme.base,
        stroke: theme.border,
        "stroke-width": 10
      }));
      for (let x = 0; x <= this.arena.width; x += 120) {
        this.layers.arena.appendChild(U.createSvg("line", {
          x1: x,
          y1: 0,
          x2: x,
          y2: this.arena.height,
          stroke: x % 480 === 0 ? theme.major : theme.grid,
          "stroke-width": x % 480 === 0 ? 2 : 1
        }));
      }
      for (let y = 0; y <= this.arena.height; y += 120) {
        this.layers.arena.appendChild(U.createSvg("line", {
          x1: 0,
          y1: y,
          x2: this.arena.width,
          y2: y,
          stroke: y % 480 === 0 ? theme.major : theme.grid,
          "stroke-width": y % 480 === 0 ? 2 : 1
        }));
      }
    }

    render(game) {
      const shake = game.effectiveShake || 0;
      const shakeX = U.rand(-shake, shake);
      const shakeY = U.rand(-shake, shake);
      this.view.x = U.clamp(game.player.x - this.view.w / 2 + shakeX, 0, this.arena.width - this.view.w);
      this.view.y = U.clamp(game.player.y - this.view.h / 2 + shakeY, 0, this.arena.height - this.view.h);
      this.svg.setAttribute("viewBox", `${this.view.x} ${this.view.y} ${this.view.w} ${this.view.h}`);

      this.renderXp(game.xpPool.items);
      this.renderProjectiles(game.projectilePool.items);
      this.renderEnemies(game.enemyPool.items);
      this.renderParticles(game.particlePool.items);
      this.renderPlayer(game.player);
      this.renderFog(game);
    }

    screenToWorld(clientX, clientY) {
      const rect = this.svg.getBoundingClientRect();
      const nx = (clientX - rect.left) / Math.max(1, rect.width);
      const ny = (clientY - rect.top) / Math.max(1, rect.height);
      return {
        x: this.view.x + nx * this.view.w,
        y: this.view.y + ny * this.view.h
      };
    }

    renderPlayer(player) {
      if (!this.playerEl || this.playerClassId !== player.classId) {
        this.layers.player.innerHTML = "";
        this.playerEl = buildPlayer(player.classDef);
        this.playerClassId = player.classId;
        this.layers.player.appendChild(this.playerEl);
      }
      const flash = player.flash > 0 ? 1 : 0;
      const pulse = 1 + Math.sin(player.pulse) * 0.035;
      this.playerEl.setAttribute("transform", `translate(${player.x} ${player.y}) rotate(${player.aimAngle * 180 / Math.PI}) scale(${pulse})`);
      this.playerEl.querySelector("[data-body]").setAttribute("fill", flash ? "#ffffff" : "#182a3a");
      this.playerEl.querySelector("[data-core]").setAttribute("fill", player.classDef.accent);
      this.playerEl.querySelector("[data-glow]").setAttribute("stroke", player.classDef.accent);
    }

    renderEnemies(enemies) {
      enemies.forEach((enemy) => {
        if (!enemy.active) {
          if (enemy.el) enemy.el.setAttribute("display", "none");
          return;
        }
        if (!enemy.el) {
          enemy.el = U.createSvg("g");
          this.layers.enemies.appendChild(enemy.el);
        }
        if (enemy.el.dataset.type !== enemy.type) {
          enemy.el.dataset.type = enemy.type;
          enemy.el.innerHTML = enemyShape(enemy);
        }
        const angle = Math.atan2(enemy.vy, enemy.vx) * 180 / Math.PI;
        enemy.el.setAttribute("display", "block");
        enemy.el.setAttribute("transform", `translate(${enemy.x} ${enemy.y}) rotate(${angle})`);
        enemy.el.querySelector("[data-enemy-body]").setAttribute("fill", enemy.flash > 0 ? "#ffffff" : enemy.config.fill);
        enemy.el.querySelector("[data-enemy-glow]").setAttribute("stroke", enemy.config.fill);
        const hp = U.clamp(enemy.hp / enemy.maxHp, 0, 1);
        enemy.el.querySelector("[data-enemy-hp]").setAttribute("width", hp * enemy.radius * 2);
      });
    }

    renderProjectiles(projectiles) {
      projectiles.forEach((p) => {
        if (!p.active) {
          if (p.el) p.el.setAttribute("display", "none");
          return;
        }
        if (!p.el) {
          p.el = U.createSvg("g");
          this.layers.projectiles.appendChild(p.el);
        }
        if (p.el.dataset.type !== p.type) {
          p.el.dataset.type = p.type;
          p.el.innerHTML = projectileShape(p);
        }
        p.el.setAttribute("display", "block");
        p.el.setAttribute("transform", `translate(${p.x} ${p.y}) rotate(${p.angle * 180 / Math.PI})`);
        if (p.config.beam) {
          const line = p.el.querySelector("line");
          line.setAttribute("x1", -p.radius * 3);
          line.setAttribute("x2", p.radius * 8);
        } else {
          const body = p.el.querySelector("[data-projectile-body]");
          if (body.tagName.toLowerCase() === "circle") body.setAttribute("r", p.radius);
        }
      });
    }

    renderXp(orbs) {
      orbs.forEach((orb) => {
        if (!orb.active) {
          if (orb.el) orb.el.setAttribute("display", "none");
          return;
        }
        if (!orb.el) {
          orb.el = U.createSvg("g");
          orb.el.innerHTML = `<circle data-glow r="14" fill="#55f0d0" opacity="0.16"/><path data-orb d="M0 -8 L7 0 L0 8 L-7 0 Z" fill="#55f0d0" stroke="#e9fff9" stroke-width="2"/>`;
          this.layers.xp.appendChild(orb.el);
        }
        const scale = 0.88 + Math.sin(orb.pulse) * 0.08;
        orb.el.setAttribute("display", "block");
        orb.el.setAttribute("transform", `translate(${orb.x} ${orb.y}) scale(${scale})`);
        orb.el.querySelector("[data-glow]").setAttribute("r", orb.radius * 2);
      });
    }

    renderParticles(particles) {
      particles.forEach((p) => {
        if (!p.active) {
          if (p.el) p.el.setAttribute("display", "none");
          return;
        }
        if (!p.el) {
          p.el = U.createSvg("circle");
          this.layers.particles.appendChild(p.el);
        }
        U.setAttrs(p.el, {
          display: "block",
          cx: p.x,
          cy: p.y,
          r: Math.max(0.5, p.radius * (p.life / p.maxLife)),
          fill: p.color,
          opacity: U.clamp(p.life / p.maxLife, 0, 1)
        });
      });
    }

    renderFog(game) {
      this.layers.effects.innerHTML = "";
      if (!game.currentMap || game.currentMap.visibility >= 0.99) return;
      const fog = U.createSvg("g", { "pointer-events": "none" });
      const pad = 80;
      fog.innerHTML = `
        <rect x="${this.view.x - pad}" y="${this.view.y - pad}" width="${this.view.w + pad * 2}" height="${this.view.h + pad * 2}" fill="rgba(5,10,17,${1 - game.currentMap.visibility})"/>
      `;
      this.layers.effects.appendChild(fog);
    }
  }

  function buildPlayer(def) {
    const group = U.createSvg("g");
    const bodyShape = def.visual.body === "hex"
      ? `<polygon data-body points="-22,-14 0,-26 22,-14 22,14 0,26 -22,14" fill="#182a3a" stroke="${def.accent}" stroke-width="5"/>`
      : def.visual.body === "diamond"
        ? `<path data-body d="M0 -29 L29 0 L0 29 L-29 0 Z" fill="#182a3a" stroke="${def.accent}" stroke-width="5"/>`
        : `<circle data-body r="26" fill="#182a3a" stroke="${def.accent}" stroke-width="5"/>`;
    const barrels = def.weapon.salvos.slice(0, 4).map((shot) => {
      const angle = shot.angleOffset || 0;
      const width = shot.type === "rail" ? 9 : shot.type === "explosive" ? 13 : 8;
      return `<line x1="8" y1="0" x2="42" y2="0" stroke="#f5f7fb" stroke-width="${width}" stroke-linecap="round" transform="rotate(${angle})"/>`;
    }).join("");
    group.innerHTML = `<circle data-glow r="34" fill="none" stroke="${def.accent}" stroke-width="8" opacity="0.28"/>${barrels}${bodyShape}<circle data-core r="10" fill="${def.accent}"/><circle r="4" cx="31" cy="0" fill="${def.accent}"/>`;
    return group;
  }

  function enemyShape(enemy) {
    const r = enemy.radius;
    let body;
    const glow = `<circle data-enemy-glow r="${r + 5}" fill="none" stroke="${enemy.config.fill}" stroke-width="5" opacity="0.16"/>`;
    if (enemy.config.shape === "triangle") {
      body = `<path data-enemy-body d="M${r} 0 L${-r * 0.72} ${-r * 0.78} L${-r * 0.72} ${r * 0.78} Z" fill="${enemy.config.fill}" stroke="${enemy.config.stroke}" stroke-width="3"/>`;
    } else if (enemy.config.shape === "diamond") {
      body = `<path data-enemy-body d="M0 ${-r} L${r} 0 L0 ${r} L${-r} 0 Z" fill="${enemy.config.fill}" stroke="${enemy.config.stroke}" stroke-width="3"/>`;
    } else if (enemy.config.shape === "hex") {
      body = `<polygon data-enemy-body points="${-r},0 ${-r * 0.5},${-r * 0.86} ${r * 0.5},${-r * 0.86} ${r},0 ${r * 0.5},${r * 0.86} ${-r * 0.5},${r * 0.86}" fill="${enemy.config.fill}" stroke="${enemy.config.stroke}" stroke-width="3"/>`;
    } else {
      body = `<rect data-enemy-body x="${-r}" y="${-r}" width="${r * 2}" height="${r * 2}" fill="${enemy.config.fill}" stroke="${enemy.config.stroke}" stroke-width="3"/>`;
    }
    const gun = enemy.config.ranged ? `<line x1="0" y1="0" x2="${r + 14}" y2="0" stroke="${enemy.config.stroke}" stroke-width="5" stroke-linecap="round"/>` : "";
    return `${glow}${gun}${body}<rect x="${-r}" y="${r + 8}" width="${r * 2}" height="5" fill="rgba(0,0,0,0.45)"/><rect data-enemy-hp x="${-r}" y="${r + 8}" width="${r * 2}" height="5" fill="#55f0d0"/>`;
  }

  function projectileShape(p) {
    if (p.config.beam) {
      return `<line x1="-18" y1="0" x2="70" y2="0" stroke="${p.config.stroke}" stroke-width="${p.radius * 2}" stroke-linecap="round"/><line x1="-6" y1="0" x2="74" y2="0" stroke="${p.config.fill}" stroke-width="${p.radius}" stroke-linecap="round"/>`;
    }
    if (p.config.spin) {
      return `<path data-projectile-body d="M0 ${-p.radius} L${p.radius * 1.4} 0 L0 ${p.radius} L${-p.radius * 1.4} 0 Z" fill="${p.config.fill}" stroke="${p.config.stroke}" stroke-width="2"/>`;
    }
    if (p.type === "sniper" || p.type === "needle" || p.type === "venom") {
      return `<path data-projectile-body d="M${p.radius * 2} 0 L${-p.radius} ${-p.radius} L${-p.radius * 0.4} 0 L${-p.radius} ${p.radius} Z" fill="${p.config.fill}" stroke="${p.config.stroke}" stroke-width="2"/>`;
    }
    if (p.type === "pellet" || p.type === "arc") {
      return `<path data-projectile-body d="M${-p.radius} ${-p.radius * 0.7} C${p.radius} ${-p.radius * 2} ${p.radius * 2} ${p.radius * 0.8} ${-p.radius * 0.4} ${p.radius}" fill="none" stroke="${p.config.stroke}" stroke-width="${Math.max(3, p.radius)}" stroke-linecap="round"/>`;
    }
    return `<circle data-projectile-body r="${p.radius}" fill="${p.config.fill}" stroke="${p.config.stroke}" stroke-width="2"/>`;
  }

export { Renderer };
