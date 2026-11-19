import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { SKINS } from "../src/game/skins.js"
import { ACTIONS } from "../src/input/bindings.js"
import { LOCALES } from "../src/i18n/locales/index.js"
import { MESSAGES } from "../src/multiplayer/messages.js"

const keysOf = (locale) => Object.keys(MESSAGES[locale]).sort()

describe("multiplayer messages", () => {
    it("translates every key in every base locale", () => {
        const reference = keysOf("en")
        for (const { code } of LOCALES) assert.deepEqual(keysOf(code), reference, code)
    })

    it("names every skin and action", () => {
        for (const skin of SKINS) assert.ok(MESSAGES.en[skin.messageKey], skin.id)
        for (const action of ACTIONS) assert.ok(MESSAGES.en[`controls.action.${action}`], action)
    })
})
