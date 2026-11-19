import { mountDifficultyPicker } from "./difficulty-picker.js"
import { LevelSystem } from "./level-system.js"

/**
 * Wires difficulty selection and level progression into the app.
 * Call before `app.init()` so the first match already sees the saved options.
 */
export function mountProgression({ app, settings, root = document }) {
    const { game, events } = app
    const levels = new LevelSystem({ events })
    game.addSystem(levels)

    mountDifficultyPicker(root.getElementById("difficulty-picker"), {
        settings,
        onSelect: (difficulty) => {
            app.matchOptions.difficulty = difficulty
        },
    })
    return { levels }
}
