import "../net/messages.js"
import { t } from "../i18n/index.js"
import { ONLINE_ROLE } from "../net/online-session.js"

const STATUS_TONE = Object.freeze({ INFO: "info", ERROR: "error" })

/** Shows a translated text and keeps it translated when the language changes. */
function setTranslatedText(element, key) {
    element.dataset.i18n = key
    element.textContent = t(key)
}

/**
 * Host/join screen for online play. Guides both players through the manual
 * code exchange and reports the connection status of an `OnlineSession`.
 */
export class OnlineScreen {
    #app
    #session
    #elements
    /** Incremented on every new attempt so late async results of an old one are ignored. */
    #attempt = 0

    constructor({ app, session, root = document }) {
        this.#app = app
        this.#session = session
        const find = (role) => root.querySelector(`[data-role="${role}"]`)
        this.#elements = {
            roles: find("online-roles"),
            local: find("online-local"),
            localCode: root.getElementById("online-local-code"),
            remote: find("online-remote"),
            remoteLabel: find("online-remote-label"),
            remoteCode: root.getElementById("online-remote-code"),
            connect: root.querySelector('[data-action="online-connect"]'),
            start: root.querySelector('[data-action="online-start"]'),
            status: find("online-status"),
            notice: find("online-notice"),
        }
    }

    mount() {
        const app = this.#app
        const session = this.#session
        const play = app.actions.get("play")
        const quit = app.actions.get("quit")
        app.registerAction("play", () => {
            this.#hideNotice()
            if (session.isActive) session.startMatch()
            else play()
        })
        app.registerAction("quit", () => (session.isActive ? session.leave() : quit()))
        app.registerAction("online", () => this.open())
        app.registerAction("online-host", () => this.#host())
        app.registerAction("online-join", () => this.#join())
        app.registerAction("online-connect", () => this.#connect())
        app.registerAction("online-copy", () => this.#copyCode())
        app.registerAction("online-start", () => session.startMatch())
        app.registerAction("online-back", () => (session.isActive ? session.leave() : app.showMenu()))
        app.events.on("online:connected", ({ role }) => this.#showConnected(role))
        app.events.on("online:ended", ({ reason }) => this.#showEnded(reason))
    }

    open() {
        this.#attempt++
        this.#hideNotice()
        this.#resetView()
        this.#app.screens.show("online")
    }

    async #host() {
        const attempt = this.#beginStep()
        this.#elements.roles.hidden = true
        this.#setStatus("online.status.creating")
        try {
            const offerCode = await this.#session.host()
            if (attempt !== this.#attempt) return
            this.#showLocalCode(offerCode)
            this.#askForRemoteCode("online.pasteAnswer")
            this.#setStatus("online.status.sendOffer")
        } catch (error) {
            if (attempt === this.#attempt) this.#fail("online.error.failed", error)
        }
    }

    #join() {
        this.#beginStep()
        this.#elements.roles.hidden = true
        this.#askForRemoteCode("online.pasteOffer")
        this.#setStatus("online.status.askOffer")
    }

    async #connect() {
        const code = this.#elements.remoteCode.value.trim()
        if (!code) return
        const attempt = this.#beginStep()
        const isHost = this.#session.isHost
        this.#elements.connect.disabled = true
        this.#setStatus(isHost ? "online.status.connecting" : "online.status.creating")
        try {
            if (isHost) {
                await this.#session.acceptAnswer(code)
            } else {
                const answerCode = await this.#session.join(code)
                if (attempt !== this.#attempt) return
                this.#showLocalCode(answerCode)
                this.#setStatus("online.status.sendAnswer")
            }
            if (attempt === this.#attempt) this.#elements.remote.hidden = true
        } catch (error) {
            if (attempt === this.#attempt) this.#fail("online.error.invalidCode", error)
        } finally {
            this.#elements.connect.disabled = false
        }
    }

    async #copyCode() {
        const { localCode } = this.#elements
        try {
            await navigator.clipboard.writeText(localCode.value)
            this.#setStatus("online.status.copied")
        } catch {
            localCode.select()
            const copied = document.execCommand?.("copy") ?? false
            this.#setStatus(copied ? "online.status.copied" : "online.status.copyManually")
        }
    }

    #showConnected(role) {
        this.#attempt++
        document.body.dataset.onlineRole = role
        const isHost = role === ONLINE_ROLE.HOST
        this.#elements.local.hidden = true
        this.#elements.remote.hidden = true
        this.#elements.start.hidden = !isHost
        this.#setStatus(isHost ? "online.status.connectedHost" : "online.status.connectedGuest")
    }

    #showEnded(reason) {
        this.#attempt++
        delete document.body.dataset.onlineRole
        if (!reason) return
        setTranslatedText(this.#elements.notice, `online.ended.${reason}`)
        this.#elements.notice.hidden = false
    }

    #beginStep() {
        return ++this.#attempt
    }

    #resetView() {
        const elements = this.#elements
        elements.roles.hidden = false
        elements.local.hidden = true
        elements.remote.hidden = true
        elements.start.hidden = true
        elements.connect.disabled = false
        elements.localCode.value = ""
        elements.remoteCode.value = ""
        this.#setStatus(null)
    }

    #showLocalCode(code) {
        this.#elements.localCode.value = code
        this.#elements.local.hidden = false
    }

    #askForRemoteCode(labelKey) {
        setTranslatedText(this.#elements.remoteLabel, labelKey)
        this.#elements.remoteCode.value = ""
        this.#elements.remote.hidden = false
        this.#elements.remoteCode.focus()
    }

    #fail(key, error) {
        console.warn("Online connection step failed:", error)
        this.#setStatus(key, STATUS_TONE.ERROR)
    }

    #setStatus(key, tone = STATUS_TONE.INFO) {
        const { status } = this.#elements
        status.dataset.tone = tone
        if (key) {
            setTranslatedText(status, key)
            return
        }
        delete status.dataset.i18n
        status.textContent = ""
    }

    #hideNotice() {
        this.#elements.notice.hidden = true
    }
}
