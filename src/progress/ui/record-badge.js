/** Reveals the "new record" badge on the game over screen when the best score was beaten. */
export function mountRecordBadge(element, events) {
    if (!element) return
    element.hidden = true
    events.on("game:setup", () => {
        element.hidden = true
    })
    events.on("progress:match-recorded", ({ isRecord }) => {
        element.hidden = !isRecord
    })
}
