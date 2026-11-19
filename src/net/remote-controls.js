const IDLE = Object.freeze({ x: 0, y: 0 })

/**
 * Same interface as `Controls`, but the direction is pushed from the network
 * instead of read from the keyboard. Used for the player on the other machine.
 */
export class RemoteControls {
    #direction = IDLE

    get direction() {
        return { ...this.#direction }
    }

    setDirection({ x, y }) {
        this.#direction = { x, y }
    }

    reset() {
        this.#direction = IDLE
    }
}
