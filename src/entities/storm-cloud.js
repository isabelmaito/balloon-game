import { HAZARD_KIND, Hazard } from "./hazard.js"

/** Big, slow thundercloud drifting in a straight line. */
export class StormCloud extends Hazard {
    constructor({ x, y, size, aspectRatio, speed }) {
        super({
            x,
            y,
            width: size,
            height: size * aspectRatio,
            speed,
            kind: HAZARD_KIND.STORM_CLOUD,
            className: "storm-cloud",
        })
    }
}
