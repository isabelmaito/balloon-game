export const ACTIONS = Object.freeze(["up", "down", "left", "right"])

export const DEFAULT_BINDINGS = Object.freeze({
    arrows: Object.freeze({ up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" }),
    wasd: Object.freeze({ up: "KeyW", down: "KeyS", left: "KeyA", right: "KeyD" }),
})

/** Default scheme of each player slot sharing the keyboard, in player order. */
export const PLAYER_DEFAULT_BINDINGS = Object.freeze([DEFAULT_BINDINGS.arrows, DEFAULT_BINDINGS.wasd])

/** Keys that toggle the pause screen, so they can never steer a balloon. */
export const PAUSE_KEYS = Object.freeze(["Escape", "KeyP"])
