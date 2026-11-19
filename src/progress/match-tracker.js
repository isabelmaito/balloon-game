const SHARED_LIVES = "shared"
const DEFAULT_COIN_VALUE = 1

const readNumber = (payload, field) => (typeof payload === "number" ? payload : payload?.[field])

export const coinValue = (coin) => coin?.value ?? DEFAULT_COIN_VALUE

/**
 * Game system that summarizes the running match for the progress feature.
 * Time comes from the loop's delta, so pauses are not counted. Level and lives
 * events are optional: when no system emits them those fields stay at zero.
 */
export class MatchTracker {
    #game = null
    #lives = new Map()

    constructor({ events }) {
        this.#reset()
        events.on("coin:collected", ({ coin }) => {
            this.coins += coinValue(coin)
        })
        events.on("level:changed", (payload) => {
            const level = readNumber(payload, "number")
            if (Number.isFinite(level)) this.level = Math.max(this.level, level)
        })
        events.on("lives:changed", (payload) => this.#trackLives(payload))
    }

    setup(game) {
        this.#game = game
        this.#reset()
    }

    update(deltaSeconds) {
        this.durationSeconds += deltaSeconds
        if (this.livesLost === 0) this.flawlessSeconds = this.durationSeconds
    }

    /** A plain summary in the shape the stats reducers expect. */
    snapshot() {
        const players = this.#game?.players ?? []
        return {
            score: Math.max(0, ...players.map(({ score }) => score)),
            coins: this.coins,
            durationSeconds: this.durationSeconds,
            flawlessSeconds: this.flawlessSeconds,
            level: this.level,
            difficulty: this.#game?.difficulty?.id ?? null,
            players: players.length,
        }
    }

    #reset() {
        this.coins = 0
        this.durationSeconds = 0
        this.flawlessSeconds = 0
        this.level = 0
        this.livesLost = 0
        this.#lives.clear()
    }

    #trackLives(payload) {
        const lives = readNumber(payload, "lives")
        if (!Number.isFinite(lives)) return
        const key = payload?.player?.id ?? SHARED_LIVES
        const previous = this.#lives.get(key)
        if (previous !== undefined && lives < previous) this.livesLost += previous - lives
        this.#lives.set(key, lives)
    }
}
