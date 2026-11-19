import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { attract, centerOf } from "../src/game/magnet.js"

const box = (x, y) => ({ x, y, width: 10, height: 10 })

describe("centerOf", () => {
    it("returns the middle of a box", () => {
        assert.deepEqual(centerOf(box(10, 20)), { x: 15, y: 25 })
    })
})

describe("attract", () => {
    it("pulls items inside the radius by at most the step", () => {
        const coin = box(95, -5)
        assert.equal(attract(coin, { x: 0, y: 0 }, { radius: 200, maxStep: 30 }), true)
        assert.deepEqual(coin, box(65, -5))
    })

    it("does not overshoot the target", () => {
        const coin = box(5, -5)
        attract(coin, { x: 0, y: 0 }, { radius: 200, maxStep: 30 })
        assert.deepEqual(centerOf(coin), { x: 0, y: 0 })
    })

    it("ignores items outside the radius", () => {
        const coin = box(295, -5)
        assert.equal(attract(coin, { x: 0, y: 0 }, { radius: 200, maxStep: 30 }), false)
        assert.deepEqual(coin, box(295, -5))
    })
})
