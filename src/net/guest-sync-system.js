import { COIN } from "../config.js"
import { viewport as defaultViewport } from "../core/viewport.js"
import { Coin } from "../entities/coin.js"
import { GUEST_PLAYER_ID, GUEST_SMOOTHING_RATE } from "./config.js"
import { EntityMirror } from "./entity-mirror.js"
import { MESSAGE_TYPE, createMessage } from "./protocol.js"
import { blendFactor, moveToward, toPixels } from "./snapshot.js"

const sameDirection = (a, b) => a?.x === b?.x && a?.y === b?.y

/**
 * Game system for the online guest, whose game runs with `simulate: false`.
 * It sends the local player's direction whenever it changes and mirrors the
 * latest snapshot received from the host onto balloons, scores and coins.
 */
export class GuestSyncSystem {
    #send
    #viewport
    #localPlayerId
    #snapshot = null
    #lastDirection = null
    #coins = null

    constructor({ send, localPlayerId = GUEST_PLAYER_ID, viewport = defaultViewport }) {
        this.#send = send
        this.#localPlayerId = localPlayerId
        this.#viewport = viewport
    }

    /** Stores the host's latest state; it is applied on the next frame. */
    receive(snapshot) {
        this.#snapshot = snapshot
    }

    setup(game) {
        this.#reset()
        this.#coins = new EntityMirror(() => this.#spawnCoin(game))
    }

    teardown() {
        this.#reset()
    }

    update(deltaSeconds, game) {
        this.#sendInput(game)
        if (!this.#snapshot) return
        const factor = blendFactor(deltaSeconds, GUEST_SMOOTHING_RATE)
        this.#applyPlayers(game, factor)
        this.#coins.apply(this.#snapshot.coins, this.#viewport, factor)
        game.coins.prune()
    }

    #reset() {
        this.#snapshot = null
        this.#lastDirection = null
        this.#coins?.clear()
    }

    #sendInput(game) {
        const player = game.players.find(({ id }) => id === this.#localPlayerId)
        if (!player) return
        const direction = player.controls.direction
        if (sameDirection(direction, this.#lastDirection)) return
        this.#lastDirection = direction
        this.#send(createMessage(MESSAGE_TYPE.INPUT, { direction }))
    }

    #applyPlayers(game, factor) {
        for (const state of this.#snapshot.players) {
            const player = game.players.find(({ id }) => id === state.id)
            if (!player) continue
            moveToward(player.balloon, toPixels(state, this.#viewport), factor)
            if (player.score === state.score) continue
            player.score = state.score
            game.events.emit("score:changed", { player, score: player.score })
        }
    }

    #spawnCoin(game) {
        return game.coins.add(new Coin({ size: this.#viewport.height * COIN.sizeRatio, speed: 0 }))
    }
}
