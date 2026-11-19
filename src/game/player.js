import { POWER_UPS } from "../config.js"
import { EFFECT } from "./effect-names.js"
import { TimedEffects } from "./effects.js"

/** A participant in the match: a balloon, the input steering it, its score and lives. */
export class Player {
    constructor({ id, balloon, controls, lives = 1 }) {
        this.id = id
        this.balloon = balloon
        this.controls = controls
        this.score = 0
        this.lives = lives
        this.effects = new TimedEffects()
    }

    /** Points earned per coin value, raised while double coins is active. */
    get coinMultiplier() {
        return this.effects.isActive(EFFECT.DOUBLE_COINS) ? POWER_UPS.doubleCoins.multiplier : 1
    }

    get isOut() {
        return this.lives <= 0
    }

    update(deltaSeconds, bounds) {
        if (this.isOut) return
        this.balloon.steer(this.controls.direction)
        this.balloon.update(deltaSeconds)
        this.balloon.keepInside(bounds)
    }

    addScore(points) {
        this.score += points
    }

    loseLife() {
        this.lives = Math.max(0, this.lives - 1)
    }
}
