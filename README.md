# Guia de Restaurantes do Brasil - EXAME Casual

Este é o portal interativo do ranking anual **"Os 100 Melhores Restaurantes do Brasil"** elaborado pela **EXAME Casual**.

O projeto foi migrado de uma base legada para um ambiente moderno em **TypeScript (estrito)** com **Vite**, arquitetura modular orientada a eventos, higienização completa de referências externas, acessibilidade aprimorada e cobertura de testes automatizados (unitários e de ponta a ponta).

---

## 🚀 Setup Rápido (Local em 5 Comandos)

Para rodar e testar o projeto localmente em sua máquina, execute a sequência de comandos abaixo no terminal:

```bash
# 1. Instalar as dependências do projeto
npm install

# 2. Instalar o navegador Chromium para os testes E2E do Playwright
npx playwright install chromium --with-deps

# 3. Rodar a suíte de testes unitários com Vitest
npm run test:unit

# 4. Rodar a suíte de testes de fluxo ponta a ponta (E2E) com Playwright
npm run test:e2e

# 5. Iniciar o servidor de desenvolvimento local
npm run dev
```

Após o último comando, abra o link [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🛠️ Outros Comandos Úteis

- **`npm run build`**: Compila os arquivos TypeScript e gera o bundle de produção otimizado na pasta `dist/`.
- **`npm run preview`**: Inicia um servidor local para visualizar o bundle de produção gerado.
- **`npm run lint`**: Executa o ESLint com regras Flat Config para verificar a qualidade do código.
- **`npm run format`**: Formata automaticamente todos os arquivos do projeto usando o Prettier.
- **`npm run type-check`**: Valida a compilação do TypeScript em modo estrito sem gerar arquivos de saída.

---

## 📂 Estrutura do Projeto

O código-fonte está estruturado sob a pasta `src/` de forma modular:

```text
├── e2e/                     # Testes de fluxo ponta a ponta com Playwright
├── public/                  # Arquivos e ativos estáticos (ex: sprite.svg de ícones)
├── src/
│   ├── domain/              # Definições de tipos e validação Zod (restaurant.ts)
│   ├── features/            # Funcionalidades e gerenciadores modulares isolados
│   │   ├── detail-dialog/   # Modal dialog acessível de detalhes do restaurante
│   │   ├── filters/         # Painéis suspensos para filtragem avançada
│   │   ├── picks/           # Favoritos, contagem, drawer lateral e exportação
│   │   ├── restaurant-list/ # Renderização dos cards (lista e grade) e Leia Mais
│   │   ├── search/          # Barra de busca de texto com debounce
│   │   ├── theme/           # Gerenciador de tema claro/escuro persistente
│   │   ├── toast/           # Mensagens e avisos temporários na tela
│   │   └── view-toggle/     # Alternador de visualização (Lista vs Grade)
│   ├── shared/              # Utilitários puros compartilhados
│   │   ├── __tests__/       # Testes unitários com Vitest (storage, event-bus, etc.)
│   │   ├── dom.ts           # Seleção de elementos tipada e escape de HTML (Anti-XSS)
│   │   ├── event-bus.ts     # PubSub desacoplado para comunicação entre features
│   │   ├── formatters.ts    # Formatadores de texto e números (leia mais inteligente)
│   │   ├── sharing.ts       # Serializador e desserializador de links de compartilhamento
│   │   └── storage.ts       # Acesso e persistência tipada no localStorage
│   └── main.ts              # Ponto de entrada (Bootstrapper) e inicialização do app
├── index.css                # Estilos globais e tokens de design do projeto
├── index.html               # Estrutura HTML principal (Layout Base)
├── package.json             # Dependências e scripts de automação
├── playwright.config.ts     # Configurações do framework de testes Playwright
├── restaurants.json         # Base de dados estática dos 100 restaurantes
├── tsconfig.json            # Configurações do compilador TypeScript (Strict)
└── vite.config.ts           # Configurações do Vite e do Vitest
```

---

## ⚖️ Licença

Este projeto é de uso exclusivo e confidencial da **EXAME Casual**. Todos os direitos reservados.
