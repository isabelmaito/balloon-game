import { viewport as defaultViewport } from "../core/viewport.js"
import { SNAPSHOT_INTERVAL_SECONDS } from "./config.js"
import { MESSAGE_TYPE, createMessage } from "./protocol.js"
import { EntityIds, createSnapshot } from "./snapshot.js"

/**
 * Game system for the online host: the host runs the real simulation and this
 * system broadcasts a snapshot of it at a fixed rate.
 *
 * `hazards` and `powerUps` are the survival systems (anything exposing
 * `entities`) and `levels` anything exposing `distance` in meters.
 */
export class HostSyncSystem {
    #send
    #viewport
    #hazards
    #powerUps
    #levels
    #ids = new EntityIds()
    #elapsedSeconds = 0

    constructor({ send, hazards, powerUps, levels, viewport = defaultViewport }) {
        this.#send = send
        this.#hazards = hazards
        this.#powerUps = powerUps
        this.#levels = levels
        this.#viewport = viewport
    }

    setup() {
        this.#elapsedSeconds = 0
    }

    update(deltaSeconds, game) {
        this.#elapsedSeconds += deltaSeconds
        if (this.#elapsedSeconds < SNAPSHOT_INTERVAL_SECONDS) return
        this.#elapsedSeconds %= SNAPSHOT_INTERVAL_SECONDS
        this.broadcast(game)
    }

    broadcast(game) {
        const snapshot = createSnapshot({
            players: game.players,
            coins: game.coins.items,
            hazards: this.#hazards.entities,
            powerUps: this.#powerUps.entities,
            distance: this.#levels.distance,
        }, this.#viewport, this.#ids)
        this.#send(createMessage(MESSAGE_TYPE.STATE, snapshot))
    }
}
