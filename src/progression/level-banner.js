import { t } from "../i18n/index.js"
import { levelNameKey } from "./levels.js"
import "./messages.js"

const VISIBLE_CLASS = "is-visible"

/**
 * Briefly announces each new level ("Level 2 — Sunset"). The fade is a CSS
 * animation, so it pauses together with the game.
 */
export class LevelBanner {
    constructor({ element, events }) {
        this.element = element
        events.on("level:changed", (change) => this.handleLevelChange(change))
    }

    handleLevelChange({ level, number, isFirst }) {
        if (isFirst) {
            this.hide()
            return
        }
        this.show(t("level.banner", { number, name: t(levelNameKey(level)) }))
    }

    show(text) {
        this.element.textContent = text
        this.element.classList.remove(VISIBLE_CLASS)
        void this.element.offsetWidth // Restarts the animation when levels change quickly.
        this.element.classList.add(VISIBLE_CLASS)
    }

    hide() {
        this.element.classList.remove(VISIBLE_CLASS)
        this.element.textContent = ""
    }
}
