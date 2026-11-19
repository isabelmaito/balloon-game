import { createEffectIcon } from "./effect-icon.js"
import { ScrollingEntity } from "./scrolling-entity.js"

/** Collectible bubble that grants the effect named by `kind`. */
export class PowerUp extends ScrollingEntity {
    constructor({ x, y, size, speed, kind }) {
        super({ x, y, width: size, height: size, speed, className: "power-up" })
        this.kind = kind
        this.sprite.appendChild(createEffectIcon(kind))
    }
}
