/** Translates raw keyboard state into a movement intent using a binding map. */
export class Controls {
    constructor(keyboard, bindings) {
        this.keyboard = keyboard
        this.bindings = { ...bindings }
    }

    isActive(action) {
        return this.keyboard.isPressed(this.bindings[action])
    }

    get direction() {
        return {
            x: Number(this.isActive("right")) - Number(this.isActive("left")),
            y: Number(this.isActive("down")) - Number(this.isActive("up")),
        }
    }
}
