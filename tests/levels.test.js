import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { LEVELS, levelIndexAt, levelNameKey } from "../src/progression/levels.js"

describe("levelIndexAt", () => {
    it("starts on the first level", () => {
        assert.equal(levelIndexAt(0), 0)
    })

    it("advances once the start distance is reached", () => {
        assert.equal(levelIndexAt(LEVELS[1].startsAt - 1), 0)
        assert.equal(levelIndexAt(LEVELS[1].startsAt), 1)
    })

    it("stays on the last level forever", () => {
        assert.equal(levelIndexAt(Number.MAX_SAFE_INTEGER), LEVELS.length - 1)
    })

    it("accepts a custom level list", () => {
        const levels = [{ startsAt: 0 }, { startsAt: 10 }]
        assert.equal(levelIndexAt(15, levels), 1)
    })
})

describe("LEVELS", () => {
    it("begin at the starting line", () => {
        assert.equal(LEVELS[0].startsAt, 0)
    })

    it("each name a sky theme", () => {
        for (const level of LEVELS) assert.equal(typeof level.sky, "string")
    })

    it("start further away and get harder in order", () => {
        for (let index = 1; index < LEVELS.length; index++) {
            const previous = LEVELS[index - 1]
            const level = LEVELS[index]
            assert.ok(level.startsAt > previous.startsAt)
            assert.ok(level.speedMultiplier >= previous.speedMultiplier)
            assert.ok(level.spawnMultiplier >= previous.spawnMultiplier)
        }
    })
})

describe("levelNameKey", () => {
    it("derives the i18n key from the level id", () => {
        assert.equal(levelNameKey({ id: "night" }), "level.name.night")
    })
})
