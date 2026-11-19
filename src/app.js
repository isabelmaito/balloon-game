import { GAME_STATE } from "./game/game.js"
import { t } from "./i18n/index.js"
import { PAUSE_KEYS } from "./input/bindings.js"

/** Coordinates the screen flow around a game instance. */
export class App {
    constructor({ game, screens, events, root = document }) {
        this.game = game
        this.screens = screens
        this.events = events
        this.root = root
        /** Options for the next match; menus update it before `play()`. */
        this.matchOptions = {}
        this.actions = new Map([
            ["play", () => this.play()],
            ["resume", () => this.resume()],
            ["quit", () => this.showMenu()],
        ])
        this.handleKeyDown = this.handleKeyDown.bind(this)
    }

    init() {
        this.root.addEventListener("click", (event) => {
            const action = event.target.closest("[data-action]")?.dataset.action
            if (action) this.runAction(action)
        })
        document.addEventListener("keydown", this.handleKeyDown)
        this.events.on("game:over", ({ players }) => this.showResults(players))
        this.showMenu()
    }

    /** Lets features react to `[data-action]` buttons without editing this class. */
    registerAction(name, handler) {
        this.actions.set(name, handler)
    }

    runAction(action) {
        this.actions.get(action)?.()
    }

    showMenu() {
        this.game.setup(this.matchOptions)
        this.screens.show("menu")
    }

    /** Starts a match; features such as online play may pass their own options. */
    play(options = this.matchOptions) {
        this.screens.hide()
        this.game.setup(options)
        this.game.start()
    }

    showResults(players) {
        const list = this.root.querySelector('[data-role="results"]')
        const ranking = [...players].sort((a, b) => b.score - a.score)
        list.replaceChildren(...ranking.map((player) => {
            const item = document.createElement("li")
            item.textContent = t("gameOver.playerResult", { player: player.id, score: player.score })
            return item
        }))
        this.screens.show("game-over")
    }

    pause() {
        this.game.pause()
        this.screens.show("pause")
    }

    resume() {
        this.screens.hide()
        this.game.resume()
    }

    handleKeyDown(event) {
        if (!PAUSE_KEYS.includes(event.code)) return
        if (this.game.state === GAME_STATE.RUNNING) this.pause()
        else if (this.game.state === GAME_STATE.PAUSED) this.resume()
    }
}
