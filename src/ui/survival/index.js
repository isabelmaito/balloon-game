import "./messages.js"
import { bindBalloonStatus } from "./balloon-status.js"
import { EffectsHud } from "./effects-hud.js"
import { LivesHud } from "./lives-hud.js"

/** Mounts the views for hazards, lives and power-ups. Call after the HUD listens to `game:setup`. */
export function mountSurvivalUi({ hud, events }) {
    bindBalloonStatus(events)
    new LivesHud({ hud, events })
    new EffectsHud({ hud, events })
}
