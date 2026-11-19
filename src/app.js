import { GAME_STATE } from "./game/game.js"
import { t } from "./i18n/index.js"

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
        this.events.on("game:over", ({ players }) => this.showResults(players))
        this.showMenu()
    }

    runAction(action) {
        const handlers = {
            play: () => this.play(),
            resume: () => this.resume(),
            quit: () => this.showMenu(),
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
        const isPauseKey = event.code === "Escape" || event.code === "KeyP"
        if (!isPauseKey) return
        if (this.game.state === GAME_STATE.RUNNING) this.pause()
        else if (this.game.state === GAME_STATE.PAUSED) this.resume()
    }
}
