/**
 * Lifetime statistics and the pure reducers that update them. The best score
 * is not kept here: the high score table, which only records finished
 * matches, is its single source.
 * A match summary looks like
 * `{ score, coins, durationSeconds, flawlessSeconds, level, difficulty, players, brokeRecord }`.
 */
export const EMPTY_STATS = Object.freeze({
    wallet: 0,
    matchesPlayed: 0,
    bestMatchCoins: 0,
    longestMatchSeconds: 0,
    longestFlawlessSeconds: 0,
    bestLevel: 0,
    hardMatches: 0,
    multiplayerMatches: 0,
    recordsBroken: 0,
})

const HARD_DIFFICULTY = "hard"
const MULTIPLAYER_MIN_PLAYERS = 2

/** Keeps known numeric fields only, so stale or corrupted data cannot leak in. */
export function normalizeStats(stored) {
    const stats = { ...EMPTY_STATS }
    for (const key of Object.keys(EMPTY_STATS)) {
        const value = stored?.[key]
        if (Number.isFinite(value) && value >= 0) stats[key] = value
    }
    return stats
}

export function addCoins(stats, amount) {
    return { ...stats, wallet: stats.wallet + amount }
}

/** Raises the "best of" records; safe to call repeatedly while a match runs. */
export function applyMatchRecords(stats, match) {
    return {
        ...stats,
        bestMatchCoins: Math.max(stats.bestMatchCoins, match.coins ?? 0),
        longestMatchSeconds: Math.max(stats.longestMatchSeconds, match.durationSeconds ?? 0),
        longestFlawlessSeconds: Math.max(stats.longestFlawlessSeconds, match.flawlessSeconds ?? 0),
        bestLevel: Math.max(stats.bestLevel, match.level ?? 0),
    }
}

/** Counts a finished match; call once per match. */
export function countFinishedMatch(stats, match) {
    const withRecords = applyMatchRecords(stats, match)
    return {
        ...withRecords,
        matchesPlayed: stats.matchesPlayed + 1,
        hardMatches: stats.hardMatches + Number(match.difficulty === HARD_DIFFICULTY),
        multiplayerMatches: stats.multiplayerMatches + Number(match.players >= MULTIPLAYER_MIN_PLAYERS),
        recordsBroken: stats.recordsBroken + Number(Boolean(match.brokeRecord)),
    }
}
