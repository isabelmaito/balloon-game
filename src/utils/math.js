export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max)
}

export function normalize({ x, y }) {
    const length = Math.hypot(x, y)
    if (length === 0) return { x: 0, y: 0 }
    return { x: x / length, y: y / length }
}

export function randomBetween(min, max) {
    return min + Math.random() * (max - min)
}
