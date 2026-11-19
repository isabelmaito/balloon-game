/** Owns a list of entities, mounts them in a container and prunes dead ones. */
export class EntityGroup {
    #entities = []
    #container

    constructor(container) {
        this.#container = container
    }

    get items() {
        return this.#entities
    }

    add(entity) {
        this.#entities.push(entity)
        this.#container.appendChild(entity.element)
        return entity
    }

    update(deltaSeconds) {
        for (const entity of this.#entities) {
            entity.update(deltaSeconds)
            if (entity.isOffscreen) entity.destroy()
        }
        this.prune()
    }

    render() {
        for (const entity of this.#entities) entity.render()
    }

    prune() {
        this.#entities = this.#entities.filter((entity) => entity.isAlive)
    }

    clear() {
        for (const entity of this.#entities) entity.destroy()
        this.#entities = []
    }
}
