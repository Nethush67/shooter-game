(function (Arena) {
  "use strict";

  function salvo(type, options) {
    return Object.assign({
      type,
      count: 1,
      spread: 0,
      angleOffset: 0,
      jitter: 0,
      barrels: [{ side: 0, forward: 35 }],
      radial: 0
    }, options || {});
  }

  function cls(id, name, tier, accent, description, weapon, evolves, visual) {
    return {
      id,
      name,
      tier,
      accent,
      description,
      weapon,
      evolves: evolves || [],
      visual: Object.assign({ barrelCount: 1, body: "round", icon: "shot" }, visual || {})
    };
  }

  const Classes = {
    // ==================== LAYER 1: ROOT (4 classes) ====================
    basic: cls("basic", "Basic", 0, "#55f0d0", "Choose your path: Velocity, Titan, Swarm, or Orbit.", {
      cadence: 0.34,
      salvos: [salvo("standard", { damage: 16, speed: 610, radius: 6, life: 1.4 })]
    }, ["velocity", "titan", "swarm", "orbit"]),

    // VELOCITY CORE - Fast, accurate, constant pressure
    velocity: cls("velocity", "Velocity Core", 1, "#55f0d0", "Fast, accurate single stream. Constant pressure and smooth control.", {
      cadence: 0.12,
      salvos: [salvo("rapid", { pattern: "single", damage: 6, speed: 700, radius: 4, life: 1.1 })]
    }, ["rapidFeed", "twinFeed", "stabilizedFeed", "pulseFeed"], { barrelCount: 1, icon: "stream" }),

    // TITAN CORE - Slow, heavy, high impact
    titan: cls("titan", "Titan Core", 1, "#f6c75e", "Slow, heavy projectile. High damage with strong impact.", {
      cadence: 0.72,
      salvos: [salvo("heavy", { pattern: "single", damage: 32, speed: 480, radius: 10, life: 1.3 })]
    }, ["heavyShot", "piercingShot", "explosiveShot", "chargedShot"], { body: "hex", icon: "blast" }),

    // SWARM CORE - Multi-bullet, coverage
    swarm: cls("swarm", "Swarm Core", 1, "#ff9f6e", "Multiple bullets with spread. Coverage over accuracy.", {
      cadence: 0.42,
      salvos: [salvo("spread", { pattern: "cone", count: 3, spread: 25, damage: 10, speed: 580, radius: 5, life: 0.9 })]
    }, ["doubleBarrel", "wideCone", "sideMounts", "ringVolley"], { barrelCount: 3, icon: "fan" }),

    // ORBIT CORE - Orbiting area control
    orbit: cls("orbit", "Orbit Core", 1, "#61a8ff", "Orbiting projectiles around player. Contact damage and area control.", {
      cadence: 0.55,
      salvos: [salvo("orbit", { pattern: "radial", radial: 3, damage: 12, speed: 0, radius: 80, life: 3.0 })]
    }, ["smallOrbit", "shieldOrbit", "orbitBarrage", "wideHalo"], { barrelCount: 3, icon: "orbit" }),

    // ==================== LAYER 2: BRANCH CHOICES (16 classes) ====================

    // VELOCITY LAYER 2 (4 classes)
    rapidFeed: cls("rapidFeed", "Rapid Feed", 2, "#55f0d0", "Fast continuous stream. Steady forward pressure.", {
      cadence: 0.08,
      salvos: [salvo("rapid", { pattern: "single", damage: 5, speed: 720, radius: 3.5, life: 1.0 })]
    }, ["minigunFeed", "accelerationFeed", "streamFeed", "needleFeed"], { barrelCount: 1, icon: "stream" }),

    twinFeed: cls("twinFeed", "Twin Feed", 2, "#61a8ff", "Two tightly grouped bullets per shot.", {
      cadence: 0.14,
      salvos: [salvo("dual", { pattern: "barrels", barrels: [{ side: -8, forward: 35 }, { side: 8, forward: 35 }], damage: 8, speed: 650, radius: 4, life: 1.0 })]
    }, ["tripleFeed", "quadFeed", "splitFeed", "mirrorFeed"], { barrelCount: 2, icon: "dual" }),

    stabilizedFeed: cls("stabilizedFeed", "Stabilized Feed", 2, "#9fe8ff", "Reduced recoil. Shots stay centered.", {
      cadence: 0.10,
      salvos: [salvo("rapid", { pattern: "single", damage: 6, speed: 700, radius: 3.8, life: 1.0 })]
    }, ["minigunFeed", "accelerationFeed", "streamFeed", "needleFeed"], { barrelCount: 1, icon: "stream" }),

    pulseFeed: cls("pulseFeed", "Pulse Feed", 2, "#7ff59b", "Rhythmic bursts in repeating intervals.", {
      cadence: 0.45,
      salvos: [salvo("burst", { pattern: "single", burstCount: 3, burstDelay: 0.12, damage: 7, speed: 680, radius: 4, life: 1.0 })]
    }, ["pulseBurst", "doublePulse", "widePulse", "shockPulse"], { barrelCount: 1, icon: "shot" }),

    // TITAN LAYER 2 (4 classes)
    heavyShot: cls("heavyShot", "Heavy Shot", 2, "#f6c75e", "Larger projectile. Slower but more impactful.", {
      cadence: 0.85,
      salvos: [salvo("heavy", { pattern: "single", damage: 45, speed: 460, radius: 14, life: 1.4, knockback: 1.5 })]
    }, ["crusherShot", "cannonShot", "ironShot", "hammerShot"], { body: "hex", icon: "blast" }),

    piercingShot: cls("piercingShot", "Piercing Shot", 2, "#f5f7fb", "Passes through enemies instead of stopping.", {
      cadence: 0.95,
      salvos: [salvo("sniper", { pattern: "single", damage: 52, speed: 1100, radius: 5, life: 1.3, pierce: 3 })]
    }, ["deepPierce", "lineBreak", "drillShot", "focusedPierce"], { icon: "rail" }),

    explosiveShot: cls("explosiveShot", "Explosive Shot", 2, "#ff6777", "Detonates on impact. Damages nearby enemies.", {
      cadence: 0.82,
      salvos: [salvo("explosive", { pattern: "single", damage: 38, speed: 420, radius: 14, life: 1.4, explodeRadius: 50 })]
    }, ["blastShot", "clusterShot", "infernoShot", "shockBlast"], { body: "hex", icon: "blast" }),

    chargedShot: cls("chargedShot", "Charged Shot", 2, "#a789ff", "Slight delay before firing for much stronger shot.", {
      cadence: 1.2,
      salvos: [salvo("heavy", { pattern: "single", damage: 65, speed: 500, radius: 16, life: 1.5 })]
    }, ["crusherShot", "cannonShot", "ironShot", "hammerShot"], { body: "hex", icon: "blast" }),

    // SWARM LAYER 2 (4 classes)
    doubleBarrel: cls("doubleBarrel", "Double Barrel", 2, "#61a8ff", "Exactly two bullets side-by-side every shot.", {
      cadence: 0.38,
      salvos: [salvo("dual", { pattern: "barrels", barrels: [{ side: -12, forward: 35 }, { side: 12, forward: 35 }], damage: 9, speed: 620, radius: 4.5, life: 1.0 })]
    }, ["tripleBarrel", "quadBarrel", "tightDouble", "twinLock"], { barrelCount: 2, icon: "dual" }),

    wideCone: cls("wideCone", "Wide Cone", 2, "#ff9f6e", "Spreads bullets in forward cone covering clear angle.", {
      cadence: 0.45,
      salvos: [salvo("spread", { pattern: "cone", count: 5, spread: 35, damage: 8, speed: 580, radius: 4, life: 0.95 })]
    }, ["broadCone", "sharpCone", "heavyCone", "openCone"], { barrelCount: 5, icon: "fan" }),

    sideMounts: cls("sideMounts", "Side Mounts", 2, "#a789ff", "Left and right cannons shoot outward, not forward.", {
      cadence: 0.42,
      salvos: [salvo("side", { pattern: "side", damage: 14, speed: 600, radius: 5, life: 1.0 })]
    }, ["sideBarrage", "twinSide", "crossfire", "rearGuard"], { barrelCount: 2, icon: "cross" }),

    ringVolley: cls("ringVolley", "Ring Volley", 2, "#c9b7ff", "Fires bullets outward in circular pattern around player.", {
      cadence: 0.55,
      salvos: [salvo("spray", { pattern: "radial", count: 8, damage: 7, speed: 550, radius: 4, life: 0.9 })]
    }, ["ringShot", "haloVolley", "orbitRing", "circleStorm"], { barrelCount: 8, icon: "radial" }),

    // ORBIT LAYER 2 (4 classes)
    smallOrbit: cls("smallOrbit", "Small Orbit", 2, "#55f0d0", "Two small orbiting projectiles circle close to player.", {
      cadence: 0.50,
      salvos: [salvo("orbit", { pattern: "radial", radial: 2, damage: 14, speed: 0, radius: 60, life: 3.0 })]
    }, ["fastOrbit", "tightShield", "orbitShot", "closeHalo"], { barrelCount: 2, icon: "orbit" }),

    shieldOrbit: cls("shieldOrbit", "Shield Orbit", 2, "#61a8ff", "Orbiting projectiles block and damage on contact.", {
      cadence: 0.55,
      salvos: [salvo("orbit", { pattern: "radial", radial: 3, damage: 16, speed: 0, radius: 80, life: 3.0 })]
    }, ["heavyShield", "reflectOrbit", "barrierOrbit", "aegisCore"], { barrelCount: 3, icon: "orbit" }),

    orbitBarrage: cls("orbitBarrage", "Orbit Barrage", 2, "#ff9f6e", "Orbiting projectiles periodically fire outward while rotating.", {
      cadence: 0.60,
      salvos: [
        salvo("orbit", { pattern: "radial", radial: 3, damage: 10, speed: 0, radius: 80, life: 3.0 }),
        salvo("standard", { pattern: "radial", radial: 3, damage: 8, speed: 500, radius: 3.5, life: 0.8 })
      ]
    }, ["rapidBarrage", "heavyBarrage", "pulseBarrage", "stormOrbit"], { barrelCount: 3, icon: "orbit" }),

    wideHalo: cls("wideHalo", "Wide Halo", 2, "#7ff59b", "Expands orbit radius to control larger area.", {
      cadence: 0.55,
      salvos: [salvo("orbit", { pattern: "radial", radial: 3, damage: 12, speed: 0, radius: 120, life: 3.0 })]
    }, ["hugeHalo", "farOrbit", "distantShield", "outerRing"], { barrelCount: 3, icon: "orbit" }),

    // ==================== LAYER 3: SCALING UP (16 classes) ====================

    // VELOCITY LAYER 3 (4 classes from each L2 path)
    minigunFeed: cls("minigunFeed", "Minigun Feed", 3, "#55f0d0", "Fire speed ramps up the longer trigger is held.", {
      cadence: 0.065,
      salvos: [salvo("minigun", { pattern: "single", damage: 4, speed: 750, radius: 3, life: 0.95 })]
    }, ["overclockFeed", "overdriveEngine", "velocityFinalA", "velocityFinalB"], { barrelCount: 1, icon: "stream" }),

    accelerationFeed: cls("accelerationFeed", "Acceleration Feed", 3, "#61a8ff", "Each shot increases firing speed slightly until reset.", {
      cadence: 0.12,
      salvos: [salvo("rapid", { pattern: "single", damage: 5, speed: 720, radius: 3.5, life: 1.0 })]
    }, ["overclockFeed", "overdriveEngine", "velocityFinalA", "velocityFinalB"], { barrelCount: 1, icon: "stream" }),

    streamFeed: cls("streamFeed", "Stream Feed", 3, "#9fe8ff", "Perfectly consistent stream with no gaps or jitter.", {
      cadence: 0.09,
      salvos: [salvo("rapid", { pattern: "single", damage: 6, speed: 700, radius: 3.8, life: 1.0 })]
    }, ["overclockFeed", "overdriveEngine", "velocityFinalA", "velocityFinalB"], { barrelCount: 1, icon: "stream" }),

    needleFeed: cls("needleFeed", "Needle Feed", 3, "#7ff59b", "Smaller, faster projectiles for constant pressure.", {
      cadence: 0.08,
      salvos: [salvo("rapid", { pattern: "single", damage: 4, speed: 850, radius: 2.5, life: 0.9 })]
    }, ["overclockFeed", "overdriveEngine", "velocityFinalA", "velocityFinalB"], { barrelCount: 1, icon: "needle" }),

    tripleFeed: cls("tripleFeed", "Triple Feed", 3, "#55f0d0", "Adds third bullet to each shot, forming tight horizontal line.", {
      cadence: 0.16,
      salvos: [salvo("triple", { pattern: "barrels", barrels: [{ side: -10, forward: 35 }, { side: 0, forward: 35 }, { side: 10, forward: 35 }], damage: 7, speed: 640, radius: 3.8, life: 1.0 })]
    }, ["velocityFinalC", "velocityFinalD", "velocityFinalE", "velocityFinalF"], { barrelCount: 3, icon: "triple" }),

    quadFeed: cls("quadFeed", "Quad Feed", 3, "#61a8ff", "Four evenly spaced bullets for stronger coverage.", {
      cadence: 0.18,
      salvos: [salvo("quad", { pattern: "barrels", barrels: [{ side: -12, forward: 35 }, { side: -4, forward: 35 }, { side: 4, forward: 35 }, { side: 12, forward: 35 }], damage: 6, speed: 620, radius: 3.5, life: 1.0 })]
    }, ["velocityFinalC", "velocityFinalD", "velocityFinalE", "velocityFinalF"], { barrelCount: 4, icon: "quad" }),

    splitFeed: cls("splitFeed", "Split Feed", 3, "#9fe8ff", "Widens spacing to hit multiple targets at once.", {
      cadence: 0.15,
      salvos: [salvo("dual", { pattern: "barrels", barrels: [{ side: -20, forward: 35 }, { side: 20, forward: 35 }], damage: 8, speed: 630, radius: 4, life: 1.0 })]
    }, ["velocityFinalC", "velocityFinalD", "velocityFinalE", "velocityFinalF"], { barrelCount: 2, icon: "dual" }),

    mirrorFeed: cls("mirrorFeed", "Mirror Feed", 3, "#7ff59b", "Adds backward copy of each shot.", {
      cadence: 0.18,
      salvos: [
        salvo("dual", { pattern: "barrels", barrels: [{ side: -8, forward: 35 }, { side: 8, forward: 35 }], damage: 7, speed: 640, radius: 3.5, life: 1.0 }),
        salvo("dual", { pattern: "barrels", barrels: [{ side: -8, forward: 35 }, { side: 8, forward: 35 }], damage: 7, speed: 640, radius: 3.5, life: 1.0, angleOffset: 180 })
      ]
    }, ["velocityFinalC", "velocityFinalD", "velocityFinalE", "velocityFinalF"], { barrelCount: 4, icon: "mirror" }),

    pulseBurst: cls("pulseBurst", "Pulse Burst", 3, "#55f0d0", "Each pulse releases compact cluster of bullets.", {
      cadence: 0.42,
      salvos: [salvo("burst", { pattern: "cone", burstCount: 3, burstDelay: 0.08, count: 3, spread: 20, damage: 5, speed: 660, radius: 3.2, life: 0.9 })]
    }, ["velocityFinalG", "velocityFinalH", "velocityFinalI", "velocityFinalJ"], { barrelCount: 3, icon: "shot" }),

    doublePulse: cls("doublePulse", "Double Pulse", 3, "#61a8ff", "Each firing cycle produces two quick pulses back-to-back.", {
      cadence: 0.35,
      salvos: [salvo("burst", { pattern: "single", burstCount: 2, burstDelay: 0.18, damage: 6, speed: 680, radius: 3.5, life: 1.0 })]
    }, ["velocityFinalG", "velocityFinalH", "velocityFinalI", "velocityFinalJ"], { barrelCount: 1, icon: "shot" }),

    widePulse: cls("widePulse", "Wide Pulse", 3, "#9fe8ff", "Expands each pulse into broader spread.", {
      cadence: 0.48,
      salvos: [salvo("burst", { pattern: "cone", burstCount: 3, burstDelay: 0.1, count: 5, spread: 40, damage: 4, speed: 640, radius: 3, life: 0.9 })]
    }, ["velocityFinalG", "velocityFinalH", "velocityFinalI", "velocityFinalJ"], { barrelCount: 5, icon: "fan" }),

    shockPulse: cls("shockPulse", "Shock Pulse", 3, "#7ff59b", "Each pulse hits harder and visibly pushes enemies back.", {
      cadence: 0.52,
      salvos: [salvo("burst", { pattern: "single", burstCount: 3, burstDelay: 0.12, damage: 10, speed: 700, radius: 4.5, life: 1.0, knockback: 1 })]
    }, ["velocityFinalG", "velocityFinalH", "velocityFinalI", "velocityFinalJ"], { barrelCount: 1, icon: "blast" }),

    // TITAN LAYER 3 (4 classes)
    crusherShot: cls("crusherShot", "Crusher Shot", 3, "#f6c75e", "Impacts push enemies backward with strong knockback.", {
      cadence: 0.88,
      salvos: [salvo("heavy", { pattern: "single", damage: 48, speed: 460, radius: 14, life: 1.4, knockback: 2.5 })]
    }, ["titanFinalA", "titanFinalB", "titanFinalC", "titanFinalD"], { body: "hex", icon: "blast" }),

    cannonShot: cls("cannonShot", "Cannon Shot", 3, "#f5f7fb", "Large shell-like projectiles with heavy visual presence.", {
      cadence: 1.0,
      salvos: [salvo("heavy", { pattern: "single", damage: 55, speed: 440, radius: 18, life: 1.5 })]
    }, ["titanFinalA", "titanFinalB", "titanFinalC", "titanFinalD"], { body: "hex", icon: "blast" }),

    ironShot: cls("ironShot", "Iron Shot", 3, "#ff6777", "Slower projectile with increased damage and weight.", {
      cadence: 1.1,
      salvos: [salvo("heavy", { pattern: "single", damage: 62, speed: 400, radius: 16, life: 1.6 })]
    }, ["titanFinalA", "titanFinalB", "titanFinalC", "titanFinalD"], { body: "hex", icon: "blast" }),

    hammerShot: cls("hammerShot", "Hammer Shot", 3, "#a789ff", "Slow crushing shots that feel extremely powerful.", {
      cadence: 1.3,
      salvos: [salvo("heavy", { pattern: "single", damage: 75, speed: 380, radius: 20, life: 1.7 })]
    }, ["titanFinalA", "titanFinalB", "titanFinalC", "titanFinalD"], { body: "hex", icon: "blast" }),

    deepPierce: cls("deepPierce", "Deep Pierce", 3, "#f6c75e", "Increases how many enemies each shot can pass through.", {
      cadence: 0.95,
      salvos: [salvo("sniper", { pattern: "single", damage: 52, speed: 1100, radius: 5, life: 1.3, pierce: 6 })]
    }, ["titanFinalE", "titanFinalF", "titanFinalG", "titanFinalH"], { icon: "rail" }),

    lineBreak: cls("lineBreak", "Line Break", 3, "#f5f7fb", "Maintains damage through multiple targets.", {
      cadence: 1.0,
      salvos: [salvo("sniper", { pattern: "single", damage: 58, speed: 1150, radius: 5, life: 1.3, pierce: 4 })]
    }, ["titanFinalE", "titanFinalF", "titanFinalG", "titanFinalH"], { icon: "rail" }),

    drillShot: cls("drillShot", "Drill Shot", 3, "#ff6777", "Shots appear to bore through enemies consistently.", {
      cadence: 1.05,
      salvos: [salvo("sniper", { pattern: "single", damage: 55, speed: 1200, radius: 4, life: 1.2, pierce: 5 })]
    }, ["titanFinalE", "titanFinalF", "titanFinalG", "titanFinalH"], { icon: "rail" }),

    focusedPierce: cls("focusedPierce", "Focused Pierce", 3, "#a789ff", "Tightens accuracy for perfectly aligned shots.", {
      cadence: 0.92,
      salvos: [salvo("sniper", { pattern: "single", damage: 60, speed: 1250, radius: 4.5, life: 1.3, pierce: 4 })]
    }, ["titanFinalE", "titanFinalF", "titanFinalG", "titanFinalH"], { icon: "rail" }),

    blastShot: cls("blastShot", "Blast Shot", 3, "#f6c75e", "Increases explosion radius.", {
      cadence: 0.85,
      salvos: [salvo("explosive", { pattern: "single", damage: 42, speed: 420, radius: 16, life: 1.4, explodeRadius: 70 })]
    }, ["titanFinalI", "titanFinalJ", "titanFinalK", "titanFinalL"], { body: "hex", icon: "blast" }),

    clusterShot: cls("clusterShot", "Cluster Shot", 3, "#f5f7fb", "Explosions split into smaller secondary blasts.", {
      cadence: 0.90,
      salvos: [salvo("cluster", { pattern: "single", damage: 35, speed: 400, radius: 14, life: 1.4, miniCount: 6, miniDamage: 12, miniRadius: 35 })]
    }, ["titanFinalI", "titanFinalJ", "titanFinalK", "titanFinalL"], { body: "hex", icon: "blast" }),

    infernoShot: cls("infernoShot", "Inferno Shot", 3, "#ff6777", "Explosions leave burning zone over time.", {
      cadence: 0.95,
      salvos: [salvo("inferno", { pattern: "single", damage: 30, speed: 390, radius: 13, life: 1.45, zoneDuration: 5, zoneDPS: 8, zoneRadius: 40 })]
    }, ["titanFinalI", "titanFinalJ", "titanFinalK", "titanFinalL"], { body: "hex", icon: "radial" }),

    shockBlast: cls("shockBlast", "Shock Blast", 3, "#a789ff", "Explosions push enemies outward.", {
      cadence: 0.88,
      salvos: [salvo("explosive", { pattern: "single", damage: 40, speed: 430, radius: 15, life: 1.4, explodeRadius: 55, knockback: 1.5 })]
    }, ["titanFinalI", "titanFinalJ", "titanFinalK", "titanFinalL"], { body: "hex", icon: "blast" }),

    // SWARM LAYER 3 (4 classes)
    tripleBarrel: cls("tripleBarrel", "Triple Barrel", 3, "#61a8ff", "Adds third projectile to each shot in stable formation.", {
      cadence: 0.32,
      salvos: [salvo("triple", { pattern: "barrels", barrels: [{ side: -12, forward: 35 }, { side: 0, forward: 35 }, { side: 12, forward: 35 }], damage: 7, speed: 600, radius: 4, life: 1.0 })]
    }, ["swarmFinalA", "swarmFinalB", "swarmFinalC", "swarmFinalD"], { barrelCount: 3, icon: "triple" }),

    quadBarrel: cls("quadBarrel", "Quad Barrel", 3, "#ff9f6e", "Fires four bullets in clean symmetrical pattern.", {
      cadence: 0.28,
      salvos: [salvo("quad", { pattern: "barrels", barrels: [{ side: -12, forward: 32 }, { side: -4, forward: 32 }, { side: 4, forward: 32 }, { side: 12, forward: 32 }], damage: 6, speed: 590, radius: 3.8, life: 1.0 })]
    }, ["swarmFinalA", "swarmFinalB", "swarmFinalC", "swarmFinalD"], { barrelCount: 4, icon: "quad" }),

    tightDouble: cls("tightDouble", "Tight Double", 3, "#a789ff", "Keeps two bullets but compresses closer for higher accuracy.", {
      cadence: 0.35,
      salvos: [salvo("dual", { pattern: "barrels", barrels: [{ side: -6, forward: 35 }, { side: 6, forward: 35 }], damage: 10, speed: 630, radius: 4.5, life: 1.0 })]
    }, ["swarmFinalA", "swarmFinalB", "swarmFinalC", "swarmFinalD"], { barrelCount: 2, icon: "dual" }),

    twinLock: cls("twinLock", "Twin Lock", 3, "#c9b7ff", "Locks both bullets to always hit same point consistently.", {
      cadence: 0.36,
      salvos: [salvo("dual", { pattern: "barrels", barrels: [{ side: -4, forward: 35 }, { side: 4, forward: 35 }], damage: 11, speed: 640, radius: 4.8, life: 1.0 })]
    }, ["swarmFinalA", "swarmFinalB", "swarmFinalC", "swarmFinalD"], { barrelCount: 2, icon: "dual" }),

    broadCone: cls("broadCone", "Broad Cone", 3, "#61a8ff", "Expands cone angle to cover more area in front.", {
      cadence: 0.52,
      salvos: [salvo("spread", { pattern: "cone", count: 7, spread: 60, damage: 7, speed: 560, radius: 3.8, life: 0.9 })]
    }, ["swarmFinalE", "swarmFinalF", "swarmFinalG", "swarmFinalH"], { barrelCount: 7, icon: "fan" }),

    sharpCone: cls("sharpCone", "Sharp Cone", 3, "#ff9f6e", "Narrows cone but increases density and focus.", {
      cadence: 0.45,
      salvos: [salvo("spread", { pattern: "cone", count: 6, spread: 25, damage: 9, speed: 600, radius: 4.2, life: 1.0 })]
    }, ["swarmFinalE", "swarmFinalF", "swarmFinalG", "swarmFinalH"], { barrelCount: 6, icon: "fan" }),

    heavyCone: cls("heavyCone", "Heavy Cone", 3, "#a789ff", "Reduces bullet count but increases impact of each.", {
      cadence: 0.55,
      salvos: [salvo("spread", { pattern: "cone", count: 4, spread: 35, damage: 12, speed: 580, radius: 5, life: 1.0 })]
    }, ["swarmFinalE", "swarmFinalF", "swarmFinalG", "swarmFinalH"], { barrelCount: 4, icon: "fan" }),

    openCone: cls("openCone", "Open Cone", 3, "#c9b7ff", "Very wide spread for maximum coverage at close range.", {
      cadence: 0.58,
      salvos: [salvo("spread", { pattern: "cone", count: 8, spread: 75, damage: 6, speed: 540, radius: 3.5, life: 0.85 })]
    }, ["swarmFinalE", "swarmFinalF", "swarmFinalG", "swarmFinalH"], { barrelCount: 8, icon: "fan" }),

    sideBarrage: cls("sideBarrage", "Side Barrage", 3, "#61a8ff", "Increases fire rate of side cannons.", {
      cadence: 0.32,
      salvos: [salvo("side", { pattern: "side", damage: 16, speed: 620, radius: 5.5, life: 1.0 })]
    }, ["swarmFinalI", "swarmFinalJ", "swarmFinalK", "swarmFinalL"], { barrelCount: 2, icon: "cross" }),

    twinSide: cls("twinSide", "Twin Side", 3, "#ff9f6e", "Fires two bullets per side instead of one.", {
      cadence: 0.38,
      salvos: [
        salvo("side", { pattern: "barrels", barrels: [{ side: -8, forward: 35 }], damage: 12, speed: 600, radius: 4.5, life: 1.0, angleOffset: 90 }),
        salvo("side", { pattern: "barrels", barrels: [{ side: 8, forward: 35 }], damage: 12, speed: 600, radius: 4.5, life: 1.0, angleOffset: 90 }),
        salvo("side", { pattern: "barrels", barrels: [{ side: -8, forward: 35 }], damage: 12, speed: 600, radius: 4.5, life: 1.0, angleOffset: -90 }),
        salvo("side", { pattern: "barrels", barrels: [{ side: 8, forward: 35 }], damage: 12, speed: 600, radius: 4.5, life: 1.0, angleOffset: -90 })
      ]
    }, ["swarmFinalI", "swarmFinalJ", "swarmFinalK", "swarmFinalL"], { barrelCount: 4, icon: "cross" }),

    crossfire: cls("crossfire", "Crossfire", 3, "#a789ff", "Adds forward shot while keeping side fire active.", {
      cadence: 0.48,
      salvos: [
        salvo("standard", { pattern: "single", damage: 10, speed: 620, radius: 4.5, life: 1.0 }),
        salvo("side", { pattern: "side", damage: 12, speed: 600, radius: 4.5, life: 1.0 })
      ]
    }, ["swarmFinalI", "swarmFinalJ", "swarmFinalK", "swarmFinalL"], { barrelCount: 3, icon: "cross" }),

    rearGuard: cls("rearGuard", "Rear Guard", 3, "#c9b7ff", "Adds backward shots for defense behind player.", {
      cadence: 0.55,
      salvos: [
        salvo("side", { pattern: "side", damage: 14, speed: 600, radius: 5, life: 1.0 }),
        salvo("rear", { pattern: "single", damage: 16, speed: 640, radius: 5.5, life: 1.1, angleOffset: 180 })
      ]
    }, ["swarmFinalI", "swarmFinalJ", "swarmFinalK", "swarmFinalL"], { barrelCount: 3, icon: "rear" }),

    ringShot: cls("ringShot", "Ring Shot", 3, "#61a8ff", "Fires clean evenly spaced circle of bullets outward.", {
      cadence: 0.52,
      salvos: [salvo("spray", { pattern: "radial", count: 10, damage: 7, speed: 560, radius: 4, life: 0.9 })]
    }, ["swarmFinalM", "swarmFinalN", "swarmFinalO", "swarmFinalP"], { barrelCount: 10, icon: "radial" }),

    haloVolley: cls("haloVolley", "Halo Volley", 3, "#ff9f6e", "Increases bullet count in circular pattern.", {
      cadence: 0.48,
      salvos: [salvo("spray", { pattern: "radial", count: 12, damage: 6, speed: 550, radius: 3.8, life: 0.85 })]
    }, ["swarmFinalM", "swarmFinalN", "swarmFinalO", "swarmFinalP"], { barrelCount: 12, icon: "radial" }),

    orbitRing: cls("orbitRing", "Orbit Ring", 3, "#a789ff", "Bullets briefly orbit before flying outward.", {
      cadence: 0.65,
      salvos: [salvo("arc", { pattern: "radial", count: 6, damage: 9, speed: 480, radius: 4.5, life: 1.2, orbit: true, orbitTime: 0.3 })]
    }, ["swarmFinalM", "swarmFinalN", "swarmFinalO", "swarmFinalP"], { barrelCount: 6, icon: "orbit" }),

    circleStorm: cls("circleStorm", "Circle Storm", 3, "#c9b7ff", "Fires dense circular waves continuously.", {
      cadence: 0.42,
      salvos: [salvo("spray", { pattern: "radial", count: 14, damage: 5, speed: 540, radius: 3.2, life: 0.8 })]
    }, ["swarmFinalM", "swarmFinalN", "swarmFinalO", "swarmFinalP"], { barrelCount: 14, icon: "radial" }),

    // ORBIT LAYER 3 (4 classes)
    fastOrbit: cls("fastOrbit", "Fast Orbit", 3, "#55f0d0", "Orbiting projectiles spin faster around player.", {
      cadence: 0.45,
      salvos: [salvo("orbit", { pattern: "radial", radial: 3, damage: 14, speed: 0, radius: 80, life: 3.0, orbitSpeed: 6 })]
    }, ["orbitFinalA", "orbitFinalB", "orbitFinalC", "orbitFinalD"], { barrelCount: 3, icon: "orbit" }),

    tightShield: cls("tightShield", "Tight Shield", 3, "#61a8ff", "More orbiters in tighter formation.", {
      cadence: 0.48,
      salvos: [salvo("orbit", { pattern: "radial", radial: 4, damage: 12, speed: 0, radius: 60, life: 3.0 })]
    }, ["orbitFinalA", "orbitFinalB", "orbitFinalC", "orbitFinalD"], { barrelCount: 4, icon: "orbit" }),

    orbitShot: cls("orbitShot", "Orbit Shot", 3, "#9fe8ff", "Orbiters fire outward when enemies are near.", {
      cadence: 0.55,
      salvos: [
        salvo("orbit", { pattern: "radial", radial: 3, damage: 10, speed: 0, radius: 80, life: 3.0 }),
        salvo("standard", { pattern: "radial", radial: 3, damage: 9, speed: 600, radius: 3.8, life: 0.9, proximityTrigger: true })
      ]
    }, ["orbitFinalA", "orbitFinalB", "orbitFinalC", "orbitFinalD"], { barrelCount: 3, icon: "orbit" }),

    closeHalo: cls("closeHalo", "Close Halo", 3, "#7ff59b", "Tight orbit with high contact damage.", {
      cadence: 0.50,
      salvos: [salvo("orbit", { pattern: "radial", radial: 3, damage: 18, speed: 0, radius: 50, life: 3.0 })]
    }, ["orbitFinalA", "orbitFinalB", "orbitFinalC", "orbitFinalD"], { barrelCount: 3, icon: "orbit" }),

    heavyShield: cls("heavyShield", "Heavy Shield", 3, "#f6c75e", "Larger blocking orbiters.", {
      cadence: 0.60,
      salvos: [salvo("orbit", { pattern: "radial", radial: 2, damage: 22, speed: 0, radius: 90, life: 3.0, radiusSize: 1.5 })]
    }, ["orbitFinalE", "orbitFinalF", "orbitFinalG", "orbitFinalH"], { barrelCount: 2, icon: "orbit" }),

    reflectOrbit: cls("reflectOrbit", "Reflect Orbit", 3, "#f5f7fb", "Orbiters bounce enemy projectiles back.", {
      cadence: 0.65,
      salvos: [salvo("orbit", { pattern: "radial", radial: 3, damage: 14, speed: 0, radius: 85, life: 3.0, reflecting: true })]
    }, ["orbitFinalE", "orbitFinalF", "orbitFinalG", "orbitFinalH"], { barrelCount: 3, icon: "orbit" }),

    barrierOrbit: cls("barrierOrbit", "Barrier Orbit", 3, "#ff6777", "Stationary barriers orbit slowly.", {
      cadence: 0.70,
      salvos: [salvo("orbit", { pattern: "radial", radial: 4, damage: 16, speed: 0, radius: 100, life: 3.0, slowOrbit: true })]
    }, ["orbitFinalE", "orbitFinalF", "orbitFinalG", "orbitFinalH"], { barrelCount: 4, icon: "orbit" }),

    aegisCore: cls("aegisCore", "Aegis Core", 3, "#a789ff", "Heavy orbiters that block major threats.", {
      cadence: 0.75,
      salvos: [salvo("orbit", { pattern: "radial", radial: 2, damage: 28, speed: 0, radius: 95, life: 3.0 })]
    }, ["orbitFinalE", "orbitFinalF", "orbitFinalG", "orbitFinalH"], { barrelCount: 2, icon: "orbit" }),

    rapidBarrage: cls("rapidBarrage", "Rapid Barrage", 3, "#55f0d0", "Orbiters fire outward constantly.", {
      cadence: 0.45,
      salvos: [
        salvo("orbit", { pattern: "radial", radial: 3, damage: 8, speed: 0, radius: 80, life: 3.0 }),
        salvo("rapid", { pattern: "radial", radial: 3, damage: 7, speed: 550, radius: 3.2, life: 0.8, fireRate: 0.15 })
      ]
    }, ["orbitFinalI", "orbitFinalJ", "orbitFinalK", "orbitFinalL"], { barrelCount: 3, icon: "orbit" }),

    heavyBarrage: cls("heavyBarrage", "Heavy Barrage", 3, "#f6c75e", "Orbiters fire heavy shots outward.", {
      cadence: 0.55,
      salvos: [
        salvo("orbit", { pattern: "radial", radial: 3, damage: 10, speed: 0, radius: 80, life: 3.0 }),
        salvo("heavy", { pattern: "radial", radial: 3, damage: 14, speed: 480, radius: 4.5, life: 1.0, fireRate: 0.25 })
      ]
    }, ["orbitFinalI", "orbitFinalJ", "orbitFinalK", "orbitFinalL"], { barrelCount: 3, icon: "orbit" }),

    pulseBarrage: cls("pulseBarrage", "Pulse Barrage", 3, "#61a8ff", "Orbiters fire in rhythmic pulses.", {
      cadence: 0.50,
      salvos: [
        salvo("orbit", { pattern: "radial", radial: 3, damage: 9, speed: 0, radius: 80, life: 3.0 }),
        salvo("burst", { pattern: "radial", radial: 3, burstCount: 3, burstDelay: 0.1, damage: 8, speed: 520, radius: 3.5, life: 0.9 })
      ]
    }, ["orbitFinalI", "orbitFinalJ", "orbitFinalK", "orbitFinalL"], { barrelCount: 3, icon: "orbit" }),

    stormOrbit: cls("stormOrbit", "Storm Orbit", 3, "#ff9f6e", "Orbiters fire constantly in all directions.", {
      cadence: 0.40,
      salvos: [
        salvo("orbit", { pattern: "radial", radial: 4, damage: 8, speed: 0, radius: 90, life: 3.0 }),
        salvo("spray", { pattern: "radial", count: 4, damage: 6, speed: 500, radius: 3.2, life: 0.8, fireRate: 0.12 })
      ]
    }, ["orbitFinalI", "orbitFinalJ", "orbitFinalK", "orbitFinalL"], { barrelCount: 4, icon: "orbit" }),

    hugeHalo: cls("hugeHalo", "Huge Halo", 3, "#55f0d0", "Very large orbit radius.", {
      cadence: 0.60,
      salvos: [salvo("orbit", { pattern: "radial", radial: 4, damage: 12, speed: 0, radius: 150, life: 3.0 })]
    }, ["orbitFinalM", "orbitFinalN", "orbitFinalO", "orbitFinalP"], { barrelCount: 4, icon: "orbit" }),

    farOrbit: cls("farOrbit", "Far Orbit", 3, "#61a8ff", "Distant orbiting sentries.", {
      cadence: 0.65,
      salvos: [salvo("orbit", { pattern: "radial", radial: 3, damage: 14, speed: 0, radius: 180, life: 3.0 })]
    }, ["orbitFinalM", "orbitFinalN", "orbitFinalO", "orbitFinalP"], { barrelCount: 3, icon: "orbit" }),

    distantShield: cls("distantShield", "Distant Shield", 3, "#9fe8ff", "Orbiters stay far out to intercept at range.", {
      cadence: 0.70,
      salvos: [salvo("orbit", { pattern: "radial", radial: 3, damage: 13, speed: 0, radius: 200, life: 3.0, interceptRange: true })]
    }, ["orbitFinalM", "orbitFinalN", "orbitFinalO", "orbitFinalP"], { barrelCount: 3, icon: "orbit" }),

    outerRing: cls("outerRing", "Outer Ring", 3, "#7ff59b", "Maximum orbit distance with wide coverage.", {
      cadence: 0.55,
      salvos: [salvo("orbit", { pattern: "radial", radial: 5, damage: 10, speed: 0, radius: 160, life: 3.0 })]
    }, ["orbitFinalM", "orbitFinalN", "orbitFinalO", "orbitFinalP"], { barrelCount: 5, icon: "orbit" }),

    // ==================== LAYER 4: AMPLIFICATION (16 classes) ====================

    // VELOCITY LAYER 4 - from minigun/acceleration/stream/needle paths
    overclockFeed: cls("overclockFeed", "Overclock Feed", 4, "#55f0d0", "Fire rate becomes extremely high but harder to control.", {
      cadence: 0.045,
      salvos: [salvo("rapid", { pattern: "single", damage: 3, speed: 780, radius: 2.8, life: 0.9 })]
    }, ["velocityFinalA", "velocityFinalB", "velocityFinalC", "velocityFinalD"], { barrelCount: 1, icon: "stream" }),

    overdriveEngine: cls("overdriveEngine", "Overdrive Engine", 4, "#61a8ff", "Uncontrollable rapid-fire chaos.", {
      cadence: 0.035,
      salvos: [salvo("rapid", { pattern: "single", damage: 2, speed: 820, radius: 2.5, life: 0.85 })]
    }, ["velocityFinalA", "velocityFinalB", "velocityFinalC", "velocityFinalD"], { barrelCount: 1, icon: "stream" }),

    // VELOCITY LAYER 4 - from triple/quad/split/mirror paths
    quintFeed: cls("quintFeed", "Quint Feed", 4, "#55f0d0", "Five parallel bullets per shot.", {
      cadence: 0.20,
      salvos: [salvo("penta", { pattern: "barrels", barrels: [{ side: -16, forward: 35 }, { side: -8, forward: 35 }, { side: 0, forward: 35 }, { side: 8, forward: 35 }, { side: 16, forward: 35 }], damage: 5, speed: 600, radius: 3.5, life: 1.0 })]
    }, ["velocityFinalE", "velocityFinalF", "velocityFinalG", "velocityFinalH"], { barrelCount: 5, icon: "penta" }),

    doubleMirror: cls("doubleMirror", "Double Mirror", 4, "#61a8ff", "Forward and backward multi-shot.", {
      cadence: 0.22,
      salvos: [
        salvo("triple", { pattern: "barrels", barrels: [{ side: -10, forward: 35 }, { side: 0, forward: 35 }, { side: 10, forward: 35 }], damage: 6, speed: 620, radius: 3.8, life: 1.0 }),
        salvo("triple", { pattern: "barrels", barrels: [{ side: -10, forward: 35 }, { side: 0, forward: 35 }, { side: 10, forward: 35 }], damage: 6, speed: 620, radius: 3.8, life: 1.0, angleOffset: 180 })
      ]
    }, ["velocityFinalE", "velocityFinalF", "velocityFinalG", "velocityFinalH"], { barrelCount: 6, icon: "mirror" }),

    // VELOCITY LAYER 4 - from pulse paths
    megaPulse: cls("megaPulse", "Mega Pulse", 4, "#55f0d0", "Massive 5-shot pulses with wide coverage.", {
      cadence: 0.38,
      salvos: [salvo("burst", { pattern: "cone", burstCount: 5, burstDelay: 0.06, count: 5, spread: 45, damage: 4, speed: 660, radius: 3.2, life: 0.9 })]
    }, ["velocityFinalI", "velocityFinalJ", "velocityFinalK", "velocityFinalL"], { barrelCount: 5, icon: "fan" }),

    shockStream: cls("shockStream", "Shock Stream", 4, "#61a8ff", "Continuous stream with knockback.", {
      cadence: 0.08,
      salvos: [salvo("rapid", { pattern: "single", damage: 5, speed: 750, radius: 3.2, life: 1.0, knockback: 0.5 })]
    }, ["velocityFinalI", "velocityFinalJ", "velocityFinalK", "velocityFinalL"], { barrelCount: 1, icon: "stream" }),

    // TITAN LAYER 4 - from crusher/cannon/iron/hammer paths
    megaCrusher: cls("megaCrusher", "Mega Crusher", 4, "#f6c75e", "Extreme knockback sends enemies flying.", {
      cadence: 0.92,
      salvos: [salvo("heavy", { pattern: "single", damage: 58, speed: 450, radius: 16, life: 1.4, knockback: 3.5 })]
    }, ["titanFinalA", "titanFinalB", "titanFinalC", "titanFinalD"], { body: "hex", icon: "blast" }),

    siegeCannon: cls("siegeCannon", "Siege Cannon", 4, "#f5f7fb", "Massive shells with extreme damage.", {
      cadence: 1.35,
      salvos: [salvo("heavy", { pattern: "single", damage: 125, speed: 360, radius: 22, life: 1.7 })]
    }, ["titanFinalA", "titanFinalB", "titanFinalC", "titanFinalD"], { body: "hex", icon: "blast" }),

    // TITAN LAYER 4 - from pierce paths
    pierceMaster: cls("pierceMaster", "Pierce Master", 4, "#9fe8ff", "Pierces through 8 enemies.", {
      cadence: 0.88,
      salvos: [salvo("sniper", { pattern: "single", damage: 50, speed: 1150, radius: 5, life: 1.35, pierce: 8 })]
    }, ["titanFinalE", "titanFinalF", "titanFinalG", "titanFinalH"], { icon: "rail" }),

    railCannon: cls("railCannon", "Rail Cannon", 4, "#55f0d0", "Instant high-damage beam.", {
      cadence: 1.1,
      salvos: [salvo("beam", { pattern: "single", damage: 90, speed: 2000, radius: 6, life: 0.35, pierce: 99 })]
    }, ["titanFinalE", "titanFinalF", "titanFinalG", "titanFinalH"], { icon: "rail" }),

    // TITAN LAYER 4 - from explosive paths
    chainCluster: cls("chainCluster", "Chain Cluster", 4, "#f6c75e", "Secondary explosions trigger more explosions.", {
      cadence: 0.95,
      salvos: [salvo("cluster", { pattern: "single", damage: 35, speed: 400, radius: 15, life: 1.5, miniCount: 8, miniDamage: 15, miniRadius: 40, chainTrigger: true })]
    }, ["titanFinalI", "titanFinalJ", "titanFinalK", "titanFinalL"], { body: "hex", icon: "blast" }),

    hellfire: cls("hellfire", "Hellfire", 4, "#a789ff", "Longer lasting fire zones with higher damage.", {
      cadence: 1.1,
      salvos: [salvo("inferno", { pattern: "single", damage: 28, speed: 390, radius: 14, life: 1.5, zoneDuration: 8, zoneDPS: 12, zoneRadius: 55 })]
    }, ["titanFinalI", "titanFinalJ", "titanFinalK", "titanFinalL"], { body: "hex", icon: "radial" }),

    // SWARM LAYER 4 - from barrel paths
    pentaBarrel: cls("pentaBarrel", "Penta Barrel", 4, "#61a8ff", "Five parallel bullets.", {
      cadence: 0.26,
      salvos: [salvo("penta", { pattern: "barrels", barrels: [{ side: -16, forward: 35 }, { side: -8, forward: 35 }, { side: 0, forward: 35 }, { side: 8, forward: 35 }, { side: 16, forward: 35 }], damage: 6, speed: 600, radius: 4, life: 1.0 })]
    }, ["swarmFinalA", "swarmFinalB", "swarmFinalC", "swarmFinalD"], { barrelCount: 5, icon: "penta" }),

    hexBarrel: cls("hexBarrel", "Hex Barrel", 4, "#ff9f6e", "Six bullets in hex formation.", {
      cadence: 0.24,
      salvos: [salvo("hex", { pattern: "barrels", barrels: [{ side: -12, forward: 32 }, { side: -6, forward: 38 }, { side: 0, forward: 32 }, { side: 0, forward: 38 }, { side: 6, forward: 32 }, { side: 12, forward: 38 }], damage: 5, speed: 590, radius: 3.8, life: 1.0 })]
    }, ["swarmFinalA", "swarmFinalB", "swarmFinalC", "swarmFinalD"], { barrelCount: 6, icon: "hex" }),

    // SWARM LAYER 4 - from cone paths
    megaCone: cls("megaCone", "Mega Cone", 4, "#61a8ff", "9 bullets in 65-degree cone.", {
      cadence: 0.42,
      salvos: [salvo("spread", { pattern: "cone", count: 9, spread: 65, damage: 6, speed: 570, radius: 3.8, life: 0.9 })]
    }, ["swarmFinalE", "swarmFinalF", "swarmFinalG", "swarmFinalH"], { barrelCount: 9, icon: "fan" }),

    ultraCone: cls("ultraCone", "Ultra Cone", 4, "#ff9f6e", "12 bullets in massive cone.", {
      cadence: 0.48,
      salvos: [salvo("spread", { pattern: "cone", count: 12, spread: 80, damage: 5, speed: 550, radius: 3.5, life: 0.85 })]
    }, ["swarmFinalE", "swarmFinalF", "swarmFinalG", "swarmFinalH"], { barrelCount: 12, icon: "fan" }),

    // SWARM LAYER 4 - from side/cross/rear paths
    heavySide: cls("heavySide", "Heavy Side", 4, "#a789ff", "Strong side cannons with piercing.", {
      cadence: 0.28,
      salvos: [salvo("side", { pattern: "side", damage: 22, speed: 640, radius: 6, life: 1.0, pierce: 2 })]
    }, ["swarmFinalI", "swarmFinalJ", "swarmFinalK", "swarmFinalL"], { barrelCount: 2, icon: "cross" }),

    gridFire: cls("gridFire", "Grid Fire", 4, "#7ff59b", "Shots extend into multiple fixed directions.", {
      cadence: 0.48,
      salvos: [
        salvo("standard", { pattern: "single", damage: 10, speed: 620, radius: 4.5, life: 1.0 }),
        salvo("side", { pattern: "side", damage: 10, speed: 600, radius: 4.5, life: 1.0 }),
        salvo("rear", { pattern: "single", damage: 10, speed: 620, radius: 4.5, life: 1.0, angleOffset: 180 })
      ]
    }, ["swarmFinalI", "swarmFinalJ", "swarmFinalK", "swarmFinalL"], { barrelCount: 4, icon: "cross" }),

    // SWARM LAYER 4 - from ring paths
    burstRing: cls("burstRing", "Burst Ring", 4, "#61a8ff", "16 bullets in circular burst.", {
      cadence: 0.45,
      salvos: [salvo("spray", { pattern: "radial", count: 16, damage: 5, speed: 540, radius: 3.5, life: 0.8 })]
    }, ["swarmFinalM", "swarmFinalN", "swarmFinalO", "swarmFinalP"], { barrelCount: 16, icon: "radial" }),

    novaVolley: cls("novaVolley", "Nova Volley", 4, "#ff9f6e", "20 bullets exploding outward.", {
      cadence: 0.55,
      salvos: [salvo("spray", { pattern: "radial", count: 20, damage: 4, speed: 520, radius: 3.2, life: 0.75 })]
    }, ["swarmFinalM", "swarmFinalN", "swarmFinalO", "swarmFinalP"], { barrelCount: 20, icon: "radial" }),

    // ORBIT LAYER 4 - from fast/tight/shot/close paths
    stormOrbit: cls("stormOrbit", "Storm Orbit", 4, "#55f0d0", "Orbiting projectiles fire outward constantly.", {
      cadence: 0.35,
      salvos: [
        salvo("orbit", { pattern: "radial", radial: 3, damage: 10, speed: 0, radius: 80, life: 3.0 }),
        salvo("rapid", { pattern: "radial", radial: 3, damage: 8, speed: 580, radius: 3.5, life: 0.9, fireRate: 0.1 })
      ]
    }, ["orbitFinalA", "orbitFinalB", "orbitFinalC", "orbitFinalD"], { barrelCount: 3, icon: "orbit" }),

    bladeOrbit: cls("bladeOrbit", "Blade Orbit", 4, "#61a8ff", "Fast spinning blades around player.", {
      cadence: 0.40,
      salvos: [salvo("orbit", { pattern: "radial", radial: 4, damage: 18, speed: 0, radius: 70, life: 3.0, orbitSpeed: 8 })]
    }, ["orbitFinalA", "orbitFinalB", "orbitFinalC", "orbitFinalD"], { barrelCount: 4, icon: "orbit" }),

    // ORBIT LAYER 4 - from shield paths
    titanShield: cls("titanShield", "Titan Shield", 4, "#f6c75e", "Massive blocking orbiters.", {
      cadence: 0.70,
      salvos: [salvo("orbit", { pattern: "radial", radial: 2, damage: 35, speed: 0, radius: 100, life: 3.0 })]
    }, ["orbitFinalE", "orbitFinalF", "orbitFinalG", "orbitFinalH"], { barrelCount: 2, icon: "orbit" }),

    omegaBarrier: cls("omegaBarrier", "Omega Barrier", 4, "#f5f7fb", "Impenetrable orbiting barriers.", {
      cadence: 0.85,
      salvos: [salvo("orbit", { pattern: "radial", radial: 3, damage: 25, speed: 0, radius: 110, life: 3.0, blocking: true })]
    }, ["orbitFinalE", "orbitFinalF", "orbitFinalG", "orbitFinalH"], { barrelCount: 3, icon: "orbit" }),

    // ORBIT LAYER 4 - from barrage paths
    cannonOrbit: cls("cannonOrbit", "Cannon Orbit", 4, "#55f0d0", "Orbiters fire cannon shots.", {
      cadence: 0.50,
      salvos: [
        salvo("orbit", { pattern: "radial", radial: 3, damage: 12, speed: 0, radius: 90, life: 3.0 }),
        salvo("heavy", { pattern: "radial", radial: 3, damage: 20, speed: 500, radius: 5, life: 1.0, fireRate: 0.2 })
      ]
    }, ["orbitFinalI", "orbitFinalJ", "orbitFinalK", "orbitFinalL"], { barrelCount: 3, icon: "orbit" }),

    rainOrbit: cls("rainOrbit", "Rain Orbit", 4, "#61a8ff", "Constant rain of shots from orbiters.", {
      cadence: 0.30,
      salvos: [
        salvo("orbit", { pattern: "radial", radial: 4, damage: 9, speed: 0, radius: 100, life: 3.0 }),
        salvo("spray", { pattern: "radial", count: 4, damage: 7, speed: 480, radius: 3.5, life: 0.85, fireRate: 0.08 })
      ]
    }, ["orbitFinalI", "orbitFinalJ", "orbitFinalK", "orbitFinalL"], { barrelCount: 4, icon: "orbit" }),

    // ORBIT LAYER 4 - from wide paths
    aegisHalo: cls("aegisHalo", "Aegis Halo", 4, "#7ff59b", "Large protective orbit ring.", {
      cadence: 0.65,
      salvos: [salvo("orbit", { pattern: "radial", radial: 4, damage: 16, speed: 0, radius: 180, life: 3.0 })]
    }, ["orbitFinalM", "orbitFinalN", "orbitFinalO", "orbitFinalP"], { barrelCount: 4, icon: "orbit" }),

    sentinelRing: cls("sentinelRing", "Sentinel Ring", 4, "#55f0d0", "Distant orbiting sentinels.", {
      cadence: 0.60,
      salvos: [salvo("orbit", { pattern: "radial", radial: 5, damage: 14, speed: 0, radius: 220, life: 3.0 })]
    }, ["orbitFinalM", "orbitFinalN", "orbitFinalO", "orbitFinalP"], { barrelCount: 5, icon: "orbit" }),

    // ==================== LAYER 5: FINAL EVOLUTIONS (16 classes) ====================

    // VELOCITY FINALS
    velocityFinalA: cls("velocityFinalA", "Velocity Omega", 5, "#55f0d0", "Ultimate rapid fire stream.", {
      cadence: 0.025,
      salvos: [salvo("rapid", { pattern: "single", damage: 2, speed: 900, radius: 2.2, life: 0.8 })]
    }, [], { barrelCount: 1, icon: "stream" }),

    velocityFinalB: cls("velocityFinalB", "Storm Phantom", 5, "#61a8ff", "Extreme speed with bullet waves.", {
      cadence: 0.08,
      salvos: [salvo("rapid", { pattern: "cone", count: 3, spread: 15, damage: 4, speed: 800, radius: 3, life: 0.9 })]
    }, [], { barrelCount: 3, icon: "fan" }),

    velocityFinalC: cls("velocityFinalC", "Hex Stream", 5, "#9fe8ff", "Six parallel bullet streams.", {
      cadence: 0.15,
      salvos: [salvo("hex", { pattern: "barrels", barrels: [{ side: -15, forward: 35 }, { side: -9, forward: 35 }, { side: -3, forward: 35 }, { side: 3, forward: 35 }, { side: 9, forward: 35 }, { side: 15, forward: 35 }], damage: 5, speed: 700, radius: 3.5, life: 1.0 })]
    }, [], { barrelCount: 6, icon: "hex" }),

    velocityFinalD: cls("velocityFinalD", "Infinity Mirror", 5, "#7ff59b", "Forward and backward streams.", {
      cadence: 0.18,
      salvos: [
        salvo("triple", { pattern: "barrels", barrels: [{ side: -10, forward: 35 }, { side: 0, forward: 35 }, { side: 10, forward: 35 }], damage: 5, speed: 700, radius: 3.8, life: 1.0 }),
        salvo("triple", { pattern: "barrels", barrels: [{ side: -10, forward: 35 }, { side: 0, forward: 35 }, { side: 10, forward: 35 }], damage: 5, speed: 700, radius: 3.8, life: 1.0, angleOffset: 180 })
      ]
    }, [], { barrelCount: 6, icon: "mirror" }),

    velocityFinalE: cls("velocityFinalE", "Bullet Hose", 5, "#55f0d0", "Five parallel rapid streams.", {
      cadence: 0.12,
      salvos: [salvo("penta", { pattern: "barrels", barrels: [{ side: -20, forward: 35 }, { side: -10, forward: 35 }, { side: 0, forward: 35 }, { side: 10, forward: 35 }, { side: 20, forward: 35 }], damage: 4, speed: 750, radius: 3.2, life: 0.9 })]
    }, [], { barrelCount: 5, icon: "penta" }),

    velocityFinalF: cls("velocityFinalF", "Barrage King", 5, "#61a8ff", "Rapid seven-barrel barrage.", {
      cadence: 0.20,
      salvos: [salvo("hepta", { pattern: "barrels", barrels: [{ side: -24, forward: 35 }, { side: -16, forward: 35 }, { side: -8, forward: 35 }, { side: 0, forward: 35 }, { side: 8, forward: 35 }, { side: 16, forward: 35 }, { side: 24, forward: 35 }], damage: 4, speed: 680, radius: 3.2, life: 1.0 })]
    }, [], { barrelCount: 7, icon: "hepta" }),

    velocityFinalG: cls("velocityFinalG", "Pulse Omega", 5, "#9fe8ff", "Maximum pulse intensity.", {
      cadence: 0.30,
      salvos: [salvo("burst", { pattern: "cone", burstCount: 7, burstDelay: 0.05, count: 7, spread: 50, damage: 4, speed: 700, radius: 3, life: 0.85 })]
    }, [], { barrelCount: 7, icon: "fan" }),

    velocityFinalH: cls("velocityFinalH", "Needle Storm", 5, "#7ff59b", "Ultra-fast needle barrage.", {
      cadence: 0.05,
      salvos: [salvo("rapid", { pattern: "single", damage: 3, speed: 1000, radius: 2, life: 0.75 })]
    }, [], { barrelCount: 1, icon: "needle" }),

    // TITAN FINALS (continued)
    titanFinalA: cls("titanFinalA", "Doom Cannon", 5, "#f6c75e", "Massive slow explosions destroy groups.", {
      cadence: 1.6,
      salvos: [salvo("explosive", { pattern: "single", damage: 150, speed: 340, radius: 28, life: 1.8, explodeRadius: 100, knockback: 3 })]
    }, [], { body: "hex", icon: "blast" }),

    titanFinalB: cls("titanFinalB", "Titan Crusher", 5, "#ff9f6e", "Extreme knockback cannon.", {
      cadence: 1.0,
      salvos: [salvo("heavy", { pattern: "single", damage: 85, speed: 420, radius: 20, life: 1.5, knockback: 4.5 })]
    }, [], { body: "hex", icon: "blast" }),

    titanFinalC: cls("titanFinalC", "Siege Master", 5, "#f5f7fb", "Ultimate siege weapon.", {
      cadence: 1.5,
      salvos: [salvo("heavy", { pattern: "single", damage: 180, speed: 320, radius: 26, life: 2.0 })]
    }, [], { body: "hex", icon: "blast" }),

    titanFinalD: cls("titanFinalD", "Iron Titan", 5, "#ff6777", "Maximum damage per shot.", {
      cadence: 1.4,
      salvos: [salvo("heavy", { pattern: "single", damage: 200, speed: 350, radius: 24, life: 1.9 })]
    }, [], { body: "hex", icon: "blast" }),

    titanFinalE: cls("titanFinalE", "Oblivion Rail", 5, "#9fe8ff", "Massive piercing beam.", {
      cadence: 1.2,
      salvos: [salvo("beam", { pattern: "single", damage: 120, speed: 2500, radius: 8, life: 0.25, pierce: 99 })]
    }, [], { icon: "rail" }),

    titanFinalF: cls("titanFinalF", "Devastator", 5, "#55f0d0", "Critical first-hit destroyer.", {
      cadence: 1.0,
      salvos: [salvo("sniper", { pattern: "single", damage: 100, speed: 1300, radius: 6, life: 1.4, pierce: 6 })]
    }, [], { icon: "rail" }),

    titanFinalG: cls("titanFinalG", "Sniper Master", 5, "#61a8ff", "Perfect accuracy sniper.", {
      cadence: 1.1,
      salvos: [salvo("sniper", { pattern: "single", damage: 110, speed: 1500, radius: 5, life: 1.5, pierce: 8 })]
    }, [], { icon: "rail" }),

    titanFinalH: cls("titanFinalH", "Line Destroyer", 5, "#a789ff", "Pierces entire enemy lines.", {
      cadence: 1.05,
      salvos: [salvo("sniper", { pattern: "single", damage: 95, speed: 1400, radius: 5, life: 1.4, pierce: 15 })]
    }, [], { icon: "rail" }),

    titanFinalI: cls("titanFinalI", "Nuke", 5, "#f6c75e", "Explosion dealing 100 damage in huge radius.", {
      cadence: 1.5,
      salvos: [salvo("explosive", { pattern: "single", damage: 100, speed: 380, radius: 22, life: 1.6, explodeRadius: 120 })]
    }, [], { body: "hex", icon: "blast" }),

    titanFinalJ: cls("titanFinalJ", "Chain Reaction", 5, "#ff9f6e", "Kills trigger chain explosions.", {
      cadence: 1.15,
      salvos: [salvo("cluster", { pattern: "single", damage: 45, speed: 390, radius: 18, life: 1.7, miniCount: 10, miniDamage: 18, miniRadius: 50, chainTrigger: true })]
    }, [], { body: "hex", icon: "blast" }),

    titanFinalK: cls("titanFinalK", "Apocalypse", 5, "#f5f7fb", "Fire zones stack and spread.", {
      cadence: 1.25,
      salvos: [salvo("inferno", { pattern: "single", damage: 35, speed: 370, radius: 16, life: 1.6, zoneDuration: 12, zoneDPS: 20, zoneRadius: 75, spreadOnKill: true })]
    }, [], { body: "hex", icon: "radial" }),

    titanFinalL: cls("titanFinalL", "Shock Nova", 5, "#ff6777", "Massive knockback explosion.", {
      cadence: 1.0,
      salvos: [salvo("explosive", { pattern: "single", damage: 80, speed: 440, radius: 20, life: 1.5, explodeRadius: 90, knockback: 3.5 })]
    }, [], { body: "hex", icon: "blast" }),

    // SWARM FINALS
    swarmFinalA: cls("swarmFinalA", "Bullet Galaxy", 5, "#61a8ff", "Multi-directional bullet output.", {
      cadence: 0.25,
      salvos: [
        salvo("spray", { pattern: "radial", count: 10, damage: 5, speed: 580, radius: 3.5, life: 0.9 }),
        salvo("penta", { pattern: "barrels", barrels: [{ side: -20, forward: 35 }, { side: -10, forward: 35 }, { side: 0, forward: 35 }, { side: 10, forward: 35 }, { side: 20, forward: 35 }], damage: 6, speed: 650, radius: 4, life: 1.0 })
      ]
    }, [], { barrelCount: 10, icon: "galaxy" }),

    swarmFinalB: cls("swarmFinalB", "Hex Storm", 5, "#ff9f6e", "Six-barrel rapid fire.", {
      cadence: 0.22,
      salvos: [salvo("hex", { pattern: "barrels", barrels: [{ side: -14, forward: 35 }, { side: -7, forward: 35 }, { side: 0, forward: 35 }, { side: 7, forward: 35 }, { side: 14, forward: 35 }, { side: 0, forward: 38 }], damage: 6, speed: 640, radius: 4, life: 1.0 })]
    }, [], { barrelCount: 6, icon: "hex" }),

    swarmFinalC: cls("swarmFinalC", "Octo Barrage", 5, "#a789ff", "Eight bullets in ring pattern.", {
      cadence: 0.20,
      salvos: [salvo("octo", { pattern: "radial", radial: 8, damage: 5, speed: 620, radius: 3.8, life: 1.0 })]
    }, [], { barrelCount: 8, icon: "octo" }),

    swarmFinalD: cls("swarmFinalD", "Perfect Mirror", 5, "#c9b7ff", "Full forward and backward barrage.", {
      cadence: 0.28,
      salvos: [
        salvo("quad", { pattern: "barrels", barrels: [{ side: -12, forward: 35 }, { side: -4, forward: 35 }, { side: 4, forward: 35 }, { side: 12, forward: 35 }], damage: 6, speed: 640, radius: 4, life: 1.0 }),
        salvo("quad", { pattern: "barrels", barrels: [{ side: -12, forward: 35 }, { side: -4, forward: 35 }, { side: 4, forward: 35 }, { side: 12, forward: 35 }], damage: 6, speed: 640, radius: 4, life: 1.0, angleOffset: 180 })
      ]
    }, [], { barrelCount: 8, icon: "mirror" }),

    swarmFinalE: cls("swarmFinalE", "Blast Cone", 5, "#61a8ff", "11 bullets in 80-degree cone.", {
      cadence: 0.38,
      salvos: [salvo("spread", { pattern: "cone", count: 11, spread: 80, damage: 6, speed: 580, radius: 3.8, life: 0.9 })]
    }, [], { barrelCount: 11, icon: "fan" }),

    swarmFinalF: cls("swarmFinalF", "Tornado Fan", 5, "#ff9f6e", "Rapid cone rotation.", {
      cadence: 0.42,
      salvos: [salvo("spread", { pattern: "cone", count: 9, spread: 70, damage: 6, speed: 600, radius: 3.8, life: 0.95 })]
    }, [], { barrelCount: 9, icon: "fan" }),

    swarmFinalG: cls("swarmFinalG", "Ultra Cone", 5, "#a789ff", "Maximum cone coverage.", {
      cadence: 0.45,
      salvos: [salvo("spread", { pattern: "cone", count: 14, spread: 90, damage: 5, speed: 560, radius: 3.5, life: 0.85 })]
    }, [], { barrelCount: 14, icon: "fan" }),

    swarmFinalH: cls("swarmFinalH", "Focused Storm", 5, "#c9b7ff", "Dense focused cone.", {
      cadence: 0.35,
      salvos: [salvo("spread", { pattern: "cone", count: 10, spread: 20, damage: 9, speed: 620, radius: 4.5, life: 1.0 })]
    }, [], { barrelCount: 10, icon: "fan" }),

    swarmFinalI: cls("swarmFinalI", "Side Annihilator", 5, "#61a8ff", "4x side damage with piercing.", {
      cadence: 0.25,
      salvos: [salvo("side", { pattern: "side", damage: 35, speed: 680, radius: 7, life: 1.0, pierce: 3 })]
    }, [], { barrelCount: 2, icon: "cross" }),

    swarmFinalJ: cls("swarmFinalJ", "Death Grid", 5, "#ff9f6e", "8 directions with orbiting bullets.", {
      cadence: 0.42,
      salvos: [salvo("spray", { pattern: "radial", count: 8, damage: 9, speed: 620, radius: 4.5, life: 1.0 })]
    }, [], { barrelCount: 8, icon: "radial" }),

    swarmFinalK: cls("swarmFinalK", "Crossfire Omega", 5, "#a789ff", "Full grid coverage.", {
      cadence: 0.55,
      salvos: [
        salvo("standard", { pattern: "cross", damage: 10, speed: 640, radius: 4.5, life: 1.0 }),
        salvo("side", { pattern: "single", damage: 10, speed: 640, radius: 4.5, life: 1.0 })
      ]
    }, [], { barrelCount: 5, icon: "cross" }),

    swarmFinalL: cls("swarmFinalL", "Bastion", 5, "#c9b7ff", "Rear fortress with immunity.", {
      cadence: 0.42,
      salvos: [
        salvo("rear", { pattern: "barrels", barrels: [{ side: -12, forward: 35 }, { side: -6, forward: 38 }, { side: 0, forward: 35 }, { side: 6, forward: 38 }, { side: 12, forward: 35 }], damage: 18, speed: 700, radius: 6, life: 1.25, angleOffset: 180 })
      ],
      rearImmunity: true
    }, [], { barrelCount: 5, icon: "rear" }),

    swarmFinalM: cls("swarmFinalM", "Infinite Barrage", 5, "#61a8ff", "Screen-filling bullet output.", {
      cadence: 0.18,
      salvos: [salvo("spray", { pattern: "radial", count: 24, damage: 4, speed: 560, radius: 3.2, life: 0.8 })]
    }, [], { barrelCount: 24, icon: "barrage" }),

    swarmFinalN: cls("swarmFinalN", "Nova Volley", 5, "#ff9f6e", "20 bullets exploding outward.", {
      cadence: 0.55,
      salvos: [salvo("spray", { pattern: "radial", count: 20, damage: 5, speed: 540, radius: 3.5, life: 0.85 })]
    }, [], { barrelCount: 20, icon: "barrage" }),

    swarmFinalO: cls("swarmFinalO", "Ring Master", 5, "#a789ff", "32 bullets in perfect ring.", {
      cadence: 0.50,
      salvos: [salvo("spray", { pattern: "radial", count: 32, damage: 3, speed: 520, radius: 3, life: 0.75 })]
    }, [], { barrelCount: 32, icon: "radial" }),

    swarmFinalP: cls("swarmFinalP", "Circle Storm", 5, "#c9b7ff", "Dense circular waves.", {
      cadence: 0.35,
      salvos: [salvo("spray", { pattern: "radial", count: 28, damage: 4, speed: 550, radius: 3.2, life: 0.8 })]
    }, [], { barrelCount: 28, icon: "radial" }),

    // ORBIT FINALS
    orbitFinalA: cls("orbitFinalA", "Storm Orbit", 5, "#55f0d0", "Orbiting projectiles fire outward constantly.", {
      cadence: 0.35,
      salvos: [
        salvo("orbit", { pattern: "radial", radial: 3, damage: 12, speed: 0, radius: 80, life: 3.0 }),
        salvo("rapid", { pattern: "radial", radial: 3, damage: 10, speed: 600, radius: 4, life: 0.9, fireRate: 0.1 })
      ]
    }, [], { barrelCount: 3, icon: "orbit" }),

    orbitFinalB: cls("orbitFinalB", "Blade Storm", 5, "#61a8ff", "Fast spinning blade orbit.", {
      cadence: 0.40,
      salvos: [salvo("orbit", { pattern: "radial", radial: 4, damage: 22, speed: 0, radius: 70, life: 3.0, orbitSpeed: 10 })]
    }, [], { barrelCount: 4, icon: "orbit" }),

    orbitFinalC: cls("orbitFinalC", "Orbit Cannon", 5, "#9fe8ff", "Orbiters fire cannon shots.", {
      cadence: 0.50,
      salvos: [
        salvo("orbit", { pattern: "radial", radial: 3, damage: 14, speed: 0, radius: 90, life: 3.0 }),
        salvo("heavy", { pattern: "radial", radial: 3, damage: 25, speed: 520, radius: 5.5, life: 1.0, fireRate: 0.2 })
      ]
    }, [], { barrelCount: 3, icon: "orbit" }),

    orbitFinalD: cls("orbitFinalD", "Rapid Orbit", 5, "#7ff59b", "Maximum orbit fire rate.", {
      cadence: 0.25,
      salvos: [
        salvo("orbit", { pattern: "radial", radial: 4, damage: 10, speed: 0, radius: 85, life: 3.0 }),
        salvo("rapid", { pattern: "radial", radial: 4, damage: 8, speed: 620, radius: 3.8, life: 0.9, fireRate: 0.08 })
      ]
    }, [], { barrelCount: 4, icon: "orbit" }),

    orbitFinalE: cls("orbitFinalE", "Titan Shield", 5, "#f6c75e", "Massive blocking orbiters.", {
      cadence: 0.75,
      salvos: [salvo("orbit", { pattern: "radial", radial: 2, damage: 45, speed: 0, radius: 110, life: 3.0 })]
    }, [], { barrelCount: 2, icon: "orbit" }),

    orbitFinalF: cls("orbitFinalF", "Omega Barrier", 5, "#f5f7fb", "Impenetrable orbiting barriers.", {
      cadence: 0.90,
      salvos: [salvo("orbit", { pattern: "radial", radial: 3, damage: 32, speed: 0, radius: 120, life: 3.0, blocking: true })]
    }, [], { barrelCount: 3, icon: "orbit" }),

    orbitFinalG: cls("orbitFinalG", "Aegis Core", 5, "#ff6777", "Heavy orbiters that block major threats.", {
      cadence: 0.85,
      salvos: [salvo("orbit", { pattern: "radial", radial: 2, damage: 55, speed: 0, radius: 100, life: 3.0 })]
    }, [], { barrelCount: 2, icon: "orbit" }),

    orbitFinalH: cls("orbitFinalH", "Reflect Storm", 5, "#a789ff", "Reflecting orbit field.", {
      cadence: 0.70,
      salvos: [salvo("orbit", { pattern: "radial", radial: 4, damage: 18, speed: 0, radius: 95, life: 3.0, reflecting: true, reflectDamage: 2 })]
    }, [], { barrelCount: 4, icon: "orbit" }),

    orbitFinalI: cls("orbitFinalI", "Rain Storm", 5, "#55f0d0", "Constant rain of shots from orbiters.", {
      cadence: 0.28,
      salvos: [
        salvo("orbit", { pattern: "radial", radial: 4, damage: 12, speed: 0, radius: 105, life: 3.0 }),
        salvo("spray", { pattern: "radial", count: 4, damage: 9, speed: 500, radius: 4, life: 0.9, fireRate: 0.06 })
      ]
    }, [], { barrelCount: 4, icon: "orbit" }),

    orbitFinalJ: cls("orbitFinalJ", "Barrage Halo", 5, "#61a8ff", "Orbiters fire heavy barrage.", {
      cadence: 0.45,
      salvos: [
        salvo("orbit", { pattern: "radial", radial: 3, damage: 16, speed: 0, radius: 100, life: 3.0 }),
        salvo("heavy", { pattern: "radial", radial: 3, damage: 28, speed: 540, radius: 6, life: 1.1, fireRate: 0.18 })
      ]
    }, [], { barrelCount: 3, icon: "orbit" }),

    orbitFinalK: cls("orbitFinalK", "Pulse Orbit", 5, "#9fe8ff", "Rhythmic orbit barrage.", {
      cadence: 0.38,
      salvos: [
        salvo("orbit", { pattern: "radial", radial: 4, damage: 13, speed: 0, radius: 95, life: 3.0 }),
        salvo("burst", { pattern: "radial", radial: 4, burstCount: 4, burstDelay: 0.08, damage: 10, speed: 560, radius: 4.5, life: 1.0 })
      ]
    }, [], { barrelCount: 4, icon: "orbit" }),

    orbitFinalL: cls("orbitFinalL", "Bullet Ring", 5, "#7ff59b", "Orbiters fill screen with bullets.", {
      cadence: 0.20,
      salvos: [
        salvo("orbit", { pattern: "radial", radial: 5, damage: 10, speed: 0, radius: 110, life: 3.0 }),
        salvo("spray", { pattern: "radial", count: 5, damage: 7, speed: 480, radius: 3.8, life: 0.85, fireRate: 0.05 })
      ]
    }, [], { barrelCount: 5, icon: "orbit" }),

    orbitFinalM: cls("orbitFinalM", "Aegis Halo", 5, "#7ff59b", "Large protective orbit ring.", {
      cadence: 0.70,
      salvos: [salvo("orbit", { pattern: "radial", radial: 4, damage: 20, speed: 0, radius: 200, life: 3.0 })]
    }, [], { barrelCount: 4, icon: "orbit" }),

    orbitFinalN: cls("orbitFinalN", "Sentinel Omega", 5, "#55f0d0", "Distant orbiting sentinels.", {
      cadence: 0.65,
      salvos: [salvo("orbit", { pattern: "radial", radial: 5, damage: 18, speed: 0, radius: 250, life: 3.0 })]
    }, [], { barrelCount: 5, icon: "orbit" }),

    orbitFinalO: cls("orbitFinalO", "Outer Aegis", 5, "#61a8ff", "Maximum range orbit defense.", {
      cadence: 0.80,
      salvos: [salvo("orbit", { pattern: "radial", radial: 3, damage: 22, speed: 0, radius: 280, life: 3.0, interceptRange: true })]
    }, [], { barrelCount: 3, icon: "orbit" }),

    orbitFinalP: cls("orbitFinalP", "Galaxy Shield", 5, "#9fe8ff", "Wide coverage orbiting shield.", {
      cadence: 0.60,
      salvos: [salvo("orbit", { pattern: "radial", radial: 6, damage: 14, speed: 0, radius: 220, life: 3.0 })]
    }, [], { barrelCount: 6, icon: "orbit" })
  };

  const terminalIds = Object.keys(Classes).filter((id) => Classes[id].tier === 3);

  function hashId(id) {
    return id.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  }

  // Root class IDs that define the three main branches
  const ROOT_CLASSES = ["velocity", "titan", "swarm", "orbit"];

  // Map each class to its root branch for locking
  function getRootBranch(classId) {
    if (ROOT_CLASSES.includes(classId)) return classId;
    // Velocity branch - Layer 2-5 classes
    if (["rapidEngine", "burstDrive", "scatterDrive", "minigun", "acceleration", "pulse",
         "triBurst", "scatterBurst", "stream", "needle",
         "tripleBarrel", "quadBarrel", "tightDouble", "twinLock",
         "pentaStream", "hexStream", "accelStream", "gattling",
         "overclockFeed", "overdriveEngine", "quintFeed", "doubleMirror",
         "megaPulse", "shockStream",
         "velocityFinalA", "velocityFinalB", "velocityFinalC", "velocityFinalD",
         "velocityFinalE", "velocityFinalF", "velocityFinalG", "velocityFinalH"].includes(classId)) return "velocity";
    // Titan branch - Layer 2-5 classes
    if (["heavyFrame", "precisionFrame", "demolitionFrame",
         "siege", "crusher", "impact",
         "piercing", "rail", "longshot",
         "bomb", "cluster", "inferno",
         "megaSiege", "megaCrusher", "criticalImpact", "multiPierce",
         "hyperRail", "extremeLongshot", "megaBomb", "chainCluster", "hellfire",
         "megaCrusher", "siegeCannon", "pierceMaster", "railCannon",
         "titanFinalA", "titanFinalB", "titanFinalC", "titanFinalD",
         "titanFinalE", "titanFinalF", "titanFinalG", "titanFinalH",
         "titanFinalI", "titanFinalJ", "titanFinalK", "titanFinalL"].includes(classId)) return "titan";
    // Swarm branch - Layer 2-5 classes
    if (["dualMatrix", "wideMatrix", "flankMatrix",
         "tripleMatrix", "quadMatrix", "coneMatrix",
         "fanMatrix", "waveMatrix", "sideBarrage", "crossMatrix", "rearGuard",
         "pentaBarrel", "hexBarrel", "megaCone", "ultraCone",
         "heavySide", "gridFire", "burstRing", "novaVolley",
         "swarmFinalA", "swarmFinalB", "swarmFinalC", "swarmFinalD",
         "swarmFinalE", "swarmFinalF", "swarmFinalG", "swarmFinalH",
         "swarmFinalI", "swarmFinalJ", "swarmFinalK", "swarmFinalL",
         "swarmFinalM", "swarmFinalN", "swarmFinalO", "swarmFinalP"].includes(classId)) return "swarm";
    // Orbit branch - Layer 2-5 classes
    if (["fastOrbit", "tightOrbit", "shotOrbit", "closeOrbit",
         "shieldOrbit", "heavyOrbit", "wideOrbit",
         "barrageOrbit", "spreadOrbit", "pulseOrbit",
         "stormOrbit", "bladeOrbit", "titanShield", "omegaBarrier",
         "cannonOrbit", "rainOrbit", "aegisHalo", "sentinelRing",
         "orbitFinalA", "orbitFinalB", "orbitFinalC", "orbitFinalD",
         "orbitFinalE", "orbitFinalF", "orbitFinalG", "orbitFinalH",
         "orbitFinalI", "orbitFinalJ", "orbitFinalK", "orbitFinalL",
         "orbitFinalM", "orbitFinalN", "orbitFinalO", "orbitFinalP"].includes(classId)) return "orbit";
    return null;
  }

  function getChoices(currentId, level) {
    const current = Classes[currentId] || Classes.basic;
    // Layer 0: Show root choices (velocity, titan, swarm, orbit)
    if (current.tier === 0) {
      return ROOT_CLASSES.map((id) => Classes[id]);
    }
    // Layer 1-4: Use defined evolution path - enforce exactly 4 choices
    if (current.evolves && current.evolves.length > 0 && current.tier < 4) {
      return current.evolves.slice(0, 4).map((id) => Classes[id]).filter(Boolean);
    }
    // Layer 5 (terminal): No more choices - exactly 4 finals already set in evolves
    if (current.evolves && current.evolves.length > 0) {
      return current.evolves.slice(0, 4).map((id) => Classes[id]).filter(Boolean);
    }
    return [];
  }

  function cardIcon(def) {
    const color = def.accent;
    const secondary = "#f5f7fb";
    const icon = def.visual.icon;
    const parts = {
      shot: `<circle cx="96" cy="80" r="30" fill="#132333" stroke="${color}" stroke-width="8"/><path d="M96 20 L96 55 M96 105 L96 140" stroke="${secondary}" stroke-width="9" stroke-linecap="round"/><circle cx="154" cy="80" r="13" fill="${color}"/>`,
      dual: `<circle cx="96" cy="80" r="29" fill="#132333" stroke="${color}" stroke-width="8"/><path d="M94 52 L160 34 M94 108 L160 126" stroke="${secondary}" stroke-width="12" stroke-linecap="round"/><circle cx="174" cy="30" r="10" fill="${color}"/><circle cx="174" cy="130" r="10" fill="${color}"/>`,
      triple: `<circle cx="96" cy="80" r="28" fill="#132333" stroke="${color}" stroke-width="8"/><path d="M70 55 L130 55 M70 80 L130 80 M70 105 L130 105" stroke="${secondary}" stroke-width="8" stroke-linecap="round"/>`,
      quad: `<circle cx="96" cy="80" r="28" fill="#132333" stroke="${color}" stroke-width="8"/><rect x="65" y="50" width="20" height="20" fill="${secondary}"/><rect x="107" y="50" width="20" height="20" fill="${secondary}"/><rect x="65" y="92" width="20" height="20" fill="${secondary}"/><rect x="107" y="92" width="20" height="20" fill="${secondary}"/>`,
      penta: `<circle cx="96" cy="80" r="28" fill="#132333" stroke="${color}" stroke-width="8"/><path d="M60 65 L135 65 M60 80 L135 80 M60 95 L135 95" stroke="${secondary}" stroke-width="6" stroke-linecap="round"/><circle cx="148" cy="72" r="5" fill="${color}"/><circle cx="148" cy="88" r="5" fill="${color}"/>`,
      hex: `<circle cx="96" cy="80" r="28" fill="#132333" stroke="${color}" stroke-width="8"/><path d="M96 45 L126 62 L126 98 L96 115 L66 98 L66 62 Z" fill="none" stroke="${secondary}" stroke-width="6"/>`,
      hepta: `<circle cx="96" cy="80" r="28" fill="#132333" stroke="${color}" stroke-width="8"/><path d="M55 65 L140 65 M55 80 L140 80 M55 95 L140 95" stroke="${secondary}" stroke-width="5" stroke-linecap="round"/><circle cx="152" cy="72" r="4" fill="${color}"/><circle cx="152" cy="88" r="4" fill="${color}"/>`,
      octo: `<circle cx="96" cy="80" r="28" fill="#132333" stroke="${color}" stroke-width="8"/><circle cx="96" cy="80" r="22" fill="none" stroke="${secondary}" stroke-width="5" stroke-dasharray="8 4"/>`,
      stream: `<circle cx="74" cy="80" r="25" fill="#132333" stroke="${color}" stroke-width="8"/><path d="M96 80 L178 80" stroke="${secondary}" stroke-width="13" stroke-linecap="round"/><circle cx="132" cy="80" r="6" fill="${color}"/><circle cx="156" cy="80" r="6" fill="${color}"/><circle cx="184" cy="80" r="6" fill="${color}"/>`,
      blast: `<circle cx="82" cy="80" r="30" fill="#132333" stroke="${color}" stroke-width="8"/><path d="M106 80 L155 80" stroke="${secondary}" stroke-width="16" stroke-linecap="round"/><path d="M175 52 L195 80 L175 108 L145 98 L145 62 Z" fill="${color}" opacity="0.9"/>`,
      fan: `<circle cx="76" cy="80" r="27" fill="#132333" stroke="${color}" stroke-width="8"/><path d="M99 80 L176 32 M99 80 L190 80 M99 80 L176 128" stroke="${secondary}" stroke-width="9" stroke-linecap="round"/><circle cx="190" cy="80" r="9" fill="${color}"/>`,
      cross: `<circle cx="96" cy="80" r="29" fill="#132333" stroke="${color}" stroke-width="8"/><path d="M96 25 L96 135 M41 80 L151 80" stroke="${secondary}" stroke-width="10" stroke-linecap="round"/><circle cx="174" cy="80" r="12" fill="${color}"/>`,
      rear: `<circle cx="96" cy="80" r="28" fill="#132333" stroke="${color}" stroke-width="8"/><path d="M50 80 L80 65 M50 80 L80 95 M140 80 L110 65 M140 80 L110 95" stroke="${secondary}" stroke-width="7" stroke-linecap="round"/>`,
      mirror: `<circle cx="96" cy="80" r="28" fill="#132333" stroke="${color}" stroke-width="8"/><path d="M70 60 L125 60 M70 100 L125 100" stroke="${secondary}" stroke-width="8" stroke-linecap="round"/>`,
      wave: `<circle cx="96" cy="80" r="28" fill="#132333" stroke="${color}" stroke-width="8"/><path d="M60 80 Q75 50 90 80 T120 80 T150 80" fill="none" stroke="${secondary}" stroke-width="6" stroke-linecap="round"/>`,
      missile: `<circle cx="76" cy="80" r="26" fill="#132333" stroke="${color}" stroke-width="8"/><path d="M107 58 L182 80 L107 102 L124 80 Z" fill="${secondary}"/><path d="M116 66 L98 50 M116 94 L98 110" stroke="${color}" stroke-width="7" stroke-linecap="round"/>`,
      radial: `<circle cx="96" cy="80" r="27" fill="#132333" stroke="${color}" stroke-width="8"/><circle cx="96" cy="80" r="50" fill="none" stroke="${secondary}" stroke-width="7" opacity="0.8"/><circle cx="96" cy="80" r="72" fill="none" stroke="${color}" stroke-width="5" opacity="0.8"/>`,
      needle: `<circle cx="66" cy="80" r="24" fill="#132333" stroke="${color}" stroke-width="8"/><path d="M95 80 L190 57 M95 80 L190 80 M95 80 L190 103" stroke="${secondary}" stroke-width="5" stroke-linecap="round"/><path d="M181 57 L197 57 M181 80 L202 80 M181 103 L197 103" stroke="${color}" stroke-width="5" stroke-linecap="round"/>`,
      rail: `<circle cx="66" cy="80" r="25" fill="#132333" stroke="${color}" stroke-width="8"/><path d="M92 80 L196 80" stroke="${secondary}" stroke-width="8" stroke-linecap="round"/><path d="M114 56 L144 104 M154 56 L184 104" stroke="${color}" stroke-width="6" stroke-linecap="round"/>`,
      orbit: `<circle cx="96" cy="80" r="25" fill="#132333" stroke="${color}" stroke-width="8"/><ellipse cx="96" cy="80" rx="76" ry="38" fill="none" stroke="${secondary}" stroke-width="7"/><circle cx="161" cy="54" r="12" fill="${color}"/><circle cx="36" cy="95" r="10" fill="${color}"/>`,
      galaxy: `<circle cx="96" cy="80" r="28" fill="#132333" stroke="${color}" stroke-width="8"/><circle cx="96" cy="80" r="35" fill="none" stroke="${secondary}" stroke-width="4" stroke-dasharray="6 4"/><circle cx="96" cy="80" r="20" fill="${color}" opacity="0.5"/>`,
      barrage: `<circle cx="96" cy="80" r="28" fill="#132333" stroke="${color}" stroke-width="8"/><path d="M65 60 L75 70 M115 60 L125 70 M65 100 L75 90 M115 100 L125 90" stroke="${secondary}" stroke-width="5" stroke-linecap="round"/>`
    };
    return `<svg viewBox="0 0 240 160" aria-hidden="true"><rect x="8" y="8" width="224" height="144" fill="rgba(255,255,255,0.04)" stroke="${color}" stroke-width="2"/><g>${parts[icon] || parts.shot}</g></svg>`;
  }

  Arena.Classes = {
    all: Classes,
    get: (id) => Classes[id] || Classes.basic,
    getChoices,
    cardIcon
  };
})(window.Arena = window.Arena || {});
