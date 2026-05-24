# Guia Casual: 100 Melhores Restaurantes do Brasil

Este projeto consiste em um guia interativo que exibe o ranking dos 100 melhores restaurantes do Brasil.
O site é publicado como uma página estática no GitHub Pages de forma automática através de GitHub Actions.

## Rodar localmente

Para executar o projeto localmente com recarregamento rápido, execute os seguintes comandos:

```bash
npm install
npm run dev
```

## Estrutura

* index.html - Estrutura principal da página com o sprite de ícones inline
* restaurants.json - Banco de dados estático contendo as informações dos 100 restaurantes
* package.json - Script para execução do servidor de desenvolvimento local
* README.md - Guia de documentação e setup do projeto
* .gitignore - Regras de exclusão de arquivos para o Git
* styles/base.css - Reset de estilos CSS, tokens de design em :root e tipografia
* styles/layout.css - Estilização do header, hero, footer e contêiner principal da página
* styles/controls.css - Barra de controles, botões de toggle de visualização, busca e sumário
* styles/cards.css - Estilização visual dos cartões dos restaurantes nos modos lista e grade
* styles/filters.css - Painéis suspensos (dropdowns) e checkboxes de filtragem
* styles/drawer.css - Estilos da gaveta lateral "Minhas Escolhas" para restaurantes marcados
* styles/dialog.css - Diálogo modal de detalhes de restaurantes e notificações flutuantes toast
* src/main.js - Inicialização do guia, fetch do arquivo JSON e vínculos globais de eventos
* src/state.js - Definição do objeto de estado e persistência local (LocalStorage)
* src/dom.js - Cache de referências a seletores DOM e helpers rápidos de manipulação
* src/filters.js - Geração de checkboxes de filtros e lógica para filtragem de restaurantes
* src/render.js - Renderização dinâmica dos cartões de restaurantes nas visualizações ativas
* src/picks.js - Atualização de badge, validação de URL compartilhada e geração de links
* src/drawer.js - Controle de abertura, renderização e ações de cópia e envio da lista curada
* src/dialog.js - Controle de abertura de modal detalhado e expansão de texto descritivo
* src/theme.js - Gerenciamento de tema claro e escuro e alternância de ícones na barra
* src/toast.js - Exibição de mensagens de aviso rápidas na interface do usuário

## Atualizar a lista de restaurantes

Para atualizar os dados exibidos na lista (nomes, descrições, imagens, preços ou localizações), modifique diretamente o arquivo restaurants.json na raiz do projeto. Após realizar as alterações, faça o commit do arquivo e envie para a branch principal (main). O deploy no GitHub Pages será realizado de forma automatizada pelo fluxo de trabalho configurado no GitHub Actions.
