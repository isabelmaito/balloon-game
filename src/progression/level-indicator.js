import { i18n, t } from "../i18n/index.js"
import "./messages.js"

/** HUD badge showing the current level number. */
export class LevelIndicator {
    #number = 1

    constructor({ element, events }) {
        this.element = element
        events.on("level:changed", ({ number }) => this.setLevel(number))
        i18n.onChange(() => this.render())
        this.render()
    }

    setLevel(number) {
        this.#number = number
        this.render()
    }

    render() {
        this.element.textContent = t("hud.level", { number: this.#number })
    }
}
