import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { EventBus } from "../src/core/event-bus.js"
import { Storage } from "../src/core/storage.js"
import { ACHIEVEMENTS } from "../src/progress/achievements/catalog.js"
import { AchievementLedger } from "../src/progress/achievements/ledger.js"
import { HighScores } from "../src/progress/high-scores.js"
import { MatchTracker } from "../src/progress/match-tracker.js"
import { ProgressService } from "../src/progress/progress-service.js"
import { ProgressStore } from "../src/progress/progress-store.js"
import { MemoryStorage } from "./helpers/memory-storage.js"

const NOW = 1_700_000_000_000

function createService({ players = [{ id: 1, score: 0 }], difficulty = "normal" } = {}) {
    const storage = new Storage(new MemoryStorage())
    const events = new EventBus()
    const tracker = new MatchTracker({ events })
    const game = { players, difficulty: { id: difficulty } }
    tracker.setup(game)
    const service = new ProgressService({
        events,
        tracker,
        store: new ProgressStore({ storage }),
        highScores: new HighScores({ storage }),
        ledger: new AchievementLedger({ storage }),
        catalog: ACHIEVEMENTS,
        clock: () => NOW,
    })
    const emitted = { unlocked: [], recorded: [] }
    events.on("achievement:unlocked", ({ achievement }) => emitted.unlocked.push(achievement.id))
    events.on("progress:match-recorded", (payload) => emitted.recorded.push(payload))
    const collect = (player) => {
        player.score += 1
        events.emit("coin:collected", { player, coin: { value: 1 } })
    }
    return { service, events, tracker, game, emitted, collect }
}

describe("ProgressService", () => {
    it("fills the wallet and unlocks the first coin achievement once", () => {
        const { service, game, emitted, collect } = createService()
        collect(game.players[0])
        collect(game.players[0])
        assert.equal(service.store.stats.wallet, 2)
        assert.deepEqual(emitted.unlocked, ["first-coin"])
    })

    it("records a finished match and its high score", () => {
        const { service, events, game, emitted, collect } = createService()
        collect(game.players[0])
        events.emit("game:over", { players: game.players })
        assert.equal(service.store.stats.matchesPlayed, 1)
        assert.deepEqual(service.highScores.entries, [{ score: 1, date: NOW, difficulty: "normal" }])
        assert.equal(emitted.recorded[0].isRecord, true)
        assert.equal(emitted.recorded[0].rank, 1)
    })

    it("unlocks hard and multiplayer achievements at game over", () => {
        const players = [{ id: 1, score: 0 }, { id: 2, score: 0 }]
        const { events, emitted } = createService({ players, difficulty: "hard" })
        events.emit("game:over", { players })
        assert.deepEqual(emitted.unlocked, ["daredevil", "teamwork"])
    })

    it("counts a broken record only when a previous best existed", () => {
        const { service, events, tracker, game, emitted, collect } = createService()
        collect(game.players[0])
        events.emit("game:over", { players: game.players })
        tracker.setup(game)
        collect(game.players[0])
        events.emit("game:over", { players: game.players })
        assert.equal(service.store.stats.recordsBroken, 1)
        assert.ok(emitted.unlocked.includes("record-breaker"))
    })

    it("wipes every record on reset", () => {
        const { service, events, game, collect } = createService()
        let resets = 0
        events.on("progress:reset", () => resets++)
        collect(game.players[0])
        events.emit("game:over", { players: game.players })
        service.reset()
        assert.equal(service.store.stats.wallet, 0)
        assert.deepEqual(service.highScores.entries, [])
        assert.equal(service.ledger.count, 0)
        assert.equal(resets, 1)
    })
})
