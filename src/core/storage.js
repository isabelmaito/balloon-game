const NAMESPACE = "balloon-game"

/**
 * JSON wrapper over Web Storage that never throws.
 * Private windows and blocked cookies make localStorage unavailable; the game
 * must keep working, just without persistence.
 */
export class Storage {
    constructor(backend = globalThis.localStorage, namespace = NAMESPACE) {
        this.backend = backend
        this.namespace = namespace
    }

    read(key, fallback) {
        try {
            const raw = this.backend?.getItem(this.#key(key))
            return raw == null ? fallback : JSON.parse(raw)
        } catch {
            return fallback
        }
    }

    write(key, value) {
        try {
            this.backend?.setItem(this.#key(key), JSON.stringify(value))
            return true
        } catch {
            return false
        }
    }

    remove(key) {
        try {
            this.backend?.removeItem(this.#key(key))
        } catch {
            // Nothing to clean up when storage is unavailable.
        }
    }

    #key(key) {
        return `${this.namespace}:${key}`
    }
}

export const storage = new Storage()
