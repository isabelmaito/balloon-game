import { I18n } from "./i18n.js"
import { DEFAULT_LOCALE, LOCALES } from "./locales/index.js"

export const i18n = new I18n({ locale: DEFAULT_LOCALE, fallbackLocale: DEFAULT_LOCALE })

for (const { code, messages } of LOCALES) i18n.register(code, messages)

export const t = (key, params) => i18n.t(key, params)

/**
 * Registers a feature's messages, given as `{ [locale]: { key: text } }`.
 * Keeps each feature's strings next to its code.
 */
export function registerMessages(bundle) {
    for (const [locale, messages] of Object.entries(bundle)) i18n.register(locale, messages)
}

/** Fills every `[data-i18n]` element below `root` with its translation. */
export function translateDom(root = document) {
    for (const element of root.querySelectorAll("[data-i18n]")) {
        element.textContent = t(element.dataset.i18n)
    }
    document.documentElement.lang = i18n.locale
}
