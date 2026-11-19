import { DIFFICULTIES, getDifficulty } from "../game/difficulty.js"
import { t } from "../i18n/index.js"
import "./messages.js"

const SETTING_KEY = "difficulty"
const INPUT_NAME = "difficulty"

/**
 * Fills a `<fieldset>` with one radio per difficulty preset, restores the
 * saved choice and persists changes. `onSelect(id)` runs with the initial
 * choice and on every change.
 */
export function mountDifficultyPicker(fieldset, { settings, onSelect }) {
    const selected = getDifficulty(settings.get(SETTING_KEY)).id
    fieldset.append(...Object.keys(DIFFICULTIES).map((id) => createOption(id, id === selected)))
    fieldset.addEventListener("change", (event) => {
        const { value } = event.target
        settings.set(SETTING_KEY, value)
        onSelect(value)
    })
    onSelect(selected)
}

function createOption(id, checked) {
    const label = document.createElement("label")
    label.className = "difficulty-option"
    const input = document.createElement("input")
    input.type = "radio"
    input.name = INPUT_NAME
    input.value = id
    input.checked = checked
    const text = document.createElement("span")
    text.dataset.i18n = `difficulty.${id}`
    text.textContent = t(text.dataset.i18n)
    label.append(input, text)
    return label
}
