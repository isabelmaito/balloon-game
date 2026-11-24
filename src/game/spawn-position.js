import { randomBetween } from "../utils/math.js"

/**
 * Where a scrolling entity of the given height enters the playfield: just past
 * the right edge, at a random height that keeps it fully on screen. `margin`
 * reserves extra room above and below (e.g. for a bobbing bird).
 */
export function rightEdgeSpawn(area, height, { margin = 0, random = randomBetween } = {}) {
    return {
        x: area.width,
        y: random(margin, area.height - height - margin),
    }
}
