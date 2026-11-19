import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { EventBus } from "../src/core/event-bus.js"
import { MatchTracker } from "../src/progress/match-tracker.js"

function createTracker() {
    const events = new EventBus()
    const tracker = new MatchTracker({ events })
    const game = { players: [{ id: 1, score: 4 }, { id: 2, score: 9 }], difficulty: { id: "hard" } }
    tracker.setup(game)
    return { events, tracker }
}

describe("MatchTracker", () => {
    it("summarizes the match from the game", () => {
        const { tracker } = createTracker()
        const summary = tracker.snapshot()
        assert.equal(summary.score, 9)
        assert.equal(summary.players, 2)
        assert.equal(summary.difficulty, "hard")
    })

    it("adds up collected coin values and running time", () => {
        const { events, tracker } = createTracker()
        events.emit("coin:collected", { coin: { value: 2 } })
        events.emit("coin:collected", { coin: { value: 1 } })
        tracker.update(0.5)
        tracker.update(0.25)
        assert.equal(tracker.snapshot().coins, 3)
        assert.equal(tracker.snapshot().durationSeconds, 0.75)
    })

    it("stops the flawless timer once a life is lost", () => {
        const { events, tracker } = createTracker()
        events.emit("lives:changed", { player: { id: 1 }, lives: 3 })
        tracker.update(2)
        events.emit("lives:changed", { player: { id: 1 }, lives: 2 })
        tracker.update(5)
        assert.equal(tracker.snapshot().flawlessSeconds, 2)
        assert.equal(tracker.livesLost, 1)
    })

    it("counts the first life lost after setup", () => {
        const { events, tracker } = createTracker()
        tracker.setup({ players: [{ id: 1, lives: 3 }], difficulty: { id: "normal" } })
        events.emit("lives:changed", { player: { id: 1 }, lives: 2 })
        assert.equal(tracker.livesLost, 1)
    })

    it("keeps the highest level reached", () => {
        const { events, tracker } = createTracker()
        events.emit("level:changed", { level: { id: "night" }, number: 3, isFirst: false })
        events.emit("level:changed", 2)
        assert.equal(tracker.snapshot().level, 3)
    })

    it("starts fresh on every setup", () => {
        const { events, tracker } = createTracker()
        events.emit("coin:collected", { coin: { value: 1 } })
        tracker.update(1)
        tracker.setup({ players: [], difficulty: { id: "easy" } })
        assert.deepEqual(tracker.snapshot(), {
            score: 0, coins: 0, durationSeconds: 0, flawlessSeconds: 0, level: 0, difficulty: "easy", players: 0,
        })
    })
})
