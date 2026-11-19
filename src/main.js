import { EventBus } from "./core/event-bus.js"
import { Keyboard } from "./core/keyboard.js"
import { Game } from "./game/game.js"
import { Hud } from "./ui/hud.js"

const keyboard = new Keyboard()
const events = new EventBus()
const game = new Game({
    playfield: document.getElementById("main"),
    keyboard,
    events,
})

const hud = new Hud({ root: document.getElementById("hud"), events })

keyboard.attach()
hud.setPlayers(game.players)
game.start()
