const CANCEL_KEY = "Escape"

/**
 * Waits for the next key press and swallows it, so neither the game nor the
 * screens react to a key that is being bound. Escape cancels the wait.
 */
export class KeyCapture {
    #target
    #listener = null
    #onCancel = null

    constructor(target = window) {
        this.#target = target
    }

    get isActive() {
        return this.#listener !== null
    }

    start({ onKey, onCancel = () => {} }) {
        this.cancel()
        this.#onCancel = onCancel
        this.#listener = (event) => {
            event.preventDefault()
            event.stopImmediatePropagation()
            if (event.code === CANCEL_KEY) {
                this.cancel()
                return
            }
            this.#stop()
            onKey(event.code)
        }
        this.#target.addEventListener("keydown", this.#listener, { capture: true })
    }

    /** Stops waiting and notifies the pending `onCancel`, if any. */
    cancel() {
        if (!this.isActive) return
        const onCancel = this.#onCancel
        this.#stop()
        onCancel()
    }

    #stop() {
        this.#target.removeEventListener("keydown", this.#listener, { capture: true })
        this.#listener = null
        this.#onCancel = null
    }
}
