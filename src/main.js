import { EventBus } from "./core/event-bus.js"
import { Keyboard } from "./core/keyboard.js"
import { Game } from "./game/game.js"

const keyboard = new Keyboard()
const events = new EventBus()
const game = new Game({
    playfield: document.getElementById("main"),
    keyboard,
    events,
})

keyboard.attach()
game.start()
