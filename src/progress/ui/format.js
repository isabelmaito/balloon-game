import { i18n, t } from "../../i18n/index.js"
import { PROGRESS_UNIT, SECONDS_PER_MINUTE } from "../units.js"

const DATE_OPTIONS = Object.freeze({ dateStyle: "medium" })

export function formatDate(timestamp) {
    return new Intl.DateTimeFormat(i18n.locale, DATE_OPTIONS).format(timestamp)
}

export function formatDuration(totalSeconds) {
    const seconds = Math.floor(totalSeconds)
    return t("progress.duration", {
        minutes: Math.floor(seconds / SECONDS_PER_MINUTE),
        seconds: seconds % SECONDS_PER_MINUTE,
    })
}

export function formatProgress({ unit }, { current, goal }) {
    const key = unit === PROGRESS_UNIT.SECONDS
        ? "progress.achievements.progressSeconds"
        : "progress.achievements.progress"
    return t(key, { current: Math.floor(current), goal })
}

export function formatDifficulty(id) {
    return t(`progress.difficulty.${id}`)
}

/** Creates an element with optional class name and text content. */
export function createElement(tag, { className, text } = {}) {
    const element = document.createElement(tag)
    if (className) element.className = className
    if (text !== undefined) element.textContent = text
    return element
}
