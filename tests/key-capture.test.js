import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { KeyCapture } from "../src/input/key-capture.js"

function keyEvent(code) {
    const event = new Event("keydown", { cancelable: true })
    event.code = code
    return event
}

describe("KeyCapture", () => {
    it("reports the next key once and swallows it", () => {
        const target = new EventTarget()
        const capture = new KeyCapture(target)
        const keys = []
        capture.start({ onKey: (code) => keys.push(code) })

        const event = keyEvent("KeyJ")
        target.dispatchEvent(event)
        target.dispatchEvent(keyEvent("KeyK"))

        assert.deepEqual(keys, ["KeyJ"])
        assert.equal(event.defaultPrevented, true)
        assert.equal(capture.isActive, false)
    })

    it("cancels on escape", () => {
        const target = new EventTarget()
        const capture = new KeyCapture(target)
        let cancelled = 0
        capture.start({ onKey: () => assert.fail("escape must not be bound"), onCancel: () => cancelled++ })
        target.dispatchEvent(keyEvent("Escape"))
        assert.equal(cancelled, 1)
        assert.equal(capture.isActive, false)
    })

    it("cancels the previous wait when a new one starts", () => {
        const capture = new KeyCapture(new EventTarget())
        let cancelled = 0
        capture.start({ onKey: () => {}, onCancel: () => cancelled++ })
        capture.start({ onKey: () => {} })
        assert.equal(cancelled, 1)
        assert.equal(capture.isActive, true)
    })
})
