import { DEFAULT_DIFFICULTY } from "../game/difficulty.js"
import { GAME_STATE } from "../game/game.js"
import { GUEST_PLAYER_ID, HOST_PLAYER_ID, LOCAL_BINDINGS, PROTOCOL_VERSION } from "./config.js"
import { GuestSyncSystem } from "./guest-sync-system.js"
import { HostSyncSystem } from "./host-sync-system.js"
import { PEER_STATE, PeerConnection } from "./peer-connection.js"
import { MESSAGE_TYPE, createMessage } from "./protocol.js"
import { RemoteControls } from "./remote-controls.js"

export const ONLINE_ROLE = Object.freeze({
    HOST: "host",
    GUEST: "guest",
})

/** Why a session ended; `null` when the local player left on purpose. */
export const END_REASON = Object.freeze({
    PEER_LEFT: "peerLeft",
    CONNECTION_LOST: "connectionLost",
    VERSION_MISMATCH: "versionMismatch",
})

/**
 * One online match between two browsers. The host owns the simulation and
 * steers player 2 from the guest's input; the guest only renders snapshots.
 *
 * Emits `online:connected` `{ role }` once both peers greeted each other and
 * `online:ended` `{ reason }` when the session is over (see `END_REASON`).
 */
export class OnlineSession {
    #app
    #game
    #events
    #survival
    #levels
    #peer = null
    #system = null
    #remoteControls = new RemoteControls()
    #handlers
    #lastGameState = null
    #send = (message) => this.#peer?.send(message)

    /**
     * `survival` holds the `hazards` and `powerUps` systems and `levels` the
     * `LevelSystem`; the host reads them for snapshots and the guest follows them.
     */
    constructor({ app, game, events, survival, levels }) {
        this.#app = app
        this.#game = game
        this.#events = events
        this.#survival = survival
        this.#levels = levels
        this.role = null
        this.isConnected = false
        this.#handlers = {
            [MESSAGE_TYPE.HELLO]: (message) => this.#greet(message),
            [MESSAGE_TYPE.INPUT]: ({ direction }) => this.#remoteControls.setDirection(direction),
            [MESSAGE_TYPE.STATE]: (snapshot) => this.#system?.receive?.(snapshot),
            [MESSAGE_TYPE.START]: ({ difficulty }) => this.#startAsGuest(difficulty),
            [MESSAGE_TYPE.PAUSE]: ({ paused }) => this.#mirrorPause(paused),
            [MESSAGE_TYPE.OVER]: ({ scores }) => this.#finishAsGuest(scores),
            [MESSAGE_TYPE.LEAVE]: () => this.#end(END_REASON.PEER_LEFT),
        }
        events.on("game:over", ({ players }) => this.#announceOver(players))
        events.on("game:state", (state) => this.#sharePause(state))
    }

    get isActive() {
        return this.role !== null
    }

    get isHost() {
        return this.role === ONLINE_ROLE.HOST
    }

    get isGuest() {
        return this.role === ONLINE_ROLE.GUEST
    }

    /** Opens a session as host and resolves with the offer code for the guest. */
    async host() {
        this.#open(ONLINE_ROLE.HOST)
        return this.#peer.createOffer()
    }

    /** Joins with the host's offer code and resolves with the answer code to send back. */
    async join(offerCode) {
        this.#open(ONLINE_ROLE.GUEST)
        return this.#peer.acceptOffer(offerCode)
    }

    /** Host: completes the handshake with the guest's answer code. */
    async acceptAnswer(answerCode) {
        await this.#peer.acceptAnswer(answerCode)
    }

    /** Host: starts a match on both machines. */
    startMatch() {
        if (!this.isHost || !this.isConnected) return
        const difficulty = this.#app.matchOptions.difficulty ?? DEFAULT_DIFFICULTY
        this.#peer.send(createMessage(MESSAGE_TYPE.START, { difficulty }))
        this.#remoteControls.reset()
        this.#app.play({
            ...this.#app.matchOptions,
            difficulty,
            players: [
                { id: HOST_PLAYER_ID, bindings: LOCAL_BINDINGS },
                { id: GUEST_PLAYER_ID, controls: this.#remoteControls },
            ],
        })
    }

