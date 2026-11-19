import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { Odometer } from "../src/progression/odometer.js"

describe("Odometer", () => {
    it("starts at zero", () => {
        assert.equal(new Odometer().meters, 0)
    })

    it("accumulates distance from elapsed time", () => {
        const odometer = new Odometer({ metersPerSecond: 10 })
        odometer.advance(1)
        odometer.advance(0.5)
        assert.equal(odometer.meters, 15)
    })

    it("travels further at higher speeds", () => {
        const odometer = new Odometer({ metersPerSecond: 10 })
        odometer.advance(1, 2)
        assert.equal(odometer.meters, 20)
    })

    it("goes back to zero on reset", () => {
        const odometer = new Odometer()
        odometer.advance(3)
        odometer.reset()
        assert.equal(odometer.meters, 0)
    })
})
