import { i18n, t } from "../../i18n/index.js"

/** One row of hearts per player in the HUD; lost lives stay as faded hearts. */
export class LivesHud {
    #rows = new Map()

    constructor({ hud, events }) {
        this.hud = hud
        events.on("game:setup", ({ players }) => this.setPlayers(players))
        events.on("lives:changed", ({ player, lives }) => this.setLives(player.id, lives))
        i18n.onChange(() => this.refresh())
    }

    setPlayers(players) {
        this.#rows.clear()
        for (const player of players) {
            const row = document.createElement("div")
            row.className = "hud-lives"
            row.setAttribute("role", "img")
            row.append(...Array.from({ length: player.lives }, () => createHeart()))
            this.hud.slotFor(player.id)?.appendChild(row)
            this.#rows.set(player.id, { row, lives: player.lives })
        }
        this.refresh()
    }

    setLives(playerId, lives) {
        const entry = this.#rows.get(playerId)
        if (!entry) return
        entry.lives = lives
        this.#render(entry)
    }

    refresh() {
        for (const entry of this.#rows.values()) this.#render(entry)
    }

    #render({ row, lives }) {
        row.setAttribute("aria-label", t("hud.lives", { lives }))
        for (const [index, heart] of [...row.children].entries()) {
            heart.classList.toggle("is-lost", index >= lives)
        }
    }
}

function createHeart() {
    const heart = document.createElement("span")
    heart.className = "heart"
    return heart
}