    /** Leaves on purpose: tells the peer, closes the link and goes back to the menu. */
    leave() {
        if (!this.isActive) return
        this.#peer.send(createMessage(MESSAGE_TYPE.LEAVE))
        this.#end(null)
    }

    /** Starting over (e.g. after a mistyped code) silently drops the previous attempt. */
    #open(role) {
        if (this.isActive) {
            this.#send(createMessage(MESSAGE_TYPE.LEAVE))
            this.#teardown()
        }
        this.role = role
        this.#peer = new PeerConnection()
        this.#peer.onMessage = (message) => this.#handlers[message.type](message)
        this.#peer.onStateChange = (state) => this.#handlePeerState(state)
    }

    #handlePeerState(state) {
        if (state === PEER_STATE.OPEN) this.#peer.send(createMessage(MESSAGE_TYPE.HELLO, { version: PROTOCOL_VERSION }))
        else if (state === PEER_STATE.CLOSED) this.#end(END_REASON.CONNECTION_LOST)
    }

    #greet({ version }) {
        if (version !== PROTOCOL_VERSION) {
            this.#end(END_REASON.VERSION_MISMATCH)
            return
        }
        if (this.isConnected) return
        this.isConnected = true
        this.#system = this.isHost
            ? this.#createHostSync()
            : new GuestSyncSystem({ send: this.#send, levels: this.#levels })
        this.#game.addSystem(this.#system)
        this.#events.emit("online:connected", { role: this.role })
    }

    #createHostSync() {
        const { hazards, powerUps } = this.#survival
        return new HostSyncSystem({ send: this.#send, hazards, powerUps, levels: this.#levels })
    }

    #startAsGuest(difficulty) {
        if (!this.isGuest) return
        this.#app.play({
            difficulty,
            simulate: false,
            players: [
                { id: HOST_PLAYER_ID, controls: new RemoteControls() },
                { id: GUEST_PLAYER_ID, bindings: LOCAL_BINDINGS },
            ],
        })
    }

    /**
     * Pausing on either side pauses both: local pause changes are forwarded and
     * the peer mirrors them. Mirrored changes echo back once and stop there,
     * because a peer already in the requested state ignores the message.
     */
    #sharePause(state) {
        const wasPaused = this.#lastGameState === GAME_STATE.PAUSED
        this.#lastGameState = state
        const paused = state === GAME_STATE.PAUSED
        const resumed = wasPaused && state === GAME_STATE.RUNNING
        if (this.isConnected && (paused || resumed)) this.#send(createMessage(MESSAGE_TYPE.PAUSE, { paused }))
    }

    #mirrorPause(paused) {
        const { state } = this.#game
        if (paused && state === GAME_STATE.RUNNING) this.#app.pause()
        else if (!paused && state === GAME_STATE.PAUSED) this.#app.resume()
    }

    #announceOver(players) {
        if (!this.isHost || !this.isConnected) return
        const scores = players.map(({ id, score }) => ({ id, score }))
        this.#peer.send(createMessage(MESSAGE_TYPE.OVER, { scores }))
    }

    #finishAsGuest(scores) {
        if (!this.isGuest) return
        for (const { id, score } of scores) {
            const player = this.#game.players.find((candidate) => candidate.id === id)
            if (!player) continue
            player.score = score
            this.#events.emit("score:changed", { player, score })
        }
        this.#game.end()
    }

    #end(reason) {
        if (!this.isActive) return
        this.#teardown()
        this.#app.showMenu()
        this.#events.emit("online:ended", { reason })
    }

    #teardown() {
        const peer = this.#peer
        peer.onStateChange = () => {}
        peer.onMessage = () => {}
        peer.close()
        if (this.#system) this.#game.removeSystem(this.#system)
        this.#peer = null
        this.#system = null
        this.#remoteControls.reset()
        this.role = null
        this.isConnected = false
    }
}
