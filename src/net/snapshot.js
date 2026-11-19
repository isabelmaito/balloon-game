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

/** Position and size as viewport fractions: `x` and `w` of the width, `y` and `h` of the height. */
export function toViewportBox({ x, y, width, height }, viewport) {
    const { x: w, y: h } = toViewportFractions({ x: width, y: height }, viewport)
    return { ...toViewportFractions({ x, y }, viewport), w, h }
}

/** Inverse of `toViewportBox`, in pixels of the local viewport. */
export function toPixelBox({ x, y, w, h }, viewport) {
    const { x: width, y: height } = toPixels({ x: w, y: h }, viewport)
    return { ...toPixels({ x, y }, viewport), width, height }
}

/**
 * Share of the remaining distance to cover this frame when easing toward a
 * target at `ratePerSecond`. Frame-rate independent; 0 means stay, 1 means snap.
 */
export function blendFactor(deltaSeconds, ratePerSecond) {
    return 1 - Math.exp(-ratePerSecond * deltaSeconds)
}

/** Moves `point` part of the way to `target`, in place. */
export function moveToward(point, target, factor) {
    point.x += (target.x - point.x) * factor
    point.y += (target.y - point.y) * factor
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

function describePlayer({ id, score, lives, effects, balloon }, viewport) {
    return {
        id,
        score,
        lives,
        effects: effects.active.map(({ name }) => name),
        ...toViewportFractions(balloon, viewport),
    }
}

/** Hazards and power-ups travel with their kind and size so the guest can rebuild them. */
function describeKindedEntity(entity, viewport, ids) {
    return { id: ids.idOf(entity), kind: entity.kind, ...toViewportBox(entity, viewport) }
}

/**
 * Compact, serializable picture of a match: balloons with score, lives and
 * effect names, coins, hazards, power-ups and the distance in meters.
 */
export function createSnapshot({ players, coins, hazards, powerUps, distance }, viewport, ids) {
    return {
        distance,
        players: players.map((player) => describePlayer(player, viewport)),
        coins: coins.map((coin) => ({ id: ids.idOf(coin), ...toViewportFractions(coin, viewport) })),
        hazards: hazards.map((hazard) => describeKindedEntity(hazard, viewport, ids)),
        powerUps: powerUps.map((powerUp) => describeKindedEntity(powerUp, viewport, ids)),
    }
}
