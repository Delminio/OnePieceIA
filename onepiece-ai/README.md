# One Piece AI

Projeto full stack para criar uma IA que responde dúvidas sobre **anime, mangá e live action de One Piece** com base em:

- OpenAI via **Responses API**
- busca local em uma base de conhecimento própria
- estrutura preparada para consultar a **One Piece Wiki**
- busca opcional na web via ferramenta de web search da OpenAI

## Arquitetura

- `client/` → frontend estático pronto para Vercel ou Render Static Site
- `server/` → backend Node.js + Express pronto para Render Web Service

## Fluxo

1. O usuário envia a pergunta no frontend.
2. O backend procura contexto em:
   - base local (`src/data/knowledge.json`)
   - One Piece Wiki ao vivo, se habilitada
3. O backend envia **pergunta + contexto + instruções** para a OpenAI.
4. O modelo responde separando anime, mangá e live action quando necessário.
5. O frontend mostra a resposta e as fontes usadas.

## Deploy recomendado

### Backend no Render

- Root Directory: `server`
- Build Command: `npm install`
- Start Command: `npm start`

### Frontend no Vercel

- Root Directory: `client`
- Framework Preset: `Other`
- Build Command: vazio
- Output Directory: `.`

Também dá para hospedar o frontend em um Static Site no Render.

## Variáveis de ambiente do backend

Crie um arquivo `.env` dentro de `server/` com:

```env
PORT=3000
OPENAI_API_KEY=sua_chave_aqui
OPENAI_MODEL=gpt-5.4
OPENAI_REASONING_EFFORT=low
OPENAI_WEB_SEARCH_ENABLED=false
WIKI_LIVE_ENABLED=true
WIKI_BASE_URL=https://onepiece.fandom.com
CLIENT_ORIGIN=http://localhost:5173
```

## Rodar localmente

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

Você pode abrir `client/index.html` direto no navegador para testar o visual.

Para desenvolvimento local com API, o ideal é servir a pasta `client` com um servidor simples ou publicar no Vercel/Render e apontar o `API_BASE_URL` no `client/app.js`.

## Endpoints

### `GET /health`
Health check.

### `POST /ask`
Exemplo de body:

```json
{
  "question": "Em que episódio aparece o Gear 5?",
  "mode": "hybrid"
}
```

`mode` pode ser:
- `local` → só base local
- `wiki` → só wiki ao vivo
- `hybrid` → base local + wiki

## Estrutura preparada para a Wiki

A integração com a wiki usa o MediaWiki/Fandom de forma leve:

- busca de páginas por título
- captura de resumo em texto
- retorno de fonte e URL

Arquivo principal:
- `server/src/services/wikiService.js`

## Base local

A base inicial fica em:
- `server/src/data/knowledge.json`

Você pode aumentar essa base manualmente ou automatizar com scripts.

## Scripts úteis

### Buscar uma página da wiki

```bash
cd server
node scripts/fetchWikiPage.js "Monkey D. Luffy"
```

### Gerar embeddings futuramente

O projeto já está organizado para isso. A próxima evolução natural é:

- chunking dos textos
- embeddings com `text-embedding-3-small`
- busca vetorial

## Observações importantes

A OpenAI recomenda a **Responses API** para novos projetos e disponibiliza modelos de embeddings como `text-embedding-3-small` e `text-embedding-3-large` para busca semântica. A OpenAI também documenta o uso de **web search** como tool dentro da Responses API. citeturn433797search0turn433797search1turn433797search9

Como a One Piece Wiki é uma wiki comunitária, trate o conteúdo como fonte útil, mas não como verdade absoluta em disputas de canonicidade. Priorize o mangá quando houver conflito.
