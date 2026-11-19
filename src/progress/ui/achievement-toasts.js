import { t } from "../../i18n/index.js"
import { createElement } from "./format.js"

const TOAST_VISIBLE_MS = 4000
const TOAST_LEAVING_CLASS = "toast--leaving"

/** Announces unlocked achievements with stacked toasts in a polite live region. */
export class AchievementToasts {
    constructor({ events, root = document.body, visibleMs = TOAST_VISIBLE_MS }) {
        this.visibleMs = visibleMs
        this.region = createElement("div", { className: "toast-region" })
        this.region.setAttribute("role", "status")
        this.region.setAttribute("aria-live", "polite")
        root.appendChild(this.region)
        events.on("achievement:unlocked", ({ achievement }) => this.show(achievement))
    }

    show(achievement) {
        const toast = createElement("div", { className: "toast" })
        toast.append(
            createElement("span", { className: "toast__title", text: t("progress.achievements.toast") }),
            createElement("strong", { className: "toast__name", text: t(achievement.nameKey) }),
        )
        this.region.appendChild(toast)
        setTimeout(() => this.#dismiss(toast), this.visibleMs)
    }

    #dismiss(toast) {
        toast.classList.add(TOAST_LEAVING_CLASS)
        toast.addEventListener("animationend", () => toast.remove(), { once: true })
        // Without animations (reduced motion) animationend never fires.
        if (getComputedStyle(toast).animationName === "none") toast.remove()
    }
}
