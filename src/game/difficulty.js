/**
 * Tuning presets. Multipliers scale the base values in config.js so balance
 * changes stay in one place.
 */
export const DIFFICULTIES = Object.freeze({
    easy: Object.freeze({ id: "easy", speedMultiplier: 0.8, spawnMultiplier: 0.7, lives: 5 }),
    normal: Object.freeze({ id: "normal", speedMultiplier: 1, spawnMultiplier: 1, lives: 3 }),
    hard: Object.freeze({ id: "hard", speedMultiplier: 1.3, spawnMultiplier: 1.4, lives: 2 }),
})

export const DEFAULT_DIFFICULTY = "normal"

export function getDifficulty(id) {
    return DIFFICULTIES[id] ?? DIFFICULTIES[DEFAULT_DIFFICULTY]
}
