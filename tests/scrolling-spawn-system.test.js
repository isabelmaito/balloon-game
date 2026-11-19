import { afterEach, beforeEach, describe, it, mock } from "node:test"
import assert from "node:assert/strict"
import { GAME_STATE } from "../src/game/game.js"
import { ScrollingSpawnSystem } from "../src/game/systems/scrolling-spawn-system.js"
import { createFakeElement } from "./helpers/fake-dom.js"

const INTERVAL = 2

/** Square entity double that stays where it is put. */
function fakeEntity({ x = 0, y = 0, size = 10 } = {}) {
    return {
        element: createFakeElement(),
        x,
        y,
        width: size,
        height: size,
        isAlive: true,
        renders: 0,
        get bounds() {
            return { x: this.x, y: this.y, width: this.width, height: this.height }
        },
        get isOffscreen() {
            return this.x + this.width < 0
        },
        update() {},
        render() {
            this.renders++
        },
        destroy() {
            this.isAlive = false
            this.element.remove()
        },
    }
}

/** Records touches; spawns entities from `nextEntity` and scales time by `game.rate`. */
class TestSystem extends ScrollingSpawnSystem {
    touches = []
    nextEntity = () => fakeEntity({ x: 500 })

    constructor() {
        super({ minInterval: INTERVAL, maxInterval: INTERVAL * 2 })
    }

    spawnRate(game) {
        return game.rate
    }

    createEntity() {
        return this.nextEntity()
    }

    onTouch(player, entity) {
        this.touches.push({ player, entity })
    }
}

function fakePlayer(id, bounds = { x: 0, y: 0, width: 10, height: 10 }) {
    return { id, isOut: false, balloon: { bounds } }
}

function createSystem(overrides = {}) {
    const game = {
        playfield: createFakeElement(),
        players: [fakePlayer(1)],
        state: GAME_STATE.RUNNING,
        isSimulating: true,
        rate: 1,
        ...overrides,
    }
    const system = new TestSystem()
    system.setup(game)
    return { system, game }
}

describe("ScrollingSpawnSystem", () => {
    beforeEach(() => {
        mock.method(Math, "random", () => 0)
    })

    afterEach(() => {
        mock.restoreAll()
    })

    it("spawns entities into the playfield once the interval elapses", () => {
        const { system, game } = createSystem()
        system.update(INTERVAL / 2, game)
        assert.equal(system.entities.length, 0)
        system.update(INTERVAL / 2, game)
        assert.equal(system.entities.length, 1)
        assert.deepEqual(game.playfield.children, [system.entities[0].element])
    })

    it("scales elapsed time by the spawn rate", () => {
        const { system, game } = createSystem({ rate: 2 })
        system.update(INTERVAL / 2, game)
        assert.equal(system.entities.length, 1)
    })

    it("does nothing while the game is not simulating", () => {
        const { system, game } = createSystem({ isSimulating: false })
        system.nextEntity = () => fakeEntity({ x: 0, y: 0 })
        system.update(INTERVAL * 10, game)
        assert.equal(system.entities.length, 0)
        assert.equal(system.touches.length, 0)
    })

    it("touches balloons that overlap an entity, skipping players who are out", () => {
        const out = { ...fakePlayer(2), isOut: true }
        const { system, game } = createSystem({ players: [fakePlayer(1), out] })
        system.nextEntity = () => fakeEntity({ x: 0, y: 0 })
        system.update(INTERVAL, game)
        assert.deepEqual(system.touches.map(({ player }) => player.id), [1])
    })

    it("ignores entities that do not overlap any balloon", () => {
        const { system, game } = createSystem()
        system.update(INTERVAL, game)
        assert.equal(system.entities.length, 1)
        assert.equal(system.touches.length, 0)
    })

    it("renders entities only while the game is running", () => {
        const { system, game } = createSystem({ state: GAME_STATE.PAUSED })
        system.update(INTERVAL, game)
        assert.equal(system.entities[0].renders, 0)
        game.state = GAME_STATE.RUNNING
        system.update(0, game)
        assert.equal(system.entities[0].renders, 1)
    })

    it("teardown removes every entity", () => {
        const { system, game } = createSystem()
        system.update(INTERVAL * 2, game)
        system.teardown()
        assert.equal(system.entities.length, 0)
        assert.deepEqual(game.playfield.children, [])
    })
})
