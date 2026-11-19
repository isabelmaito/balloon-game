import { ACTIONS, PAUSE_KEYS, PLAYER_DEFAULT_BINDINGS } from "./bindings.js"

/** Why a key cannot be assigned to a slot. */
export const ASSIGN_ERROR = Object.freeze({
    RESERVED: "reserved",
    TAKEN: "taken",
})

/**
 * Finds the slot already using `code`, ignoring the slot being edited.
 * Bindings are a list with one `{ [action]: code }` map per player.
 * @returns {{ player: number, action: string } | null} player is a 0-based index
 */
export function findConflict(bindingsList, { player, action, code }) {
    for (const [index, bindings] of bindingsList.entries()) {
        for (const otherAction of ACTIONS) {
            const isSameSlot = index === player && otherAction === action
            if (!isSameSlot && bindings[otherAction] === code) return { player: index, action: otherAction }
        }
    }
    return null
}

/**
 * Returns a new bindings list with `code` assigned, or the reason it was refused.
 * The input list is never mutated.
 */
export function assignKey(bindingsList, { player, action, code }) {
    if (PAUSE_KEYS.includes(code)) return { ok: false, reason: ASSIGN_ERROR.RESERVED }
    const conflict = findConflict(bindingsList, { player, action, code })
    if (conflict) return { ok: false, reason: ASSIGN_ERROR.TAKEN, conflict }
    const bindings = bindingsList.map((map, index) => (index === player ? { ...map, [action]: code } : map))
    return { ok: true, bindings }
}

/** True when every player has a key per action and no key is used twice or reserved. */
export function isValidBindingsList(bindingsList, playerCount = PLAYER_DEFAULT_BINDINGS.length) {
    if (!Array.isArray(bindingsList) || bindingsList.length !== playerCount) return false
    const codes = bindingsList.flatMap((bindings) => ACTIONS.map((action) => bindings?.[action]))
    const allStrings = codes.every((code) => typeof code === "string" && code.length > 0)
    const noReserved = codes.every((code) => !PAUSE_KEYS.includes(code))
    return allStrings && noReserved && new Set(codes).size === codes.length
}

/** Fresh, mutable copy of the default bindings of every player slot. */
export function defaultBindingsList() {
    return PLAYER_DEFAULT_BINDINGS.map((bindings) => ({ ...bindings }))
}

/** Accepts persisted bindings only when they are still valid; otherwise uses the defaults. */
export function normalizeBindingsList(stored) {
    if (!isValidBindingsList(stored)) return defaultBindingsList()
    return stored.map((bindings) => Object.fromEntries(ACTIONS.map((action) => [action, bindings[action]])))
}
