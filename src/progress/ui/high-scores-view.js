import { t } from "../../i18n/index.js"
import { createElement, formatDate, formatDifficulty, formatDuration } from "./format.js"

/** Renders the high score table and lifetime stats into the high scores screen. */
export class HighScoresView {
    constructor({ root, highScores, store }) {
        this.highScores = highScores
        this.store = store
        this.list = root.querySelector('[data-role="high-scores"]')
        this.empty = root.querySelector('[data-role="high-scores-empty"]')
        this.stats = root.querySelector('[data-role="progress-stats"]')
    }

    render() {
        const { entries } = this.highScores
        this.list.replaceChildren(...entries.map((entry, index) => this.#renderEntry(entry, index)))
        this.list.hidden = entries.length === 0
        this.empty.hidden = entries.length > 0
        this.stats.replaceChildren(...this.#statLines().map((text) => createElement("li", { text })))
    }

    #renderEntry({ score, date, difficulty }, index) {
        const item = createElement("li", { className: "high-score" })
        item.append(
            createElement("span", { className: "high-score__rank", text: String(index + 1) }),
            createElement("span", { className: "high-score__score", text: t("progress.highScores.score", { score }) }),
            createElement("span", { className: "high-score__difficulty", text: formatDifficulty(difficulty) }),
            createElement("time", { className: "high-score__date", text: formatDate(date) }),
        )
        return item
    }

    #statLines() {
        const { wallet, matchesPlayed, longestMatchSeconds } = this.store.stats
        return [
            t("progress.stats.wallet", { value: wallet }),
            t("progress.stats.matchesPlayed", { value: matchesPlayed }),
            // The table only holds finished matches, so it is the one source for the best score.
            t("progress.stats.bestScore", { value: this.highScores.best }),
            t("progress.stats.longestMatch", { value: formatDuration(longestMatchSeconds) }),
        ]
    }
}
