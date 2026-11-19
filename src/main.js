import { BALLOON_SPEED } from "./config.js"
import { GameLoop } from "./core/game-loop.js"
import { Keyboard } from "./core/keyboard.js"

const mainDiv = document.getElementById("main")
const balloon = document.getElementById("balloon")
const keyboard = new Keyboard()

function moveBalloon(deltaSeconds) {
    const computedStyle = getComputedStyle(balloon)
    const y = parseFloat(computedStyle.top)
    const x = parseFloat(computedStyle.left)
    const step = BALLOON_SPEED * window.innerHeight * deltaSeconds
    if (keyboard.isPressed("ArrowUp")) balloon.style.top = (y - step) + "px"
    if (keyboard.isPressed("ArrowDown")) balloon.style.top = (y + step) + "px"
    if (keyboard.isPressed("ArrowLeft")) balloon.style.left = (x - step) + "px"
    if (keyboard.isPressed("ArrowRight")) balloon.style.left = (x + step) + "px"
}

function spawnCoin() {
    const coin = document.createElement("div")
    coin.classList.add("coin")
    coin.style.left = "100vw"
    coin.style.top = (Math.random() * 90) + "vh"
    mainDiv.appendChild(coin)
}

const loop = new GameLoop(moveBalloon)

keyboard.attach()
loop.start()
spawnCoin()
