import { COIN } from "../config.js"
import { EntityGroup } from "../core/entity-group.js"
import { viewport as defaultViewport } from "../core/viewport.js"
import { Coin } from "../entities/coin.js"
import { GAME_STATE } from "../game/game.js"
import { GUEST_PLAYER_ID, GUEST_SMOOTHING_RATE } from "./config.js"
import { EntityMirror } from "./entity-mirror.js"
import { MESSAGE_TYPE, createMessage } from "./protocol.js"
import { createRemoteHazard, createRemotePowerUp } from "./remote-entities.js"
import { blendFactor, moveToward, toPixelBox, toPixels } from "./snapshot.js"

const sameDirection = (a, b) => a?.x === b?.x && a?.y === b?.y

/**
 * Game system for the online guest, whose game runs with `simulate: false`.
 * It sends the local player's direction whenever it changes and mirrors the
 * latest snapshot received from the host onto balloons, scores, coins,
 * hazards and power-ups.
 */
export class GuestSyncSystem {
    #send
    #viewport
    #localPlayerId
    #snapshot = null
    #lastDirection = null
    /** One `{ key, group, mirror }` per entity list of the snapshot. */
    #lists = []
    /** Groups created here; coins live in the game's own group, which the game renders. */
    #ownGroups = []

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
        const hazards = new EntityGroup(game.playfield)
        const powerUps = new EntityGroup(game.playfield)
        this.#ownGroups = [hazards, powerUps]
        this.#lists = [
            this.#mirrorList("coins", game.coins, () => this.#createCoin()),
            this.#mirrorList("hazards", hazards, ({ kind, ...state }) => createRemoteHazard(kind, this.#boxOf(state))),
            this.#mirrorList("powerUps", powerUps, ({ kind, ...state }) => createRemotePowerUp(kind, this.#boxOf(state))),
        ]
    }

    teardown() {
        this.#reset()
    }

    update(deltaSeconds, game) {
        this.#sendInput(game)
        if (!this.#snapshot) return
        const factor = blendFactor(deltaSeconds, GUEST_SMOOTHING_RATE)
        this.#applyPlayers(game, factor)
        for (const { key, group, mirror } of this.#lists) {
            mirror.apply(this.#snapshot[key], this.#viewport, factor)
            group.prune()
        }
        if (game.state === GAME_STATE.RUNNING) for (const group of this.#ownGroups) group.render()
    }

    #reset() {
        this.#snapshot = null
        this.#lastDirection = null
        for (const { mirror } of this.#lists) mirror.clear()
        for (const group of this.#ownGroups) group.clear()
        this.#lists = []
        this.#ownGroups = []
    }

    #mirrorList(key, group, create) {
        return { key, group, mirror: new EntityMirror((state) => group.add(create(state))) }
    }

    #boxOf(state) {
        return toPixelBox(state, this.#viewport)
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

    #createCoin() {
        return new Coin({ size: this.#viewport.height * COIN.sizeRatio, speed: 0 })
    }
}
