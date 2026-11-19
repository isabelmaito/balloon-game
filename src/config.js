/** Sizes and speeds are fractions of the viewport height (per second for speeds). */
export const BALLOON = {
    sizeRatio: 0.2,
    speedRatio: 0.5,
    startXRatio: 0.1,
    startYRatio: 0.4,
}

export const COIN = {
    sizeRatio: 0.1,
    speedRatio: 0.35,
    minSpawnInterval: 0.8,
    maxSpawnInterval: 2,
}

/** Portion of the balloon box that counts for collisions. */
export const HITBOX_RATIO = 0.7
