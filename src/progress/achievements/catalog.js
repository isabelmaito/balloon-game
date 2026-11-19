const SECONDS_PER_MINUTE = 60

/**
 * Builds a catalog entry. `measure(stats)` reads how far the player got;
 * the achievement unlocks once it reaches `goal`.
 */
const achievement = (id, goal, measure) => Object.freeze({
    id,
    goal,
    measure,
    nameKey: `achievement.${id}.name`,
    descriptionKey: `achievement.${id}.description`,
})

/** Every achievement, evaluated against the lifetime stats from `stats.js`. */
export const ACHIEVEMENTS = Object.freeze([
    achievement("first-coin", 1, (stats) => stats.wallet),
    achievement("coin-rush", 50, (stats) => stats.bestMatchCoins),
    achievement("treasure-hoard", 500, (stats) => stats.wallet),
    achievement("regular", 10, (stats) => stats.matchesPlayed),
    achievement("survivor", 2 * SECONDS_PER_MINUTE, (stats) => stats.longestMatchSeconds),
    achievement("record-breaker", 1, (stats) => stats.recordsBroken),
    achievement("daredevil", 1, (stats) => stats.hardMatches),
    achievement("teamwork", 1, (stats) => stats.multiplayerMatches),
    achievement("untouchable", SECONDS_PER_MINUTE, (stats) => stats.longestFlawlessSeconds),
    achievement("climber", 5, (stats) => stats.bestLevel),
])
