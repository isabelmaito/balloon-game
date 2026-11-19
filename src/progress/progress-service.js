import { findNewlyUnlocked } from "./achievements/evaluator.js"
import { coinValue } from "./match-tracker.js"

/**
 * Turns game events into persistent progress. Emits:
 * - `achievement:unlocked` `{ achievement, date }` once per new achievement;
 * - `progress:match-recorded` `{ match, rank, isRecord }` after each game over;
 * - `progress:reset` when every record is wiped.
 */
export class ProgressService {
    constructor({ events, tracker, store, highScores, ledger, catalog, clock = Date.now }) {
        this.events = events
        this.tracker = tracker
        this.store = store
        this.highScores = highScores
        this.ledger = ledger
        this.catalog = catalog
        this.clock = clock
        events.on("coin:collected", ({ coin }) => this.#handleCoin(coin))
        events.on("game:over", () => this.#handleGameOver())
    }

    reset() {
        this.store.reset()
        this.highScores.reset()
        this.ledger.reset()
        this.events.emit("progress:reset")
    }

    #handleCoin(coin) {
        if (this.tracker.isMirror) return
        // The tracker listened first, so its snapshot already includes this coin.
        this.store.addCoins(coinValue(coin))
        this.store.recordMatchProgress(this.tracker.snapshot())
        this.#unlockAchievements()
    }

    #handleGameOver() {
        if (this.tracker.isMirror) return
        const date = this.clock()
        const summary = this.tracker.snapshot()
        const { rank, isRecord, previousBest } = this.highScores.submit({
            score: summary.score,
            date,
            difficulty: summary.difficulty,
        })
        const match = { ...summary, brokeRecord: isRecord && previousBest > 0 }
        this.store.recordFinishedMatch(match)
        this.#unlockAchievements()
        this.events.emit("progress:match-recorded", { match, rank, isRecord })
    }

    #unlockAchievements() {
        const unlocked = findNewlyUnlocked(this.catalog, this.store.stats, (id) => this.ledger.isUnlocked(id))
        if (unlocked.length === 0) return
        const date = this.clock()
        this.ledger.unlock(unlocked.map(({ id }) => id), date)
        for (const achievement of unlocked) this.events.emit("achievement:unlocked", { achievement, date })
    }
}
