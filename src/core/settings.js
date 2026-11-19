const STORAGE_KEY = "settings"

/** Persistent key/value preferences with change notifications. */
export class Settings {
    #values
    #listeners = new Set()

    constructor({ storage, defaults }) {
        this.storage = storage
        this.defaults = defaults
        this.#values = { ...defaults, ...storage.read(STORAGE_KEY, {}) }
    }

    get(key) {
        return this.#values[key]
    }

    set(key, value) {
        this.#values = { ...this.#values, [key]: value }
        this.storage.write(STORAGE_KEY, this.#values)
        for (const listener of this.#listeners) listener(key, value)
    }

    reset(key) {
        this.set(key, this.defaults[key])
    }

    onChange(listener) {
        this.#listeners.add(listener)
        return () => this.#listeners.delete(listener)
    }
}
