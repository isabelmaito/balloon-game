import { HAZARD, HAZARDS } from "../../config.js"
import { viewport } from "../../core/viewport.js"
import { Bird } from "../../entities/bird.js"
import { StormCloud } from "../../entities/storm-cloud.js"
import { pickRandom, randomBetween } from "../../utils/math.js"
import { ScrollingSpawnSystem } from "./scrolling-spawn-system.js"

/** Builds each hazard kind from its config, entering at the right edge. */
const HAZARD_FACTORIES = [
    (speedMultiplier) => {
        const { sizeRatio, aspectRatio, speedRatio } = HAZARDS.stormCloud
        const size = viewport.height * sizeRatio
        return new StormCloud({
            x: viewport.width,
            y: randomBetween(0, viewport.height - size * aspectRatio),
            size,
            aspectRatio,
            speed: viewport.height * speedRatio * speedMultiplier,
        })
    },
    (speedMultiplier) => {
        const { sizeRatio, speedRatio, bobAmplitudeRatio, bobFrequency } = HAZARDS.bird
        const size = viewport.height * sizeRatio
        const bobAmplitude = viewport.height * bobAmplitudeRatio
        return new Bird({
            x: viewport.width,
            y: randomBetween(bobAmplitude, viewport.height - size - bobAmplitude),
            size,
            speed: viewport.height * speedRatio * speedMultiplier,
            bobAmplitude,
            bobFrequency,
        })
    },
]

/** Spawns obstacles and emits `hazard:hit` the first time one touches a player. */
export class HazardSystem extends ScrollingSpawnSystem {
    constructor({ events }) {
        super({
            minInterval: HAZARD.minSpawnInterval,
            maxInterval: HAZARD.maxSpawnInterval,
            entityHitboxRatio: HAZARD.hitboxRatio,
        })
        this.events = events
    }

    spawnRate(game) {
        return game.spawnMultiplier
    }

    createEntity(game) {
        return pickRandom(HAZARD_FACTORIES)(game.speedMultiplier)
    }

    onTouch(player, hazard) {
        if (hazard.registerHit(player)) this.events.emit("hazard:hit", { player, hazard })
    }
}
