import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { ACHIEVEMENTS } from "../src/progress/achievements/catalog.js"
import { findNewlyUnlocked, progressOf } from "../src/progress/achievements/evaluator.js"
import { AchievementLedger } from "../src/progress/achievements/ledger.js"
import { EMPTY_STATS } from "../src/progress/stats.js"
import { Storage } from "../src/core/storage.js"
import { MemoryStorage } from "./helpers/memory-storage.js"

const MIN_ACHIEVEMENTS = 8
const byId = (id) => ACHIEVEMENTS.find((achievement) => achievement.id === id)
const unlockedIds = (stats, unlocked = []) =>
    findNewlyUnlocked(ACHIEVEMENTS, { ...EMPTY_STATS, ...stats }, (id) => unlocked.includes(id))
        .map(({ id }) => id)

describe("achievement catalog", () => {
    it("has enough achievements with unique ids", () => {
        const ids = ACHIEVEMENTS.map(({ id }) => id)
        assert.ok(ids.length >= MIN_ACHIEVEMENTS)
        assert.equal(new Set(ids).size, ids.length)
    })

    it("locks everything for a new player", () => {
        assert.deepEqual(unlockedIds({}), [])
    })
})

describe("progressOf", () => {
    it("reports partial progress", () => {
        const progress = progressOf(byId("treasure-hoard"), { ...EMPTY_STATS, wallet: 125 })
        assert.deepEqual(progress, { current: 125, goal: 500, ratio: 0.25, done: false })
    })

    it("caps progress at the goal", () => {
        const progress = progressOf(byId("first-coin"), { ...EMPTY_STATS, wallet: 40 })
        assert.equal(progress.current, 1)
        assert.equal(progress.done, true)
    })

    it("treats missing measurements as zero", () => {
        assert.equal(progressOf(byId("climber"), {}).current, 0)
    })
})

describe("findNewlyUnlocked", () => {
    it("unlocks coin achievements", () => {
        assert.deepEqual(unlockedIds({ wallet: 1 }), ["first-coin"])
        assert.deepEqual(unlockedIds({ wallet: 500, bestMatchCoins: 50 }), ["first-coin", "coin-rush", "treasure-hoard"])
    })

    it("unlocks match achievements", () => {
        const stats = { matchesPlayed: 10, longestMatchSeconds: 120, hardMatches: 1, multiplayerMatches: 1 }
        assert.deepEqual(unlockedIds(stats), ["regular", "survivor", "daredevil", "teamwork"])
    })

    it("unlocks record, lives and level achievements", () => {
        const stats = { recordsBroken: 1, longestFlawlessSeconds: 60, bestLevel: 5 }
        assert.deepEqual(unlockedIds(stats), ["record-breaker", "untouchable", "climber"])
    })

    it("skips achievements that are already unlocked", () => {
        assert.deepEqual(unlockedIds({ wallet: 500 }, ["first-coin"]), ["treasure-hoard"])
    })
})

describe("AchievementLedger", () => {
    it("persists unlocked achievements with their date", () => {
        const storage = new Storage(new MemoryStorage())
        new AchievementLedger({ storage }).unlock(["first-coin"], 1000)
        const ledger = new AchievementLedger({ storage })
        assert.equal(ledger.isUnlocked("first-coin"), true)
        assert.equal(ledger.unlockedAt("first-coin"), 1000)
        assert.equal(ledger.count, 1)
    })

    it("forgets everything on reset", () => {
        const ledger = new AchievementLedger({ storage: new Storage(new MemoryStorage()) })
        ledger.unlock(["regular"], 1)
        ledger.reset()
        assert.equal(ledger.isUnlocked("regular"), false)
    })
})
