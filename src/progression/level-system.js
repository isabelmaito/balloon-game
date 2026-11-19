import { NEUTRAL_MODIFIERS } from "../game/game.js"
import { LEVELS, levelIndexAt } from "./levels.js"
import { Odometer } from "./odometer.js"

/**
 * Game system that measures the distance travelled and moves the match through
 * the levels. On every level change it updates `game.levelModifiers` and emits
 * `level:changed` with `{ level, number, isFirst }`.
 */
export class LevelSystem {
    #index = -1

    constructor({ events, levels = LEVELS, odometer = new Odometer() }) {
        this.events = events
        this.levels = levels
        this.odometer = odometer
    }

    get distance() {
        return this.odometer.meters
    }

    get level() {
        return this.levels[this.#index]
    }

    setup(game) {
        this.odometer.reset()
        this.#enter(0, game)
    }

    update(deltaSeconds, game) {
        this.odometer.advance(deltaSeconds, game.speedMultiplier)
        const index = levelIndexAt(this.distance, this.levels)
        if (index !== this.#index) this.#enter(index, game)
    }

    teardown(game) {
        game.levelModifiers = NEUTRAL_MODIFIERS
        this.#index = -1
    }

    #enter(index, game) {
        this.#index = index
        const { speedMultiplier, spawnMultiplier } = this.level
        game.levelModifiers = { speedMultiplier, spawnMultiplier }
        this.events.emit("level:changed", { level: this.level, number: index + 1, isFirst: index === 0 })
    }
}
