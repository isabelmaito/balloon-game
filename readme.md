# Balloon Game

Jogo de balão feito com HTML, CSS e JavaScript puro, sem bibliotecas nem bundler.
Desvie de nuvens de tempestade e pássaros, junte moedas e power-ups e chegue o mais
longe possível, sozinho, com alguém no mesmo teclado ou online.

## Funcionalidades

- **Fases**: dia, pôr do sol, noite e tempestade, cada uma mais rápida que a anterior.
- **Dificuldades**: fácil, normal e difícil (velocidade, frequência de obstáculos e vidas).
- **Obstáculos e vidas**: nuvens de tempestade e pássaros tiram vidas; o balão pisca
  enquanto está invulnerável.
- **Power-ups**: escudo, ímã de moedas e moedas em dobro.
- **Balões**: clássico, festa, balão de ar quente, coração e estrela.
- **Multijogador local**: dois jogadores no mesmo teclado.
- **Multijogador online**: dois navegadores conectados por WebRTC, sem servidor.
- **Teclas configuráveis** para cada jogador.
- **Recordes, estatísticas e conquistas** salvos no navegador.
- **Idiomas**: português, inglês, espanhol e francês.

## Como rodar

O jogo usa ES modules, então precisa ser servido por HTTP (abrir o `index.html`
direto pelo sistema de arquivos não funciona).

```bash
npm start
```

Depois abra <http://localhost:8080>. O script usa `python3 -m http.server`; qualquer
servidor estático serve.

## Controles

| Ação | Jogador 1 | Jogador 2 |
| --- | --- | --- |
| Mover | Setas | W A S D |
| Pausar / continuar | Esc ou P | Esc ou P |

As teclas podem ser trocadas em **Controles**, no menu principal. Esc e P ficam
reservadas para a pausa.

## Jogando online

A conexão é ponto a ponto (WebRTC). Não existe servidor do jogo: os dois jogadores
trocam códigos manualmente, por qualquer mensageiro.

1. Quem hospeda clica em **Online → Criar partida** e envia o código gerado.
2. Quem entra clica em **Online → Entrar em partida**, cola o código, clica em
   **Conectar** e devolve o código de resposta.
3. Quem hospeda cola a resposta, clica em **Conectar** e depois em **Iniciar partida**.

A partida roda no navegador de quem hospeda; o outro navegador envia só os comandos
e recebe o estado do jogo. Pausar de um lado pausa os dois. Redes muito restritivas
(alguns NATs corporativos) podem impedir a conexão, porque o jogo usa apenas STUN.

## Estrutura do projeto

```
index.html        telas e HUD
css/              estilos por funcionalidade
src/main.js       ponto de entrada, monta as dependências
src/app.js        fluxo de telas
src/core/         loop, teclado, eventos, armazenamento
src/entities/     balão, moedas, obstáculos, power-ups
src/game/         regras da partida e sistemas
src/progression/  dificuldade e fases
src/progress/     estatísticas, recordes e conquistas
src/multiplayer/  multijogador local, skins e controles
src/net/          multijogador online
src/i18n/         traduções
tests/            testes unitários
```

Os detalhes de arquitetura estão em [docs/architecture.md](docs/architecture.md).

## Testes

```bash
npm test
```

Usa o test runner nativo do Node (`node --test`), sem dependências.

## Contribuindo

Veja [CONTRIBUTING.md](CONTRIBUTING.md).

## Versões anteriores

V1:


![Balloon Game Screenshot](screenshots/Drifblim.gif)

V2:


![Balloon Game Screenshot](screenshots/Drifblim2.gif)

V3:


![Balloon Game Screenshot](screenshots/Drifblim3.gif)
