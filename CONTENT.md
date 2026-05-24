# Guia de Conteúdo e Atualização de Dados

Este documento serve como guia prático para jornalistas, editores e desenvolvedores da EXAME Casual que desejam atualizar a lista de restaurantes, fotos ou informações do guia interativo.

---

## 📋 Estrutura de Dados (`restaurants.json`)

A base de dados do guia está centralizada no arquivo [restaurants.json](file:///Users/andrelopes/Documents/Site/restaurants.json). Ele consiste em um array com exatamente 100 objetos correspondentes aos restaurantes.

Cada entrada de restaurante no JSON deve obrigatoriamente seguir a estrutura abaixo para passar na validação estrita do compilador e do Zod schema:

```json
{
  "rank": 1,
  "name": "Origem",
  "city": "Salvador",
  "votes": 120,
  "description": "Descrição completa do restaurante contendo sua trajetória e detalhes do menu.",
  "service": "Serviço: Endereço completo, telefone e horário de funcionamento.",
  "imageUrl": "https://classic.exame.com/wp-content/uploads/2025/04/foto-do-restaurante.jpg",
  "cuisine": "Brasileira",
  "price": "$$$$",
  "neighborhood": "Pituba"
}
```

### Detalhes dos Campos:

1. **`rank`** (Número): Posição do restaurante no ranking (de `1` a `100`). Não deve haver posições repetidas, exceto em empates autorizados (onde múltiplos itens compartilham a classificação).
2. **`name`** (String): Nome oficial do restaurante. Não pode estar vazio.
3. **`city`** (String): Cidade do restaurante (Ex: `"São Paulo"`, `"Rio de Janeiro"`, `"Salvador"`, `"Curitiba"`, `"Belo Horizonte"`).
4. **`votes`** (Número ou null): Contagem de votos recebidos (caso aplicável). Pode ser preenchido como `null`.
5. **`description`** (String): Texto descritivo detalhando o menu, chef e proposta.
6. **`service`** (String): Informações de serviço (endereço físico, telefone, link de reservas e horário de funcionamento).
7. **`imageUrl`** (String): URL absoluta da imagem hospedada em servidor seguro (HTTPS).
8. **`cuisine`** (String): Culinária predominante (Ex: `"Italiana"`, `"Japonesa"`, `"Brasileira"`, `"Autoral"`, `"Carnes"`, etc.).
9. **`price`** (String): Faixa de preço expressa em cifrões. Deve ser exatamente um dos seguintes valores: `"$"` (Barato), `"$$"` (Moderado), `"$$$"` (Caro), ou `"$$$$"` (Muito Caro).
10. **`neighborhood`** (String ou null): Bairro onde o restaurante está localizado. Pode ser preenchido como `null` ou omitido.

---

## 🖼️ Diretrizes para Imagens

- **Segurança:** As imagens devem, sem exceção, vir de URLs seguras (`https://`). URLs que iniciem com `http://` causam erros de conteúdo misto (Mixed Content) e bloqueios nos navegadores dos usuários.
- **Hospedagem:** Prefira hospedar as imagens no CDN ou WordPress oficial da EXAME (ex: `https://classic.exame.com/...`). Evite links temporários de redes sociais ou sites externos que podem expirar.
- **Formato e Resolução:** Imagens no formato retangular horizontal (proporção 16:9 ou 4:3) com resolução recomendada de no mínimo `800x600` pixels e compressão web otimizada (WebP ou JPEG progressivo).

---

## 🛠️ Workflow de Pull Request (PR) para Atualização

Ao alterar ou adicionar dados, siga o fluxo técnico de qualidade estabelecido:

```bash
# 1. Crie uma branch específica para a alteração
git checkout -b content/atualizacao-guia-2026

# 2. Edite o arquivo restaurants.json na raiz do projeto

# 3. Valide o esquema Zod e a tipagem estrita rodando:
npm run type-check

# 4. Formate o JSON modificado no padrão do projeto:
npm run format

# 5. Execute os testes automatizados locais para certificar de que nenhum seletor foi corrompido:
npm run test:unit
npm run test:e2e

# 6. Faça o commit convencional das alterações
git commit -m "chore(content): update restaurants metadata and images for 2026 list"

# 7. Faça o push para o repositório remoto e abra o Pull Request no GitHub
```

> [!IMPORTANT]
> O workflow de integração contínua (CI) do GitHub executará as validações de linter, tipo e execução de testes em todas as branches. O merge da branch na `main` só será permitido se todas as verificações do CI passarem com sucesso (indicador verde).
