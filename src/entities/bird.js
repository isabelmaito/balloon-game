import { Hazard } from "./hazard.js"

const FULL_TURN = Math.PI * 2

/** Fast bird that bobs up and down around the height it spawned at. */
export class Bird extends Hazard {
    #baseY
    #elapsed = 0

    constructor({ x, y, size, speed, bobAmplitude, bobFrequency }) {
        super({ x, y, width: size, height: size, speed, className: "bird" })
        this.#baseY = y
        this.bobAmplitude = bobAmplitude
        this.bobFrequency = bobFrequency
    }

    update(deltaSeconds) {
        super.update(deltaSeconds)
        this.#elapsed += deltaSeconds
        this.y = this.#baseY + Math.sin(this.#elapsed * this.bobFrequency * FULL_TURN) * this.bobAmplitude
    }
}
