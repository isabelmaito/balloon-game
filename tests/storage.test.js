import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { Storage } from "../src/core/storage.js"
import { MemoryStorage } from "./helpers/memory-storage.js"

describe("Storage", () => {
    it("round-trips json values", () => {
        const storage = new Storage(new MemoryStorage())
        storage.write("settings", { locale: "en" })
        assert.deepEqual(storage.read("settings"), { locale: "en" })
    })

    it("returns the fallback for missing keys", () => {
        assert.equal(new Storage(new MemoryStorage()).read("missing", 42), 42)
    })

    it("returns the fallback for corrupted data", () => {
        const backend = new MemoryStorage()
        backend.setItem("balloon-game:bad", "{not json")
        assert.equal(new Storage(backend).read("bad", "ok"), "ok")
    })

    it("does not throw when the backend fails", () => {
        const failing = { getItem() { throw new Error() }, setItem() { throw new Error() } }
        const storage = new Storage(failing)
        assert.equal(storage.write("key", 1), false)
        assert.equal(storage.read("key", 0), 0)
    })
})
