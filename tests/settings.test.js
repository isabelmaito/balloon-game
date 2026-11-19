import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { Settings } from "../src/core/settings.js"
import { Storage } from "../src/core/storage.js"
import { MemoryStorage } from "./helpers/memory-storage.js"

describe("Settings", () => {
    it("uses defaults when nothing is stored", () => {
        const settings = new Settings({ storage: new Storage(new MemoryStorage()), defaults: { locale: "pt-BR" } })
        assert.equal(settings.get("locale"), "pt-BR")
    })

    it("persists changes across instances", () => {
        const storage = new Storage(new MemoryStorage())
        new Settings({ storage, defaults: { locale: "pt-BR" } }).set("locale", "en")
        assert.equal(new Settings({ storage, defaults: { locale: "pt-BR" } }).get("locale"), "en")
    })

    it("restores a default value on reset", () => {
        const settings = new Settings({ storage: new Storage(new MemoryStorage()), defaults: { volume: 1 } })
        settings.set("volume", 0)
        settings.reset("volume")
        assert.equal(settings.get("volume"), 1)
    })
})
