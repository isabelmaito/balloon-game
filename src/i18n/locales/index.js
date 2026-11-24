import en from "./en.js"
import es from "./es.js"
import fr from "./fr.js"
import ptBR from "./pt-BR.js"

export const DEFAULT_LOCALE = "pt-BR"

export const LOCALES = Object.freeze([
    { code: "pt-BR", label: "Português", messages: ptBR },
    { code: "en", label: "English", messages: en },
    { code: "es", label: "Español", messages: es },
    { code: "fr", label: "Français", messages: fr },
])
