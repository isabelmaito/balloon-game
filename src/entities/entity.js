/**
 * Base class for anything drawn on the playfield.
 * Position and size are stored in pixels; the DOM only mirrors that state.
 */
export class Entity {
    constructor({ x = 0, y = 0, width, height, className }) {
        this.x = x
        this.y = y
        this.isAlive = true
        this.element = document.createElement("div")
        this.element.className = `entity ${className}`
        this.resize(width, height)
        this.sprite = document.createElement("div")
        this.sprite.className = "sprite"
        this.element.appendChild(this.sprite)
    }

    get bounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height }
    }

    resize(width, height) {
        this.width = width
        this.height = height
        this.element.style.width = `${width}px`
        this.element.style.height = `${height}px`
    }

    update(_deltaSeconds) {}

    render() {
        this.element.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`
    }

    destroy() {
        this.isAlive = false
        this.element.remove()
    }
}
