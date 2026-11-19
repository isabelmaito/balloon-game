import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { applyHit, HIT_RESULT } from "../src/game/damage.js"
import { EFFECT } from "../src/game/effect-names.js"
import { Player } from "../src/game/player.js"

const TIMING = { invulnerabilitySeconds: 1.5, shieldGraceSeconds: 0.5 }

function createPlayer(lives = 3) {
    return new Player({ id: 1, balloon: null, controls: null, lives })
}

describe("applyHit", () => {
    it("costs a life and grants invulnerability", () => {
        const player = createPlayer()
        assert.equal(applyHit(player, TIMING), HIT_RESULT.DAMAGED)
        assert.equal(player.lives, 2)
        assert.equal(player.effects.remaining(EFFECT.INVULNERABLE), 1.5)
    })

    it("ignores hits while invulnerable", () => {
        const player = createPlayer()
        applyHit(player, TIMING)
        assert.equal(applyHit(player, TIMING), HIT_RESULT.IGNORED)
        assert.equal(player.lives, 2)
        player.effects.update(1.5)
        assert.equal(applyHit(player, TIMING), HIT_RESULT.DAMAGED)
        assert.equal(player.lives, 1)
    })

    it("lets a shield absorb one hit", () => {
        const player = createPlayer()
        player.effects.activate(EFFECT.SHIELD, Infinity)
        assert.equal(applyHit(player, TIMING), HIT_RESULT.SHIELDED)
        assert.equal(player.lives, 3)
        assert.equal(player.effects.isActive(EFFECT.SHIELD), false)
        assert.equal(player.effects.remaining(EFFECT.INVULNERABLE), 0.5)
    })

    it("ignores players that are already out", () => {
        const player = createPlayer(0)
        assert.equal(applyHit(player, TIMING), HIT_RESULT.IGNORED)
    })
})
