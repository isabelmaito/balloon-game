import { HITBOX_RATIO } from "../../config.js"
import { EntityGroup } from "../../core/entity-group.js"
import { Spawner } from "../../core/spawner.js"
import { intersects, shrink } from "../../utils/collision.js"
import { GAME_STATE } from "../game.js"

/**
 * Base for systems that spawn scrolling entities and react when a balloon
 * touches one. Subclasses implement `createEntity(game)` and
 * `onTouch(player, entity, game)`, and may override `spawnRate(game)` and
 * `sharedGroup(game)`.
 */
export class ScrollingSpawnSystem {
    #group = null
    #ownsGroup = true
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
        const shared = this.sharedGroup(game)
        this.#ownsGroup = !shared
        this.#group = shared ?? new EntityGroup(game.playfield)
        this.#spawner = new Spawner({
            spawn: () => this.#group.add(this.createEntity(game)),
            minInterval: this.minInterval,
            maxInterval: this.maxInterval,
        })
    }

    teardown() {
        if (this.#ownsGroup) this.#group?.clear()
    }

    /**
     * A group owned by someone else to spawn into, or null for a private one.
     * The owner of a shared group clears and renders it.
     */
    sharedGroup(_game) {
        return null
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
        if (this.#ownsGroup && game.state === GAME_STATE.RUNNING) this.#group.render()
    }

    #touchOverlapping(player, game) {
        const balloonHitbox = shrink(player.balloon.bounds, HITBOX_RATIO)
        for (const entity of this.#group.items) {
            const entityHitbox = shrink(entity.bounds, this.entityHitboxRatio)
            if (entity.isAlive && intersects(balloonHitbox, entityHitbox)) this.onTouch(player, entity, game)
        }
    }
}
