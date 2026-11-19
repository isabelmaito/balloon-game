/**
 * Level (phase) definitions. A level starts once the match has travelled
 * `startsAt` meters; its multipliers stack on top of the difficulty preset.
 * `sky` names the background theme. The last level never ends.
 */
export const LEVELS = Object.freeze([
    Object.freeze({ id: "day", sky: "day", startsAt: 0, speedMultiplier: 1, spawnMultiplier: 1 }),
    Object.freeze({ id: "sunset", sky: "sunset", startsAt: 500, speedMultiplier: 1.1, spawnMultiplier: 1.15 }),
    Object.freeze({ id: "night", sky: "night", startsAt: 1200, speedMultiplier: 1.2, spawnMultiplier: 1.3 }),
    Object.freeze({ id: "storm", sky: "storm", startsAt: 2000, speedMultiplier: 1.35, spawnMultiplier: 1.45 }),
])

/** Index of the level reached after travelling `distance` meters. */
export function levelIndexAt(distance, levels = LEVELS) {
    let index = 0
    for (let next = 1; next < levels.length && levels[next].startsAt <= distance; next++) index = next
    return index
}

/** Translation key holding the display name of a level. */
export function levelNameKey(level) {
    return `level.name.${level.id}`
}
