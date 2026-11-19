import { after, afterEach, before, beforeEach, describe, it, mock } from "node:test"
import assert from "node:assert/strict"
import { POWER_UP } from "../src/config.js"
import { EventBus } from "../src/core/event-bus.js"
import { TimedEffects } from "../src/game/effects.js"
import { GAME_STATE } from "../src/game/game.js"
import { PowerUpSystem } from "../src/game/systems/power-up-system.js"
import { createFakeElement, installFakeDocument } from "./helpers/fake-dom.js"

const VIEWPORT = { width: 1000, height: 500 }
/** Big enough to cover the whole viewport even after the balloon hitbox shrinks. */
const WHOLE_SCREEN = { x: -VIEWPORT.width, y: -VIEWPORT.height, width: VIEWPORT.width * 3, height: VIEWPORT.height * 3 }
const FAR_AWAY = { x: -500, y: -500, width: 10, height: 10 }
/** With Math.random() === 0 the first kind is picked. */
const FIRST_KIND = "shield"

function fakePlayer(id, bounds = FAR_AWAY) {
    return { id, isOut: false, balloon: { bounds }, effects: new TimedEffects() }
}

function createSystem(overrides = {}) {
    const events = new EventBus()
    const emitted = []
    for (const name of ["power-up:collected", "effects:changed"]) {
        events.on(name, (payload) => emitted.push({ name, ...payload }))
    }
    const game = {
        playfield: createFakeElement(),
        players: [fakePlayer(1)],
        coins: { items: [] },
        state: GAME_STATE.RUNNING,
        isSimulating: true,
        spawnMultiplier: 1,
        speedMultiplier: 1,
        ...overrides,
    }
    const system = new PowerUpSystem({ events })
    system.setup(game)
    return { system, game, emitted }
}

/** Reaches the first spawn in two steps so the new bubble barely moves. */
function spawnFirst(system, game) {
    system.update(POWER_UP.minSpawnInterval - 0.5, game)
    system.update(0.5, game)
}

describe("PowerUpSystem", () => {
    let restoreDocument

    before(() => {
        restoreDocument = installFakeDocument(VIEWPORT)
    })

    after(() => {
        restoreDocument()
    })

    beforeEach(() => {
        mock.method(Math, "random", () => 0)
    })

    afterEach(() => {
        mock.restoreAll()
    })

    it("spawns a bubble at the right edge after the minimum interval", () => {
        const { system, game } = createSystem({ speedMultiplier: 2 })
        system.update(POWER_UP.minSpawnInterval - 0.5, game)
        assert.equal(system.entities.length, 0)
        system.update(0.5, game)
        const [powerUp] = system.entities
        assert.equal(powerUp.kind, FIRST_KIND)
        assert.equal(powerUp.speed, VIEWPORT.height * POWER_UP.speedRatio * 2)
        assert.equal(powerUp.x, VIEWPORT.width - powerUp.speed * 0.5)
        assert.deepEqual(game.playfield.children, [powerUp.element])
    })

    it("grants the effect and announces the pickup", () => {
        const player = fakePlayer(1, WHOLE_SCREEN)
        const { system, game, emitted } = createSystem({ players: [player] })
        spawnFirst(system, game)
        assert.ok(player.effects.isActive(FIRST_KIND))
        assert.deepEqual(emitted.map(({ name }) => name), ["power-up:collected", "effects:changed"])
        assert.equal(emitted[0].player, player)
        assert.equal(emitted[0].kind, FIRST_KIND)
    })

    it("removes the bubble once it is picked up", () => {
        const { system, game } = createSystem({ players: [fakePlayer(1, WHOLE_SCREEN)] })
        spawnFirst(system, game)
        assert.equal(system.entities.length, 0)
        assert.deepEqual(game.playfield.children, [])
    })

    it("gives a bubble to one player only when both touch it", () => {
        const players = [fakePlayer(1, WHOLE_SCREEN), fakePlayer(2, WHOLE_SCREEN)]
        const { system, game, emitted } = createSystem({ players })
        spawnFirst(system, game)
        const collected = emitted.filter(({ name }) => name === "power-up:collected")
        assert.deepEqual(collected.map(({ player }) => player.id), [1])
        assert.equal(players[1].effects.isActive(FIRST_KIND), false)
    })

    it("leaves bubbles alone when no balloon touches them", () => {
        const { system, game, emitted } = createSystem()
        spawnFirst(system, game)
        assert.equal(system.entities.length, 1)
        assert.equal(emitted.length, 0)
    })

    it("neither spawns nor grants while the game is not simulating", () => {
        const player = fakePlayer(1, WHOLE_SCREEN)
        const { system, game, emitted } = createSystem({ players: [player], isSimulating: false })
        system.update(POWER_UP.maxSpawnInterval * 4, game)
        assert.equal(system.entities.length, 0)
        assert.equal(emitted.length, 0)
        assert.deepEqual(player.effects.active, [])
    })
})
