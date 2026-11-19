import { BALLOON, COIN } from "./config.js"
import { GameLoop } from "./core/game-loop.js"
import { EventBus } from "./core/event-bus.js"
import { Keyboard } from "./core/keyboard.js"
import { Spawner } from "./core/spawner.js"
import { Balloon } from "./entities/balloon.js"
import { Coin } from "./entities/coin.js"
import { intersects, shrink } from "./utils/collision.js"
import { randomBetween } from "./utils/math.js"

const playfield = document.getElementById("main")
const keyboard = new Keyboard()
const events = new EventBus()
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

let coins = []

function spawnCoin() {
    const size = viewportHeight * COIN.sizeRatio
    const coin = new Coin({
        x: window.innerWidth,
        y: randomBetween(0, window.innerHeight - size),
        size,
        speed: viewportHeight * COIN.speedRatio,
    })
    coins.push(coin)
    playfield.appendChild(coin.element)
}

const coinSpawner = new Spawner({
    spawn: spawnCoin,
    minInterval: COIN.minSpawnInterval,
    maxInterval: COIN.maxSpawnInterval,
})

function updateCoins(deltaSeconds) {
    coinSpawner.update(deltaSeconds)
    for (const coin of coins) {
        coin.update(deltaSeconds)
        coin.render()
        if (coin.isOffscreen) coin.destroy()
    }
    collectTouchedCoins()
    coins = coins.filter((coin) => coin.isAlive)
}

const HITBOX_RATIO = 0.7

function collectTouchedCoins() {
    const balloonHitbox = shrink(balloon.bounds, HITBOX_RATIO)
    for (const coin of coins) {
        if (coin.isAlive && intersects(balloonHitbox, coin.bounds)) {
            coin.destroy()
            events.emit("coin:collected", coin)
        }
    }
}

function update(deltaSeconds) {
    balloon.steer(readDirection())
    balloon.update(deltaSeconds)
    balloon.keepInside({ width: window.innerWidth, height: window.innerHeight })
    balloon.render()
    updateCoins(deltaSeconds)
}

const loop = new GameLoop(update)

keyboard.attach()
loop.start()
