import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
    EntityIds,
    blendFactor,
    createSnapshot,
    moveToward,
    toPixels,
    toViewportFractions,
} from "../src/net/snapshot.js"

const VIEWPORT = { width: 1000, height: 500 }

describe("viewport fractions", () => {
    it("divides by the viewport size", () => {
        assert.deepEqual(toViewportFractions({ x: 250, y: 100 }, VIEWPORT), { x: 0.25, y: 0.2 })
    })

    it("rounds to a compact precision", () => {
        assert.deepEqual(toViewportFractions({ x: 1, y: 1 }, { width: 3, height: 3 }), { x: 0.3333, y: 0.3333 })
    })

    it("returns zero for an empty viewport", () => {
        assert.deepEqual(toViewportFractions({ x: 10, y: 10 }, { width: 0, height: 0 }), { x: 0, y: 0 })
    })

    it("maps fractions back to pixels of another viewport", () => {
        assert.deepEqual(toPixels({ x: 0.25, y: 0.2 }, { width: 2000, height: 1000 }), { x: 500, y: 200 })
    })
})

describe("smoothing", () => {
    it("does not move when no time passed", () => {
        assert.equal(blendFactor(0, 10), 0)
    })

    it("approaches a full step as time grows", () => {
        assert.ok(blendFactor(10, 10) > 0.999)
    })

    it("gives the same result for one long frame or two short ones", () => {
        const oneFrame = { x: 0, y: 0 }
        const twoFrames = { x: 0, y: 0 }
        const target = { x: 100, y: -50 }
        moveToward(oneFrame, target, blendFactor(0.1, 12))
        moveToward(twoFrames, target, blendFactor(0.05, 12))
        moveToward(twoFrames, target, blendFactor(0.05, 12))
        assert.ok(Math.abs(oneFrame.x - twoFrames.x) < 1e-9)
        assert.ok(Math.abs(oneFrame.y - twoFrames.y) < 1e-9)
    })

    it("moves part of the way toward the target", () => {
        const point = { x: 0, y: 10 }
        moveToward(point, { x: 10, y: 20 }, 0.5)
        assert.deepEqual(point, { x: 5, y: 15 })
    })
})

describe("EntityIds", () => {
    it("keeps the same id for the same object", () => {
        const ids = new EntityIds()
        const coin = {}
        assert.equal(ids.idOf(coin), ids.idOf(coin))
    })

    it("gives different objects different ids", () => {
        const ids = new EntityIds()
        assert.notEqual(ids.idOf({}), ids.idOf({}))
    })
})

describe("createSnapshot", () => {
    it("describes players and coins in viewport fractions", () => {
        const ids = new EntityIds()
        const coin = { x: 900, y: 250 }
        const snapshot = createSnapshot({
            players: [{ id: 1, score: 4, balloon: { x: 100, y: 50 } }],
            coins: [coin],
        }, VIEWPORT, ids)

        assert.deepEqual(snapshot, {
            players: [{ id: 1, score: 4, x: 0.1, y: 0.1 }],
            coins: [{ id: ids.idOf(coin), x: 0.9, y: 0.5 }],
        })
    })
})
