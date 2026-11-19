import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
    MESSAGE_TYPE,
    ProtocolError,
    SIGNAL_TYPE,
    createMessage,
    decodeMessage,
    decodeSignal,
    encodeMessage,
    encodeSignal,
    isValidMessage,
} from "../src/net/protocol.js"

const OFFER = { type: SIGNAL_TYPE.OFFER, sdp: "v=0\r\no=- 1 2 IN IP4 127.0.0.1\r\n" }

describe("signaling codes", () => {
    it("round-trips a session description", () => {
        assert.deepEqual(decodeSignal(encodeSignal(OFFER), SIGNAL_TYPE.OFFER), OFFER)
    })

    it("produces plain base64", () => {
        assert.match(encodeSignal(OFFER), /^[A-Za-z0-9+/]+=*$/)
    })

    it("keeps non-ASCII characters intact", () => {
        const signal = { type: SIGNAL_TYPE.ANSWER, sdp: "s=balão ¿qué?" }
        assert.deepEqual(decodeSignal(encodeSignal(signal), SIGNAL_TYPE.ANSWER), signal)
    })

    it("ignores whitespace added while copying", () => {
        const code = encodeSignal(OFFER)
        const messy = `  ${code.slice(0, 10)}\n${code.slice(10)}\n`
        assert.deepEqual(decodeSignal(messy, SIGNAL_TYPE.OFFER), OFFER)
    })

    it("drops unknown fields", () => {
        const code = encodeSignal({ ...OFFER, extra: "ignored" })
        assert.deepEqual(Object.keys(decodeSignal(code, SIGNAL_TYPE.OFFER)), ["type", "sdp"])
    })

    it("rejects a code of the other type", () => {
        assert.throws(() => decodeSignal(encodeSignal(OFFER), SIGNAL_TYPE.ANSWER), ProtocolError)
    })

    it("rejects text that is not base64", () => {
        assert.throws(() => decodeSignal("not a code!", SIGNAL_TYPE.OFFER), ProtocolError)
    })

    it("rejects base64 that is not JSON", () => {
        assert.throws(() => decodeSignal(btoa("hello"), SIGNAL_TYPE.OFFER), ProtocolError)
    })

    it("rejects JSON without a session description", () => {
        const code = btoa(JSON.stringify({ type: SIGNAL_TYPE.OFFER }))
        assert.throws(() => decodeSignal(code, SIGNAL_TYPE.OFFER), ProtocolError)
    })

    it("rejects an empty code", () => {
        assert.throws(() => decodeSignal("", SIGNAL_TYPE.OFFER), ProtocolError)
    })
})

describe("data channel messages", () => {
    const VALID = [
        createMessage(MESSAGE_TYPE.HELLO, { version: 1 }),
        createMessage(MESSAGE_TYPE.INPUT, { direction: { x: -1, y: 1 } }),
        createMessage(MESSAGE_TYPE.STATE, {
            players: [{ id: 1, x: 0.1, y: 0.4, score: 3 }],
            coins: [{ id: 7, x: 0.9, y: 0.5 }],
        }),
        createMessage(MESSAGE_TYPE.STATE, { players: [], coins: [] }),
        createMessage(MESSAGE_TYPE.START, { difficulty: "hard" }),
        createMessage(MESSAGE_TYPE.PAUSE, { paused: true }),
        createMessage(MESSAGE_TYPE.OVER, { scores: [{ id: 1, score: 2 }, { id: 2, score: 5 }] }),
        createMessage(MESSAGE_TYPE.LEAVE),
    ]

    for (const message of VALID) {
        it(`round-trips a ${message.type} message`, () => {
            assert.deepEqual(decodeMessage(encodeMessage(message)), message)
        })
    }

    it("lets the type win over a payload field with the same name", () => {
        assert.equal(createMessage(MESSAGE_TYPE.LEAVE, { type: "input" }).type, MESSAGE_TYPE.LEAVE)
    })

    const INVALID = {
        "an unknown type": { type: "teleport" },
        "an inherited type name": { type: "toString" },
        "a missing type": { version: 1 },
        "an array": [MESSAGE_TYPE.LEAVE],
        "null": null,
        "a hello without version": { type: MESSAGE_TYPE.HELLO },
        "a fractional version": { type: MESSAGE_TYPE.HELLO, version: 1.5 },
        "an input with a fast axis": { type: MESSAGE_TYPE.INPUT, direction: { x: 2, y: 0 } },
        "an input without direction": { type: MESSAGE_TYPE.INPUT },
        "a state without coins": { type: MESSAGE_TYPE.STATE, players: [] },
        "a state with a NaN position": {
            type: MESSAGE_TYPE.STATE,
            players: [{ id: 1, x: Number.NaN, y: 0, score: 0 }],
            coins: [],
        },
        "a state with a coin without id": { type: MESSAGE_TYPE.STATE, players: [], coins: [{ x: 0, y: 0 }] },
        "a start without difficulty": { type: MESSAGE_TYPE.START },
        "a pause with a string flag": { type: MESSAGE_TYPE.PAUSE, paused: "yes" },
        "an over with a negative id": { type: MESSAGE_TYPE.OVER, scores: [{ id: -1, score: 0 }] },
    }

    for (const [name, message] of Object.entries(INVALID)) {
        it(`rejects ${name}`, () => {
            assert.equal(isValidMessage(message), false)
            assert.throws(() => decodeMessage(JSON.stringify(message)), ProtocolError)
        })
    }

    it("refuses to build an invalid message", () => {
        assert.throws(() => createMessage(MESSAGE_TYPE.INPUT, { direction: { x: 0.5, y: 0 } }), ProtocolError)
    })

    it("refuses to encode an invalid message", () => {
        assert.throws(() => encodeMessage({ type: MESSAGE_TYPE.PAUSE }), ProtocolError)
    })

    it("rejects data that is not JSON text", () => {
        assert.throws(() => decodeMessage("{oops"), ProtocolError)
        assert.throws(() => decodeMessage(new ArrayBuffer(4)), ProtocolError)
    })
})
