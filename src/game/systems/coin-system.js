import { COIN } from "../../config.js"
import { viewport } from "../../core/viewport.js"
import { Coin } from "../../entities/coin.js"
import { rightEdgeSpawn } from "../spawn-position.js"
import { ScrollingSpawnSystem } from "./scrolling-spawn-system.js"

/**
 * Spawns coins into the game's own coin group and pays them to the player who
 * touches them. Emits `coin:collected` and `score:changed`.
 */
export class CoinSystem extends ScrollingSpawnSystem {
    constructor({ events }) {
        super({ minInterval: COIN.minSpawnInterval, maxInterval: COIN.maxSpawnInterval })
        this.events = events
    }

    sharedGroup(game) {
        return game.coins
    }

    spawnRate(game) {
        return game.spawnMultiplier
    }

    createEntity(game) {
        const size = viewport.height * COIN.sizeRatio
        return new Coin({
            ...rightEdgeSpawn(viewport, size),
            size,
            speed: viewport.height * COIN.speedRatio * game.speedMultiplier,
        })
    }

    onTouch(player, coin) {
        coin.destroy()
        player.addScore(coin.value * player.coinMultiplier)
        this.events.emit("coin:collected", { player, coin })
        this.events.emit("score:changed", { player, score: player.score })
    }
}
