import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { Settings } from "../src/core/settings.js"
import { Storage } from "../src/core/storage.js"
import { PREFERENCE_KEYS, PlayerPreferences, buildPlayerSetups, resolvePlayerCount } from "../src/game/player-preferences.js"
import { PLAYER_DEFAULT_SKINS } from "../src/game/skins.js"
import { DEFAULT_BINDINGS } from "../src/input/bindings.js"
import { MemoryStorage } from "./helpers/memory-storage.js"

function createPreferences(storage = new Storage(new MemoryStorage())) {
    return new PlayerPreferences(new Settings({ storage, defaults: {} }))
}

describe("resolvePlayerCount", () => {
    it("accepts offered counts and falls back to one player", () => {
        assert.equal(resolvePlayerCount(2), 2)
        assert.equal(resolvePlayerCount(5), 1)
        assert.equal(resolvePlayerCount(undefined), 1)
    })
})

describe("buildPlayerSetups", () => {
    it("creates one setup per player with ids starting at 1", () => {
        const setups = buildPlayerSetups({
            count: 2,
            bindings: [DEFAULT_BINDINGS.arrows, DEFAULT_BINDINGS.wasd],
            skins: ["heart", "star"],
        })
        assert.deepEqual(setups, [
            { id: 1, bindings: DEFAULT_BINDINGS.arrows, skin: "heart" },
            { id: 2, bindings: DEFAULT_BINDINGS.wasd, skin: "star" },
        ])
    })
})

describe("PlayerPreferences", () => {
    it("starts with one player, default keys and default skins", () => {
        const preferences = createPreferences()
        assert.deepEqual(preferences.toMatchPlayers(), [
            { id: 1, bindings: DEFAULT_BINDINGS.arrows, skin: PLAYER_DEFAULT_SKINS[0] },
        ])
    })

    it("persists count, skins and bindings", () => {
        const storage = new Storage(new MemoryStorage())
        const preferences = createPreferences(storage)
        preferences.playerCount = 2
        preferences.setSkin(1, "heart")
        preferences.bindings = [DEFAULT_BINDINGS.arrows, { ...DEFAULT_BINDINGS.wasd, up: "KeyQ" }]

        const reloaded = createPreferences(storage).toMatchPlayers()
        assert.equal(reloaded.length, 2)
        assert.equal(reloaded[1].skin, "heart")
        assert.equal(reloaded[1].bindings.up, "KeyQ")
    })

    it("ignores unknown skins", () => {
        const preferences = createPreferences()
        preferences.setSkin(0, "dragon")
        assert.equal(preferences.skins[0], PLAYER_DEFAULT_SKINS[0])
    })

    it("restores default bindings", () => {
        const preferences = createPreferences()
        preferences.bindings = [{ ...DEFAULT_BINDINGS.arrows, up: "KeyI" }, DEFAULT_BINDINGS.wasd]
        preferences.resetBindings()
        assert.equal(preferences.bindings[0].up, DEFAULT_BINDINGS.arrows.up)
    })

    it("notifies only about its own keys", () => {
        const settings = new Settings({ storage: new Storage(new MemoryStorage()), defaults: {} })
        const preferences = new PlayerPreferences(settings)
        const changes = []
        preferences.onChange((key) => changes.push(key))
        settings.set("locale", "en")
        preferences.playerCount = 2
        assert.deepEqual(changes, [PREFERENCE_KEYS.playerCount])
    })
})
