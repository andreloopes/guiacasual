# Política de Segurança (Security Policy)

Este documento descreve as políticas de segurança aplicáveis ao Guia de Restaurantes da EXAME Casual e orientações para reporte de vulnerabilidades ou bugs de segurança.

---

## 🔒 Práticas de Segurança no Desenvolvimento

Durante a modernização da aplicação, adotamos diretrizes rígidas para evitar vulnerabilidades comuns na web:

### 1. Proteção contra Scripting Cross-Site (XSS)

- **Causa Comum:** Renderizar strings do banco de dados ou do JSON diretamente no DOM usando `.innerHTML` ou de forma não tratada pode permitir a execução de códigos maliciosos se as descrições contiverem tags `<script>` ou handlers `onerror`.
- **Ação Técnica:** Implementamos o utilitário seguro `escapeHtml()` no arquivo [src/shared/dom.ts](file:///Users/andrelopes/Documents/Site/src/shared/dom.ts). Toda renderização dinâmica de dados do restaurante (nome, culinária, descrição, bairro) passa obrigatoriamente por essa higienização antes de entrar no fluxo de renderização HTML do navegador.

### 2. Injeção de Parâmetros na URL

- **Causa Comum:** Os favoritos do usuário podem ser importados automaticamente via parâmetros de query string na URL (`?picks=...`). Tratar esses dados de forma ingênua (usando `eval()` ou parsing simples) expõe a SPA a quebras de memória e ataques de redirecionamento.
- **Ação Técnica:** O utilitário [src/shared/sharing.ts](file:///Users/andrelopes/Documents/Site/src/shared/sharing.ts) realiza validação estrita durante a decodificação dos parâmetros. Apenas inteiros (referentes a rankings válidos de 1 a 100) e os tipos enumerados permitidos (`visited` ou `wantToGo`) são importados para o estado interno da aplicação. Dados desconhecidos são sumariamente ignorados.

---

## 🐛 Reportando Vulnerabilidades

Se você identificar qualquer vulnerabilidade de segurança no código-fonte, dados ou infraestrutura de carregamento do portal, por favor, siga o processo abaixo:

1. **Contato Privado:** Não abra uma issue pública no GitHub ou comente publicamente. Envie um e-mail detalhado para a equipe de tecnologia da EXAME Casual em **tecnologia@exame.com**.
2. **Conteúdo do Reporte:** Inclua o passo a passo para reproduzir a falha, o impacto de exploração estimado e, se possível, prints ou prova de conceito técnica (PoC).
3. **Prazo de Resolução:** Nossa equipe de engenharia se compromete a avaliar o reporte em até **48 horas úteis** e fornecer uma estimativa de correção.
