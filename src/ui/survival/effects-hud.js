import { POWER_UPS } from "../../config.js"
import { createEffectIcon } from "../../entities/effect-icon.js"
import { i18n, t } from "../../i18n/index.js"

/** Only power-up effects are shown; invulnerability already blinks the balloon. */
const SHOWN_EFFECTS = new Set(Object.keys(POWER_UPS))

/** Small icons for each player's active power-ups, timed ones with a draining bar. */
export class EffectsHud {
    #lists = new Map()

    constructor({ hud, events }) {
        this.hud = hud
        events.on("game:setup", ({ players }) => this.setPlayers(players))
        events.on("effects:changed", ({ player, effects }) => this.show(player.id, effects))
        i18n.onChange(() => this.refresh())
    }

    setPlayers(players) {
        this.#lists.clear()
        for (const player of players) {
            const list = document.createElement("ul")
            list.className = "hud-effects"
            this.hud.slotFor(player.id)?.appendChild(list)
            this.#lists.set(player.id, list)
        }
        this.refresh()
    }

    show(playerId, effects) {
        const list = this.#lists.get(playerId)
        if (!list) return
        const chips = effects.filter(({ name }) => SHOWN_EFFECTS.has(name)).map(createChip)
        list.replaceChildren(...chips)
        this.#label(list)
    }

    refresh() {
        for (const list of this.#lists.values()) this.#label(list)
    }

    #label(list) {
        list.setAttribute("aria-label", t("hud.effects"))
        for (const chip of list.children) {
            const name = t(`effect.${chip.dataset.kind}`)
            chip.title = name
            chip.setAttribute("aria-label", name)
        }
    }
}

function createChip({ name, remaining }) {
    const chip = document.createElement("li")
    chip.className = "hud-effect"
    chip.dataset.kind = name
    chip.appendChild(createEffectIcon(name))
    if (Number.isFinite(remaining)) {
        chip.classList.add("is-timed")
        chip.style.setProperty("--effect-time-left", `${remaining}s`)
    }
    return chip
}
