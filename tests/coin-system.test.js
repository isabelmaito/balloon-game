import { after, afterEach, before, beforeEach, describe, it, mock } from "node:test"
import assert from "node:assert/strict"
import { COIN } from "../src/config.js"
import { EntityGroup } from "../src/core/entity-group.js"
import { EventBus } from "../src/core/event-bus.js"
import { GAME_STATE } from "../src/game/game.js"
import { Player } from "../src/game/player.js"
import { CoinSystem } from "../src/game/systems/coin-system.js"
import { createFakeElement, installFakeDocument } from "./helpers/fake-dom.js"

const VIEWPORT = { width: 1000, height: 500 }
const WHOLE_SCREEN = { x: -VIEWPORT.width, y: -VIEWPORT.height, width: VIEWPORT.width * 3, height: VIEWPORT.height * 3 }
const FAR_AWAY = { x: -500, y: -500, width: 10, height: 10 }

function playerAt(id, bounds) {
    return new Player({ id, balloon: { bounds }, controls: null, lives: 3 })
}

function createSystem(overrides = {}) {
    const events = new EventBus()
    const emitted = []
    for (const name of ["coin:collected", "score:changed"]) {
        events.on(name, (payload) => emitted.push({ name, ...payload }))
    }
    const playfield = createFakeElement()
    const game = {
        playfield,
        coins: new EntityGroup(playfield),
        players: [playerAt(1, FAR_AWAY)],
        state: GAME_STATE.RUNNING,
        isSimulating: true,
        spawnMultiplier: 1,
        speedMultiplier: 1,
        ...overrides,
    }
    const system = new CoinSystem({ events })
    system.setup(game)
    return { system, game, emitted }
}

describe("CoinSystem", () => {
    let restoreDocument

    before(() => {
        restoreDocument = installFakeDocument(VIEWPORT)
    })

    after(() => restoreDocument())

    beforeEach(() => {
        mock.method(Math, "random", () => 0)
    })

    afterEach(() => {
        mock.restoreAll()
    })

    it("spawns coins into the game's coin group at the right edge", () => {
        const { system, game } = createSystem()
        system.update(COIN.minSpawnInterval, game)
        const [coin] = game.coins.items
        assert.ok(coin)
        assert.equal(coin.width, VIEWPORT.height * COIN.sizeRatio)
        assert.equal(coin.speed, VIEWPORT.height * COIN.speedRatio)
    })

    it("follows the level speed and spawn multipliers", () => {
        const { system, game } = createSystem({ spawnMultiplier: 2, speedMultiplier: 1.5 })
        system.update(COIN.minSpawnInterval / 2, game)
        assert.equal(game.coins.items[0].speed, VIEWPORT.height * COIN.speedRatio * 1.5)
    })

    it("pays the touched coin to the player and announces it", () => {
        const player = playerAt(1, WHOLE_SCREEN)
        const { system, game, emitted } = createSystem({ players: [player] })
        system.update(COIN.minSpawnInterval, game)
        assert.equal(player.score, 1)
        assert.deepEqual(game.coins.items, [])
        assert.deepEqual(emitted.map(({ name }) => name), ["coin:collected", "score:changed"])
        assert.equal(emitted[1].score, 1)
    })

    it("does not spawn or collect on an online guest", () => {
        const player = playerAt(1, WHOLE_SCREEN)
        const { system, game } = createSystem({ players: [player], isSimulating: false })
        system.update(COIN.maxSpawnInterval * 3, game)
        assert.deepEqual(game.coins.items, [])
        assert.equal(player.score, 0)
    })

    it("leaves the coin group to the game on teardown", () => {
        const { system, game } = createSystem()
        system.update(COIN.minSpawnInterval, game)
        system.teardown(game)
        assert.equal(game.coins.items.length, 1)
    })
})
