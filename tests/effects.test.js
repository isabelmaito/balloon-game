import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { TimedEffects } from "../src/game/effects.js"

describe("TimedEffects", () => {
    it("counts an effect down and reports its expiry once", () => {
        const effects = new TimedEffects()
        effects.activate("magnet", 2)
        assert.deepEqual(effects.update(1.5), [])
        assert.equal(effects.isActive("magnet"), true)
        assert.equal(effects.remaining("magnet"), 0.5)
        assert.deepEqual(effects.update(0.5), ["magnet"])
        assert.equal(effects.isActive("magnet"), false)
        assert.deepEqual(effects.update(1), [])
    })

    it("refreshes to the longer duration when activated again", () => {
        const effects = new TimedEffects()
        effects.activate("magnet", 3)
        effects.update(2)
        effects.activate("magnet", 3)
        assert.equal(effects.remaining("magnet"), 3)
        effects.activate("magnet", 1)
        assert.equal(effects.remaining("magnet"), 3)
    })

    it("keeps infinite effects until consumed", () => {
        const effects = new TimedEffects()
        effects.activate("shield", Infinity)
        effects.update(1000)
        assert.equal(effects.isActive("shield"), true)
        assert.equal(effects.consume("shield"), true)
        assert.equal(effects.consume("shield"), false)
    })

    it("lists and clears active effects", () => {
        const effects = new TimedEffects()
        effects.activate("a", 1)
        effects.activate("b", 2)
        assert.deepEqual(effects.active, [{ name: "a", remaining: 1 }, { name: "b", remaining: 2 }])
        effects.clear()
        assert.deepEqual(effects.active, [])
    })
})
