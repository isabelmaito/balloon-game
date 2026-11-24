import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { PROTOCOL_VERSION } from "../src/net/config.js"
import { MESSAGE_TYPE, isValidMessage } from "../src/net/protocol.js"

const hello = (fields) => ({ type: MESSAGE_TYPE.HELLO, version: PROTOCOL_VERSION, ...fields })
const start = (fields) => ({ type: MESSAGE_TYPE.START, difficulty: "normal", skin: "party", ...fields })

describe("skins in online messages", () => {
    it("accepts a hello announcing a known skin", () => {
        assert.equal(isValidMessage(hello({ skin: "hot-air" })), true)
    })

    it("accepts a hello without skin so older peers reach the version check", () => {
        assert.equal(isValidMessage(hello({ version: 1 })), true)
    })

    it("rejects a hello with an unknown skin", () => {
        assert.equal(isValidMessage(hello({ skin: "dragon" })), false)
    })

    it("rejects a hello with a skin that is not text", () => {
        assert.equal(isValidMessage(hello({ skin: 3 })), false)
    })

    it("accepts a start with the host skin", () => {
        assert.equal(isValidMessage(start()), true)
    })

    it("rejects a start without skin", () => {
        assert.equal(isValidMessage(start({ skin: undefined })), false)
    })

    it("rejects a start with an unknown skin", () => {
        assert.equal(isValidMessage(start({ skin: "balloon--party" })), false)
    })
})
