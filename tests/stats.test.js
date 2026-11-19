import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { EMPTY_STATS, addCoins, applyMatchRecords, countFinishedMatch, normalizeStats } from "../src/progress/stats.js"

function match(overrides = {}) {
    return {
        score: 10,
        coins: 4,
        durationSeconds: 30,
        flawlessSeconds: 12,
        level: 2,
        difficulty: "normal",
        players: 1,
        brokeRecord: false,
        ...overrides,
    }
}

describe("stats", () => {
    describe("normalizeStats", () => {
        it("starts from empty stats when nothing is stored", () => {
            assert.deepEqual(normalizeStats(undefined), EMPTY_STATS)
            assert.deepEqual(normalizeStats(null), EMPTY_STATS)
        })

        it("keeps known, finite, non-negative numbers only", () => {
            const stats = normalizeStats({ wallet: 7, bestScore: -1, bestLevel: "3", hardMatches: NaN, extra: 9 })
            assert.deepEqual(stats, { ...EMPTY_STATS, wallet: 7 })
        })
    })

    describe("addCoins", () => {
        it("adds to the wallet without touching the input", () => {
            const stats = { ...EMPTY_STATS, wallet: 5 }
            assert.equal(addCoins(stats, 3).wallet, 8)
            assert.equal(stats.wallet, 5)
        })
    })

    describe("applyMatchRecords", () => {
        it("raises every best-of record", () => {
            assert.deepEqual(applyMatchRecords(EMPTY_STATS, match()), {
                ...EMPTY_STATS,
                bestScore: 10,
                bestMatchCoins: 4,
                longestMatchSeconds: 30,
                longestFlawlessSeconds: 12,
                bestLevel: 2,
            })
        })

        it("never lowers a record", () => {
            const stats = applyMatchRecords(EMPTY_STATS, match({ score: 50, level: 5 }))
            const next = applyMatchRecords(stats, match({ score: 20, level: 1 }))
            assert.equal(next.bestScore, 50)
            assert.equal(next.bestLevel, 5)
        })

        it("is safe to repeat and leaves match counters alone", () => {
            const once = applyMatchRecords(EMPTY_STATS, match())
            assert.deepEqual(applyMatchRecords(once, match()), once)
            assert.equal(once.matchesPlayed, 0)
        })

        it("treats missing fields as zero", () => {
            assert.deepEqual(applyMatchRecords(EMPTY_STATS, {}), EMPTY_STATS)
        })
    })

    describe("countFinishedMatch", () => {
        it("counts a normal single-player match", () => {
            const stats = countFinishedMatch(EMPTY_STATS, match())
            assert.equal(stats.matchesPlayed, 1)
            assert.equal(stats.hardMatches, 0)
            assert.equal(stats.multiplayerMatches, 0)
            assert.equal(stats.recordsBroken, 0)
            assert.equal(stats.bestScore, 10)
        })

        it("counts hard-difficulty matches", () => {
            const stats = countFinishedMatch(EMPTY_STATS, match({ difficulty: "hard" }))
            assert.equal(stats.hardMatches, 1)
            assert.equal(stats.multiplayerMatches, 0)
        })

        it("counts two-player matches as multiplayer", () => {
            const stats = countFinishedMatch(EMPTY_STATS, match({ players: 2 }))
            assert.equal(stats.multiplayerMatches, 1)
            assert.equal(stats.hardMatches, 0)
        })

        it("counts a hard two-player match in both counters", () => {
            const stats = countFinishedMatch(EMPTY_STATS, match({ difficulty: "hard", players: 2, brokeRecord: true }))
            assert.equal(stats.matchesPlayed, 1)
            assert.equal(stats.hardMatches, 1)
            assert.equal(stats.multiplayerMatches, 1)
            assert.equal(stats.recordsBroken, 1)
        })

        it("accumulates across matches without mutating the input", () => {
            const first = countFinishedMatch(EMPTY_STATS, match({ difficulty: "hard" }))
            const second = countFinishedMatch(first, match({ players: 2, score: 3 }))
            assert.equal(second.matchesPlayed, 2)
            assert.equal(second.hardMatches, 1)
            assert.equal(second.multiplayerMatches, 1)
            assert.equal(second.bestScore, 10)
            assert.equal(first.matchesPlayed, 1)
            assert.equal(EMPTY_STATS.matchesPlayed, 0)
        })

        it("keeps the wallet untouched", () => {
            const stats = countFinishedMatch({ ...EMPTY_STATS, wallet: 9 }, match())
            assert.equal(stats.wallet, 9)
        })
    })
})
