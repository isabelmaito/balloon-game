import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { Storage } from "../src/core/storage.js"
import { ProgressStore } from "../src/progress/progress-store.js"
import { EMPTY_STATS, applyMatchRecords, countFinishedMatch, normalizeStats } from "../src/progress/stats.js"
import { MemoryStorage } from "./helpers/memory-storage.js"

const match = (overrides = {}) => ({
    score: 10,
    coins: 10,
    durationSeconds: 30,
    flawlessSeconds: 20,
    level: 2,
    difficulty: "normal",
    players: 1,
    brokeRecord: false,
    ...overrides,
})

describe("stats reducers", () => {
    it("drops unknown and invalid stored fields", () => {
        const stats = normalizeStats({ wallet: 4, bestScore: -1, junk: 9, matchesPlayed: "3" })
        assert.deepEqual(stats, { ...EMPTY_STATS, wallet: 4 })
    })

    it("keeps the best records without counting the match", () => {
        const stats = applyMatchRecords({ ...EMPTY_STATS, bestMatchCoins: 50 }, match())
        assert.equal(stats.bestMatchCoins, 50)
        assert.equal(stats.longestMatchSeconds, 30)
        assert.equal(stats.matchesPlayed, 0)
    })

    it("counts hard, multiplayer and record-breaking matches", () => {
        const stats = countFinishedMatch(EMPTY_STATS, match({ difficulty: "hard", players: 2, brokeRecord: true }))
        assert.equal(stats.matchesPlayed, 1)
        assert.equal(stats.hardMatches, 1)
        assert.equal(stats.multiplayerMatches, 1)
        assert.equal(stats.recordsBroken, 1)
    })

    it("ignores missing optional match fields", () => {
        const stats = countFinishedMatch(EMPTY_STATS, { score: 3, players: 1 })
        assert.equal(stats.bestLevel, 0)
        assert.equal(stats.bestMatchCoins, 0)
    })
})

describe("ProgressStore", () => {
    it("persists the wallet across instances", () => {
        const storage = new Storage(new MemoryStorage())
        const store = new ProgressStore({ storage })
        store.addCoins(3)
        store.addCoins(2)
        assert.equal(new ProgressStore({ storage }).stats.wallet, 5)
    })

    it("resets every statistic", () => {
        const store = new ProgressStore({ storage: new Storage(new MemoryStorage()) })
        store.recordFinishedMatch(match())
        store.reset()
        assert.deepEqual(store.stats, EMPTY_STATS)
    })
})
