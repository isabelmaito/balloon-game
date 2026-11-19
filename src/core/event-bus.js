/** Minimal publish/subscribe hub used to decouple game systems from the UI. */
export class EventBus {
    #listeners = new Map()

    on(eventName, listener) {
        if (!this.#listeners.has(eventName)) this.#listeners.set(eventName, new Set())
        this.#listeners.get(eventName).add(listener)
        return () => this.off(eventName, listener)
    }

    off(eventName, listener) {
        this.#listeners.get(eventName)?.delete(listener)
    }

    emit(eventName, payload) {
        for (const listener of this.#listeners.get(eventName) ?? []) {
            listener(payload)
        }
    }
}
