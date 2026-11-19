import { PersistedState } from "./persisted-state.js"

const STORAGE_KEY = "progress.highScores"
export const HIGH_SCORE_LIMIT = 5
/** Rank reported for a score that did not make the table. */
export const NOT_RANKED = 0

const isEntry = (entry) => Number.isFinite(entry?.score)
    && Number.isFinite(entry?.date)
    && typeof entry?.difficulty === "string"

/**
 * Inserts `entry` into a descending table. Ties keep the older entry first.
 * Returns the new table and the 1-based rank, or `NOT_RANKED`.
 */
export function insertScore(entries, entry, limit = HIGH_SCORE_LIMIT) {
    const position = entries.findIndex(({ score }) => entry.score > score)
    const index = position === -1 ? entries.length : position
    const table = [...entries.slice(0, index), entry, ...entries.slice(index)].slice(0, limit)
    return { entries: table, rank: index < limit ? index + 1 : NOT_RANKED }
}

export function bestScoreOf(entries) {
    return entries[0]?.score ?? 0
}

/** Top local scores with the date and difficulty they were made on. */
export class HighScores {
    #state

    constructor({ storage, limit = HIGH_SCORE_LIMIT }) {
        this.limit = limit
        this.#state = new PersistedState({
            storage,
            key: STORAGE_KEY,
            initial: [],
            normalize: (stored) => (Array.isArray(stored) ? stored.filter(isEntry).slice(0, limit) : []),
        })
    }

    get entries() {
        return this.#state.value
    }

    get best() {
        return bestScoreOf(this.entries)
    }

    /** Adds a `{ score, date, difficulty }` entry and tells whether it beat the best score. */
    submit(entry) {
        const previousBest = this.best
        const { entries, rank } = insertScore(this.entries, entry, this.limit)
        if (rank !== NOT_RANKED) this.#state.set(entries)
        return { rank, previousBest, isRecord: entry.score > previousBest }
    }

    reset() {
        this.#state.reset()
    }

    onChange(listener) {
        return this.#state.onChange(listener)
    }
}
