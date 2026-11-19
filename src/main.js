import { BALLOON } from "./config.js"
import { GameLoop } from "./core/game-loop.js"
import { Keyboard } from "./core/keyboard.js"
import { Balloon } from "./entities/balloon.js"

const playfield = document.getElementById("main")
const keyboard = new Keyboard()
const viewportHeight = window.innerHeight

const balloon = new Balloon({
    x: window.innerWidth * BALLOON.startXRatio,
    y: viewportHeight * BALLOON.startYRatio,
    size: viewportHeight * BALLOON.sizeRatio,
    speed: viewportHeight * BALLOON.speedRatio,
})
playfield.appendChild(balloon.element)

function readDirection() {
    const x = Number(keyboard.isPressed("ArrowRight")) - Number(keyboard.isPressed("ArrowLeft"))
    const y = Number(keyboard.isPressed("ArrowDown")) - Number(keyboard.isPressed("ArrowUp"))
    return { x, y }
}

function spawnCoin() {
    const coin = document.createElement("div")
    coin.classList.add("coin")
    coin.style.left = "100vw"
    coin.style.top = (Math.random() * 90) + "vh"
    playfield.appendChild(coin)
}

function update(deltaSeconds) {
    balloon.steer(readDirection())
    balloon.update(deltaSeconds)
    balloon.render()
}

const loop = new GameLoop(update)

keyboard.attach()
loop.start()
spawnCoin()
