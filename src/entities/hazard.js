import { ScrollingEntity } from "./scrolling-entity.js"

/** Scrolling obstacle. Remembers who it already hit so one pass costs one life at most. */
export class Hazard extends ScrollingEntity {
    #hitPlayers = new Set()

    constructor({ className, ...options }) {
        super({ ...options, className: `hazard ${className}` })
    }

    /** Returns true the first time this hazard touches the given player. */
    registerHit(player) {
        if (this.#hitPlayers.has(player)) return false
        this.#hitPlayers.add(player)
        return true
    }
}
