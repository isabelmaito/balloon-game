/**
 * Shows one overlay screen at a time. Screens are `[data-screen]` elements in the
 * page; they are hidden with the `hidden` attribute so assistive tech ignores them.
 */
export class ScreenManager {
    #screens = new Map()
    #current = null

    constructor(root = document) {
        for (const element of root.querySelectorAll("[data-screen]")) {
            element.hidden = true
            this.#screens.set(element.dataset.screen, element)
        }
    }

    get current() {
        return this.#current
    }

    show(name) {
        const screen = this.#screens.get(name)
        if (!screen) throw new Error(`Unknown screen: ${name}`)
        this.hide()
        screen.hidden = false
        this.#current = name
        screen.querySelector("button, select, input")?.focus()
    }

    hide() {
        if (this.#current) this.#screens.get(this.#current).hidden = true
        this.#current = null
    }
}
