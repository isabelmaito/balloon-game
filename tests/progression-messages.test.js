import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { DIFFICULTIES } from "../src/game/difficulty.js"
import { LOCALES } from "../src/i18n/locales/index.js"
import { LEVELS, levelNameKey } from "../src/progression/levels.js"
import { PROGRESSION_MESSAGES } from "../src/progression/messages.js"

const bundles = Object.entries(PROGRESSION_MESSAGES)

describe("progression messages", () => {
    it("ship every supported locale", () => {
        for (const { code } of LOCALES) assert.ok(PROGRESSION_MESSAGES[code], code)
    })

    it("define the same keys in every locale", () => {
        const [, reference] = bundles[0]
        for (const [, messages] of bundles) {
            assert.deepEqual(Object.keys(messages).sort(), Object.keys(reference).sort())
        }
    })

    it("name every level and difficulty", () => {
        const keys = [
            ...LEVELS.map(levelNameKey),
            ...Object.keys(DIFFICULTIES).map((id) => `difficulty.${id}`),
        ]
        for (const [locale, messages] of bundles) {
            for (const key of keys) assert.ok(messages[key], `${locale} is missing ${key}`)
        }
    })
})
