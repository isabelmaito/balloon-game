import "./messages.js"
import { i18n } from "../i18n/index.js"
import { ACHIEVEMENTS } from "./achievements/catalog.js"
import { AchievementLedger } from "./achievements/ledger.js"
import { HighScores } from "./high-scores.js"
import { MatchTracker } from "./match-tracker.js"
import { ProgressService } from "./progress-service.js"
import { ProgressStore } from "./progress-store.js"
import { AchievementToasts } from "./ui/achievement-toasts.js"
import { AchievementsView } from "./ui/achievements-view.js"
import { HighScoresView } from "./ui/high-scores-view.js"
import { mountRecordBadge } from "./ui/record-badge.js"
import { ResetPrompt } from "./ui/reset-prompt.js"

/**
 * Plugs persistent progress (stats, high scores, achievements) into the game.
 * Everything runs off game events; `Game` only hosts the match tracker system.
 */
export function installProgress({ app, game, events, storage, root = document }) {
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
    mountRecordBadge(root.querySelector('[data-role="new-record"]'), events)
    new AchievementToasts({ events })

    const views = new Map([
        ["high-scores", new HighScoresView({ root, highScores: service.highScores, store: service.store })],
        ["achievements", new AchievementsView({ root, catalog: ACHIEVEMENTS, ledger: service.ledger, store: service.store })],
    ])
    for (const [screen, view] of views) {
        app.registerAction(screen, () => {
            view.render()
            app.screens.show(screen)
        })
    }
    const resetPrompt = new ResetPrompt({ root, onConfirm: () => service.reset() })
    app.registerAction("progress-back", () => {
        resetPrompt.close()
        app.showMenu()
    })
    app.registerAction("progress-reset", () => resetPrompt.ask())
    app.registerAction("progress-reset-confirm", () => resetPrompt.confirm())
    app.registerAction("progress-reset-cancel", () => resetPrompt.cancel())

    const renderViews = () => {
        for (const view of views.values()) view.render()
    }
    i18n.onChange(renderViews)
    events.on("progress:reset", renderViews)
    return service
}
