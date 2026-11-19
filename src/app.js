import { GAME_STATE } from "./game/game.js"

/** Coordinates the screen flow around a game instance. */
export class App {
    constructor({ game, screens, events, root = document }) {
        this.game = game
        this.screens = screens
        this.events = events
        this.root = root
        this.handleKeyDown = this.handleKeyDown.bind(this)
    }

    init() {
        this.root.addEventListener("click", (event) => {
            const action = event.target.closest("[data-action]")?.dataset.action
            if (action) this.runAction(action)
        })
        document.addEventListener("keydown", this.handleKeyDown)
        this.showMenu()
    }

    runAction(action) {
        const handlers = {
            play: () => this.play(),
        }
        handlers[action]?.()
    }

    showMenu() {
        this.game.setup()
        this.screens.show("menu")
    }

    play() {
        this.screens.hide()
        this.game.setup()
        this.game.start()
    }

    handleKeyDown(event) {
        const isPauseKey = event.code === "Escape" || event.code === "KeyP"
        if (isPauseKey && this.game.state === GAME_STATE.RUNNING) this.game.pause()
    }
}
