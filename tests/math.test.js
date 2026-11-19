import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { clamp, normalize, pickRandom } from "../src/utils/math.js"

describe("clamp", () => {
    it("limits values to the range", () => {
        assert.equal(clamp(-5, 0, 10), 0)
        assert.equal(clamp(15, 0, 10), 10)
        assert.equal(clamp(5, 0, 10), 5)
    })
})

describe("normalize", () => {
    it("returns a unit vector", () => {
        const { x, y } = normalize({ x: 1, y: 1 })
        assert.ok(Math.abs(Math.hypot(x, y) - 1) < 1e-9)
    })

    it("keeps the zero vector", () => {
        assert.deepEqual(normalize({ x: 0, y: 0 }), { x: 0, y: 0 })
    })
})

describe("pickRandom", () => {
    it("maps the random number onto the list", () => {
        const items = ["a", "b", "c"]
        assert.equal(pickRandom(items, () => 0), "a")
        assert.equal(pickRandom(items, () => 0.5), "b")
        assert.equal(pickRandom(items, () => 0.999), "c")
    })
})
