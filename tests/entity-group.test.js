import { describe, it } from "node:test"
import assert from "node:assert/strict"
import { EntityGroup } from "../src/core/entity-group.js"
import { createFakeElement } from "./helpers/fake-dom.js"

/** Entity double that records calls and owns a fake element. */
function fakeEntity({ isOffscreen = false } = {}) {
    return {
        element: createFakeElement(),
        isAlive: true,
        isOffscreen,
        updates: [],
        renders: 0,
        update(deltaSeconds) {
            this.updates.push(deltaSeconds)
        },
        render() {
            this.renders++
        },
        destroy() {
            this.isAlive = false
            this.element.remove()
        },
    }
}

function createGroup() {
    const container = createFakeElement()
    return { container, group: new EntityGroup(container) }
}

describe("EntityGroup", () => {
    it("mounts added entities in the container and returns them", () => {
        const { container, group } = createGroup()
        const entity = fakeEntity()
        assert.equal(group.add(entity), entity)
        assert.deepEqual(group.items, [entity])
        assert.deepEqual(container.children, [entity.element])
    })

    it("updates every entity with the elapsed time", () => {
        const { group } = createGroup()
        const entities = [group.add(fakeEntity()), group.add(fakeEntity())]
        group.update(0.25)
        assert.deepEqual(entities.map(({ updates }) => updates), [[0.25], [0.25]])
    })

    it("destroys and drops entities that left the screen", () => {
        const { container, group } = createGroup()
        const visible = group.add(fakeEntity())
        const gone = group.add(fakeEntity({ isOffscreen: true }))
        group.update(0.1)
        assert.equal(gone.isAlive, false)
        assert.deepEqual(group.items, [visible])
        assert.deepEqual(container.children, [visible.element])
    })

    it("prunes entities destroyed elsewhere", () => {
        const { group } = createGroup()
        const kept = group.add(fakeEntity())
        group.add(fakeEntity()).destroy()
        group.prune()
        assert.deepEqual(group.items, [kept])
    })

    it("renders every entity", () => {
        const { group } = createGroup()
        const entities = [group.add(fakeEntity()), group.add(fakeEntity())]
        group.render()
        assert.deepEqual(entities.map(({ renders }) => renders), [1, 1])
    })

    it("clear destroys everything and empties the group", () => {
        const { container, group } = createGroup()
        const entities = [group.add(fakeEntity()), group.add(fakeEntity())]
        group.clear()
        assert.ok(entities.every(({ isAlive }) => !isAlive))
        assert.deepEqual(group.items, [])
        assert.deepEqual(container.children, [])
    })
})
