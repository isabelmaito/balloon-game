import { COIN, LIVES, POWER_UPS } from "../config.js"
import { EntityGroup } from "../core/entity-group.js"
import { viewport as defaultViewport } from "../core/viewport.js"
import { Coin } from "../entities/coin.js"
import { GAME_STATE } from "../game/game.js"
import { emitEffectsChanged } from "../game/systems/effects-system.js"
import { announceLives } from "../game/systems/lives-system.js"
import { GUEST_PLAYER_ID, GUEST_SMOOTHING_RATE } from "./config.js"
import { EntityMirror } from "./entity-mirror.js"
import { MESSAGE_TYPE, createMessage } from "./protocol.js"
import { createRemoteHazard, createRemotePowerUp } from "./remote-entities.js"
import { blendFactor, moveToward, toPixelBox, toPixels } from "./snapshot.js"

const sameDirection = (a, b) => a?.x === b?.x && a?.y === b?.y

/**
 * Snapshots carry effect names only, so a mirrored effect starts its local
 * timer at the full configured duration (the HUD bar then drains as usual);
 * the host's next snapshots remove it if it ends earlier.
 */
const mirroredDurationSeconds = (name) => POWER_UPS[name]?.durationSeconds ?? LIVES.invulnerabilitySeconds

/**
 * Game system for the online guest, whose game runs with `simulate: false`.
 * It sends the local player's direction whenever it changes and mirrors the
 * latest snapshot received from the host onto balloons, scores, coins,
 * hazards and power-ups. Lives, effects and the distance (through `levels`,
 * a `LevelSystem`) change once per snapshot and raise the same events as the
 * local survival and level systems, so the HUD needs no online special case.
 */
export class GuestSyncSystem {
    #send
    #viewport
    #localPlayerId
    #levels
    #snapshot = null
    /** True until the latest snapshot's lives, effects and distance are applied. */
    #isFresh = false
    #lastDirection = null
    /** One `{ key, group, mirror }` per entity list of the snapshot. */
    #lists = []
    /** Groups created here; coins live in the game's own group, which the game renders. */
    #ownGroups = []

    constructor({ send, levels, localPlayerId = GUEST_PLAYER_ID, viewport = defaultViewport }) {
        this.#send = send
        this.#levels = levels
        this.#localPlayerId = localPlayerId
        this.#viewport = viewport
    }

    /** Stores the host's latest state; it is applied on the next frame. */
    receive(snapshot) {
        this.#snapshot = snapshot
        this.#isFresh = true
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
        if (this.#isFresh) this.#applyStatus(game)
        for (const { key, group, mirror } of this.#lists) {
            mirror.apply(this.#snapshot[key], this.#viewport, factor)
            group.prune()
        }
        if (game.state === GAME_STATE.RUNNING) for (const group of this.#ownGroups) group.render()
    }

    #reset() {
        this.#snapshot = null
        this.#isFresh = false
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

    #applyStatus(game) {
        this.#isFresh = false
        for (const state of this.#snapshot.players) {
            const player = game.players.find(({ id }) => id === state.id)
            if (!player) continue
            this.#applyLives(game, player, state.lives)
            this.#applyEffects(game, player, state.effects)
        }
        this.#levels.syncDistance(this.#snapshot.distance, game)
    }

    #applyLives(game, player, lives) {
        if (player.lives === lives) return
        player.lives = lives
        announceLives(game.events, player)
    }

    #applyEffects(game, player, names) {
        const { effects } = player
        const ended = effects.active.map(({ name }) => name).filter((name) => !names.includes(name))
        const started = names.filter((name) => !effects.isActive(name))
        if (ended.length === 0 && started.length === 0) return
        for (const name of ended) effects.consume(name)
        for (const name of started) effects.activate(name, mirroredDurationSeconds(name))
        emitEffectsChanged(game.events, player)
    }

    #createCoin() {
        return new Coin({ size: this.#viewport.height * COIN.sizeRatio, speed: 0 })
    }
}
