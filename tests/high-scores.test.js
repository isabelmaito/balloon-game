import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { Storage } from "../src/core/storage.js"
import { HighScores, NOT_RANKED, insertScore } from "../src/progress/high-scores.js"
import { MemoryStorage } from "./helpers/memory-storage.js"

const entry = (score, date = 0) => ({ score, date, difficulty: "normal" })

describe("insertScore", () => {
    it("keeps the table sorted from best to worst", () => {
        const { entries, rank } = insertScore([entry(30), entry(10)], entry(20))
        assert.deepEqual(entries.map(({ score }) => score), [30, 20, 10])
        assert.equal(rank, 2)
    })

    it("places ties after older entries", () => {
        const { entries, rank } = insertScore([entry(20, 1)], entry(20, 2))
        assert.deepEqual(entries.map(({ date }) => date), [1, 2])
        assert.equal(rank, 2)
    })

    it("drops scores that do not fit the limit", () => {
        const { entries, rank } = insertScore([entry(3), entry(2)], entry(1), 2)
        assert.equal(entries.length, 2)
        assert.equal(rank, NOT_RANKED)
    })
})

describe("HighScores", () => {
    it("keeps the top five and persists them", () => {
        const storage = new Storage(new MemoryStorage())
        const table = new HighScores({ storage })
        for (const score of [5, 1, 7, 3, 9, 2]) table.submit(entry(score))
        assert.deepEqual(new HighScores({ storage }).entries.map(({ score }) => score), [9, 7, 5, 3, 2])
    })

    it("flags a new record only when the best score is beaten", () => {
        const table = new HighScores({ storage: new Storage(new MemoryStorage()) })
        assert.equal(table.submit(entry(10)).isRecord, true)
        assert.equal(table.submit(entry(10)).isRecord, false)
        const result = table.submit(entry(12))
        assert.equal(result.isRecord, true)
        assert.equal(result.previousBest, 10)
    })

    it("does not count an empty score as a record", () => {
        const table = new HighScores({ storage: new Storage(new MemoryStorage()) })
        assert.equal(table.submit(entry(0)).isRecord, false)
    })

    it("ignores malformed stored entries", () => {
        const storage = new Storage(new MemoryStorage())
        storage.write("progress.highScores", [entry(4), { score: "x" }, null])
        assert.deepEqual(new HighScores({ storage }).entries, [entry(4)])
    })
})
