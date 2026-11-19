import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { Player } from "../src/game/player.js"

describe("Player", () => {
    it("accumulates score", () => {
        const player = new Player({ id: 1, balloon: null, controls: null })
        player.addScore(1)
        player.addScore(5)
        assert.equal(player.score, 6)
    })

    it("is out once every life is lost and never goes below zero", () => {
        const player = new Player({ id: 1, balloon: null, controls: null, lives: 2 })
        player.loseLife()
        assert.equal(player.isOut, false)
        player.loseLife()
        player.loseLife()
        assert.equal(player.lives, 0)
        assert.equal(player.isOut, true)
    })
})
