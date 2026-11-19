# Architecture

The game is plain JavaScript (ES modules), HTML and CSS. There is no bundler
and no runtime dependency: the browser loads `src/main.js` directly.

## Folders

| Path | Responsibility |
| --- | --- |
| `src/main.js` | Composition root. Creates the shared objects and wires them together. |
| `src/app.js` | Screen flow (menu, pause, game over) and `[data-action]` buttons. |
| `src/core/` | Engine pieces with no game rules: loop, keyboard, events, storage, settings, spawner. |
| `src/entities/` | Things drawn on the playfield. All extend `Entity`. |
| `src/game/` | Rules of a match: `Game`, `Player`, difficulty presets. |
| `src/input/` | Key bindings and the `Controls` mapper. |
| `src/i18n/` | Translator and the base locales. |
| `src/ui/` | DOM widgets: HUD, screen manager, pickers. |
| `src/progression/` | Difficulty picker, levels (phases), distance and their widgets. |
| `src/multiplayer/` | Same-keyboard multiplayer feature: player setup panel, controls screen, player tags and their strings. |
| `src/utils/` | Pure helpers (math, collision). |
| `tests/` | Unit tests for pure modules, run with `node --test`. |

## Key ideas

- **State lives in JS, the DOM mirrors it.** Entities keep `x`, `y`, `width`
  and `height` in pixels and only write a CSS transform in `render()`.
- **Sizes are relative to the viewport height**, see `src/config.js`.
- **Events decouple systems from UI.** `Game` emits `score:changed`,
  `coin:collected`, `game:state`, `game:setup` and `game:over` on the
  `EventBus`; widgets subscribe to them. The level system adds
  `level:changed` with `{ level, number, isFirst }`.
- **Systems extend a match.** `game.addSystem(system)` plugs an object with
  optional `setup(game)`, `update(deltaSeconds, game)` and `teardown(game)`.
- **Features own their strings.** Call `registerMessages({ "pt-BR": {...}, en: {...}, es: {...} })`
  next to the feature instead of growing the base locale files.
- **Levels stack on difficulty.** Systems set `game.levelModifiers`; `game.speedMultiplier`
  and `game.spawnMultiplier` combine them with the difficulty preset.
- **Match options.** Menus write to `app.matchOptions` (`players`, `difficulty`)
  and `app.play()` passes them to `game.setup()`.
- **Players and skins.** `PlayerPreferences` keeps `playerCount`, `skins` and
  `bindings` in `Settings` and builds `matchOptions.players` as
  `{ id, bindings, skin }`. Skins live in `src/game/skins.js`; each one is a
  `balloon--<id>` css modifier drawn in `css/skins.css` ("classic" keeps the image).
  Key rebinding rules (no duplicates, pause keys reserved) live in `src/input/binding-rules.js`.

## Online multiplayer

Two browsers play together over WebRTC with no server of our own. Code lives
in `src/net/` (config, protocol, peer link, sync systems, session, strings) and
the screen in `src/ui/online-screen.js`.

**Signaling is manual.** `PeerConnection` waits until ICE gathering is
complete, so one code per direction carries every candidate:

1. The host clicks *Host* and gets an **offer code**.
2. The guest pastes it under *Join* and gets an **answer code**.
3. The host pastes the answer; the data channel opens.

A code is the session description `{ type, sdp }` as JSON, UTF-8 encoded and
then base64 (`encodeSignal` / `decodeSignal` in `src/net/protocol.js`). Only a
public STUN server is configured, so peers behind strict NATs may not connect.

**The host is authoritative.** It runs the normal simulation; player 2 is
steered by a `RemoteControls` (same `direction` getter as `Controls`) fed by the
guest's input. `HostSyncSystem` broadcasts a snapshot 20 times per second. The
guest's game is set up with `simulate: false` (no movement, spawning or
collisions) and `GuestSyncSystem` sends the local direction whenever it changes
and eases balloons and coins toward the latest snapshot. Positions travel as
fractions of the viewport so different window sizes line up.

**Messages** are JSON objects with a `type`; each type has a validator and
anything invalid from the peer is dropped.

| Type | Direction | Payload |
| --- | --- | --- |
| `hello` | both | `version` (protocol version; a mismatch ends the session) |
| `input` | guest → host | `direction: { x, y }`, each axis -1, 0 or 1 |
| `state` | host → guest | `players: [{ id, x, y, score }]`, `coins: [{ id, x, y }]` |
| `start` | host → guest | `difficulty` |
| `pause` | both | `paused` |
| `over` | host → guest | `scores: [{ id, score }]` |
| `leave` | both | none |

**Pause is shared:** pausing or resuming on either side does the same on the
other, so the host never simulates while the guest is frozen.

**Ending.** *Quit* or *Back* sends `leave`. A received `leave`, a closed data
channel or a `disconnected`/`failed` connection ends the session; both sides
return to the menu and `online:ended { reason }` shows why. `OnlineSession`
also emits `online:connected { role }` once both peers said hello. Only the
host can start a rematch from the results screen.
