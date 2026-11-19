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
