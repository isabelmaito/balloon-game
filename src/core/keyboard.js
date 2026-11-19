/**
 * Tracks which physical keys are currently held down.
 * Uses `KeyboardEvent.code` so bindings work on any keyboard layout.
 */
export class Keyboard {
    #pressed = new Set()
    #target

    constructor(target = window) {
        this.#target = target
        this.handleKeyDown = this.handleKeyDown.bind(this)
        this.handleKeyUp = this.handleKeyUp.bind(this)
        this.reset = this.reset.bind(this)
    }

    attach() {
        this.#target.addEventListener("keydown", this.handleKeyDown)
        this.#target.addEventListener("keyup", this.handleKeyUp)
        this.#target.addEventListener("blur", this.reset)
    }

    detach() {
        this.#target.removeEventListener("keydown", this.handleKeyDown)
        this.#target.removeEventListener("keyup", this.handleKeyUp)
        this.#target.removeEventListener("blur", this.reset)
        this.reset()
    }

    handleKeyDown(event) {
        this.#pressed.add(event.code)
    }

    handleKeyUp(event) {
        this.#pressed.delete(event.code)
    }

    isPressed(code) {
        return this.#pressed.has(code)
    }

    reset() {
        this.#pressed.clear()
    }
}
