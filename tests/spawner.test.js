import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { Spawner } from "../src/core/spawner.js"

/** Random double that hands out the given intervals in order, then repeats the last one. */
function sequence(...values) {
    const calls = []
    const random = (min, max) => {
        calls.push([min, max])
        return values.length > 1 ? values.shift() : values[0]
    }
    return { random, calls }
}

describe("Spawner", () => {
    it("spawns once per elapsed interval", () => {
        let count = 0
        const spawner = new Spawner({
            spawn: () => count++,
            minInterval: 1,
            maxInterval: 1,
            random: (min) => min,
        })
        spawner.update(0.5)
        assert.equal(count, 0)
        spawner.update(2.6)
        assert.equal(count, 3)
    })

    it("restarts the countdown on reset", () => {
        let count = 0
        const spawner = new Spawner({
            spawn: () => count++,
            minInterval: 1,
            maxInterval: 1,
            random: (min) => min,
        })
        spawner.update(0.9)
        spawner.reset()
        spawner.update(0.9)
        assert.equal(count, 0)
    })

    it("spawns for every varying interval that fits in one update", () => {
        let count = 0
        const { random } = sequence(1, 0.5, 2, 3)
        const spawner = new Spawner({ spawn: () => count++, minInterval: 0.5, maxInterval: 3, random })
        spawner.update(3.5)
        assert.equal(count, 3)
        spawner.update(2.75)
        assert.equal(count, 3)
        spawner.update(0.25)
        assert.equal(count, 4)
    })

    it("carries leftover time into the next interval", () => {
        let count = 0
        const { random } = sequence(1, 2)
        const spawner = new Spawner({ spawn: () => count++, minInterval: 1, maxInterval: 2, random })
        spawner.update(1.5)
        assert.equal(count, 1)
        spawner.update(1.25)
        assert.equal(count, 1)
        spawner.update(0.25)
        assert.equal(count, 2)
    })

    it("draws each interval between the configured bounds", () => {
        const { random, calls } = sequence(1)
        const spawner = new Spawner({ spawn: () => {}, minInterval: 1, maxInterval: 4, random })
        spawner.update(3)
        assert.equal(calls.length, 4)
        assert.ok(calls.every(([min, max]) => min === 1 && max === 4))
    })
})
