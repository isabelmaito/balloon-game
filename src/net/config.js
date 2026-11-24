/** Settings for the peer-to-peer online mode. */

/** Bumped whenever the message format changes, so mismatched builds refuse to play. */
export const PROTOCOL_VERSION = 2

/** Public STUN server used to discover each peer's public address. No TURN relay. */
export const RTC_CONFIG = Object.freeze({
    iceServers: Object.freeze([Object.freeze({ urls: "stun:stun.l.google.com:19302" })]),
})

export const DATA_CHANNEL_LABEL = "balloon-game"

/** Signaling codes are created anyway after this wait, with the candidates found so far. */
export const ICE_GATHERING_TIMEOUT_MS = 5000

/** Host broadcasts this many snapshots per second. */
export const SNAPSHOT_RATE = 20
export const SNAPSHOT_INTERVAL_SECONDS = 1 / SNAPSHOT_RATE

/** Snapshot coordinates are viewport fractions rounded to this many steps per unit. */
export const SNAPSHOT_PRECISION = 10000

/**
 * How fast the guest eases entities toward the latest snapshot, per second.
 * Higher is snappier; lower hides jitter between snapshots better.
 */
export const GUEST_SMOOTHING_RATE = 15

export const HOST_PLAYER_ID = 1
export const GUEST_PLAYER_ID = 2
