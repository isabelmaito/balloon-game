import { ScrollingEntity } from "./scrolling-entity.js"

export class Coin extends ScrollingEntity {
    constructor({ x, y, size, speed, value = 1 }) {
        super({ x, y, width: size, height: size, speed, className: "coin" })
        this.value = value
    }
}
