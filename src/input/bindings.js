export const ACTIONS = Object.freeze(["up", "down", "left", "right"])

export const DEFAULT_BINDINGS = Object.freeze({
    arrows: Object.freeze({ up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" }),
    wasd: Object.freeze({ up: "KeyW", down: "KeyS", left: "KeyA", right: "KeyD" }),
})
