import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { RemoteControls } from "../src/net/remote-controls.js"

describe("RemoteControls", () => {
    it("starts idle", () => {
        assert.deepEqual(new RemoteControls().direction, { x: 0, y: 0 })
    })

    it("reports the last direction received", () => {
        const controls = new RemoteControls()
        controls.setDirection({ x: 1, y: -1 })
        assert.deepEqual(controls.direction, { x: 1, y: -1 })
    })

    it("does not expose its internal state", () => {
        const controls = new RemoteControls()
        controls.direction.x = 1
        assert.deepEqual(controls.direction, { x: 0, y: 0 })
    })

    it("goes back to idle on reset", () => {
        const controls = new RemoteControls()
        controls.setDirection({ x: -1, y: 0 })
        controls.reset()
        assert.deepEqual(controls.direction, { x: 0, y: 0 })
    })
})
