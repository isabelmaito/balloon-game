import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { EventBus } from "../src/core/event-bus.js"
import { NEUTRAL_MODIFIERS } from "../src/game/game.js"
import { LevelSystem } from "../src/progression/level-system.js"
import { Odometer } from "../src/progression/odometer.js"

const LEVELS = [
    { id: "first", startsAt: 0, speedMultiplier: 1, spawnMultiplier: 1 },
    { id: "second", startsAt: 10, speedMultiplier: 2, spawnMultiplier: 3 },
]

function createSystem() {
    const events = new EventBus()
    const changes = []
    events.on("level:changed", (change) => changes.push(change))
    const system = new LevelSystem({ events, levels: LEVELS, odometer: new Odometer({ metersPerSecond: 1 }) })
    const game = { speedMultiplier: 1, levelModifiers: NEUTRAL_MODIFIERS, isSimulating: true }
    return { system, game, changes }
}

describe("LevelSystem", () => {
    it("announces the first level on setup", () => {
        const { system, game, changes } = createSystem()
        system.setup(game)
        assert.deepEqual(changes, [{ level: LEVELS[0], number: 1, isFirst: true }])
    })

    it("advances when enough distance is travelled", () => {
        const { system, game, changes } = createSystem()
        system.setup(game)
        system.update(9, game)
        assert.equal(changes.length, 1)
        system.update(1, game)
        assert.equal(system.level, LEVELS[1])
        assert.deepEqual(changes.at(-1), { level: LEVELS[1], number: 2, isFirst: false })
    })

    it("applies the level multipliers to the game", () => {
        const { system, game } = createSystem()
        system.setup(game)
        system.update(10, game)
        assert.deepEqual(game.levelModifiers, { speedMultiplier: 2, spawnMultiplier: 3 })
    })

    it("measures distance using the game speed", () => {
        const { system, game } = createSystem()
        system.setup(game)
        game.speedMultiplier = 2
        system.update(3, game)
        assert.equal(system.distance, 6)
    })

    it("does not measure distance when the game only mirrors a host", () => {
        const { system, game, changes } = createSystem()
        game.isSimulating = false
        system.setup(game)
        system.update(20, game)
        assert.equal(system.distance, 0)
        assert.equal(changes.length, 1)
    })

    it("follows a distance synced from the host", () => {
        const { system, game, changes } = createSystem()
        game.isSimulating = false
        system.setup(game)
        system.syncDistance(12, game)
        assert.equal(system.distance, 12)
        assert.deepEqual(changes.at(-1), { level: LEVELS[1], number: 2, isFirst: false })
        assert.deepEqual(game.levelModifiers, { speedMultiplier: 2, spawnMultiplier: 3 })
    })

    it("does not announce the same level twice when synced", () => {
        const { system, game, changes } = createSystem()
        system.setup(game)
        system.syncDistance(4, game)
        system.syncDistance(6, game)
        assert.equal(changes.length, 1)
    })

    it("starts over on a new match", () => {
        const { system, game } = createSystem()
        system.setup(game)
        system.update(20, game)
        system.teardown(game)
        assert.equal(game.levelModifiers, NEUTRAL_MODIFIERS)
        system.setup(game)
        assert.equal(system.distance, 0)
        assert.equal(system.level, LEVELS[0])
    })
})
