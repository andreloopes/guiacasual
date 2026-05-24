# Guia de Contribuição e Code Review

Este guia detalha os padrões de desenvolvimento, convenções de código e o checklist de revisão (Code Review) que devem ser seguidos por todos os desenvolvedores para manter a qualidade e robustez técnica do Guia de Restaurantes da EXAME Casual.

---

## 💻 Convenções de Código

### 1. TypeScript Estrito (Strict Mode)

- O compilador está configurado em modo estrito (`strict: true`, `noUncheckedIndexedAccess: true`).
- **Regra:** Nunca utilize `@ts-ignore`, `@ts-nocheck` ou o tipo genérico `any` para silenciar erros de compilação. Defina interfaces claras ou tipos locais.
- Garanta tratamento de nulos/indefinidos ao capturar elementos do DOM.

### 2. Comunicação via EventBus

- Modificações de estado que impactam múltiplos componentes devem ser propagadas exclusivamente por meio de eventos no `eventBus` ([src/shared/event-bus.ts](file:///Users/andrelopes/Documents/Site/src/shared/event-bus.ts)).
- Não instancie ou manipule elementos de outras features diretamente.

### 3. Utilitários do DOM

- Utilize as funções tipadas `$()` e `$$()` de [src/shared/dom.ts](file:///Users/andrelopes/Documents/Site/src/shared/dom.ts) para buscar elementos na árvore do DOM.
- Para renderização dinâmica de dados textuais fornecidos pelo usuário ou JSON externo, use a função `escapeHtml()` para proteção nativa contra ataques de scripting cross-site (XSS).

---

## 📝 Padrão de Commits (Conventional Commits)

Adotamos a especificação de commits convencionais. As mensagens de commit devem seguir a estrutura abaixo:

`tipo(escopo): descrição curta em letras minúsculas`

### Tipos Permitidos:

- **`feat`**: Implementação de nova funcionalidade (ex: `feat(filters): add rating filter drop`).
- **`fix`**: Correção de bugs ou regressões visuais (ex: `fix(drawer): close modal on backdrop click`).
- **`refactor`**: Modificação de código que não altera o comportamento externo (ex: `refactor(list): extract card rendering to module`).
- **`test`**: Adição ou ajuste de testes automatizados (ex: `test(sharing): add unit tests for url decoder`).
- **`docs`**: Ajustes de documentação (ex: `docs(readme): add troubleshooting section`).
- **`chore`**: Atualizações de tarefas de build ou dependências (ex: `chore(deps): update vitest to v4.1`).

---

## 🔍 Checklist de Code Review

Antes de aprovar e realizar o merge de qualquer Pull Request (PR) para a branch `main`, verifique os itens abaixo:

### ⚙️ Qualidade de Código & Tipagem

- [ ] O código foi formatado (`npm run format`) e não possui erros do linter (`npm run lint`).
- [ ] A checagem de tipos estritos do compilador TypeScript (`npm run type-check`) passa com sucesso.
- [ ] Todos os testes unitários (`npm run test:unit`) e testes de ponta a ponta (`npm run test:e2e`) passam sem erros.
- [ ] O build de produção (`npm run build`) gera o bundle com sucesso.

### ♿ Acessibilidade (a11y)

- [ ] Todos os elementos interativos possuem rótulo de leitura adequado (`aria-label`) e foco de contorno claro no tema ativo.
- [ ] O contraste de cores segue o limite WCAG AA (taxa mínima de 4.5:1).
- [ ] Caixas de diálogo modais e gavetas (drawers) capturam o foco do teclado (Focus Trap) e restauram o foco ao elemento original após fechamento.

### ⚡ Desempenho (Performance)

- [ ] O primeiro card de restaurante (Origem) na renderização inicial contém o atributo `fetchpriority="high"`.
- [ ] Os cards subsequentes contêm o atributo `loading="lazy"` para evitar sobrecarga de rede.
- [ ] Não há ícones SVG inline duplicados; novos ícones foram adicionados e referenciados através do arquivo de sprite unificado `sprite.svg`.
