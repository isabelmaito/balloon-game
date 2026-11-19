import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { SNAPSHOT_INTERVAL_SECONDS } from "../src/net/config.js"
import { HostSyncSystem } from "../src/net/host-sync-system.js"
import { MESSAGE_TYPE, isValidMessage } from "../src/net/protocol.js"

const VIEWPORT = { width: 1000, height: 500 }

function fakeGame() {
    return {
        players: [{ id: 1, score: 2, lives: 3, effects: { active: [] }, balloon: { x: 100, y: 250 } }],
        coins: { items: [{ x: 500, y: 0 }] },
    }
}

function createSystem() {
    const sent = []
    const system = new HostSyncSystem({
        send: (message) => sent.push(message),
        hazards: { entities: [{ kind: "bird", x: 900, y: 100, width: 50, height: 50 }] },
        powerUps: { entities: [] },
        levels: { distance: 42 },
        viewport: VIEWPORT,
    })
    system.setup()
    return { system, sent }
}

describe("HostSyncSystem", () => {
    it("waits a full interval before the first snapshot", () => {
        const { system, sent } = createSystem()
        system.update(SNAPSHOT_INTERVAL_SECONDS / 2, fakeGame())
        assert.equal(sent.length, 0)
    })

    it("sends one valid state message per interval", () => {
        const { system, sent } = createSystem()
        const game = fakeGame()
        for (let frame = 0; frame < 4; frame++) system.update(SNAPSHOT_INTERVAL_SECONDS / 2, game)
        assert.equal(sent.length, 2)
        assert.equal(sent[0].type, MESSAGE_TYPE.STATE)
        assert.ok(sent.every(isValidMessage))
    })

    it("describes the match in viewport fractions", () => {
        const { system, sent } = createSystem()
        system.broadcast(fakeGame())
        assert.deepEqual(sent[0].players, [{ id: 1, score: 2, lives: 3, effects: [], x: 0.1, y: 0.5 }])
        assert.deepEqual(sent[0].coins.map(({ x, y }) => ({ x, y })), [{ x: 0.5, y: 0 }])
    })

    it("includes hazards, power-ups and the distance", () => {
        const { system, sent } = createSystem()
        system.broadcast(fakeGame())
        assert.deepEqual(sent[0].hazards.map(({ kind, x, w }) => ({ kind, x, w })), [{ kind: "bird", x: 0.9, w: 0.05 }])
        assert.deepEqual(sent[0].powerUps, [])
        assert.equal(sent[0].distance, 42)
    })
})
