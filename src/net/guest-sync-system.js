import { COIN } from "../config.js"
import { viewport as defaultViewport } from "../core/viewport.js"
import { Coin } from "../entities/coin.js"
import { GUEST_PLAYER_ID, GUEST_SMOOTHING_RATE } from "./config.js"
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
    #coins = new Map()

    constructor({ send, localPlayerId = GUEST_PLAYER_ID, viewport = defaultViewport }) {
        this.#send = send
        this.#localPlayerId = localPlayerId
        this.#viewport = viewport
    }

    /** Stores the host's latest state; it is applied on the next frame. */
    receive(snapshot) {
        this.#snapshot = snapshot
    }

    setup() {
        this.#reset()
    }

    teardown() {
        this.#reset()
    }

    update(deltaSeconds, game) {
        this.#sendInput(game)
        if (!this.#snapshot) return
        const factor = blendFactor(deltaSeconds, GUEST_SMOOTHING_RATE)
        this.#applyPlayers(game, factor)
        this.#applyCoins(game, factor)
    }

    #reset() {
        this.#snapshot = null
        this.#lastDirection = null
        this.#coins.clear()
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

    /** New coins appear right at their position; known ones glide to it. */
    #applyCoins(game, factor) {
        const visibleIds = new Set()
        for (const state of this.#snapshot.coins) {
            visibleIds.add(state.id)
            const target = toPixels(state, this.#viewport)
            const coin = this.#coins.get(state.id)
            if (coin) moveToward(coin, target, factor)
            else Object.assign(this.#spawnCoin(state.id, game), target)
        }
        for (const [id, coin] of this.#coins) {
            if (visibleIds.has(id)) continue
            coin.destroy()
            this.#coins.delete(id)
        }
        game.coins.prune()
    }

    #spawnCoin(id, game) {
        const coin = game.coins.add(new Coin({ size: this.#viewport.height * COIN.sizeRatio, speed: 0 }))
        this.#coins.set(id, coin)
        return coin
    }
}
