import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { ACHIEVEMENTS } from "../src/progress/achievements/catalog.js"
import { PROGRESS_MESSAGES } from "../src/progress/messages.js"

const LOCALES = ["pt-BR", "en", "es"]

describe("progress messages", () => {
    it("provides the same keys in every locale", () => {
        const [reference, ...others] = LOCALES.map((locale) => Object.keys(PROGRESS_MESSAGES[locale]).sort())
        for (const keys of others) assert.deepEqual(keys, reference)
    })

    it("names and describes every achievement", () => {
        for (const locale of LOCALES) {
            for (const { nameKey, descriptionKey } of ACHIEVEMENTS) {
                assert.ok(PROGRESS_MESSAGES[locale][nameKey], `${locale} ${nameKey}`)
                assert.ok(PROGRESS_MESSAGES[locale][descriptionKey], `${locale} ${descriptionKey}`)
            }
        }
    })
})
