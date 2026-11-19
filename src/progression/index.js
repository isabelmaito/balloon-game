import { mountDifficultyPicker } from "./difficulty-picker.js"

/**
 * Wires difficulty selection and level progression into the app.
 * Call before `app.init()` so the first match already sees the saved options.
 */
export function mountProgression({ app, settings, root = document }) {
    mountDifficultyPicker(root.getElementById("difficulty-picker"), {
        settings,
        onSelect: (difficulty) => {
            app.matchOptions.difficulty = difficulty
        },
    })
}
