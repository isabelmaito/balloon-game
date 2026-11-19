import "./messages.js"
import { GAME_STATE } from "../game/game.js"
import { PlayerPreferences } from "../game/player-preferences.js"
import { ControlsScreen } from "./controls-screen.js"
import { PlayerSetupPanel } from "./player-setup-panel.js"
import { PlayerTags } from "./player-tags.js"

/**
 * Installs same-keyboard multiplayer: player count, skins and key bindings are
 * read from settings and written to `app.matchOptions.players` before each match.
 */
export function installMultiplayer({ app, game, events, settings, root = document }) {
    const preferences = new PlayerPreferences(settings)
    new PlayerTags({ events })

    const applyPreferences = () => {
        app.matchOptions.players = preferences.toMatchPlayers()
        if (game.state === GAME_STATE.IDLE) game.setup(app.matchOptions)
    }

    new PlayerSetupPanel({ root: root.querySelector('[data-role="player-setup"]'), preferences }).mount()
    const controls = new ControlsScreen({ root: root.querySelector('[data-screen="controls"]'), preferences })
    controls.mount()
    app.registerAction("controls", () => app.screens.show("controls"))
    app.registerAction("controls-back", () => {
        controls.close()
        app.screens.show("menu")
    })
    preferences.onChange(applyPreferences)
    app.matchOptions.players = preferences.toMatchPlayers()
    return preferences
}
