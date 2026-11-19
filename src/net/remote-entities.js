import { Bird } from "../entities/bird.js"
import { HAZARD_KIND } from "../entities/hazard.js"
import { PowerUp } from "../entities/power-up.js"
import { StormCloud } from "../entities/storm-cloud.js"

/**
 * Builds the guest's copies of hazards and power-ups from a snapshot entry.
 * Copies never move on their own (the host moves them), so they are created
 * still, square, and then resized to the host's box in local pixels.
 */

const STILL = Object.freeze({ speed: 0, bobAmplitude: 0, bobFrequency: 0 })
const SQUARE = 1

const HAZARD_CLASSES = Object.freeze({
    [HAZARD_KIND.STORM_CLOUD]: StormCloud,
    [HAZARD_KIND.BIRD]: Bird,
})

function sizedTo(entity, { width, height }) {
    entity.resize(width, height)
    return entity
}

export function createRemoteHazard(kind, box) {
    return sizedTo(new HAZARD_CLASSES[kind]({ ...STILL, size: box.width, aspectRatio: SQUARE }), box)
}

export function createRemotePowerUp(kind, box) {
    return sizedTo(new PowerUp({ ...STILL, size: box.width, kind }), box)
}
