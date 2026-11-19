# Contribuindo

## Código

- JavaScript puro com ES modules; nada de dependências de runtime.
- 4 espaços, sem ponto e vírgula, aspas duplas (veja `.editorconfig`).
- Regras de jogo novas entram como sistemas (`game.addSystem`) em vez de crescer a classe `Game`.
- Textos visíveis passam pelo i18n. Cada funcionalidade registra as próprias mensagens
  com `registerMessages` em português, inglês e espanhol.
- Lógica pura ganha teste em `tests/`. Rode `npm test` antes de cada commit.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/) com commits pequenos,
cada um deixando o jogo funcionando:

```
feat(hud): show remaining lives
fix(core): let the game loop stop from inside its update
docs(readme): explain how to play online
```

Tipos usados: `feat`, `fix`, `refactor`, `style`, `test`, `docs`, `chore`.
