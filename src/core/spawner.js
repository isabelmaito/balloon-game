import { randomBetween } from "../utils/math.js"

/**
 * Calls `spawn` at a random interval between `minInterval` and `maxInterval` seconds.
 * Driven by the game loop so it pauses together with the game.
 */
export class Spawner {
    #timeLeft

    constructor({ spawn, minInterval, maxInterval, random = randomBetween }) {
        this.spawn = spawn
        this.minInterval = minInterval
        this.maxInterval = maxInterval
        this.random = random
        this.#timeLeft = this.#nextInterval()
    }

    update(deltaSeconds) {
        this.#timeLeft -= deltaSeconds
        while (this.#timeLeft <= 0) {
            this.spawn()
            this.#timeLeft += this.#nextInterval()
        }
    }

    #nextInterval() {
        return this.random(this.minInterval, this.maxInterval)
    }
}
