import { EffectsSystem } from "./effects-system.js"
import { HazardSystem } from "./hazard-system.js"
import { LivesSystem } from "./lives-system.js"
import { PowerUpSystem } from "./power-up-system.js"

/** Plugs hazards, lives and power-ups into a game. Power-ups run first so a shield grabbed this frame already counts. */
export function installSurvivalSystems({ game, events }) {
    game
        .addSystem(new EffectsSystem({ events }))
        .addSystem(new LivesSystem({ events }))
        .addSystem(new PowerUpSystem({ events }))
        .addSystem(new HazardSystem({ events }))
}
