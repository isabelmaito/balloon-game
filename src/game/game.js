import { BALLOON, COIN, HITBOX_RATIO } from "../config.js"
import { EntityGroup } from "../core/entity-group.js"
import { GameLoop } from "../core/game-loop.js"
import { Spawner } from "../core/spawner.js"
import { viewport } from "../core/viewport.js"
import { Balloon } from "../entities/balloon.js"
import { Coin } from "../entities/coin.js"
import { intersects, shrink } from "../utils/collision.js"
import { randomBetween } from "../utils/math.js"

export class Game {
    constructor({ playfield, keyboard, events }) {
        this.playfield = playfield
        this.keyboard = keyboard
        this.events = events
        this.loop = new GameLoop((deltaSeconds) => this.update(deltaSeconds))
        this.coins = new EntityGroup(playfield)
        this.coinSpawner = new Spawner({
            spawn: () => this.spawnCoin(),
            minInterval: COIN.minSpawnInterval,
            maxInterval: COIN.maxSpawnInterval,
        })
        this.balloon = this.createBalloon()
    }

    start() {
        this.loop.start()
    }

    createBalloon() {
        const balloon = new Balloon({
            x: viewport.width * BALLOON.startXRatio,
            y: viewport.height * BALLOON.startYRatio,
            size: viewport.height * BALLOON.sizeRatio,
            speed: viewport.height * BALLOON.speedRatio,
        })
        this.playfield.appendChild(balloon.element)
        return balloon
    }

    spawnCoin() {
        const size = viewport.height * COIN.sizeRatio
        this.coins.add(new Coin({
            x: viewport.width,
            y: randomBetween(0, viewport.height - size),
            size,
            speed: viewport.height * COIN.speedRatio,
        }))
    }

    readDirection() {
        const { keyboard } = this
        return {
            x: Number(keyboard.isPressed("ArrowRight")) - Number(keyboard.isPressed("ArrowLeft")),
            y: Number(keyboard.isPressed("ArrowDown")) - Number(keyboard.isPressed("ArrowUp")),
        }
    }

    update(deltaSeconds) {
        this.balloon.steer(this.readDirection())
        this.balloon.update(deltaSeconds)
        this.balloon.keepInside(viewport)

        this.coinSpawner.update(deltaSeconds)
        this.coins.update(deltaSeconds)
        this.collectTouchedCoins()

        this.balloon.render()
        this.coins.render()
    }

    collectTouchedCoins() {
        const balloonHitbox = shrink(this.balloon.bounds, HITBOX_RATIO)
        for (const coin of this.coins.items) {
            if (coin.isAlive && intersects(balloonHitbox, coin.bounds)) {
                coin.destroy()
                this.events.emit("coin:collected", coin)
            }
        }
        this.coins.prune()
    }
}
