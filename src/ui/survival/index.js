import { bindBalloonStatus } from "./balloon-status.js"

/** Mounts the views for hazards, lives and power-ups. */
export function mountSurvivalUi({ events }) {
    bindBalloonStatus(events)
}
