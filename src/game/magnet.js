export function centerOf({ x, y, width, height }) {
    return { x: x + width / 2, y: y + height / 2 }
}

/**
 * Moves `item` (a box with x, y, width, height) toward `target` by at most
 * `maxStep` pixels when its center lies within `radius`. Returns whether it moved.
 */
export function attract(item, target, { radius, maxStep }) {
    const center = centerOf(item)
    const offsetX = target.x - center.x
    const offsetY = target.y - center.y
    const distance = Math.hypot(offsetX, offsetY)
    if (distance === 0 || distance > radius) return false
    const step = Math.min(maxStep, distance)
    item.x += (offsetX / distance) * step
    item.y += (offsetY / distance) * step
    return true
}
