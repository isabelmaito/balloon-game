/**
 * Named countdowns for temporary player effects (shield, magnet, ...).
 * Pure: time only moves through `update`, so it pauses with the game loop.
 * An infinite duration keeps the effect until it is consumed or cleared.
 */
export class TimedEffects {
    #remaining = new Map()

    /** Starts an effect, or refreshes it when the new duration is longer. */
    activate(name, durationSeconds) {
        const current = this.#remaining.get(name) ?? 0
        this.#remaining.set(name, Math.max(current, durationSeconds))
    }

    isActive(name) {
        return this.#remaining.has(name)
    }

    remaining(name) {
        return this.#remaining.get(name) ?? 0
    }

    /** Ends an effect early; returns whether it was active. */
    consume(name) {
        return this.#remaining.delete(name)
    }

    /** Advances every countdown and returns the names that just expired. */
    update(deltaSeconds) {
        const expired = []
        for (const [name, timeLeft] of this.#remaining) {
            const next = timeLeft - deltaSeconds
            if (next > 0) {
                this.#remaining.set(name, next)
            } else {
                this.#remaining.delete(name)
                expired.push(name)
            }
        }
        return expired
    }

    clear() {
        this.#remaining.clear()
    }

    get active() {
        return [...this.#remaining].map(([name, remaining]) => ({ name, remaining }))
    }
}
