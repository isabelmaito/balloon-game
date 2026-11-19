import { BALLOON, COIN, HITBOX_RATIO } from "../config.js"
import { EntityGroup } from "../core/entity-group.js"
import { GameLoop } from "../core/game-loop.js"
import { Spawner } from "../core/spawner.js"
import { viewport } from "../core/viewport.js"
import { Balloon } from "../entities/balloon.js"
import { Coin } from "../entities/coin.js"
import { DEFAULT_BINDINGS } from "../input/bindings.js"
import { Controls } from "../input/controls.js"
import { intersects, shrink } from "../utils/collision.js"
import { randomBetween } from "../utils/math.js"
import { DEFAULT_DIFFICULTY, getDifficulty } from "./difficulty.js"
import { Player } from "./player.js"

export const GAME_STATE = Object.freeze({
    IDLE: "idle",
    RUNNING: "running",
    PAUSED: "paused",
    OVER: "over",
})

export class Game {
    constructor({ playfield, keyboard, events }) {
        this.playfield = playfield
        this.keyboard = keyboard
        this.events = events
        this.loop = new GameLoop((deltaSeconds) => this.update(deltaSeconds))
        this.coins = new EntityGroup(playfield)
        this.coinSpawner = new Spawner({
            spawn: () => this.spawnCoin(),
            minInterval: COIN.minSpawnInterval,
            maxInterval: COIN.maxSpawnInterval,
        })
        this.players = []
        this.difficulty = getDifficulty(DEFAULT_DIFFICULTY)
        this.state = GAME_STATE.IDLE
        this.systems = []
        this.handleResize = this.handleResize.bind(this)
        window.addEventListener("resize", this.handleResize)
    }

    /**
     * Plugs a gameplay system into the match lifecycle. A system may implement
     * `setup(game)`, `update(deltaSeconds, game)` and `teardown(game)`.
     */
    addSystem(system) {
        this.systems.push(system)
        return this
    }

    /** Clears the field and prepares a fresh match. */
    setup({
        players: playerSetups = [{ id: 1, bindings: DEFAULT_BINDINGS.arrows }],
        difficulty = DEFAULT_DIFFICULTY,
    } = {}) {
        this.loop.stop()
        this.difficulty = getDifficulty(difficulty)
        for (const system of this.systems) system.teardown?.(this)
        this.coins.clear()
        for (const { balloon } of this.players) balloon.destroy()
        this.players = playerSetups.map((setup, index) => this.createPlayer({ ...setup, index }))
        this.handleResize()
        for (const { balloon } of this.players) balloon.render()
        for (const system of this.systems) system.setup?.(this)
        this.#setState(GAME_STATE.IDLE)
        this.events.emit("game:setup", { players: this.players })
    }

    start() {
        this.handleResize()
        this.#setState(GAME_STATE.RUNNING)
        this.loop.start()
    }

    pause() {
        if (this.state !== GAME_STATE.RUNNING) return
        this.loop.stop()
        this.#setState(GAME_STATE.PAUSED)
    }

    resume() {
        if (this.state !== GAME_STATE.PAUSED) return
        this.#setState(GAME_STATE.RUNNING)
        this.loop.start()
    }

    togglePause() {
        if (this.state === GAME_STATE.RUNNING) this.pause()
        else this.resume()
    }

    end() {
        if (this.state === GAME_STATE.OVER) return
        this.loop.stop()
        this.#setState(GAME_STATE.OVER)
        this.events.emit("game:over", { players: this.players })
    }

    #setState(state) {
        this.state = state
        this.events.emit("game:state", state)
    }

    createPlayer({ id, bindings, index = 0 }) {
        const balloon = new Balloon({
            x: viewport.width * BALLOON.startXRatio,
            y: viewport.height * (BALLOON.startYRatio + index * BALLOON.playerOffsetRatio),
            size: viewport.height * BALLOON.sizeRatio,
            speed: viewport.height * BALLOON.speedRatio,
        })
        this.playfield.appendChild(balloon.element)
        return new Player({ id, balloon, controls: new Controls(this.keyboard, bindings) })
    }

    /** Keeps balloons proportional to the viewport, which may be 0 before first layout. */
    handleResize() {
        const size = viewport.height * BALLOON.sizeRatio
        for (const { balloon } of this.players) {
            balloon.resize(size, size)
            balloon.speed = viewport.height * BALLOON.speedRatio
        }
    }

    spawnCoin() {
        const size = viewport.height * COIN.sizeRatio
        this.coins.add(new Coin({
            x: viewport.width,
            y: randomBetween(0, viewport.height - size),
            size,
            speed: viewport.height * COIN.speedRatio * this.difficulty.speedMultiplier,
        }))
    }

    update(deltaSeconds) {
        for (const player of this.players) player.update(deltaSeconds, viewport)

        this.coinSpawner.update(deltaSeconds * this.difficulty.spawnMultiplier)
        this.coins.update(deltaSeconds)
        for (const player of this.players) this.collectTouchedCoins(player)
        for (const system of this.systems) system.update?.(deltaSeconds, this)
        if (this.state !== GAME_STATE.RUNNING) return

        for (const { balloon } of this.players) balloon.render()
        this.coins.render()
    }

    collectTouchedCoins(player) {
        const balloonHitbox = shrink(player.balloon.bounds, HITBOX_RATIO)
        for (const coin of this.coins.items) {
            if (coin.isAlive && intersects(balloonHitbox, coin.bounds)) {
                coin.destroy()
                player.addScore(coin.value)
                this.events.emit("coin:collected", { player, coin })
                this.events.emit("score:changed", { player, score: player.score })
            }
        }
        this.coins.prune()
    }
}
