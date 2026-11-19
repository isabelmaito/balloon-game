import { PersistedState } from "./persisted-state.js"
import { EMPTY_STATS, addCoins, applyMatchRecords, countFinishedMatch, normalizeStats } from "./stats.js"

const STORAGE_KEY = "progress.stats"

/** Lifetime statistics: coin wallet, matches played and personal records. */
export class ProgressStore {
    #state

    constructor({ storage }) {
        this.#state = new PersistedState({
            storage,
            key: STORAGE_KEY,
            initial: EMPTY_STATS,
            normalize: normalizeStats,
        })
    }

    get stats() {
        return this.#state.value
    }

    addCoins(amount) {
        this.#state.update((stats) => addCoins(stats, amount))
    }

    recordMatchProgress(match) {
        this.#state.update((stats) => applyMatchRecords(stats, match))
    }

    recordFinishedMatch(match) {
        this.#state.update((stats) => countFinishedMatch(stats, match))
    }

    reset() {
        this.#state.reset()
    }

    onChange(listener) {
        return this.#state.onChange(listener)
    }
}
