import { t } from "../i18n/index.js"
import "./messages.js"

/** Writes the distance travelled in the match into the game over screen. */
export function mountDistanceResult({ element, events, levels }) {
    events.on("game:over", () => {
        element.textContent = t("gameOver.distance", { distance: Math.floor(levels.distance) })
    })
}
