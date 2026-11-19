const PLACEHOLDER = /\{(\w+)\}/g

/**
 * Flat-key translator. Features register their own messages, so strings stay
 * next to the code that uses them instead of in one giant file.
 */
export class I18n {
    #messages = new Map()
    #listeners = new Set()

    constructor({ locale, fallbackLocale }) {
        this.locale = locale
        this.fallbackLocale = fallbackLocale
    }

    register(locale, messages) {
        const current = this.#messages.get(locale) ?? {}
        this.#messages.set(locale, { ...current, ...messages })
    }

    has(locale) {
        return this.#messages.has(locale)
    }

    setLocale(locale) {
        if (!this.has(locale) || locale === this.locale) return
        this.locale = locale
        for (const listener of this.#listeners) listener(locale)
    }

    onChange(listener) {
        this.#listeners.add(listener)
        return () => this.#listeners.delete(listener)
    }

    t(key, params = {}) {
        const template = this.#lookup(this.locale, key)
            ?? this.#lookup(this.fallbackLocale, key)
            ?? key
        return template.replace(PLACEHOLDER, (match, name) => (name in params ? String(params[name]) : match))
    }

    #lookup(locale, key) {
        return this.#messages.get(locale)?.[key]
    }
}
