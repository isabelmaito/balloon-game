import { i18n, t } from "../i18n/index.js"

/** Heads-up display: one score badge per player, refreshed through game events. */
export class Hud {
    #scores = new Map()

    constructor({ root, events }) {
        this.root = root
        events.on("score:changed", ({ player, score }) => this.setScore(player.id, score))
        i18n.onChange(() => this.refresh())
    }

    setPlayers(players) {
        this.root.replaceChildren()
        this.#scores.clear()
        for (const player of players) {
            const slot = document.createElement("div")
            slot.className = `hud-player hud-player--p${player.id}`
            const badge = document.createElement("div")
            badge.className = `hud-score hud-score--p${player.id}`
            slot.appendChild(badge)
            this.root.appendChild(slot)
            this.#scores.set(player.id, { slot, badge, score: player.score })
        }
        this.refresh()
    }

    /** Container around a player's score where features can mount extra widgets. */
    slotFor(playerId) {
        return this.#scores.get(playerId)?.slot
    }

    setScore(playerId, score) {
        const entry = this.#scores.get(playerId)
        if (!entry) return
        entry.score = score
        this.#render(playerId, entry)
    }

    refresh() {
        for (const [playerId, entry] of this.#scores) this.#render(playerId, entry)
    }

    #render(playerId, { badge, score }) {
        const key = this.#scores.size > 1 ? "hud.playerScore" : "hud.score"
        badge.textContent = t(key, { player: playerId, score })
    }
}
