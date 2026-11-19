/** Axis-aligned bounding box overlap test. */
export function intersects(a, b) {
    return a.x < b.x + b.width
        && a.x + a.width > b.x
        && a.y < b.y + b.height
        && a.y + a.height > b.y
}

/** Shrinks a box around its center; sprites rarely fill their whole box. */
export function shrink(box, ratio) {
    const insetX = (box.width * (1 - ratio)) / 2
    const insetY = (box.height * (1 - ratio)) / 2
    return {
        x: box.x + insetX,
        y: box.y + insetY,
        width: box.width - insetX * 2,
        height: box.height - insetY * 2,
    }
}
