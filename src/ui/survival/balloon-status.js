/**
 * Mirrors player state on the balloon element so CSS can animate it:
 * `data-effects` lists active effect names and `.is-out` drops the balloon.
 */
export function bindBalloonStatus(events) {
    events.on("effects:changed", ({ player, effects }) => {
        player.balloon.element.dataset.effects = effects.map(({ name }) => name).join(" ")
    })
    events.on("player:out", ({ player }) => {
        player.balloon.element.classList.add("is-out")
    })
}
