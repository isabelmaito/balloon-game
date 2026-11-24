import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { rightEdgeSpawn } from "../src/game/spawn-position.js"

const AREA = { width: 800, height: 600 }
const lowest = (min) => min
const highest = (_min, max) => max

describe("rightEdgeSpawn", () => {
    it("starts at the right edge", () => {
        assert.equal(rightEdgeSpawn(AREA, 50, { random: lowest }).x, 800)
    })

    it("keeps the whole entity inside the playfield height", () => {
        assert.equal(rightEdgeSpawn(AREA, 50, { random: lowest }).y, 0)
        assert.equal(rightEdgeSpawn(AREA, 50, { random: highest }).y, 550)
    })

    it("leaves the requested margin above and below", () => {
        assert.equal(rightEdgeSpawn(AREA, 50, { margin: 20, random: lowest }).y, 20)
        assert.equal(rightEdgeSpawn(AREA, 50, { margin: 20, random: highest }).y, 530)
    })
})
