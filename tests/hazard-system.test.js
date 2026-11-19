import { after, afterEach, before, beforeEach, describe, it, mock } from "node:test"
import assert from "node:assert/strict"
import { HAZARD, HAZARDS } from "../src/config.js"
import { EventBus } from "../src/core/event-bus.js"
import { GAME_STATE } from "../src/game/game.js"
import { HazardSystem } from "../src/game/systems/hazard-system.js"
import { createFakeElement, installFakeDocument } from "./helpers/fake-dom.js"

const VIEWPORT = { width: 1000, height: 500 }
/** Big enough to cover the whole viewport even after the balloon hitbox shrinks. */
const WHOLE_SCREEN = { x: -VIEWPORT.width, y: -VIEWPORT.height, width: VIEWPORT.width * 3, height: VIEWPORT.height * 3 }
const FAR_AWAY = { x: -500, y: -500, width: 10, height: 10 }

function fakePlayer(id, bounds = FAR_AWAY) {
    return { id, isOut: false, balloon: { bounds } }
}

function createSystem(overrides = {}) {
    const events = new EventBus()
    const hits = []
    events.on("hazard:hit", (payload) => hits.push(payload))
    const game = {
        playfield: createFakeElement(),
        players: [fakePlayer(1)],
        state: GAME_STATE.RUNNING,
        isSimulating: true,
        spawnMultiplier: 1,
        speedMultiplier: 1,
        ...overrides,
    }
    const system = new HazardSystem({ events })
    system.setup(game)
    return { system, game, hits }
}

describe("HazardSystem", () => {
    let restoreDocument

    before(() => {
        restoreDocument = installFakeDocument(VIEWPORT)
    })

    after(() => {
        restoreDocument()
    })

    beforeEach(() => {
        // Shortest interval, first hazard kind (storm cloud), top of the screen.
        mock.method(Math, "random", () => 0)
    })

    afterEach(() => {
        mock.restoreAll()
    })

    it("spawns a hazard after the minimum interval at normal rate", () => {
        const { system, game } = createSystem()
        system.update(HAZARD.minSpawnInterval / 2, game)
        assert.equal(system.entities.length, 0)
        system.update(HAZARD.minSpawnInterval / 2, game)
        assert.equal(system.entities.length, 1)
        assert.deepEqual(game.playfield.children, [system.entities[0].element])
    })

    it("spawns faster with a higher spawn multiplier", () => {
        const { system, game } = createSystem({ spawnMultiplier: 2 })
        system.update(HAZARD.minSpawnInterval / 2, game)
        assert.equal(system.entities.length, 1)
    })

    it("spawns slower with a lower spawn multiplier", () => {
        const { system, game } = createSystem({ spawnMultiplier: 0.5 })
        system.update(HAZARD.minSpawnInterval, game)
        assert.equal(system.entities.length, 0)
        system.update(HAZARD.minSpawnInterval, game)
        assert.equal(system.entities.length, 1)
    })

    it("scales hazard speed by the game speed multiplier", () => {
        const { system, game } = createSystem({ speedMultiplier: 1.5 })
        system.update(HAZARD.minSpawnInterval, game)
        const expected = VIEWPORT.height * HAZARDS.stormCloud.speedRatio * 1.5
        assert.equal(system.entities[0].speed, expected)
    })

    it("hits each overlapping player once per pass", () => {
        const players = [fakePlayer(1, WHOLE_SCREEN), fakePlayer(2, WHOLE_SCREEN)]
        const { system, game, hits } = createSystem({ players })
        system.update(HAZARD.minSpawnInterval, game)
        for (let frame = 0; frame < 5; frame++) system.update(0.1, game)
        assert.equal(system.entities.length, 1)
        assert.deepEqual(hits.map(({ player }) => player.id), [1, 2])
        assert.ok(hits.every(({ hazard }) => hazard === system.entities[0]))
    })

    it("does not hit players far from the hazard", () => {
        const { system, game, hits } = createSystem()
        system.update(HAZARD.minSpawnInterval, game)
        assert.equal(system.entities.length, 1)
        assert.equal(hits.length, 0)
    })

    it("neither spawns nor hits while the game is not simulating", () => {
        const players = [fakePlayer(1, WHOLE_SCREEN)]
        const { system, game, hits } = createSystem({ players, isSimulating: false })
        system.update(HAZARD.maxSpawnInterval * 4, game)
        assert.equal(system.entities.length, 0)
        assert.equal(hits.length, 0)
    })
})
