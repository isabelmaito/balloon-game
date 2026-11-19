import { i18n, t } from "../i18n/index.js"

/** Labels every balloon with its player tag ("P2") whenever several players share the field. */
export class PlayerTags {
    #tags = []

    constructor({ events }) {
        events.on("game:setup", ({ players }) => this.attach(players))
        i18n.onChange(() => this.translate())
    }

    attach(players) {
        this.#tags = players.length > 1 ? players.map((player) => this.#createTag(player)) : []
        this.translate()
    }

    translate() {
        for (const { element, playerId } of this.#tags) element.textContent = t("players.tag", { player: playerId })
    }

    #createTag({ id, balloon }) {
        const element = document.createElement("span")
        element.className = `balloon-tag balloon-tag--p${id}`
        balloon.element.appendChild(element)
        return { element, playerId: id }
    }
}
