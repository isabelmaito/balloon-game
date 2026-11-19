/**
 * Balloon looks. "classic" uses the original sprite image; every other skin is
 * drawn purely with CSS through the `balloon--<id>` modifier class.
 */
export const SKINS = Object.freeze([
    Object.freeze({ id: "classic", messageKey: "skins.classic" }),
    Object.freeze({ id: "party", messageKey: "skins.party" }),
    Object.freeze({ id: "hot-air", messageKey: "skins.hotAir" }),
    Object.freeze({ id: "heart", messageKey: "skins.heart" }),
    Object.freeze({ id: "star", messageKey: "skins.star" }),
])

export const DEFAULT_SKIN = "classic"

/** Starting skin of each player slot, chosen so both balloons differ at a glance. */
export const PLAYER_DEFAULT_SKINS = Object.freeze([DEFAULT_SKIN, "hot-air"])

export function isSkin(id) {
    return SKINS.some((skin) => skin.id === id)
}

/** Returns `id` when it names a known skin, otherwise `fallback`. */
export function resolveSkin(id, fallback = DEFAULT_SKIN) {
    return isSkin(id) ? id : fallback
}

export function skinClassName(id) {
    return `balloon--${resolveSkin(id)}`
}

/** Accepts persisted skins per player, replacing unknown entries with each slot's default. */
export function normalizeSkins(stored) {
    const list = Array.isArray(stored) ? stored : []
    return PLAYER_DEFAULT_SKINS.map((fallback, index) => resolveSkin(list[index], fallback))
}
