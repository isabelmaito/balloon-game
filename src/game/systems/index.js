import { EffectsSystem } from "./effects-system.js"
import { HazardSystem } from "./hazard-system.js"
import { LivesSystem } from "./lives-system.js"
import { PowerUpSystem } from "./power-up-system.js"

/**
 * Plugs hazards, lives and power-ups into a game. Power-ups run first so a shield grabbed this frame already counts.
 * Returns the systems whose `entities` other features (such as online sync) read.
 */
export function installSurvivalSystems({ game, events }) {
    const powerUps = new PowerUpSystem({ events })
    const hazards = new HazardSystem({ events })
    game
        .addSystem(new EffectsSystem({ events }))
        .addSystem(new LivesSystem({ events }))
        .addSystem(powerUps)
        .addSystem(hazards)
    return { hazards, powerUps }
}
