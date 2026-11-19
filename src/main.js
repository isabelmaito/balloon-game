import { EventBus } from "./core/event-bus.js"
import { Settings } from "./core/settings.js"
import { storage } from "./core/storage.js"
import { Keyboard } from "./core/keyboard.js"
import { Game } from "./game/game.js"
import { i18n, translateDom } from "./i18n/index.js"
import { DEFAULT_LOCALE } from "./i18n/locales/index.js"
import { Hud } from "./ui/hud.js"

const settings = new Settings({ storage, defaults: { locale: DEFAULT_LOCALE } })
i18n.setLocale(settings.get("locale"))
i18n.onChange(() => translateDom())
translateDom()

const keyboard = new Keyboard()
const events = new EventBus()
const game = new Game({
    playfield: document.getElementById("main"),
    keyboard,
    events,
})

const hud = new Hud({ root: document.getElementById("hud"), events })

keyboard.attach()
hud.setPlayers(game.players)
game.start()
