import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { Storage } from "../src/core/storage.js"
import { PersistedState } from "../src/progress/persisted-state.js"
import { MemoryStorage } from "./helpers/memory-storage.js"

const createState = (storage = new Storage(new MemoryStorage())) =>
    new PersistedState({ storage, key: "counter", initial: { count: 0 } })

describe("PersistedState", () => {
    it("starts from the initial value", () => {
        assert.deepEqual(createState().value, { count: 0 })
    })

    it("persists updates across instances", () => {
        const storage = new Storage(new MemoryStorage())
        createState(storage).update(({ count }) => ({ count: count + 1 }))
        assert.deepEqual(createState(storage).value, { count: 1 })
    })

    it("normalizes stored data", () => {
        const storage = new Storage(new MemoryStorage())
        storage.write("list", "not a list")
        const state = new PersistedState({
            storage,
            key: "list",
            initial: [],
            normalize: (stored) => (Array.isArray(stored) ? stored : []),
        })
        assert.deepEqual(state.value, [])
    })

    it("resets to the initial value and clears storage", () => {
        const storage = new Storage(new MemoryStorage())
        const state = createState(storage)
        state.set({ count: 5 })
        state.reset()
        assert.deepEqual(state.value, { count: 0 })
        assert.equal(storage.read("counter", null), null)
    })

    it("notifies listeners on change", () => {
        const state = createState()
        const seen = []
        state.onChange((value) => seen.push(value.count))
        state.set({ count: 2 })
        state.reset()
        assert.deepEqual(seen, [2, 0])
    })
})
