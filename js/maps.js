(function (Arena) {
  "use strict";

  // 10-MAP SYSTEM - Locked at game start, NEVER changes mid-game
  // Each map has unique identity, gameplay modifiers, enemy weighting, and visuals

  const maps = {
    standard: {
      id: "standard",
      name: "Standard Arena",
      shortDesc: "Balanced baseline for testing builds.",
      fullDesc: "Balanced baseline map used for default gameplay testing and general runs. Enemy speed, damage, and spawn rates are all neutral with no special modifiers applied. It provides clear sightlines and predictable pacing, making it ideal for testing builds. This map emphasizes core mechanics without favoring any specific class type. It acts as the control environment for all balance comparisons. Players experience stable, evenly paced combat. It is the most neutral and readable map in the system.",
      spawnRate: 1,
      hpScale: 1,
      speedScale: 1,
      damageScale: 1,
      xpScale: 1,
      visibility: 1,
      weightModifiers: {},
      theme: {
        base: "#0b1420",
        grid: "rgba(85,240,208,0.06)",
        major: "rgba(255,255,255,0.12)",
        border: "#34495f",
        accent: "#55f0d0",
        playerGlow: "rgba(85,240,208,0.3)"
      }
    },

    desert: {
      id: "desert",
      name: "Desert Rush",
      shortDesc: "Fast-paced open terrain with constant movement pressure.",
      fullDesc: "A fast-paced open terrain map designed around constant movement and pressure. Enemy units spawn slightly more frequently and favor high-speed variants. The wide open space reduces cover, forcing constant dodging and positioning. This map rewards velocity-based builds and punishes slow setups. Combat flows rapidly with little downtime between engagements. Visibility remains high but heat-like visual distortion adds tension. It encourages aggressive repositioning and momentum-based gameplay.",
      spawnRate: 1.12,
      hpScale: 0.94,
      speedScale: 1.24,
      damageScale: 0.98,
      xpScale: 1.08,
      visibility: 1,
      weightModifiers: { fast: 1.55, swarm: 1.45, blade: 1.35, runner: 1.4 },
      theme: {
        base: "#1a1410",
        grid: "rgba(246,199,94,0.09)",
        major: "rgba(255,159,110,0.16)",
        border: "#7a5a3a",
        accent: "#f6c75e",
        playerGlow: "rgba(246,199,94,0.35)"
      }
    },

    neon: {
      id: "neon",
      name: "Neon Grid",
      shortDesc: "Digital arena with precise lanes and enhanced visibility.",
      fullDesc: "A highly structured digital arena with glowing geometric pathways and sharp visual contrast. Enemy movement is slightly faster but more predictable due to structured lanes. Combat feels rhythmic and precise, rewarding accuracy and timing. Projectile visibility is enhanced for reaction-based dodging. Builds with precision or burst firing perform best here. The environment emphasizes clarity and fast decision-making. It feels like fighting inside a controlled simulation space.",
      spawnRate: 1.05,
      hpScale: 1.02,
      speedScale: 1.08,
      damageScale: 1,
      xpScale: 1.05,
      visibility: 1.15,
      weightModifiers: { runner: 1.25, ranger: 1.3, skirmisher: 1.2, drone: 1.35 },
      theme: {
        base: "#0a0a1a",
        grid: "rgba(255,0,128,0.08)",
        major: "rgba(0,255,255,0.14)",
        border: "#5040a0",
        accent: "#ff0080",
        playerGlow: "rgba(0,255,255,0.4)"
      }
    },

    ice: {
      id: "ice",
      name: "Icebreak Fields",
      shortDesc: "Slippery terrain with slower but tankier enemies.",
      fullDesc: "A cold, slippery battlefield that reduces movement responsiveness slightly. Enemy units are slower but significantly tankier, creating extended fights. Projectile travel feels heavier due to subtle drag effects. Positioning becomes critical as turning and dodging feel less responsive. This map favors sustained damage and high-impact builds. Combat has a deliberate, weighty pacing. It punishes reckless movement but rewards patience.",
      spawnRate: 0.92,
      hpScale: 1.38,
      speedScale: 0.88,
      damageScale: 1.06,
      xpScale: 1.12,
      visibility: 1.05,
      weightModifiers: { tank: 1.65, bruiser: 1.5, warden: 1.45, heavy: 1.55, fast: 0.6, blade: 0.7 },
      theme: {
        base: "#0d1418",
        grid: "rgba(159,232,255,0.07)",
        major: "rgba(255,255,255,0.18)",
        border: "#3a5a6a",
        accent: "#9fe8ff",
        playerGlow: "rgba(159,232,255,0.35)"
      }
    },

    jungle: {
      id: "jungle",
      name: "Jungle Overgrowth",
      shortDesc: "Dense terrain with reduced visibility and swarm clusters.",
      fullDesc: "A dense, overgrown environment that reduces visibility and increases close-range encounters. Enemies spawn in clusters and rely heavily on swarm behavior. The terrain visually obstructs long sightlines, forcing reactive combat. This map heavily favors area control and multi-shot builds. Ambushes are common due to tight engagement spacing. Combat feels chaotic and enclosed. Survival depends on crowd control efficiency.",
      spawnRate: 1.22,
      hpScale: 0.88,
      speedScale: 1.06,
      damageScale: 0.94,
      xpScale: 1.15,
      visibility: 0.72,
      weightModifiers: { swarm: 2.2, chaser: 1.45, splitter: 1.55, hunter: 1.35, ranger: 0.4, mortar: 0.35 },
      theme: {
        base: "#0a180a",
        grid: "rgba(127,245,155,0.06)",
        major: "rgba(127,245,155,0.12)",
        border: "#3a5a3a",
        accent: "#7ff59b",
        playerGlow: "rgba(127,245,155,0.3)"
      }
    },

    industrial: {
      id: "industrial",
      name: "Industrial Core",
      shortDesc: "Heavy machinery zone with elite enemies and slower pacing.",
      fullDesc: "A heavy machinery-themed battlefield dominated by structured mechanical hazards and elite enemies. Enemy units spawn less frequently but are significantly stronger. Combat pacing is slower but more tactical and punishing. Precision and armor-piercing builds perform best here. The environment feels dense, metallic, and oppressive. Encounters are less frequent but high-stakes. Mistakes are punished heavily due to elite enemy presence.",
      spawnRate: 0.68,
      hpScale: 1.55,
      speedScale: 0.85,
      damageScale: 1.22,
      xpScale: 1.28,
      visibility: 0.95,
      weightModifiers: { titan: 2.0, tank: 1.8, bruiser: 1.6, elite: 1.9, warden: 1.7, swarm: 0.35, fast: 0.5 },
      theme: {
        base: "#111418",
        grid: "rgba(245,247,251,0.05)",
        major: "rgba(246,199,94,0.12)",
        border: "#4a4a4a",
        accent: "#f5f7fb",
        playerGlow: "rgba(246,199,94,0.25)"
      }
    },

    voidrift: {
      id: "voidrift",
      name: "Void Rift",
      shortDesc: "Unstable dimension with unpredictable enemy bursts.",
      fullDesc: "A destabilized arena with distorted visibility and irregular enemy wave patterns. Enemies spawn in unpredictable bursts rather than steady flow. Movement and perception feel slightly unstable due to visual warping. This map favors adaptability over consistent builds. Combat is chaotic and requires constant repositioning. Enemy behavior is less predictable than any other map. It creates high tension and reactive gameplay moments.",
      spawnRate: 1.0,
      hpScale: 1.0,
      speedScale: 1.12,
      damageScale: 1.0,
      xpScale: 1.18,
      visibility: 0.85,
      weightModifiers: { chaser: 1.4, splitter: 1.5, drone: 1.45, hunter: 1.35, phantom: 1.6, tank: 0.7 },
      burstSpawn: true,
      theme: {
        base: "#0d0a14",
        grid: "rgba(201,183,255,0.08)",
        major: "rgba(255,103,119,0.14)",
        border: "#5a3a6a",
        accent: "#c9b7ff",
        playerGlow: "rgba(201,183,255,0.4)"
      }
    },

    storm: {
      id: "storm",
      name: "Stormfront",
      shortDesc: "Escalating waves with increasing speed pressure.",
      fullDesc: "A high-pressure battlefield with continuous enemy wave escalation. Enemy speed increases slightly over time during combat. Lightning-like visual effects create rapid feedback loops. This map strongly favors high fire-rate and sustain builds. Combat never fully stabilizes, maintaining constant pressure. Players must keep moving and attacking without pause. It creates a feeling of escalating survival intensity.",
      spawnRate: 1.15,
      hpScale: 0.96,
      speedScale: 1.0,
      damageScale: 1.04,
      xpScale: 1.1,
      visibility: 0.88,
      escalatingSpeed: true,
      weightModifiers: { fast: 1.6, runner: 1.5, chaser: 1.4, ranger: 1.25, tank: 0.6 },
      theme: {
        base: "#0a1418",
        grid: "rgba(97,168,255,0.08)",
        major: "rgba(255,255,255,0.16)",
        border: "#3a5a7a",
        accent: "#61a8ff",
        playerGlow: "rgba(97,168,255,0.35)"
      }
    },

    crystal: {
      id: "crystal",
      name: "Crystal Caverns",
      shortDesc: "Reflective corridors favoring precision and angled combat.",
      fullDesc: "A reflective underground environment with tight corridors and angled geometry. Projectile reflections and visual bounce effects increase spatial complexity. Enemies favor mid-range engagements with calculated movement patterns. Precision-based builds excel in this controlled environment. Combat feels methodical and spatially challenging. The map rewards angle control and positioning awareness. It creates a puzzle-like combat flow.",
      spawnRate: 0.98,
      hpScale: 1.08,
      speedScale: 0.94,
      damageScale: 1.02,
      xpScale: 1.08,
      visibility: 1.1,
      reflectionEnabled: true,
      weightModifiers: { ranger: 1.5, skirmisher: 1.4, drone: 1.35, sentry: 1.45, swarm: 0.7, chaser: 0.8 },
      theme: {
        base: "#0a0a1a",
        grid: "rgba(167,137,255,0.07)",
        major: "rgba(201,183,255,0.14)",
        border: "#4a4080",
        accent: "#a789ff",
        playerGlow: "rgba(167,137,255,0.4)"
      }
    },

    fortress: {
      id: "fortress",
      name: "Fortress Siege",
      shortDesc: "Heavy tank formations with high endurance requirements.",
      fullDesc: "A heavily fortified battlefield dominated by tank units and structured wave assaults. Enemy health is significantly increased, and spawn waves are organized in formations. Combat pacing is slow but extremely high pressure. High-damage and explosive builds are strongly favored. The environment feels like a defensive war zone. Each encounter feels like breaking through layers of resistance. It is the most endurance-focused map in the system.",
      spawnRate: 0.75,
      hpScale: 1.72,
      speedScale: 0.78,
      damageScale: 1.18,
      xpScale: 1.35,
      visibility: 1,
      formationSpawns: true,
      weightModifiers: { tank: 2.2, titan: 1.9, warden: 1.8, bruiser: 1.7, heavy: 1.6, fast: 0.3, runner: 0.4 },
      theme: {
        base: "#141014",
        grid: "rgba(255,103,119,0.06)",
        major: "rgba(246,199,94,0.14)",
        border: "#5a4a4a",
        accent: "#ff6777",
        playerGlow: "rgba(255,103,119,0.3)"
      }
    }
  };

  // SAFE FALLBACK - Standard Arena always exists
  const FALLBACK_ID = "standard";

  function list() {
    return Object.keys(maps).map((id) => maps[id]);
  }

  function get(id) {
    // SAFETY: Always return a valid map, fallback to standard
    const map = maps[id];
    if (!map || !map.id) {
      console.warn("[Maps] Invalid map ID:", id, "- using fallback");
      return maps[FALLBACK_ID];
    }
    return map;
  }

  function getAllIds() {
    return Object.keys(maps);
  }

  function isValid(id) {
    return !!(maps[id] && maps[id].id);
  }

  // Unique SVG icons for each map
  function icon(map) {
    if (!map || !map.id) return iconStandard();
    
    switch (map.id) {
      case "standard": return iconStandard(map);
      case "desert": return iconDesert(map);
      case "neon": return iconNeon(map);
      case "ice": return iconIce(map);
      case "jungle": return iconJungle(map);
      case "industrial": return iconIndustrial(map);
      case "voidrift": return iconVoid(map);
      case "storm": return iconStorm(map);
      case "crystal": return iconCrystal(map);
      case "fortress": return iconFortress(map);
      default: return iconStandard(map);
    }
  }

  function iconStandard(map) {
    const c = map.theme.accent, b = map.theme.base;
    return `<svg viewBox="0 0 220 130" aria-hidden="true"><rect width="220" height="130" fill="${b}"/><rect x="30" y="20" width="160" height="90" fill="none" stroke="${c}" stroke-width="3" rx="4"/><circle cx="110" cy="65" r="25" fill="none" stroke="${c}" stroke-width="2"/><path d="M30 65 H190 M110 20 V110" stroke="${c}" stroke-width="1" opacity="0.4"/><circle cx="110" cy="65" r="8" fill="${c}"/></svg>`;
  }

  function iconDesert(map) {
    const c = map.theme.accent, b = map.theme.base;
    return `<svg viewBox="0 0 220 130" aria-hidden="true"><rect width="220" height="130" fill="${b}"/><path d="M10 100 Q55 60 100 85 Q145 110 190 70 Q210 50 210 50" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/><path d="M30 110 Q80 80 130 95 Q180 110 200 90" fill="none" stroke="${c}" stroke-width="3" opacity="0.6" stroke-linecap="round"/><circle cx="180" cy="30" r="18" fill="${c}" opacity="0.9"/><circle cx="170" cy="28" r="4" fill="${b}"/></svg>`;
  }

  function iconNeon(map) {
    const c = map.theme.accent, b = map.theme.base, s = "#00ffff";
    return `<svg viewBox="0 0 220 130" aria-hidden="true"><rect width="220" height="130" fill="${b}"/><rect x="20" y="15" width="180" height="100" fill="none" stroke="${c}" stroke-width="2" rx="2"/><rect x="35" y="30" width="150" height="70" fill="none" stroke="${s}" stroke-width="1" rx="1" opacity="0.6"/><path d="M35 65 H185 M110 30 V100" stroke="${c}" stroke-width="1" stroke-dasharray="8 4" opacity="0.5"/><circle cx="110" cy="65" r="12" fill="${c}"/><rect x="104" y="59" width="12" height="12" fill="${b}"/></svg>`;
  }

  function iconIce(map) {
    const c = map.theme.accent, b = map.theme.base;
    return `<svg viewBox="0 0 220 130" aria-hidden="true"><rect width="220" height="130" fill="${b}"/><path d="M110 20 L125 55 L160 55 L135 75 L145 105 L110 85 L75 105 L85 75 L60 55 L95 55 Z" fill="none" stroke="${c}" stroke-width="3" stroke-linejoin="round"/><circle cx="110" cy="65" r="6" fill="${c}"/><path d="M20 110 L40 90 L60 100 L80 85 L100 95" fill="none" stroke="${c}" stroke-width="2" opacity="0.5" stroke-linecap="round"/></svg>`;
  }

  function iconJungle(map) {
    const c = map.theme.accent, b = map.theme.base;
    return `<svg viewBox="0 0 220 130" aria-hidden="true"><rect width="220" height="130" fill="${b}"/><path d="M40 110 L50 40 L65 110" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/><path d="M155 110 L170 35 L180 110" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/><path d="M95 110 L110 50 L125 110" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/><circle cx="110" cy="90" r="5" fill="${c}"/></svg>`;
  }

  function iconIndustrial(map) {
    const c = map.theme.accent, b = map.theme.base;
    return `<svg viewBox="0 0 220 130" aria-hidden="true"><rect width="220" height="130" fill="${b}"/><rect x="40" y="40" width="50" height="50" fill="none" stroke="${c}" stroke-width="3"/><rect x="130" y="40" width="50" height="50" fill="none" stroke="${c}" stroke-width="3"/><rect x="85" y="70" width="50" height="35" fill="none" stroke="${c}" stroke-width="2"/><path d="M65 40 V25 M155 40 V25 M110 70 V55" stroke="${c}" stroke-width="3" stroke-linecap="round"/><circle cx="110" cy="50" r="6" fill="${c}"/></svg>`;
  }

  function iconVoid(map) {
    const c = map.theme.accent, b = map.theme.base;
    return `<svg viewBox="0 0 220 130" aria-hidden="true"><defs><radialGradient id="voidGrad" cx="50%" cy="50%"><stop offset="0%" stop-color="${c}" stop-opacity="0.3"/><stop offset="100%" stop-color="${b}" stop-opacity="0"/></radialGradient></defs><rect width="220" height="130" fill="${b}"/><circle cx="110" cy="65" r="50" fill="url(#voidGrad)"/><path d="M60 65 Q85 40 110 65 Q135 90 160 65" fill="none" stroke="${c}" stroke-width="2" opacity="0.6"/><circle cx="110" cy="65" r="4" fill="${c}"/></svg>`;
  }

  function iconStorm(map) {
    const c = map.theme.accent, b = map.theme.base;
    return `<svg viewBox="0 0 220 130" aria-hidden="true"><rect width="220" height="130" fill="${b}"/><path d="M70 30 L85 55 L75 55 L95 85 L80 60 L95 60 Z" fill="${c}"/><path d="M140 25 L155 50 L145 50 L165 80 L150 55 L165 55 Z" fill="${c}" opacity="0.7"/><path d="M40 110 Q70 80 100 100 Q130 120 160 95 Q190 70 190 70" fill="none" stroke="${c}" stroke-width="2" opacity="0.5" stroke-linecap="round"/><circle cx="110" cy="65" r="3" fill="${c}"/></svg>`;
  }

  function iconCrystal(map) {
    const c = map.theme.accent, b = map.theme.base;
    return `<svg viewBox="0 0 220 130" aria-hidden="true"><rect width="220" height="130" fill="${b}"/><path d="M80 100 L110 35 L140 100 L125 100 L110 70 L95 100 Z" fill="none" stroke="${c}" stroke-width="3" stroke-linejoin="round"/><path d="M50 105 L70 60 L90 105" fill="none" stroke="${c}" stroke-width="2" opacity="0.6" stroke-linejoin="round"/><path d="M130 105 L150 60 L170 105" fill="none" stroke="${c}" stroke-width="2" opacity="0.6" stroke-linejoin="round"/></svg>`;
  }

  function iconFortress(map) {
    const c = map.theme.accent, b = map.theme.base;
    return `<svg viewBox="0 0 220 130" aria-hidden="true"><rect width="220" height="130" fill="${b}"/><path d="M55 105 V50 L75 60 L95 50 L115 60 L135 50 L155 60 L175 50 V105 Z" fill="none" stroke="${c}" stroke-width="4" stroke-linejoin="round"/><path d="M75 105 V80 H95 V105 M125 105 V80 H145 V105" stroke="${c}" stroke-width="3" stroke-linejoin="round"/><rect x="100" y="70" width="20" height="15" fill="none" stroke="${c}" stroke-width="2"/></svg>`;
  }

  // Map selection is locked at game start - no mid-game switching
  // This is enforced by the game logic, not the map system
  Arena.Maps = {
    list,
    get,
    getAllIds,
    isValid,
    icon,
    FALLBACK_ID
  };
})(window.Arena = window.Arena || {});
