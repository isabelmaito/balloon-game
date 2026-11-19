import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
    ASSIGN_ERROR,
    assignKey,
    defaultBindingsList,
    findConflict,
    isValidBindingsList,
    normalizeBindingsList,
} from "../src/input/binding-rules.js"
import { DEFAULT_BINDINGS } from "../src/input/bindings.js"

describe("findConflict", () => {
    it("finds a key used by another player", () => {
        const conflict = findConflict(defaultBindingsList(), { player: 0, action: "up", code: "KeyS" })
        assert.deepEqual(conflict, { player: 1, action: "down" })
    })

    it("finds a key used by another action of the same player", () => {
        const conflict = findConflict(defaultBindingsList(), { player: 0, action: "up", code: "ArrowDown" })
        assert.deepEqual(conflict, { player: 0, action: "down" })
    })

    it("ignores the slot being edited", () => {
        assert.equal(findConflict(defaultBindingsList(), { player: 0, action: "up", code: "ArrowUp" }), null)
    })
})

describe("assignKey", () => {
    it("assigns a free key without mutating the input", () => {
        const original = defaultBindingsList()
        const result = assignKey(original, { player: 1, action: "up", code: "KeyI" })
        assert.equal(result.ok, true)
        assert.equal(result.bindings[1].up, "KeyI")
        assert.equal(original[1].up, "KeyW")
    })

    it("refuses a key already taken", () => {
        const result = assignKey(defaultBindingsList(), { player: 1, action: "up", code: "ArrowLeft" })
        assert.deepEqual(result, { ok: false, reason: ASSIGN_ERROR.TAKEN, conflict: { player: 0, action: "left" } })
    })

    it("refuses the pause keys", () => {
        const result = assignKey(defaultBindingsList(), { player: 0, action: "up", code: "KeyP" })
        assert.deepEqual(result, { ok: false, reason: ASSIGN_ERROR.RESERVED })
    })
})

describe("isValidBindingsList", () => {
    it("accepts the defaults", () => {
        assert.equal(isValidBindingsList(defaultBindingsList()), true)
    })

    it("rejects duplicates, gaps and wrong shapes", () => {
        assert.equal(isValidBindingsList([DEFAULT_BINDINGS.arrows, DEFAULT_BINDINGS.arrows]), false)
        assert.equal(isValidBindingsList([DEFAULT_BINDINGS.arrows, { up: "KeyW" }]), false)
        assert.equal(isValidBindingsList([DEFAULT_BINDINGS.arrows]), false)
        assert.equal(isValidBindingsList("ArrowUp"), false)
    })
})

describe("normalizeBindingsList", () => {
    it("keeps valid stored bindings and drops unknown actions", () => {
        const stored = [{ ...DEFAULT_BINDINGS.arrows, jump: "Space" }, { ...DEFAULT_BINDINGS.wasd, up: "KeyQ" }]
        const result = normalizeBindingsList(stored)
        assert.equal(result[1].up, "KeyQ")
        assert.equal("jump" in result[0], false)
    })

    it("falls back to the defaults when stored data is invalid", () => {
        assert.deepEqual(normalizeBindingsList(undefined), defaultBindingsList())
        assert.deepEqual(normalizeBindingsList([{}, {}]), defaultBindingsList())
    })
})
