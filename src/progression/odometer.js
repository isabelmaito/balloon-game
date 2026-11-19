import { METERS_PER_SECOND } from "./config.js"

/** Accumulates the distance travelled during a match, scaled by the current speed. */
export class Odometer {
    #meters = 0

    constructor({ metersPerSecond = METERS_PER_SECOND } = {}) {
        this.metersPerSecond = metersPerSecond
    }

    get meters() {
        return this.#meters
    }

    advance(deltaSeconds, speedMultiplier = 1) {
        this.#meters += deltaSeconds * this.metersPerSecond * speedMultiplier
    }

    /** Jumps to a distance measured elsewhere, such as the online host's. */
    moveTo(meters) {
        this.#meters = meters
    }

    reset() {
        this.moveTo(0)
    }
}
