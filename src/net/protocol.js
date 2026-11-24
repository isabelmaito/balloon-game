import { POWER_UPS } from "../config.js"
import { HAZARD_KIND } from "../entities/hazard.js"
import { EFFECT } from "../game/effect-names.js"
import { isSkin } from "../game/skins.js"

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

/** Messages sent over the data channel once peers are connected. */
export const MESSAGE_TYPE = Object.freeze({
    HELLO: "hello",
    INPUT: "input",
    STATE: "state",
    START: "start",
    PAUSE: "pause",
    OVER: "over",
    LEAVE: "leave",
})

const AXIS_VALUES = new Set([-1, 0, 1])
const HAZARD_KINDS = new Set(Object.values(HAZARD_KIND))
const POWER_UP_KINDS = new Set(Object.keys(POWER_UPS))
const EFFECT_NAMES = new Set(Object.values(EFFECT))

const isAxis = (value) => AXIS_VALUES.has(value)
const isId = (value) => Number.isInteger(value) && value >= 0
const isCount = isId
const isNumber = (value) => Number.isFinite(value)
const isDistance = (value) => isNumber(value) && value >= 0
const isListOf = (value, isItem) => Array.isArray(value) && value.every(isItem)

const isDirection = (value) => isObject(value) && isAxis(value.x) && isAxis(value.y)
const isPosition = (value) => isObject(value) && isNumber(value.x) && isNumber(value.y)
const isBox = (value) => isPosition(value) && isNumber(value.w) && isNumber(value.h)
const isScore = (value) => isObject(value) && isId(value.id) && isNumber(value.score)
const isEffectName = (value) => EFFECT_NAMES.has(value)
const isPlayerState = (value) => isPosition(value) && isScore(value)
    && isCount(value.lives) && isListOf(value.effects, isEffectName)
/** Optional in `hello` so a peer on an older version still reaches the version check. */
const isOptionalSkin = (value) => value === undefined || isSkin(value)
const isCoinState = (value) => isPosition(value) && isId(value.id)
const isHazardState = (value) => isBox(value) && isId(value.id) && HAZARD_KINDS.has(value.kind)
const isPowerUpState = (value) => isBox(value) && isId(value.id) && POWER_UP_KINDS.has(value.kind)

const VALIDATORS = Object.freeze({
    [MESSAGE_TYPE.HELLO]: (message) => Number.isInteger(message.version) && isOptionalSkin(message.skin),
    [MESSAGE_TYPE.INPUT]: (message) => isDirection(message.direction),
    [MESSAGE_TYPE.STATE]: (message) => isListOf(message.players, isPlayerState)
        && isListOf(message.coins, isCoinState)
        && isListOf(message.hazards, isHazardState)
        && isListOf(message.powerUps, isPowerUpState)
        && isDistance(message.distance),
    [MESSAGE_TYPE.START]: (message) => typeof message.difficulty === "string" && isSkin(message.skin),
    [MESSAGE_TYPE.PAUSE]: (message) => typeof message.paused === "boolean",
    [MESSAGE_TYPE.OVER]: (message) => isListOf(message.scores, isScore),
    [MESSAGE_TYPE.LEAVE]: () => true,
})

export function isValidMessage(message) {
    return isObject(message) && Object.hasOwn(VALIDATORS, message.type) && VALIDATORS[message.type](message)
}

/** Builds a message, throwing early when the payload would be rejected by the peer. */
export function createMessage(type, payload = {}) {
    const message = { ...payload, type }
    if (!isValidMessage(message)) throw new ProtocolError(`Invalid ${type} message`)
    return message
}

export function encodeMessage(message) {
    if (!isValidMessage(message)) throw new ProtocolError(`Invalid ${message?.type} message`)
    return JSON.stringify(message)
}

/** Parses data received from the peer. Throws `ProtocolError` on anything unexpected. */
export function decodeMessage(text) {
    if (typeof text !== "string") throw new ProtocolError("Message is not text")
    const message = parseJson(text)
    if (!isValidMessage(message)) throw new ProtocolError(`Invalid ${message?.type} message`)
    return message
}
