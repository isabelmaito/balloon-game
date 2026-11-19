/** Mirrors the current level's sky on `<body data-sky>` so CSS can tint the background. */
export function mountSkyTheme({ events, body = document.body }) {
    events.on("level:changed", ({ level }) => {
        body.dataset.sky = level.sky
    })
}
