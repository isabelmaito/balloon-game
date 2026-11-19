import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { Spawner } from "../src/core/spawner.js"

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
})
