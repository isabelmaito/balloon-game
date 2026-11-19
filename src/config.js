/** Sizes and speeds are fractions of the viewport height (per second for speeds). */
export const BALLOON = {
    sizeRatio: 0.2,
    speedRatio: 0.5,
    startXRatio: 0.1,
    startYRatio: 0.4,
    playerOffsetRatio: 0.25,
}

export const COIN = {
    sizeRatio: 0.1,
    speedRatio: 0.35,
    minSpawnInterval: 0.8,
    maxSpawnInterval: 2,
}

/** Portion of the balloon box that counts for collisions. */
export const HITBOX_RATIO = 0.7

/** Obstacles that cost a life on contact. Kinds share spawn timing. */
export const HAZARD = {
    minSpawnInterval: 2.5,
    maxSpawnInterval: 5,
    hitboxRatio: 0.75,
}

export const HAZARDS = {
    stormCloud: {
        sizeRatio: 0.22,
        speedRatio: 0.28,
    },
    bird: {
        sizeRatio: 0.12,
        speedRatio: 0.55,
        bobAmplitudeRatio: 0.06,
        bobFrequency: 1.2,
    },
}

/** Seconds of protection after taking a hit or losing a shield. */
export const LIVES = {
    invulnerabilitySeconds: 1.5,
    shieldGraceSeconds: 0.75,
}

export const POWER_UP = {
    sizeRatio: 0.09,
    speedRatio: 0.3,
    minSpawnInterval: 8,
    maxSpawnInterval: 14,
}

/** Per power-up tuning. An infinite duration lasts until the effect is used. */
export const POWER_UPS = {
    shield: {
        durationSeconds: Infinity,
    },
    magnet: {
        durationSeconds: 8,
        radiusRatio: 0.35,
        pullSpeedRatio: 1.2,
    },
    doubleCoins: {
        durationSeconds: 10,
        multiplier: 2,
    },
}
