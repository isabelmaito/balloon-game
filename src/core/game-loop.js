const MAX_DELTA_SECONDS = 0.1

/**
 * Fixed-callback loop driven by requestAnimationFrame.
 * Delta time is clamped so a background tab does not teleport entities.
 */
export class GameLoop {
    #update
    #frameId = null
    #lastTimestamp = null

    constructor(update) {
        this.#update = update
        this.tick = this.tick.bind(this)
    }

    get isRunning() {
        return this.#frameId !== null
    }

    start() {
        if (this.isRunning) return
        this.#lastTimestamp = null
        this.#frameId = requestAnimationFrame(this.tick)
    }

    stop() {
        if (!this.isRunning) return
        cancelAnimationFrame(this.#frameId)
        this.#frameId = null
    }

    tick(timestamp) {
        const elapsedMs = this.#lastTimestamp === null ? 0 : timestamp - this.#lastTimestamp
        this.#lastTimestamp = timestamp
        const deltaSeconds = Math.min(elapsedMs / 1000, MAX_DELTA_SECONDS)
        this.#update(deltaSeconds)
        this.#frameId = requestAnimationFrame(this.tick)
    }
}
