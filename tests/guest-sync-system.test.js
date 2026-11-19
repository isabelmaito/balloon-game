import { after, before, describe, it } from "node:test"
import assert from "node:assert/strict"
import { EntityGroup } from "../src/core/entity-group.js"
import { EventBus } from "../src/core/event-bus.js"
import { GUEST_PLAYER_ID, HOST_PLAYER_ID } from "../src/net/config.js"
import { TimedEffects } from "../src/game/effects.js"
import { GuestSyncSystem } from "../src/net/guest-sync-system.js"
import { MESSAGE_TYPE, isValidMessage } from "../src/net/protocol.js"
import { createFakeElement, installFakeDocument } from "./helpers/fake-dom.js"

const VIEWPORT = { width: 1000, height: 500 }
const FRAME = 1 / 60

function fakePlayer(id) {
    return {
        id,
        score: 0,
        lives: 3,
        effects: new TimedEffects(),
        controls: { direction: { x: 0, y: 0 } },
        balloon: { x: 0, y: 0, element: { classList: new Set(), dataset: {} } },
    }
}

function createSystem() {
    const sent = []
    const playfield = createFakeElement()
    const game = {
        players: [fakePlayer(HOST_PLAYER_ID), fakePlayer(GUEST_PLAYER_ID)],
        playfield,
        coins: new EntityGroup(playfield),
        events: new EventBus(),
    }
    const system = new GuestSyncSystem({
        send: (message) => sent.push(message),
        levels: { syncDistance() {} },
        viewport: VIEWPORT,
    })
    system.setup(game)
    return { system, game, sent, playfield, guest: game.players[1] }
}

function snapshot(coins, players = []) {
    return { players, coins, hazards: [], powerUps: [], distance: 0 }
}

describe("GuestSyncSystem", () => {
    let restoreDocument

    before(() => {
        restoreDocument = installFakeDocument(VIEWPORT)
    })

    after(() => {
        restoreDocument()
    })

    describe("input", () => {
        it("sends the local direction on the first frame", () => {
            const { system, game, sent } = createSystem()
            system.update(FRAME, game)
            assert.equal(sent.length, 1)
            assert.equal(sent[0].type, MESSAGE_TYPE.INPUT)
            assert.deepEqual(sent[0].direction, { x: 0, y: 0 })
            assert.ok(isValidMessage(sent[0]))
        })

        it("does not resend an unchanged direction", () => {
            const { system, game, sent, guest } = createSystem()
            system.update(FRAME, game)
            guest.controls.direction = { x: 0, y: 0 }
            system.update(FRAME, game)
            system.update(FRAME, game)
            assert.equal(sent.length, 1)
        })

        it("sends again whenever the direction changes", () => {
            const { system, game, sent, guest } = createSystem()
            system.update(FRAME, game)
            guest.controls.direction = { x: 1, y: 0 }
            system.update(FRAME, game)
            guest.controls.direction = { x: 1, y: -1 }
            system.update(FRAME, game)
            guest.controls.direction = { x: 1, y: -1 }
            system.update(FRAME, game)
            assert.deepEqual(sent.map(({ direction }) => direction), [
                { x: 0, y: 0 },
                { x: 1, y: 0 },
                { x: 1, y: -1 },
            ])
        })

        it("only reports the local player's direction", () => {
            const { system, game, sent } = createSystem()
            system.update(FRAME, game)
            game.players[0].controls.direction = { x: -1, y: 0 }
            system.update(FRAME, game)
            assert.equal(sent.length, 1)
        })

        it("sends the direction again after a reset", () => {
            const { system, game, sent } = createSystem()
            system.update(FRAME, game)
            system.teardown()
            system.setup(game)
            system.update(FRAME, game)
            assert.equal(sent.length, 2)
        })
    })

    describe("coins", () => {
        it("adds new coins right at their snapshot position", () => {
            const { system, game, playfield } = createSystem()
            system.receive(snapshot([{ id: 1, x: 0.5, y: 0.2 }, { id: 2, x: 0.1, y: 0.9 }]))
            system.update(FRAME, game)
            assert.deepEqual(game.coins.items.map(({ x, y }) => ({ x, y })), [
                { x: 500, y: 100 },
                { x: 100, y: 450 },
            ])
            assert.equal(playfield.children.length, 2)
        })

        it("eases known coins toward their new position instead of respawning them", () => {
            const { system, game } = createSystem()
            system.receive(snapshot([{ id: 1, x: 0.5, y: 0.2 }]))
            system.update(FRAME, game)
            const [coin] = game.coins.items
            system.receive(snapshot([{ id: 1, x: 0.4, y: 0.2 }]))
            system.update(FRAME, game)
            assert.deepEqual(game.coins.items, [coin])
            assert.ok(coin.x < 500 && coin.x > 400)
            assert.equal(coin.y, 100)
        })

        it("removes coins missing from the latest snapshot", () => {
            const { system, game, playfield } = createSystem()
            system.receive(snapshot([{ id: 1, x: 0.5, y: 0.2 }, { id: 2, x: 0.1, y: 0.9 }]))
            system.update(FRAME, game)
            const [collected, kept] = game.coins.items
            system.receive(snapshot([{ id: 2, x: 0.1, y: 0.9 }, { id: 3, x: 0.9, y: 0.5 }]))
            system.update(FRAME, game)
            assert.equal(collected.isAlive, false)
            assert.equal(game.coins.items.length, 2)
            assert.equal(game.coins.items[0], kept)
            assert.deepEqual({ x: game.coins.items[1].x, y: game.coins.items[1].y }, { x: 900, y: 250 })
            assert.equal(playfield.children.length, 2)
        })

        it("removes every coin when the snapshot has none", () => {
            const { system, game, playfield } = createSystem()
            system.receive(snapshot([{ id: 1, x: 0.5, y: 0.2 }]))
            system.update(FRAME, game)
            system.receive(snapshot([]))
            system.update(FRAME, game)
            assert.deepEqual(game.coins.items, [])
            assert.deepEqual(playfield.children, [])
        })
    })

    describe("players", () => {
        it("copies scores and announces the change once", () => {
            const { system, game, guest } = createSystem()
            const changes = []
            game.events.on("score:changed", ({ player, score }) => changes.push([player.id, score]))
            system.receive(snapshot([], [{ id: GUEST_PLAYER_ID, x: 0.5, y: 0.5, score: 3, lives: 3, effects: [] }]))
            system.update(FRAME, game)
            system.update(FRAME, game)
            assert.equal(guest.score, 3)
            assert.deepEqual(changes, [[GUEST_PLAYER_ID, 3]])
        })

        it("eases balloons toward their snapshot position", () => {
            const { system, game, guest } = createSystem()
            system.receive(snapshot([], [{ id: GUEST_PLAYER_ID, x: 0.5, y: 0.5, score: 0, lives: 3, effects: [] }]))
            system.update(FRAME, game)
            assert.ok(guest.balloon.x > 0 && guest.balloon.x < 500)
            assert.ok(guest.balloon.y > 0 && guest.balloon.y < 250)
        })
    })
})
