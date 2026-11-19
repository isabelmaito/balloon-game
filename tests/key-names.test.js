import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { formatKey } from "../src/input/key-names.js"

describe("formatKey", () => {
    it("strips the Key and Digit prefixes", () => {
        assert.equal(formatKey("KeyW"), "W")
        assert.equal(formatKey("Digit7"), "7")
    })

    it("shows arrows as symbols", () => {
        assert.equal(formatKey("ArrowUp"), "↑")
        assert.equal(formatKey("ArrowLeft"), "←")
    })

    it("labels numpad and modifier keys", () => {
        assert.equal(formatKey("Numpad4"), "Num 4")
        assert.equal(formatKey("ShiftLeft"), "Shift L")
        assert.equal(formatKey("ControlRight"), "Control R")
    })

    it("translates language-dependent names", () => {
        assert.equal(formatKey("Space", (key) => `<${key}>`), "<keys.space>")
    })

    it("keeps unknown codes as they are", () => {
        assert.equal(formatKey("F5"), "F5")
        assert.equal(formatKey("Key"), "Key")
    })

    it("returns an empty label for a missing code", () => {
        assert.equal(formatKey(undefined), "")
    })
})
