/** CSS-drawn symbol of an effect, shared by power-up bubbles and the HUD. */
export function createEffectIcon(kind) {
    const icon = document.createElement("span")
    icon.className = "effect-icon"
    icon.dataset.kind = kind
    return icon
}
