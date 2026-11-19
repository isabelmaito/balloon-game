import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { EventBus } from "../src/core/event-bus.js"
import { Player } from "../src/game/player.js"
import { LivesSystem } from "../src/game/systems/lives-system.js"

function createMatch(livesPerPlayer) {
    const events = new EventBus()
    const players = livesPerPlayer.map((lives, index) => new Player({ id: index + 1, balloon: null, controls: null, lives }))
    const game = { players, ended: false, end() { this.ended = true } }
    const system = new LivesSystem({ events })
    system.setup(game)
    return { events, players, game }
}

function record(events, name) {
    const calls = []
    events.on(name, (payload) => calls.push(payload))
    return calls
}

describe("LivesSystem", () => {
    it("costs a life on hazard hit and reports it", () => {
        const { events, players: [player] } = createMatch([3])
        const changes = record(events, "lives:changed")
        events.emit("hazard:hit", { player })
        assert.deepEqual(changes, [{ player, lives: 2 }])
    })

    it("ends the match only when every player is out", () => {
        const { events, players: [first, second], game } = createMatch([1, 1])
        const outs = record(events, "player:out")
        events.emit("hazard:hit", { player: first })
        assert.equal(game.ended, false)
        events.emit("hazard:hit", { player: second })
        assert.equal(game.ended, true)
        assert.deepEqual(outs, [{ player: first }, { player: second }])
    })

    it("does not report lives when the hit is ignored", () => {
        const { events, players: [player] } = createMatch([3])
        events.emit("hazard:hit", { player })
        const changes = record(events, "lives:changed")
        events.emit("hazard:hit", { player })
        assert.deepEqual(changes, [])
    })
})
