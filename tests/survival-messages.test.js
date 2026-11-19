import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { i18n } from "../src/i18n/index.js"
import { SURVIVAL_MESSAGES } from "../src/ui/survival/messages.js"

describe("survival messages", () => {
    it("define the same keys in every locale", () => {
        const [reference, ...others] = Object.values(SURVIVAL_MESSAGES).map((messages) => Object.keys(messages).sort())
        for (const keys of others) assert.deepEqual(keys, reference)
    })

    it("only target locales the game ships", () => {
        for (const locale of Object.keys(SURVIVAL_MESSAGES)) assert.equal(i18n.has(locale), true)
    })
})
