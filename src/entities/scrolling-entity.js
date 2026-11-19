import { Entity } from "./entity.js"

/** Entity that drifts from right to left with the scenery. */
export class ScrollingEntity extends Entity {
    constructor({ speed, ...options }) {
        super(options)
        this.speed = speed
    }

    get isOffscreen() {
        return this.x + this.width < 0
    }

    update(deltaSeconds) {
        this.x -= this.speed * deltaSeconds
    }
}
