import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { Controls } from "../src/input/controls.js"
import { DEFAULT_BINDINGS } from "../src/input/bindings.js"

function fakeKeyboard(pressedCodes) {
    return { isPressed: (code) => pressedCodes.includes(code) }
}

describe("Controls", () => {
    it("maps bound keys to a direction", () => {
        const controls = new Controls(fakeKeyboard(["KeyW", "KeyD"]), DEFAULT_BINDINGS.wasd)
        assert.deepEqual(controls.direction, { x: 1, y: -1 })
    })

    it("cancels opposite keys", () => {
        const controls = new Controls(fakeKeyboard(["ArrowLeft", "ArrowRight"]), DEFAULT_BINDINGS.arrows)
        assert.deepEqual(controls.direction, { x: 0, y: 0 })
    })

    it("ignores keys bound to another scheme", () => {
        const controls = new Controls(fakeKeyboard(["ArrowUp"]), DEFAULT_BINDINGS.wasd)
        assert.deepEqual(controls.direction, { x: 0, y: 0 })
    })
})
