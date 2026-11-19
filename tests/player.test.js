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
})
