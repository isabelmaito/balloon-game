import { afterEach, beforeEach, describe, it } from "node:test"
import assert from "node:assert/strict"
import { GameLoop } from "../src/core/game-loop.js"

/** Manual animation frame scheduler so the loop can be stepped deterministically. */
function installFakeFrames() {
    let nextId = 1
    const pending = new Map()
    globalThis.requestAnimationFrame = (callback) => {
        pending.set(nextId, callback)
        return nextId++
    }
    globalThis.cancelAnimationFrame = (id) => pending.delete(id)
    return {
        step(timestamp) {
            const callbacks = [...pending.values()]
            pending.clear()
            for (const callback of callbacks) callback(timestamp)
        },
        get pendingCount() {
            return pending.size
        },
    }
}

describe("GameLoop", () => {
    let frames

    beforeEach(() => {
        frames = installFakeFrames()
    })

    afterEach(() => {
        delete globalThis.requestAnimationFrame
        delete globalThis.cancelAnimationFrame
    })

    it("passes elapsed seconds to the update callback", () => {
        const deltas = []
        new GameLoop((delta) => deltas.push(delta)).start()
        frames.step(1000)
        frames.step(1050)
        assert.deepEqual(deltas, [0, 0.05])
    })

    it("clamps long pauses between frames", () => {
        const deltas = []
        new GameLoop((delta) => deltas.push(delta)).start()
        frames.step(0)
        frames.step(5000)
        assert.equal(deltas[1], 0.1)
    })

    it("stops when stop() is called during an update", () => {
        let calls = 0
        const loop = new GameLoop(() => {
            calls++
            if (calls === 2) loop.stop()
        })
        loop.start()
        for (let frame = 0; frame < 5; frame++) frames.step(frame * 16)
        assert.equal(calls, 2)
        assert.equal(loop.isRunning, false)
        assert.equal(frames.pendingCount, 0)
    })
})
