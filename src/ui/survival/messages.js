import { registerMessages } from "../../i18n/index.js"

export const SURVIVAL_MESSAGES = {
    "pt-BR": {
        "hud.lives": "Vidas: {lives}",
        "hud.effects": "Efeitos ativos",
        "effect.shield": "Escudo",
        "effect.magnet": "Ímã",
        "effect.doubleCoins": "Moedas em dobro",
    },
    en: {
        "hud.lives": "Lives: {lives}",
        "hud.effects": "Active effects",
        "effect.shield": "Shield",
        "effect.magnet": "Magnet",
        "effect.doubleCoins": "Double coins",
    },
    es: {
        "hud.lives": "Vidas: {lives}",
        "hud.effects": "Efectos activos",
        "effect.shield": "Escudo",
        "effect.magnet": "Imán",
        "effect.doubleCoins": "Monedas dobles",
    },
}

registerMessages(SURVIVAL_MESSAGES)
