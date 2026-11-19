import "./messages.js"
import { GAME_STATE } from "../game/game.js"
import { PlayerPreferences } from "../game/player-preferences.js"
import { PlayerSetupPanel } from "./player-setup-panel.js"

/**
 * Installs same-keyboard multiplayer: player count, skins and key bindings are
 * read from settings and written to `app.matchOptions.players` before each match.
 */
export function installMultiplayer({ app, game, settings, root = document }) {
    const preferences = new PlayerPreferences(settings)

    const applyPreferences = () => {
        app.matchOptions.players = preferences.toMatchPlayers()
        if (game.state === GAME_STATE.IDLE) game.setup(app.matchOptions)
    }

    new PlayerSetupPanel({ root: root.querySelector('[data-role="player-setup"]'), preferences }).mount()
    preferences.onChange(applyPreferences)
    app.matchOptions.players = preferences.toMatchPlayers()
    return preferences
}
