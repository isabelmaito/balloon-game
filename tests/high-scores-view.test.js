import { after, before, describe, it } from "node:test"
import assert from "node:assert/strict"
import { Storage } from "../src/core/storage.js"
import "../src/progress/messages.js"
import { HighScores } from "../src/progress/high-scores.js"
import { ProgressStore } from "../src/progress/progress-store.js"
import { HighScoresView } from "../src/progress/ui/high-scores-view.js"
import { createFakeElement, installFakeDocument } from "./helpers/fake-dom.js"
import { MemoryStorage } from "./helpers/memory-storage.js"

const DAY = 1_700_000_000_000

function createView({ finishedScores, abandonedScore }) {
    const storage = new Storage(new MemoryStorage())
    const highScores = new HighScores({ storage })
    const store = new ProgressStore({ storage })
    for (const score of finishedScores) {
        highScores.submit({ score, date: DAY, difficulty: "normal" })
        store.recordFinishedMatch({ score, coins: score, durationSeconds: 60, players: 1 })
    }
    // A match quit halfway reports progress on every coin but never finishes.
    store.recordMatchProgress({ score: abandonedScore, coins: abandonedScore, durationSeconds: 90 })
    const elements = {
        "high-scores": createFakeElement("ol"),
        "high-scores-empty": createFakeElement("p"),
        "progress-stats": createFakeElement("ul"),
    }
    const root = { querySelector: (selector) => elements[/data-role="([^"]+)"/.exec(selector)[1]] }
    const view = new HighScoresView({ root, highScores, store })
    view.render()
    return { elements }
}

describe("HighScoresView", () => {
    let restoreDocument

    before(() => {
        restoreDocument = installFakeDocument()
    })

    after(() => restoreDocument())

    it("reports the same best score as the top of the high score table", () => {
        const { elements } = createView({ finishedScores: [37, 25], abandonedScore: 50 })
        const lines = elements["progress-stats"].children.map(({ textContent }) => textContent)
        assert.ok(lines.includes("Melhor pontuação: 37"), lines.join(" | "))
    })
})
