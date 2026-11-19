import { i18n } from "../i18n/index.js"
import { LOCALES } from "../i18n/locales/index.js"

/** Binds a `<select>` to the active locale and persists the choice. */
export function mountLanguagePicker(select, settings) {
    select.replaceChildren(...LOCALES.map(({ code, label }) => new Option(label, code)))
    select.value = i18n.locale
    select.addEventListener("change", () => {
        i18n.setLocale(select.value)
        settings.set("locale", select.value)
    })
}
