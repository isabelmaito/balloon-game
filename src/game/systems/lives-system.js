import { LIVES } from "../../config.js"
import { applyHit, HIT_RESULT } from "../damage.js"
import { emitEffectsChanged } from "./effects-system.js"

/**
 * Turns `hazard:hit` into lost lives and ends the match once every player is out.
 * Emits `player:hit`, `lives:changed` and `player:out`.
 */
export class LivesSystem {
    #game = null

    constructor({ events }) {
        this.events = events
        events.on("hazard:hit", ({ player }) => this.hit(player))
    }

    setup(game) {
        this.#game = game
    }

    hit(player) {
        if (this.#game?.isSimulating === false) return
        const result = applyHit(player, LIVES)
        if (result === HIT_RESULT.IGNORED) return
        this.events.emit("player:hit", { player, result })
        if (result === HIT_RESULT.DAMAGED) {
            this.events.emit("lives:changed", { player, lives: player.lives })
        }
        if (player.isOut) this.#knockOut(player)
        emitEffectsChanged(this.events, player)
        if (this.#game?.players.every((each) => each.isOut)) this.#game.end()
    }

    #knockOut(player) {
        player.effects.clear()
        this.events.emit("player:out", { player })
    }
}
