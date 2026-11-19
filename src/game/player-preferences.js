import { defaultBindingsList, normalizeBindingsList } from "../input/binding-rules.js"
import { normalizeSkins, resolveSkin } from "./skins.js"

/** Player counts offered by the menu; players share one keyboard. */
export const PLAYER_COUNTS = Object.freeze([1, 2])

/** Settings keys owned by this store. */
export const PREFERENCE_KEYS = Object.freeze({
    playerCount: "playerCount",
    bindings: "bindings",
    skins: "skins",
})

/** Clamps a stored count to one the menu offers. */
export function resolvePlayerCount(count) {
    return PLAYER_COUNTS.includes(count) ? count : PLAYER_COUNTS[0]
}

/** Builds the `players` match option: one `{ id, bindings, skin }` per player, ids from 1. */
export function buildPlayerSetups({ count, bindings, skins }) {
    return Array.from({ length: resolvePlayerCount(count) }, (_, index) => ({
        id: index + 1,
        bindings: { ...bindings[index] },
        skin: skins[index],
    }))
}

/**
 * Typed access to the multiplayer preferences kept in `Settings`.
 * Reads are always sanitized, so corrupted or outdated storage falls back to defaults.
 */
export class PlayerPreferences {
    constructor(settings) {
        this.settings = settings
    }

    get playerCount() {
        return resolvePlayerCount(this.settings.get(PREFERENCE_KEYS.playerCount))
    }

    set playerCount(count) {
        this.settings.set(PREFERENCE_KEYS.playerCount, resolvePlayerCount(count))
    }

    get bindings() {
        return normalizeBindingsList(this.settings.get(PREFERENCE_KEYS.bindings))
    }

    set bindings(bindingsList) {
        this.settings.set(PREFERENCE_KEYS.bindings, normalizeBindingsList(bindingsList))
    }

    resetBindings() {
        this.settings.set(PREFERENCE_KEYS.bindings, defaultBindingsList())
    }

    get skins() {
        return normalizeSkins(this.settings.get(PREFERENCE_KEYS.skins))
    }

    setSkin(playerIndex, skin) {
        const skins = this.skins
        skins[playerIndex] = resolveSkin(skin, skins[playerIndex])
        this.settings.set(PREFERENCE_KEYS.skins, skins)
    }

    /** Calls `listener` whenever one of these preferences changes. */
    onChange(listener) {
        const keys = Object.values(PREFERENCE_KEYS)
        return this.settings.onChange((key) => {
            if (keys.includes(key)) listener(key)
        })
    }

    toMatchPlayers() {
        return buildPlayerSetups({ count: this.playerCount, bindings: this.bindings, skins: this.skins })
    }
}
