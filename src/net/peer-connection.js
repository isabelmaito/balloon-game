import { DATA_CHANNEL_LABEL, ICE_GATHERING_TIMEOUT_MS, RTC_CONFIG } from "./config.js"
import { ProtocolError, SIGNAL_TYPE, decodeMessage, decodeSignal, encodeMessage, encodeSignal } from "./protocol.js"

export const PEER_STATE = Object.freeze({
    CONNECTING: "connecting",
    OPEN: "open",
    CLOSED: "closed",
})

/** Connection states after which the link is considered gone. */
const LOST_CONNECTION_STATES = new Set(["disconnected", "failed", "closed"])

/**
 * One `RTCPeerConnection` with a single data channel and manual signaling:
 * the host calls `createOffer()`, the guest `acceptOffer(code)` and the host
 * finishes with `acceptAnswer(code)`. Codes already contain every ICE
 * candidate, so no signaling server is needed.
 *
 * Set `onMessage(message)` and `onStateChange(state)` to listen; invalid
 * messages from the peer are dropped.
 */
export class PeerConnection {
    #connection
    #channel = null
    #state = PEER_STATE.CONNECTING

    onMessage = () => {}
    onStateChange = () => {}

    constructor(config = RTC_CONFIG) {
        this.#connection = new RTCPeerConnection(config)
        this.#connection.addEventListener("datachannel", (event) => this.#bindChannel(event.channel))
        this.#connection.addEventListener("connectionstatechange", () => {
            if (LOST_CONNECTION_STATES.has(this.#connection.connectionState)) this.#setState(PEER_STATE.CLOSED)
        })
    }

    get state() {
        return this.#state
    }

    get isOpen() {
        return this.#state === PEER_STATE.OPEN
    }

    /** Host side: returns the offer code to give to the guest. */
    async createOffer() {
        this.#bindChannel(this.#connection.createDataChannel(DATA_CHANNEL_LABEL))
        await this.#connection.setLocalDescription(await this.#connection.createOffer())
        return this.#localCode()
    }

    /** Guest side: reads the host's offer code and returns the answer code. */
    async acceptOffer(code) {
        await this.#connection.setRemoteDescription(decodeSignal(code, SIGNAL_TYPE.OFFER))
        await this.#connection.setLocalDescription(await this.#connection.createAnswer())
        return this.#localCode()
    }

    /** Host side: reads the guest's answer code; the channel opens shortly after. */
    async acceptAnswer(code) {
        await this.#connection.setRemoteDescription(decodeSignal(code, SIGNAL_TYPE.ANSWER))
    }

    send(message) {
        if (this.isOpen) this.#channel.send(encodeMessage(message))
    }

    close() {
        this.#channel?.close()
        this.#connection.close()
        this.#setState(PEER_STATE.CLOSED)
    }

    async #localCode() {
        await this.#iceGatheringComplete()
        return encodeSignal(this.#connection.localDescription)
    }

    #iceGatheringComplete() {
        const connection = this.#connection
        if (connection.iceGatheringState === "complete") return Promise.resolve()
        return new Promise((resolve) => {
            const finish = () => {
                clearTimeout(timer)
                connection.removeEventListener("icegatheringstatechange", handleChange)
                resolve()
            }
            const handleChange = () => {
                if (connection.iceGatheringState === "complete") finish()
            }
            const timer = setTimeout(finish, ICE_GATHERING_TIMEOUT_MS)
            connection.addEventListener("icegatheringstatechange", handleChange)
        })
    }

    #bindChannel(channel) {
        this.#channel = channel
        channel.addEventListener("open", () => this.#setState(PEER_STATE.OPEN))
        channel.addEventListener("close", () => this.#setState(PEER_STATE.CLOSED))
        channel.addEventListener("message", (event) => this.#receive(event.data))
    }

    #receive(data) {
        try {
            this.onMessage(decodeMessage(data))
        } catch (error) {
            if (!(error instanceof ProtocolError)) throw error
            console.warn("Dropped invalid message from peer:", error.message)
        }
    }

    #setState(state) {
        if (this.#state === state || this.#state === PEER_STATE.CLOSED) return
        this.#state = state
        this.onStateChange(state)
    }
}
