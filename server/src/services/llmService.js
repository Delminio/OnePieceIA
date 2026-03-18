import OpenAI from "openai";
import { env } from "../config/env.js";

const client = new OpenAI({
  apiKey: env.openRouterApiKey,
  baseURL: env.openRouterBaseUrl,
  defaultHeaders: {
    "HTTP-Referer": env.openRouterSiteUrl,
    "X-Title": env.openRouterAppName
  }
});

const SYSTEM_PROMPT = `
Você é o One Piece AI, um assistente especialista em One Piece.

Regras obrigatórias:
- Responda em português do Brasil.
- Use prioritariamente o contexto fornecido.
- Quando houver conflito, trate o mangá como referência canônica principal.
- Diferencie claramente mangá, anime e live action quando isso for relevante.
- Se a evidência for insuficiente, diga isso com honestidade.
- Não invente capítulo, episódio, elenco ou fatos sem base no contexto.
- Seja claro, organizado e com tom profissional, mas fácil de ler.

Formato preferido:
1. Resposta principal em 1 ou 2 parágrafos.
2. Se houver versões diferentes, adicione uma seção "Diferenças por versão".
3. Se o usuário pedir comparação, destaque em bullets curtos.
4. Feche com "Base da resposta" citando [Fonte X].
`;

export async function generateAnswer({ question, history = [], context = "", spoilerLevel = "normal" }) {
  if (!env.openRouterApiKey) {
    throw new Error("OPENROUTER_API_KEY não configurada no servidor.");
  }

  const trimmedHistory = history.slice(-env.maxHistoryMessages).map((item) => ({
    role: item.role === "assistant" ? "assistant" : "user",
    content: String(item.content || "").slice(0, 1500)
  }));

  const userPrompt = `
Nível de spoiler desejado: ${spoilerLevel}.

Pergunta do usuário:
${question}

Contexto recuperado:
${context || "Nenhum contexto recuperado."}
`;

  const completion = await client.chat.completions.create({
    model: env.openRouterModel,
    temperature: 0.4,
    messages: [
      { role: "system", content: SYSTEM_PROMPT.trim() },
      ...trimmedHistory,
      { role: "user", content: userPrompt.trim() }
    ]
  });

  return completion.choices?.[0]?.message?.content?.trim() || "Não consegui gerar uma resposta.";
}
