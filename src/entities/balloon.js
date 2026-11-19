import { Entity } from "./entity.js"

export class Balloon extends Entity {
    constructor({ x, y, size, speed }) {
        super({ x, y, width: size, height: size, className: "balloon" })
        this.speed = speed
        this.direction = { x: 0, y: 0 }
    }

    steer(direction) {
        this.direction = direction
    }

    update(deltaSeconds) {
        this.x += this.direction.x * this.speed * deltaSeconds
        this.y += this.direction.y * this.speed * deltaSeconds
    }
}
