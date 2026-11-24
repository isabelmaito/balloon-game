import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { createFakeElement, installFakeDocument } from "./helpers/fake-dom.js"
import { EntityGroup } from "../src/core/entity-group.js"
import { EventBus } from "../src/core/event-bus.js"
import { GAME_STATE } from "../src/game/game.js"
import { Player } from "../src/game/player.js"
import { GuestSyncSystem } from "../src/net/guest-sync-system.js"

const VIEWPORT = { width: 1000, height: 500 }
const PLAYER_ID = 1
const IDLE = { x: 0, y: 0 }

function playerState(fields = {}) {
    return { id: PLAYER_ID, x: 0.1, y: 0.2, score: 0, lives: 3, effects: [], ...fields }
}

function snapshot(fields = {}) {
    return { players: [playerState()], coins: [], hazards: [], powerUps: [], distance: 0, ...fields }
}

function record(events, name) {
    const calls = []
    events.on(name, (payload) => calls.push(payload))
    return calls
}

function createMatch() {
    installFakeDocument()
    const playfield = createFakeElement()
    const events = new EventBus()
    const balloon = { x: 0, y: 0, element: { classList: new Set(), dataset: {} } }
    const player = new Player({ id: PLAYER_ID, balloon, controls: { direction: IDLE }, lives: 3 })
    const game = { playfield, events, players: [player], coins: new EntityGroup(playfield), state: GAME_STATE.RUNNING }
    const distances = []
    const levels = { syncDistance: (distance) => distances.push(distance) }
    const system = new GuestSyncSystem({ send() {}, levels, viewport: VIEWPORT })
    system.setup(game)
    const step = (state) => {
        system.receive(state)
        system.update(0, game)
    }
    return { game, events, player, system, distances, step, playfield }
}

describe("GuestSyncSystem", () => {
    it("reports lives that changed on the host", () => {
        const { events, player, step } = createMatch()
        const changes = record(events, "lives:changed")
        step(snapshot({ players: [playerState({ lives: 2 })] }))
        assert.equal(player.lives, 2)
        assert.deepEqual(changes, [{ player, lives: 2 }])
    })

    it("does not report the same lives twice", () => {
        const { events, step } = createMatch()
        const changes = record(events, "lives:changed")
        step(snapshot({ players: [playerState({ lives: 2 })] }))
        step(snapshot({ players: [playerState({ lives: 2 })] }))
        assert.equal(changes.length, 1)
    })

    it("knocks a player out when the host says no lives are left", () => {
        const { events, player, step } = createMatch()
        const outs = record(events, "player:out")
        step(snapshot({ players: [playerState({ lives: 0 })] }))
        assert.deepEqual(outs, [{ player }])
        assert.equal(player.isOut, true)
    })

    it("starts and ends effects named by the host", () => {
        const { events, player, step } = createMatch()
        const changes = record(events, "effects:changed")
        step(snapshot({ players: [playerState({ effects: ["shield", "magnet"] })] }))
        assert.deepEqual(changes.at(-1).effects.map(({ name }) => name), ["shield", "magnet"])
        step(snapshot({ players: [playerState({ effects: ["magnet"] })] }))
        assert.equal(player.effects.isActive("shield"), false)
        assert.deepEqual(changes.at(-1).effects.map(({ name }) => name), ["magnet"])
        assert.equal(changes.length, 2)
    })

    it("gives a mirrored power-up a draining timer", () => {
        const { player, step } = createMatch()
        step(snapshot({ players: [playerState({ effects: ["magnet"] })] }))
        assert.ok(Number.isFinite(player.effects.remaining("magnet")))
    })

    it("applies discrete state only once per snapshot", () => {
        const { game, events, system, step } = createMatch()
        const changes = record(events, "effects:changed")
        step(snapshot({ players: [playerState({ effects: ["magnet"] })] }))
        game.players[0].effects.clear()
        system.update(0, game)
        assert.equal(changes.length, 1)
    })

    it("passes the host distance to the levels", () => {
        const { distances, step } = createMatch()
        step(snapshot({ distance: 87 }))
        assert.deepEqual(distances, [87])
    })

    it("creates hazards and power-ups of the right kind and size", () => {
        const { playfield, step } = createMatch()
        step(snapshot({
            hazards: [{ id: 1, kind: "bird", x: 0.5, y: 0.2, w: 0.06, h: 0.12 }],
            powerUps: [{ id: 2, kind: "shield", x: 0.8, y: 0.4, w: 0.05, h: 0.1 }],
        }))
        const [hazard, powerUp] = playfield.children
        assert.match(hazard.className, /hazard bird/)
        assert.match(powerUp.className, /power-up/)
        assert.equal(hazard.style.width, "60px")
        assert.equal(hazard.style.height, "60px")
        assert.equal(powerUp.style.width, "50px")
    })

    it("removes mirrored hazards the host no longer has", () => {
        const { playfield, step } = createMatch()
        step(snapshot({ hazards: [{ id: 1, kind: "stormCloud", x: 0.5, y: 0.2, w: 0.2, h: 0.1 }] }))
        const [hazard] = playfield.children
        step(snapshot())
        assert.equal(playfield.children.includes(hazard), false)
    })

    it("clears mirrored entities on teardown", () => {
        const { playfield, system, step } = createMatch()
        step(snapshot({ powerUps: [{ id: 2, kind: "magnet", x: 0.8, y: 0.4, w: 0.05, h: 0.1 }] }))
        system.teardown()
        assert.deepEqual(playfield.children, [])
    })
})
