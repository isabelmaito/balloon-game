import { PersistedState } from "../persisted-state.js"

const STORAGE_KEY = "progress.achievements"

const normalizeUnlocked = (stored) => Object.fromEntries(
    Object.entries(stored ?? {}).filter(([, date]) => Number.isFinite(date)),
)

/** Persisted record of unlocked achievements, as `{ [id]: unlockTimestamp }`. */
export class AchievementLedger {
    #state

    constructor({ storage }) {
        this.#state = new PersistedState({ storage, key: STORAGE_KEY, initial: {}, normalize: normalizeUnlocked })
    }

    isUnlocked(id) {
        return id in this.#state.value
    }

    unlockedAt(id) {
        return this.#state.value[id] ?? null
    }

    get count() {
        return Object.keys(this.#state.value).length
    }

    unlock(ids, date) {
        if (ids.length === 0) return
        this.#state.update((unlocked) => ({ ...unlocked, ...Object.fromEntries(ids.map((id) => [id, date])) }))
    }

    reset() {
        this.#state.reset()
    }

    onChange(listener) {
        return this.#state.onChange(listener)
    }
}
