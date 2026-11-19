import { PLAYER_COUNTS } from "../game/player-preferences.js"
import { SKINS, skinClassName } from "../game/skins.js"
import { i18n, t } from "../i18n/index.js"

const MAX_PLAYERS = Math.max(...PLAYER_COUNTS)

function createField(labelText, control) {
    const field = document.createElement("label")
    field.className = "field"
    const label = document.createElement("span")
    label.textContent = labelText
    field.append(label, control)
    return { field, label }
}

function createSelect(options) {
    const select = document.createElement("select")
    select.className = "select"
    select.replaceChildren(...options.map((value) => new Option("", String(value))))
    return select
}

function createSkinPreview() {
    const preview = document.createElement("div")
    const sprite = document.createElement("div")
    sprite.className = "sprite"
    preview.appendChild(sprite)
    preview.setAttribute("aria-hidden", "true")
    return preview
}

/**
 * Menu block where players pick how many share the keyboard and which balloon
 * each one flies. Choices go straight to `PlayerPreferences`.
 */
export class PlayerSetupPanel {
    #modeSelect = createSelect(PLAYER_COUNTS)
    #modeLabel
    #skinRows = []

    constructor({ root, preferences }) {
        this.root = root
        this.preferences = preferences
    }

    mount() {
        const mode = createField("", this.#modeSelect)
        this.#modeLabel = mode.label
        this.#modeSelect.addEventListener("change", () => {
            this.preferences.playerCount = Number(this.#modeSelect.value)
        })
        this.root.replaceChildren(mode.field)

        for (let index = 0; index < MAX_PLAYERS; index++) this.#mountSkinRow(index)

        i18n.onChange(() => this.translate())
        this.preferences.onChange(() => this.refresh())
        this.translate()
        this.refresh()
    }

    #mountSkinRow(index) {
        const select = createSelect(SKINS.map(({ id }) => id))
        const preview = createSkinPreview()
        const { field, label } = createField("", select)
        field.classList.add("player-setup__skin")
        field.appendChild(preview)
        select.addEventListener("change", () => this.preferences.setSkin(index, select.value))
        this.root.appendChild(field)
        this.#skinRows.push({ field, label, select, preview })
    }

    translate() {
        this.#modeLabel.textContent = t("players.mode")
        for (const option of this.#modeSelect.options) option.textContent = t(`players.mode.${option.value}`)
        for (const [index, { label, select }] of this.#skinRows.entries()) {
            label.textContent = t("players.skin", { player: index + 1 })
            for (const [skinIndex, option] of [...select.options].entries()) {
                option.textContent = t(SKINS[skinIndex].messageKey)
            }
        }
    }

    refresh() {
        const { playerCount, skins } = this.preferences
        this.#modeSelect.value = String(playerCount)
        for (const [index, { field, select, preview }] of this.#skinRows.entries()) {
            field.hidden = index >= playerCount
            select.value = skins[index]
            preview.className = `skin-preview entity balloon ${skinClassName(skins[index])}`
        }
    }
}
