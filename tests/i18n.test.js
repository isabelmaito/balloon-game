import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { I18n } from "../src/i18n/i18n.js"

function createI18n() {
    const i18n = new I18n({ locale: "pt-BR", fallbackLocale: "en" })
    i18n.register("en", { "hud.score": "Score: {score}", "only.en": "English only" })
    i18n.register("pt-BR", { "hud.score": "Pontos: {score}" })
    return i18n
}

describe("I18n", () => {
    it("interpolates parameters", () => {
        assert.equal(createI18n().t("hud.score", { score: 7 }), "Pontos: 7")
    })

    it("falls back to the fallback locale", () => {
        assert.equal(createI18n().t("only.en"), "English only")
    })

    it("returns the key when nothing matches", () => {
        assert.equal(createI18n().t("missing.key"), "missing.key")
    })

    it("keeps unknown placeholders untouched", () => {
        assert.equal(createI18n().t("hud.score"), "Pontos: {score}")
    })

    it("notifies listeners on locale change", () => {
        const i18n = createI18n()
        const changes = []
        i18n.onChange((locale) => changes.push(locale))
        i18n.setLocale("en")
        i18n.setLocale("xx")
        assert.deepEqual(changes, ["en"])
    })

    it("merges messages registered in several calls", () => {
        const i18n = createI18n()
        i18n.register("pt-BR", { "menu.play": "Jogar" })
        assert.equal(i18n.t("menu.play"), "Jogar")
        assert.equal(i18n.t("hud.score", { score: 1 }), "Pontos: 1")
    })
})
