# Histórico de Alterações (Changelog)

Todas as alterações notáveis neste projeto serão documentadas neste arquivo de acordo com as convenções do [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e aderindo ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [1.0.1] - 2026-05-24

### Fixed

- **Sanitização de HTML:** Remoção do comentário de ambient effect residual e comentários óbvios de placeholders dinâmicos JS.
- **Vazamento de Paths locais:** Correção de todos os links absolutos `file://` apontando para caminhos locais nos arquivos de documentação Markdown, substituídos por links relativos.

### Changed

- **Nomenclatura Semântica:** Classes do Hero (`title-number`, `title-main`, `title-country`, `hero-byline-container`) renomeadas para nomenclatura de domínio coerente (`ranking-figure`, `ranking-title`, `ranking-subtitle`, `guide-byline`) e correspondentes seletores CSS ajustados.
- **Configurações de Linting:** Habilitada a checagem com type-awareness no ESLint estrito.
- **Arquitetura TypeScript:** Configuração dividida com referências de projetos do TS (Solution TSConfig references para app, node e tests).
- **Testes Multi-browser:** Suíte Playwright E2E expandida para rodar testes contra a build de produção no Chromium, Firefox e Webkit.
- **Novos Scripts de CI:** Adicionados scripts informativos para validação autônoma do Zod (`npm run validate-data`), verificação de links absolutos nos docs (`npm run check-links`) e teste unitário da integridade de referências a ícones do Sprite SVG.

## [1.0.0] - 2026-05-24

Este release marca a modernização completa da base de código legada, estruturando o projeto para manutenção e evolução por uma equipe sênior.

### Adicionado

- **TypeScript:** Configuração estrita (`strict: true`) e compilação rápida com o bundler **Vite**.
- **EventBus:** Mecanismo desacoplado Pub/Sub fortemente tipado para comunicação entre as features da interface.
- **Validação com Zod:** Esquema estrito para verificação e higienização em tempo de execução dos dados de restaurantes.
- **SVG Sprite:** Consolidação de 12 ícones inline repetidos em um arquivo centralizado `/public/sprite.svg` e carregamento otimizado com a tag `<use>`.
- **Vitest Unit Tests:** Suite de 22 testes unitários sob `/src/shared/__tests__/` validando EventBus, Storage, Formatters e serialização de URLs.
- **Playwright E2E Tests:** Suite de 5 testes ponta a ponta em `e2e/guide.spec.ts` validando filtros, favoritos, deep-links, e conformidade de teclado/foco acessível.
- **CI Pipeline:** Configuração automática via GitHub Actions (`.github/workflows/ci.yml`) executando paralelamente linter, type-check, testes de unidade, testes E2E e etapa de build.

### Modificado

- **Paridade de Layout:** Refatorado para preservar 100% da identidade visual legada e interações conceituais anteriores.
- **Sanitização de Dados:** Higienização de nomes e bairros inconsistentes em [restaurants.json](./restaurants.json) nos rankings 18 (Glouton), 46 (Tangará Jean-Georges) e 61 (Boia).
- **Acessibilidade de Cores (WCAG AA):**
  - **Light Theme:** Alterado contraste de `--text-tertiary` de `#a3a3a3` para `#737373` (taxa de 4.6:1 no fundo branco).
  - **Dark Theme:** Alterado contraste de `--text-tertiary` de `#525252` para `#8a8a8a` (taxa superior a 4.5:1 no fundo preto).
- **Nome Acessível (WCAG 2.5.3):** Ajustado o atributo `aria-label` do botão `#btn-my-picks` para coincidir com a etiqueta textual visual inicial ("Minhas Escolhas").

### Removido

- **Rastros Legados:** Eliminação de todas as referências do site de referência (NYT, New York Times) e comentários ornamentais autogerados.
- **XSS:** Remoção de renderização dinâmica vulnerável no DOM substituindo por utilitários seguros com escape HTML em strings.
- **Script Legado:** Exclusão do arquivo gigante global `app.js` e sua importação por cache-busting manual em `index.html`.
