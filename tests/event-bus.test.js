import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { EventBus } from "../src/core/event-bus.js"

describe("EventBus", () => {
    it("delivers payloads to subscribers", () => {
        const bus = new EventBus()
        const received = []
        bus.on("score", (value) => received.push(value))
        bus.emit("score", 3)
        assert.deepEqual(received, [3])
    })

    it("stops delivering after unsubscribe", () => {
        const bus = new EventBus()
        let calls = 0
        const unsubscribe = bus.on("tick", () => calls++)
        unsubscribe()
        bus.emit("tick")
        assert.equal(calls, 0)
    })

    it("ignores events without listeners", () => {
        assert.doesNotThrow(() => new EventBus().emit("nothing"))
    })
})
