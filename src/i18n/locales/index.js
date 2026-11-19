import en from "./en.js"
import es from "./es.js"
import ptBR from "./pt-BR.js"

export const DEFAULT_LOCALE = "pt-BR"

export const LOCALES = Object.freeze([
    { code: "pt-BR", label: "Português", messages: ptBR },
    { code: "en", label: "English", messages: en },
    { code: "es", label: "Español", messages: es },
])
