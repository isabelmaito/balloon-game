import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { ProtocolError, SIGNAL_TYPE, decodeSignal, encodeSignal } from "../src/net/protocol.js"

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
