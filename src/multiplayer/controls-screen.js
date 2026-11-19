import { i18n, t } from "../i18n/index.js"
import { ACTIONS } from "../input/bindings.js"
import { formatKey } from "../input/key-names.js"

function createElement(tag, className, text = "") {
    const element = document.createElement(tag)
    element.className = className
    element.textContent = text
    return element
}

/** Screen listing every player's keys, one row per movement action. */
export class ControlsScreen {
    #grid
    #status

    constructor({ root, preferences }) {
        this.root = root
        this.preferences = preferences
    }

    mount() {
        this.#grid = this.root.querySelector('[data-role="controls-grid"]')
        this.#status = this.root.querySelector('[data-role="controls-status"]')
        i18n.onChange(() => this.render())
        this.preferences.onChange(() => this.render())
        this.render()
    }

    render() {
        this.#grid.replaceChildren(...this.preferences.bindings.map((bindings, player) => this.#renderPlayer(bindings, player)))
    }

    #renderPlayer(bindings, player) {
        const card = createElement("section", "controls-player")
        card.appendChild(createElement("h3", "controls-player__name", t("players.name", { player: player + 1 })))
        for (const action of ACTIONS) card.appendChild(this.#renderRow({ player, action, code: bindings[action] }))
        return card
    }

    #renderRow({ action, code }) {
        const row = createElement("div", "controls-row")
        row.append(
            createElement("span", "controls-row__action", t(`controls.action.${action}`)),
            createElement("kbd", "controls-row__key", formatKey(code, t)),
        )
        return row
    }
}
