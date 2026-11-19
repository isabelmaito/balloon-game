import { LIVES } from "../../config.js"
import { applyHit, HIT_RESULT } from "../damage.js"
import { emitEffectsChanged } from "./effects-system.js"

/**
 * Announces a player's new life count with `lives:changed` and, once none
 * are left, clears its effects and emits `player:out`. Shared with the online
 * guest, which receives lives from the host instead of losing them itself.
 */
export function announceLives(events, player) {
    events.emit("lives:changed", { player, lives: player.lives })
    if (!player.isOut) return
    player.effects.clear()
    events.emit("player:out", { player })
}

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
        if (result === HIT_RESULT.DAMAGED) announceLives(this.events, player)
        emitEffectsChanged(this.events, player)
        if (this.#game?.players.every((each) => each.isOut)) this.#game.end()
    }
}
