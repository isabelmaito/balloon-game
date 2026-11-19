import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { DIFFICULTIES, getDifficulty } from "../src/game/difficulty.js"

describe("getDifficulty", () => {
    it("returns the requested preset", () => {
        assert.equal(getDifficulty("hard"), DIFFICULTIES.hard)
    })

    it("falls back to normal for unknown ids", () => {
        assert.equal(getDifficulty("impossible"), DIFFICULTIES.normal)
    })
})

describe("DIFFICULTIES", () => {
    it("gets harder in order", () => {
        const { easy, normal, hard } = DIFFICULTIES
        assert.ok(easy.speedMultiplier < normal.speedMultiplier)
        assert.ok(normal.speedMultiplier < hard.speedMultiplier)
        assert.ok(easy.lives > hard.lives)
    })
})
