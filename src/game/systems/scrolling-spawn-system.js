import { HITBOX_RATIO } from "../../config.js"
import { EntityGroup } from "../../core/entity-group.js"
import { Spawner } from "../../core/spawner.js"
import { intersects, shrink } from "../../utils/collision.js"
import { GAME_STATE } from "../game.js"

/**
 * Base for systems that spawn scrolling entities and react when a balloon
 * touches one. Subclasses implement `createEntity(game)` and
 * `onTouch(player, entity, game)`, and may override `spawnRate(game)`.
 */
export class ScrollingSpawnSystem {
    #group = null
    #spawner = null

    constructor({ minInterval, maxInterval, entityHitboxRatio = 1 }) {
        this.minInterval = minInterval
        this.maxInterval = maxInterval
        this.entityHitboxRatio = entityHitboxRatio
    }

    get entities() {
        return this.#group?.items ?? []
    }

    setup(game) {
        this.#group = new EntityGroup(game.playfield)
        this.#spawner = new Spawner({
            spawn: () => this.#group.add(this.createEntity(game)),
            minInterval: this.minInterval,
            maxInterval: this.maxInterval,
        })
    }

    teardown() {
        this.#group?.clear()
    }

    /** Multiplier applied to elapsed time before it reaches the spawner. */
    spawnRate(_game) {
        return 1
    }

    update(deltaSeconds, game) {
        // An online guest mirrors the host; spawning and touching are host rules.
        if (!game.isSimulating) return
        this.#spawner.update(deltaSeconds * this.spawnRate(game))
        this.#group.update(deltaSeconds)
        for (const player of game.players) {
            if (!player.isOut) this.#touchOverlapping(player, game)
        }
        this.#group.prune()
        if (game.state === GAME_STATE.RUNNING) this.#group.render()
    }

    #touchOverlapping(player, game) {
        const balloonHitbox = shrink(player.balloon.bounds, HITBOX_RATIO)
        for (const entity of this.#group.items) {
            const entityHitbox = shrink(entity.bounds, this.entityHitboxRatio)
            if (entity.isAlive && intersects(balloonHitbox, entityHitbox)) this.onTouch(player, entity, game)
        }
    }
}
