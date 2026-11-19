import { moveToward, toPixels } from "./snapshot.js"

/**
 * Keeps local entities in step with one list of a snapshot, matched by id:
 * new ids appear right at their position, known ones glide toward it and
 * ids that are gone get destroyed. Pruning the owning group is up to the caller.
 */
export class EntityMirror {
    #create
    #entities = new Map()

    /** `create(state)` builds and mounts the local entity for a new snapshot entry. */
    constructor(create) {
        this.#create = create
    }

    apply(states, viewport, factor) {
        const visibleIds = new Set()
        for (const state of states) {
            visibleIds.add(state.id)
            const target = toPixels(state, viewport)
            const entity = this.#entities.get(state.id)
            if (entity) moveToward(entity, target, factor)
            else this.#entities.set(state.id, Object.assign(this.#create(state), target))
        }
        for (const [id, entity] of this.#entities) {
            if (visibleIds.has(id)) continue
            entity.destroy()
            this.#entities.delete(id)
        }
    }

    clear() {
        for (const entity of this.#entities.values()) entity.destroy()
        this.#entities.clear()
    }
}
