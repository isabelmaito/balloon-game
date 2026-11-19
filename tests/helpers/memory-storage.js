/** In-memory implementation of the Web Storage API for tests. */
export class MemoryStorage {
    #data = new Map()

    getItem(key) {
        return this.#data.has(key) ? this.#data.get(key) : null
    }

    setItem(key, value) {
        this.#data.set(key, String(value))
    }

    removeItem(key) {
        this.#data.delete(key)
    }
}
