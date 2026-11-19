import { BALLOON_SPEED, FRAME_DURATION_MS } from "./config.js"
import { Keyboard } from "./core/keyboard.js"

const mainDiv = document.getElementById("main")
const balloon = document.getElementById("balloon")
const keyboard = new Keyboard()

function moveBalloon() {
    const computedStyle = getComputedStyle(balloon)
    const y = parseInt(computedStyle.top)
    const x = parseInt(computedStyle.left)
    if (keyboard.isPressed("ArrowUp")) balloon.style.top = (y - BALLOON_SPEED) + "px"
    if (keyboard.isPressed("ArrowDown")) balloon.style.top = (y + BALLOON_SPEED) + "px"
    if (keyboard.isPressed("ArrowLeft")) balloon.style.left = (x - BALLOON_SPEED) + "px"
    if (keyboard.isPressed("ArrowRight")) balloon.style.left = (x + BALLOON_SPEED) + "px"
}

function spawnCoin() {
    const coin = document.createElement("div")
    coin.classList.add("coin")
    coin.style.left = "100vw"
    coin.style.top = (Math.random() * 90) + "vh"
    mainDiv.appendChild(coin)
}

function gameLoop() {
    moveBalloon()
    setTimeout(gameLoop, FRAME_DURATION_MS)
}

keyboard.attach()
gameLoop()
spawnCoin()
