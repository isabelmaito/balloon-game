import { SNAPSHOT_PRECISION } from "./config.js"

/**
 * Snapshots carry positions as fractions of the viewport so peers with
 * different window sizes see the same layout.
 */

function toFraction(value, size) {
    if (size <= 0) return 0
    return Math.round((value / size) * SNAPSHOT_PRECISION) / SNAPSHOT_PRECISION
}

export function toViewportFractions({ x, y }, viewport) {
    return { x: toFraction(x, viewport.width), y: toFraction(y, viewport.height) }
}

export function toPixels({ x, y }, viewport) {
    return { x: x * viewport.width, y: y * viewport.height }
}

/** Hands out stable numeric ids to objects without touching them. */
export class EntityIds {
    #ids = new WeakMap()
    #nextId = 0

    idOf(entity) {
        if (!this.#ids.has(entity)) this.#ids.set(entity, this.#nextId++)
        return this.#ids.get(entity)
    }
}

/** Compact, serializable picture of a match: balloons, scores and coins. */
export function createSnapshot({ players, coins }, viewport, ids) {
    return {
        players: players.map(({ id, score, balloon }) => ({ id, score, ...toViewportFractions(balloon, viewport) })),
        coins: coins.map((coin) => ({ id: ids.idOf(coin), ...toViewportFractions(coin, viewport) })),
    }
}
