const SYMBOLS = Object.freeze({
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
    Minus: "-",
    Equal: "=",
    BracketLeft: "[",
    BracketRight: "]",
    Semicolon: ";",
    Quote: "'",
    Backquote: "`",
    Backslash: "\\",
    Comma: ",",
    Period: ".",
    Slash: "/",
})

/** Keys whose name depends on the language, mapped to message keys. */
const TRANSLATED = Object.freeze({
    Space: "keys.space",
    Enter: "keys.enter",
    Backspace: "keys.backspace",
    Tab: "keys.tab",
})

const PREFIXES = Object.freeze([
    { prefix: "Key", format: (rest) => rest },
    { prefix: "Digit", format: (rest) => rest },
    { prefix: "Numpad", format: (rest) => `Num ${rest}` },
])

const SIDES = Object.freeze({ Left: "L", Right: "R" })
const SIDED_KEY = /^(Shift|Control|Alt|Meta)(Left|Right)$/

/**
 * Turns a `KeyboardEvent.code` into a short label for the player, e.g.
 * "KeyW" -> "W" and "ArrowUp" -> "↑". `translate` resolves language-dependent names.
 */
export function formatKey(code, translate = (key) => key) {
    if (!code) return ""
    if (code in SYMBOLS) return SYMBOLS[code]
    if (code in TRANSLATED) return translate(TRANSLATED[code])
    const sided = SIDED_KEY.exec(code)
    if (sided) return `${sided[1]} ${SIDES[sided[2]]}`
    const match = PREFIXES.find(({ prefix }) => code.startsWith(prefix) && code.length > prefix.length)
    return match ? match.format(code.slice(match.prefix.length)) : code
}
