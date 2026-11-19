import { registerMessages } from "../i18n/index.js"

/** Strings for difficulty selection, levels and distance, per locale. */
export const PROGRESSION_MESSAGES = Object.freeze({
    "pt-BR": {
        "menu.difficulty": "Dificuldade",
        "difficulty.easy": "Fácil",
        "difficulty.normal": "Normal",
        "difficulty.hard": "Difícil",
        "level.name.day": "Dia",
        "level.name.sunset": "Pôr do sol",
        "level.name.night": "Noite",
        "level.name.storm": "Tempestade",
        "level.banner": "Fase {number} — {name}",
        "hud.level": "Fase {number}",
        "gameOver.distance": "Distância percorrida: {distance} m",
    },
    en: {
        "menu.difficulty": "Difficulty",
        "difficulty.easy": "Easy",
        "difficulty.normal": "Normal",
        "difficulty.hard": "Hard",
        "level.name.day": "Daytime",
        "level.name.sunset": "Sunset",
        "level.name.night": "Night",
        "level.name.storm": "Storm",
        "level.banner": "Level {number} — {name}",
        "hud.level": "Level {number}",
        "gameOver.distance": "Distance travelled: {distance} m",
    },
    es: {
        "menu.difficulty": "Dificultad",
        "difficulty.easy": "Fácil",
        "difficulty.normal": "Normal",
        "difficulty.hard": "Difícil",
        "level.name.day": "Día",
        "level.name.sunset": "Atardecer",
        "level.name.night": "Noche",
        "level.name.storm": "Tormenta",
        "level.banner": "Fase {number} — {name}",
        "hud.level": "Fase {number}",
        "gameOver.distance": "Distancia recorrida: {distance} m",
    },
})

registerMessages(PROGRESSION_MESSAGES)
