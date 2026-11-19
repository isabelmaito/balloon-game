/**
 * Pure wire format of the online mode: signaling codes exchanged by hand and
 * messages sent over the data channel. No browser API besides base64 is used,
 * so everything here runs under node for tests.
 */

export const SIGNAL_TYPE = Object.freeze({
    OFFER: "offer",
    ANSWER: "answer",
})

/** Thrown for any code or message that does not follow the protocol. */
export class ProtocolError extends Error {
    constructor(message) {
        super(message)
        this.name = "ProtocolError"
    }
}

function toBase64(text) {
    const bytes = new TextEncoder().encode(text)
    let binary = ""
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return btoa(binary)
}

function fromBase64(code) {
    const binary = atob(code)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes)
}

function parseJson(text) {
    try {
        return JSON.parse(text)
    } catch {
        throw new ProtocolError("Not valid JSON")
    }
}

const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value)

/** Turns a session description (`{ type, sdp }`) into a copy-pasteable code. */
export function encodeSignal({ type, sdp }) {
    return toBase64(JSON.stringify({ type, sdp }))
}

/**
 * Reads a code produced by `encodeSignal`. Whitespace added while copying is
 * ignored. Throws `ProtocolError` when the code is broken or of another type.
 */
export function decodeSignal(code, expectedType) {
    let text
    try {
        text = fromBase64(String(code).replace(/\s+/g, ""))
    } catch {
        throw new ProtocolError("Signal is not valid base64")
    }
    const signal = parseJson(text)
    if (!isObject(signal) || typeof signal.sdp !== "string" || signal.sdp === "") {
        throw new ProtocolError("Signal has no session description")
    }
    if (signal.type !== expectedType) {
        throw new ProtocolError(`Expected a ${expectedType} signal, got ${signal.type}`)
    }
    return { type: signal.type, sdp: signal.sdp }
}
