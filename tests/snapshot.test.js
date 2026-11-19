import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
    EntityIds,
    blendFactor,
    createSnapshot,
    moveToward,
    toPixelBox,
    toPixels,
    toViewportBox,
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

    it("describes a box with its size", () => {
        const box = { x: 250, y: 100, width: 100, height: 50 }
        assert.deepEqual(toViewportBox(box, VIEWPORT), { x: 0.25, y: 0.2, w: 0.1, h: 0.1 })
    })

    it("maps a box back to pixels of another viewport", () => {
        const pixels = toPixelBox({ x: 0.25, y: 0.2, w: 0.1, h: 0.1 }, { width: 2000, height: 1000 })
        assert.deepEqual(pixels, { x: 500, y: 200, width: 200, height: 100 })
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
    const player = {
        id: 1,
        score: 4,
        lives: 2,
        effects: { active: [{ name: "shield", remaining: Infinity }, { name: "magnet", remaining: 3 }] },
        balloon: { x: 100, y: 50 },
    }

    function snapshotOf(match) {
        const ids = new EntityIds()
        const empty = { players: [], coins: [], hazards: [], powerUps: [], distance: 0 }
        return { ids, snapshot: createSnapshot({ ...empty, ...match }, VIEWPORT, ids) }
    }

    it("describes players with lives and effect names", () => {
        const { snapshot } = snapshotOf({ players: [player] })
        assert.deepEqual(snapshot.players, [
            { id: 1, score: 4, lives: 2, effects: ["shield", "magnet"], x: 0.1, y: 0.1 },
        ])
    })

    it("describes coins in viewport fractions", () => {
        const coin = { x: 900, y: 250 }
        const { ids, snapshot } = snapshotOf({ coins: [coin] })
        assert.deepEqual(snapshot.coins, [{ id: ids.idOf(coin), x: 0.9, y: 0.5 }])
    })

    it("describes hazards and power-ups with kind and size", () => {
        const hazard = { kind: "stormCloud", x: 500, y: 100, width: 200, height: 100 }
        const powerUp = { kind: "magnet", x: 800, y: 400, width: 50, height: 50 }
        const { ids, snapshot } = snapshotOf({ hazards: [hazard], powerUps: [powerUp] })
        assert.deepEqual(snapshot.hazards, [{ id: ids.idOf(hazard), kind: "stormCloud", x: 0.5, y: 0.2, w: 0.2, h: 0.2 }])
        assert.deepEqual(snapshot.powerUps, [{ id: ids.idOf(powerUp), kind: "magnet", x: 0.8, y: 0.8, w: 0.05, h: 0.1 }])
    })

    it("gives every entity its own id across lists", () => {
        const { snapshot } = snapshotOf({
            coins: [{ x: 0, y: 0 }],
            hazards: [{ kind: "bird", x: 0, y: 0, width: 1, height: 1 }],
            powerUps: [{ kind: "shield", x: 0, y: 0, width: 1, height: 1 }],
        })
        const ids = [snapshot.coins, snapshot.hazards, snapshot.powerUps].flat().map(({ id }) => id)
        assert.equal(new Set(ids).size, ids.length)
    })

    it("carries the distance travelled", () => {
        assert.equal(snapshotOf({ distance: 123.5 }).snapshot.distance, 123.5)
    })
})
