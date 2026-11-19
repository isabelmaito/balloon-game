import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
    DEFAULT_SKIN,
    PLAYER_DEFAULT_SKINS,
    SKINS,
    isSkin,
    normalizeSkins,
    resolveSkin,
    skinClassName,
} from "../src/game/skins.js"

describe("skins", () => {
    it("keeps the image balloon as the default skin", () => {
        assert.equal(DEFAULT_SKIN, "classic")
        assert.equal(SKINS[0].id, DEFAULT_SKIN)
    })

    it("offers at least four css-drawn skins with unique ids", () => {
        const ids = SKINS.map((skin) => skin.id)
        assert.equal(new Set(ids).size, ids.length)
        assert.ok(ids.filter((id) => id !== DEFAULT_SKIN).length >= 4)
    })

    it("gives every skin a translatable name", () => {
        for (const skin of SKINS) assert.match(skin.messageKey, /^skins\./)
    })

    it("recognises known skins only", () => {
        assert.equal(isSkin("heart"), true)
        assert.equal(isSkin("dragon"), false)
    })

    it("resolves unknown skins to a fallback", () => {
        assert.equal(resolveSkin("star"), "star")
        assert.equal(resolveSkin("dragon"), DEFAULT_SKIN)
        assert.equal(resolveSkin(undefined, "heart"), "heart")
    })

    it("builds the modifier class name", () => {
        assert.equal(skinClassName("hot-air"), "balloon--hot-air")
        assert.equal(skinClassName("dragon"), "balloon--classic")
    })

    it("defaults players to different skins", () => {
        assert.notEqual(PLAYER_DEFAULT_SKINS[0], PLAYER_DEFAULT_SKINS[1])
    })

    it("normalizes stored skins per player", () => {
        assert.deepEqual(normalizeSkins(["star", "dragon"]), ["star", PLAYER_DEFAULT_SKINS[1]])
        assert.deepEqual(normalizeSkins(null), [...PLAYER_DEFAULT_SKINS])
    })
})
