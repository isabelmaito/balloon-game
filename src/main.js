import { App } from "./app.js"
import { EventBus } from "./core/event-bus.js"
import { Settings } from "./core/settings.js"
import { storage } from "./core/storage.js"
import { Keyboard } from "./core/keyboard.js"
import { Game } from "./game/game.js"
import { i18n, translateDom } from "./i18n/index.js"
import { DEFAULT_LOCALE } from "./i18n/locales/index.js"
import { mountProgression } from "./progression/index.js"
import { installProgress } from "./progress/index.js"
import { installMultiplayer } from "./multiplayer/index.js"
import { Hud } from "./ui/hud.js"
import { OnlineSession } from "./net/online-session.js"
import { mountLanguagePicker } from "./ui/language-picker.js"
import { OnlineScreen } from "./ui/online-screen.js"
import { ScreenManager } from "./ui/screen-manager.js"

const settings = new Settings({ storage, defaults: { locale: DEFAULT_LOCALE } })
i18n.setLocale(settings.get("locale"))
i18n.onChange(() => translateDom())
translateDom()
mountLanguagePicker(document.getElementById("language-picker"), settings)

const keyboard = new Keyboard()
const events = new EventBus()
const game = new Game({
    playfield: document.getElementById("main"),
    keyboard,
    events,
})

const hud = new Hud({ root: document.getElementById("hud"), events })

keyboard.attach()
events.on("game:state", (state) => {
    document.body.dataset.gameState = state
})
events.on("game:setup", ({ players }) => hud.setPlayers(players))

const app = new App({ game, screens: new ScreenManager(), events })
mountProgression({ app, settings })
installProgress({ app, game, events, storage })
installMultiplayer({ app, game, events, settings })
app.init()
new OnlineScreen({ app, session: new OnlineSession({ app, game, events }) }).mount()
