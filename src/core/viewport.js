/** Read-only view of the playable area size, in pixels. */
export const viewport = {
    get width() {
        return window.innerWidth
    },
    get height() {
        return window.innerHeight
    },
}
