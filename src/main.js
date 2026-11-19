import { BALLOON_SPEED, FRAME_DURATION_MS } from "./config.js"

const mainDiv = document.getElementById("main")
const balloon = document.getElementById("balloon")
let pressUp = false
let pressDown = false
let pressLeft = false
let pressRight = false

function handleKeyDown(event) {
    if (event.key === "ArrowUp") pressUp = true
    if (event.key === "ArrowDown") pressDown = true
    if (event.key === "ArrowLeft") pressLeft = true
    if (event.key === "ArrowRight") pressRight = true
}

function handleKeyUp(event) {
    if (event.key === "ArrowUp") pressUp = false
    if (event.key === "ArrowDown") pressDown = false
    if (event.key === "ArrowLeft") pressLeft = false
    if (event.key === "ArrowRight") pressRight = false
}

function moveBalloon() {
    const computedStyle = getComputedStyle(balloon)
    const y = parseInt(computedStyle.top)
    const x = parseInt(computedStyle.left)
    if (pressUp) balloon.style.top = (y - BALLOON_SPEED) + "px"
    if (pressDown) balloon.style.top = (y + BALLOON_SPEED) + "px"
    if (pressLeft) balloon.style.left = (x - BALLOON_SPEED) + "px"
    if (pressRight) balloon.style.left = (x + BALLOON_SPEED) + "px"
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

document.addEventListener("keydown", handleKeyDown)
document.addEventListener("keyup", handleKeyUp)
gameLoop()
spawnCoin()
