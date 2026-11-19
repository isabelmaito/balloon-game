import { mountDifficultyPicker } from "./difficulty-picker.js"
import { mountDistanceResult } from "./distance-result.js"
import { LevelBanner } from "./level-banner.js"
import { LevelIndicator } from "./level-indicator.js"
import { LevelSystem } from "./level-system.js"
import { mountSkyTheme } from "./sky-theme.js"

/**
 * Wires difficulty selection and level progression into the app.
 * Call before `app.init()` so the first match already sees the saved options.
 */
export function mountProgression({ app, settings, root = document }) {
    const { game, events } = app
    const levels = new LevelSystem({ events })
    game.addSystem(levels)
    new LevelIndicator({ element: root.getElementById("level-indicator"), events })
    new LevelBanner({ element: root.getElementById("level-banner"), events })
    mountSkyTheme({ events, body: root.body })
    mountDistanceResult({ element: root.querySelector('[data-role="distance"]'), events, levels })

    mountDifficultyPicker(root.getElementById("difficulty-picker"), {
        settings,
        onSelect: (difficulty) => {
            app.matchOptions.difficulty = difficulty
        },
    })
    return { levels }
}
