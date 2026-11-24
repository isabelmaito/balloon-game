import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { DEFAULT_LOCALE, LOCALES } from "../src/i18n/locales/index.js"
import { MESSAGES as MULTIPLAYER_MESSAGES } from "../src/multiplayer/messages.js"
import { ONLINE_MESSAGES } from "../src/net/messages.js"
import { PROGRESS_MESSAGES } from "../src/progress/messages.js"
import { PROGRESSION_MESSAGES } from "../src/progression/messages.js"
import { SURVIVAL_MESSAGES } from "../src/ui/survival/messages.js"

const BASE_MESSAGES = Object.fromEntries(LOCALES.map(({ code, messages }) => [code, messages]))

const BUNDLES = {
    base: BASE_MESSAGES,
    multiplayer: MULTIPLAYER_MESSAGES,
    online: ONLINE_MESSAGES,
    progress: PROGRESS_MESSAGES,
    progression: PROGRESSION_MESSAGES,
    survival: SURVIVAL_MESSAGES,
}

const sortedKeys = (messages) => Object.keys(messages ?? {}).sort()

describe("locale coverage", () => {
    for (const [name, bundle] of Object.entries(BUNDLES)) {
        it(`${name} messages exist in every selectable locale`, () => {
            const reference = sortedKeys(bundle[DEFAULT_LOCALE])
            for (const { code } of LOCALES) {
                assert.deepEqual(sortedKeys(bundle[code]), reference, `${name} / ${code}`)
            }
        })
    }
})
