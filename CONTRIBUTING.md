# Contribuindo

## Código

- JavaScript puro com ES modules; nada de dependências de runtime.
- 4 espaços, sem ponto e vírgula, aspas duplas (veja `.editorconfig`).
- Regras de jogo novas entram como sistemas (`game.addSystem`) em vez de crescer a classe `Game`.
- Textos visíveis passam pelo i18n. Cada funcionalidade registra as próprias mensagens
  com `registerMessages`, em todos os idiomas listados em `src/i18n/locales/index.js`.
- Lógica pura ganha teste em `tests/`. Rode `npm test` antes de cada commit.

## Novo idioma

1. Crie `src/i18n/locales/<código>.js` com as mensagens base.
2. Adicione o bloco do idioma em cada `messages.js` de funcionalidade.
3. Registre o idioma em `LOCALES` (`src/i18n/locales/index.js`).

O teste `tests/locale-coverage.test.js` falha enquanto faltar alguma chave.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/) com commits pequenos,
cada um deixando o jogo funcionando:

```
feat(hud): show remaining lives
fix(core): let the game loop stop from inside its update
docs(readme): explain how to play online
```

Tipos usados: `feat`, `fix`, `refactor`, `style`, `test`, `docs`, `chore`.
