import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { intersects, shrink } from "../src/utils/collision.js"

describe("intersects", () => {
    const box = { x: 0, y: 0, width: 10, height: 10 }

    it("detects overlapping boxes", () => {
        assert.equal(intersects(box, { x: 5, y: 5, width: 10, height: 10 }), true)
    })

    it("ignores boxes that only touch edges", () => {
        assert.equal(intersects(box, { x: 10, y: 0, width: 10, height: 10 }), false)
    })

    it("ignores distant boxes", () => {
        assert.equal(intersects(box, { x: 50, y: 50, width: 1, height: 1 }), false)
    })
})

describe("shrink", () => {
    it("keeps the box centered", () => {
        assert.deepEqual(shrink({ x: 0, y: 0, width: 100, height: 50 }, 0.5), {
            x: 25, y: 12.5, width: 50, height: 25,
        })
    })
})
