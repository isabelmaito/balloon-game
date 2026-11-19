/**
 * A single value kept in `Storage` under one key, with change notifications.
 * `normalize` turns whatever was stored (possibly old or corrupted data) into
 * a valid value, so callers never deal with malformed state.
 */
export class PersistedState {
    #value
    #listeners = new Set()

    constructor({ storage, key, initial, normalize = (stored) => stored }) {
        this.storage = storage
        this.key = key
        this.initial = initial
        this.normalize = normalize
        this.#value = normalize(storage.read(key, initial))
    }

    get value() {
        return this.#value
    }

    set(value) {
        this.#value = value
        this.storage.write(this.key, value)
        this.#notify()
    }

    update(transform) {
        this.set(transform(this.#value))
    }

    reset() {
        this.#value = this.initial
        this.storage.remove(this.key)
        this.#notify()
    }

    onChange(listener) {
        this.#listeners.add(listener)
        return () => this.#listeners.delete(listener)
    }

    #notify() {
        for (const listener of this.#listeners) listener(this.#value)
    }
}
