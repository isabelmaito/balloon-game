import "./messages.js"
import { ACHIEVEMENTS } from "./achievements/catalog.js"
import { AchievementLedger } from "./achievements/ledger.js"
import { HighScores } from "./high-scores.js"
import { MatchTracker } from "./match-tracker.js"
import { ProgressService } from "./progress-service.js"
import { ProgressStore } from "./progress-store.js"

/**
 * Plugs persistent progress (stats, high scores, achievements) into the game.
 * Everything runs off game events; `Game` only hosts the match tracker system.
 */
export function installProgress({ app, game, events, storage }) {
    // The tracker must subscribe before the service so its snapshot includes the latest coin.
    const tracker = new MatchTracker({ events })
    game.addSystem(tracker)
    const service = new ProgressService({
        events,
        tracker,
        store: new ProgressStore({ storage }),
        highScores: new HighScores({ storage }),
        ledger: new AchievementLedger({ storage }),
        catalog: ACHIEVEMENTS,
    })
    return service
}
