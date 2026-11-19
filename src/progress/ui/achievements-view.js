import { t } from "../../i18n/index.js"
import { progressOf } from "../achievements/evaluator.js"
import { createElement, formatDate, formatProgress } from "./format.js"

/** Lists every achievement, locked or unlocked, with the player's progress. */
export class AchievementsView {
    constructor({ root, catalog, ledger, store }) {
        this.catalog = catalog
        this.ledger = ledger
        this.store = store
        this.list = root.querySelector('[data-role="achievements"]')
        this.summary = root.querySelector('[data-role="achievements-summary"]')
    }

    render() {
        this.summary.textContent = t("progress.achievements.summary", {
            unlocked: this.catalog.filter(({ id }) => this.ledger.isUnlocked(id)).length,
            total: this.catalog.length,
        })
        this.list.replaceChildren(...this.catalog.map((achievement) => this.#renderItem(achievement)))
    }

    #renderItem(achievement) {
        const unlockedAt = this.ledger.unlockedAt(achievement.id)
        const isUnlocked = unlockedAt !== null
        const item = createElement("li", { className: "achievement" })
        item.classList.toggle("achievement--unlocked", isUnlocked)
        item.append(
            createElement("strong", { className: "achievement__name", text: t(achievement.nameKey) }),
            createElement("span", { className: "achievement__description", text: t(achievement.descriptionKey) }),
            isUnlocked ? this.#renderUnlocked(unlockedAt) : this.#renderProgress(achievement),
        )
        return item
    }

    #renderUnlocked(date) {
        return createElement("span", {
            className: "achievement__status",
            text: t("progress.achievements.unlockedOn", { date: formatDate(date) }),
        })
    }

    #renderProgress(achievement) {
        const progress = progressOf(achievement, this.store.stats)
        const label = formatProgress(achievement, progress)
        const wrapper = createElement("span", { className: "achievement__status" })
        const bar = createElement("progress", { className: "achievement__bar" })
        bar.max = progress.goal
        bar.value = progress.current
        bar.setAttribute("aria-label", label)
        wrapper.append(bar, createElement("span", { text: label }))
        return wrapper
    }
}
