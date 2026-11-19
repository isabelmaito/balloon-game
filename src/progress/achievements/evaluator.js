/** How far `stats` are from unlocking `achievement`, capped at its goal. */
export function progressOf(achievement, stats) {
    const measured = Number(achievement.measure(stats)) || 0
    const current = Math.min(Math.max(measured, 0), achievement.goal)
    return { current, goal: achievement.goal, ratio: current / achievement.goal, done: current >= achievement.goal }
}

/** Achievements whose goal is met by `stats` but are not unlocked yet. */
export function findNewlyUnlocked(catalog, stats, isUnlocked) {
    return catalog.filter((achievement) => !isUnlocked(achievement.id) && progressOf(achievement, stats).done)
}
