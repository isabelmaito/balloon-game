import { ScrollingEntity } from "./scrolling-entity.js"

/** Names of the hazard kinds; they match the keys of `HAZARDS` in the config. */
export const HAZARD_KIND = Object.freeze({
    STORM_CLOUD: "stormCloud",
    BIRD: "bird",
})

/** Scrolling obstacle. Remembers who it already hit so one pass costs one life at most. */
export class Hazard extends ScrollingEntity {
    #hitPlayers = new Set()

    constructor({ kind, className, ...options }) {
        super({ ...options, className: `hazard ${className}` })
        this.kind = kind
    }

    /** Returns true the first time this hazard touches the given player. */
    registerHit(player) {
        if (this.#hitPlayers.has(player)) return false
        this.#hitPlayers.add(player)
        return true
    }
}
