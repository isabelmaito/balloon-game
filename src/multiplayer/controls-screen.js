import { i18n, t } from "../i18n/index.js"
import { ASSIGN_ERROR, assignKey } from "../input/binding-rules.js"
import { ACTIONS } from "../input/bindings.js"
import { KeyCapture } from "../input/key-capture.js"
import { formatKey } from "../input/key-names.js"

const STATUS_MESSAGES = Object.freeze({
    waiting: "controls.waiting",
    saved: "controls.saved",
    cancelled: "controls.cancelled",
    [ASSIGN_ERROR.TAKEN]: "controls.taken",
    [ASSIGN_ERROR.RESERVED]: "controls.reserved",
})

const WAITING_LABEL = "…"

function createElement(tag, className, text = "") {
    const element = document.createElement(tag)
    element.className = className
    element.textContent = text
    return element
}

const isSameSlot = (a, b) => a?.player === b?.player && a?.action === b?.action

/**
 * Screen listing every player's keys, one row per movement action. "Change"
 * waits for the next key press and refuses keys already in use.
 */
export class ControlsScreen {
    #grid
    #status
    #capture = new KeyCapture()
    /** Slot waiting for a key, as `{ player, action }` with a 0-based player. */
    #pending = null
    /** Last feedback shown, kept raw so it can be translated again. */
    #feedback = null

    constructor({ root, preferences }) {
        this.root = root
        this.preferences = preferences
    }

    mount() {
        this.#grid = this.root.querySelector('[data-role="controls-grid"]')
        this.#status = this.root.querySelector('[data-role="controls-status"]')
        this.#grid.addEventListener("click", (event) => {
            const button = event.target.closest("[data-binding-action]")
            if (button) this.startChange({ player: Number(button.dataset.bindingPlayer), action: button.dataset.bindingAction })
        })
        i18n.onChange(() => this.render())
        this.preferences.onChange(() => this.render())
        this.render()
    }

    startChange(slot) {
        this.#capture.start({
            onKey: (code) => this.#assign(slot, code),
            onCancel: () => this.#finish(slot, { type: "cancelled" }),
        })
        this.#pending = slot
        this.#feedback = { type: "waiting", ...slot }
        this.render()
        this.#focus(slot)
    }

    restoreDefaults() {
        this.#capture.cancel()
        this.#feedback = null
        this.preferences.resetBindings()
    }

    /** Stops any pending change, e.g. when leaving the screen. */
    close() {
        this.#capture.cancel()
        this.#feedback = null
        this.render()
    }

    #assign(slot, code) {
        const result = assignKey(this.preferences.bindings, { ...slot, code })
        if (!result.ok) {
            this.#finish(slot, { type: result.reason, code, ...(result.conflict ?? slot) })
            return
        }
        this.#pending = null
        this.#feedback = { type: "saved", code, ...slot }
        this.preferences.bindings = result.bindings
        this.#focus(slot)
    }

    #finish(slot, feedback) {
        this.#pending = null
        this.#feedback = feedback
        this.render()
        this.#focus(slot)
    }

    render() {
        this.#grid.replaceChildren(...this.preferences.bindings.map((bindings, player) => this.#renderPlayer(bindings, player)))
        this.#status.textContent = this.#describe(this.#feedback)
    }

    #describe(feedback) {
        if (!feedback) return ""
        return t(STATUS_MESSAGES[feedback.type], {
            player: feedback.player + 1,
            action: t(`controls.action.${feedback.action}`),
            key: formatKey(feedback.code, t),
        })
    }

    #renderPlayer(bindings, player) {
        const card = createElement("section", "controls-player")
        card.appendChild(createElement("h3", "controls-player__name", t("players.name", { player: player + 1 })))
        for (const action of ACTIONS) card.appendChild(this.#renderRow({ player, action, code: bindings[action] }))
        return card
    }

    #renderRow({ player, action, code }) {
        const isWaiting = isSameSlot(this.#pending, { player, action })
        const row = createElement("div", "controls-row")
        row.classList.toggle("is-waiting", isWaiting)

        const actionName = t(`controls.action.${action}`)
        const button = createElement("button", "button button--small", t("controls.change"))
        button.type = "button"
        button.dataset.bindingPlayer = String(player)
        button.dataset.bindingAction = action
        button.setAttribute("aria-pressed", String(isWaiting))
        button.setAttribute("aria-label", t("controls.changeLabel", { player: player + 1, action: actionName }))

        row.append(
            createElement("span", "controls-row__action", actionName),
            createElement("kbd", "controls-row__key", isWaiting ? WAITING_LABEL : formatKey(code, t)),
            button,
        )
        return row
    }

    #focus({ player, action }) {
        this.#grid.querySelector(`[data-binding-player="${player}"][data-binding-action="${action}"]`)?.focus()
    }
}
