/** Announces a player's current effects so views can mirror them. */
export function emitEffectsChanged(events, player) {
    events.emit("effects:changed", { player, effects: player.effects.active })
}

/** Advances every player's timed effects and reports the ones that expire. */
export class EffectsSystem {
    constructor({ events }) {
        this.events = events
    }

    update(deltaSeconds, game) {
        for (const player of game.players) {
            const expired = player.effects.update(deltaSeconds)
            if (expired.length > 0) emitEffectsChanged(this.events, player)
        }
    }
}
