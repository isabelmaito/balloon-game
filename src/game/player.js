/** A participant in the match: a balloon, the input steering it and its score. */
export class Player {
    constructor({ id, balloon, controls }) {
        this.id = id
        this.balloon = balloon
        this.controls = controls
        this.score = 0
    }

    update(deltaSeconds, bounds) {
        this.balloon.steer(this.controls.direction)
        this.balloon.update(deltaSeconds)
        this.balloon.keepInside(bounds)
    }

    addScore(points) {
        this.score += points
    }
}
