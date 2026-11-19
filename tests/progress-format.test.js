import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { i18n } from "../src/i18n/index.js"
import "../src/progress/messages.js"
import { formatDuration, formatProgress } from "../src/progress/ui/format.js"
import { PROGRESS_UNIT } from "../src/progress/units.js"

describe("progress formatting", () => {
    it("splits durations into minutes and seconds", () => {
        i18n.setLocale("en")
        assert.equal(formatDuration(125.9), "2m 5s")
    })

    it("formats progress by unit", () => {
        i18n.setLocale("en")
        assert.equal(formatProgress({ unit: PROGRESS_UNIT.COUNT }, { current: 3.7, goal: 10 }), "3 / 10")
        assert.equal(formatProgress({ unit: PROGRESS_UNIT.SECONDS }, { current: 45.2, goal: 120 }), "45s / 120s")
    })
})
