import { POWER_UP, POWER_UPS } from "../../config.js"
import { viewport } from "../../core/viewport.js"
import { PowerUp } from "../../entities/power-up.js"
import { pickRandom } from "../../utils/math.js"
import { EFFECT } from "../effect-names.js"
import { attract, centerOf } from "../magnet.js"
import { rightEdgeSpawn } from "../spawn-position.js"
import { emitEffectsChanged } from "./effects-system.js"
import { ScrollingSpawnSystem } from "./scrolling-spawn-system.js"

const POWER_UP_KINDS = Object.keys(POWER_UPS)

/**
 * Spawns shield, magnet and double-coin bubbles, grants their effect on
 * pickup and applies the running ones. Emits `power-up:collected`.
 */
export class PowerUpSystem extends ScrollingSpawnSystem {
    constructor({ events }) {
        super({ minInterval: POWER_UP.minSpawnInterval, maxInterval: POWER_UP.maxSpawnInterval })
        this.events = events
    }

    createEntity(game) {
        const size = viewport.height * POWER_UP.sizeRatio
        return new PowerUp({
            ...rightEdgeSpawn(viewport, size),
            size,
            speed: viewport.height * POWER_UP.speedRatio * game.speedMultiplier,
            kind: pickRandom(POWER_UP_KINDS),
        })
    }

    onTouch(player, powerUp) {
        const { kind } = powerUp
        powerUp.destroy()
        player.effects.activate(kind, POWER_UPS[kind].durationSeconds)
        this.events.emit("power-up:collected", { player, kind })
        emitEffectsChanged(this.events, player)
    }

    update(deltaSeconds, game) {
        super.update(deltaSeconds, game)
        if (!game.isSimulating) return
        for (const player of game.players) {
            if (player.effects.isActive(EFFECT.MAGNET)) this.#pullCoins(player, game.coins.items, deltaSeconds)
        }
    }

    #pullCoins(player, coins, deltaSeconds) {
        const { radiusRatio, pullSpeedRatio } = POWER_UPS.magnet
        const target = centerOf(player.balloon.bounds)
        const options = {
            radius: viewport.height * radiusRatio,
            maxStep: viewport.height * pullSpeedRatio * deltaSeconds,
        }
        for (const coin of coins) attract(coin, target, options)
    }
}
