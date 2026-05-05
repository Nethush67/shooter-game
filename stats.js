(function (Arena) {
  "use strict";

  const cap = 10;

  const definitions = {
    health: {
      label: "HEALTH",
      cap,
      description: "Max HP",
      value: (level) => `+${level * 14} max HP`
    },
    speed: {
      label: "SPEED",
      cap,
      description: "Movement",
      value: (level) => `+${Math.round(level * 5)}% move speed`
    },
    damage: {
      label: "DAMAGE",
      cap,
      description: "Projectile power",
      value: (level) => `+${Math.round(level * 8)}% damage`
    },
    fireRate: {
      label: "FIRE RATE",
      cap,
      description: "Weapon cooldown",
      value: (level) => `-${Math.round(level * 4.5)}% cooldown`
    },
    shield: {
      label: "SHIELD",
      cap,
      description: "Damage reduction",
      value: (level) => `${Math.round(level * 3.5)}% reduced damage`
    },
    regen: {
      label: "REGEN",
      cap,
      description: "Passive recovery",
      value: (level) => `${(level * 0.55).toFixed(1)} HP/sec`
    },
    projectileSize: {
      label: "PROJECTILE SIZE",
      cap,
      description: "Hitbox size",
      value: (level) => `+${Math.round(level * 6)}% projectile size`
    },
    penetration: {
      label: "PENETRATION",
      cap,
      description: "Extra pierce",
      value: (level) => `+${Math.floor(level / 2)} pierce`
    }
  };

  function createState() {
    return {
      points: 0,
      levels: Object.keys(definitions).reduce((acc, id) => {
        acc[id] = 0;
        return acc;
      }, {})
    };
  }

  function spend(state, id) {
    if (!definitions[id] || state.points <= 0 || state.levels[id] >= definitions[id].cap) {
      return false;
    }
    state.levels[id] += 1;
    state.points -= 1;
    return true;
  }

  function effects(state) {
    const level = (id) => state.levels[id] || 0;
    return {
      maxHpBonus: level("health") * 14,
      speedMultiplier: 1 + level("speed") * 0.05,
      damageMultiplier: 1 + level("damage") * 0.08,
      cooldownMultiplier: Math.max(0.48, 1 - level("fireRate") * 0.045),
      damageTakenMultiplier: Math.max(0.58, 1 - level("shield") * 0.035),
      regenPerSecond: level("regen") * 0.55,
      projectileSizeMultiplier: 1 + level("projectileSize") * 0.06,
      extraPierce: Math.floor(level("penetration") / 2)
    };
  }

  Arena.Stats = {
    definitions,
    createState,
    spend,
    effects
  };
})(window.Arena = window.Arena || {});
