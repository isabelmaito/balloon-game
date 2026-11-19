import { EffectsSystem } from "./effects-system.js"
import { HazardSystem } from "./hazard-system.js"

/** Plugs hazards, lives and power-ups into a game. */
export function installSurvivalSystems({ game, events }) {
    game
        .addSystem(new EffectsSystem({ events }))
        .addSystem(new HazardSystem({ events }))
}
