/**
 * Two-step "reset progress" control: the trigger button reveals a confirmation
 * panel, and only its confirm button actually wipes the progress.
 */
export class ResetPrompt {
    constructor({ root, onConfirm }) {
        this.trigger = root.querySelector('[data-action="progress-reset"]')
        this.panel = root.querySelector('[data-role="progress-reset-confirm"]')
        this.cancelButton = this.panel.querySelector('[data-action="progress-reset-cancel"]')
        this.onConfirm = onConfirm
        this.close()
    }

    ask() {
        this.trigger.hidden = true
        this.panel.hidden = false
        // Focus the harmless choice so a stray Enter does not erase anything.
        this.cancelButton.focus()
    }

    cancel() {
        this.close()
        this.trigger.focus()
    }

    confirm() {
        this.onConfirm()
        this.cancel()
    }

    close() {
        this.panel.hidden = true
        this.trigger.hidden = false
    }
}
