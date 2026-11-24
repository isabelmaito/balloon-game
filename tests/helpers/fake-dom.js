/**
 * Just enough DOM for entities and widgets to run under `node --test`.
 * Elements keep their children and parent so tests can check mounting.
 */
export function createFakeElement(tagName = "div") {
    const classes = new Set()
    return {
        tagName: tagName.toUpperCase(),
        className: "",
        style: {},
        dataset: {},
        children: [],
        parentNode: null,
        classList: {
            add: (...names) => names.forEach((name) => classes.add(name)),
            remove: (...names) => names.forEach((name) => classes.delete(name)),
            toggle: (name, force = !classes.has(name)) => {
                if (force) classes.add(name)
                else classes.delete(name)
                return force
            },
            contains: (name) => classes.has(name),
        },
        appendChild(child) {
            child.parentNode?.children.splice(child.parentNode.children.indexOf(child), 1)
            child.parentNode = this
            this.children.push(child)
            return child
        },
        append(...children) {
            for (const child of children) this.appendChild(child)
        },
        replaceChildren(...children) {
            for (const child of [...this.children]) child.parentNode = null
            this.children = []
            this.append(...children)
        },
        remove() {
            if (!this.parentNode) return
            this.parentNode.children.splice(this.parentNode.children.indexOf(this), 1)
            this.parentNode = null
        },
    }
}

/**
 * Installs fake `document` and `window` globals with the given viewport size.
 * Returns a function that restores the previous globals.
 */
export function installFakeDocument({ width = 1000, height = 500 } = {}) {
    const previous = { document: globalThis.document, window: globalThis.window }
    globalThis.document = { createElement: createFakeElement }
    globalThis.window = { innerWidth: width, innerHeight: height }
    return () => {
        for (const [name, value] of Object.entries(previous)) {
            if (value === undefined) delete globalThis[name]
            else globalThis[name] = value
        }
    }
}
