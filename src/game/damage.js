import { EFFECT } from "./effect-names.js"

export const HIT_RESULT = Object.freeze({
    IGNORED: "ignored",
    SHIELDED: "shielded",
    DAMAGED: "damaged",
})

/**
 * Resolves a hazard touching a player. A shield absorbs the hit; otherwise a
 * life is lost. Either way the player gets a short invulnerability window.
 */
export function applyHit(player, { invulnerabilitySeconds, shieldGraceSeconds }) {
    const { effects } = player
    if (player.isOut || effects.isActive(EFFECT.INVULNERABLE)) return HIT_RESULT.IGNORED
    if (effects.consume(EFFECT.SHIELD)) {
        effects.activate(EFFECT.INVULNERABLE, shieldGraceSeconds)
        return HIT_RESULT.SHIELDED
    }
    player.loseLife()
    effects.activate(EFFECT.INVULNERABLE, invulnerabilitySeconds)
    return HIT_RESULT.DAMAGED
}
