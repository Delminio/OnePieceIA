import OpenAI from "openai";
import { env } from "../config/env.js";

let client = null;

function getClient() {
  if (!env.openrouterApiKey) {
    throw new Error("OPENROUTER_API_KEY não configurada.");
  }

  if (!client) {
    const defaultHeaders = {};

    if (env.openrouterSiteUrl) {
      defaultHeaders["HTTP-Referer"] = env.openrouterSiteUrl;
    }

    if (env.openrouterAppName) {
      defaultHeaders["X-Title"] = env.openrouterAppName;
    }

    client = new OpenAI({
      apiKey: env.openrouterApiKey,
      baseURL: env.openrouterBaseUrl,
      defaultHeaders
    });
  }

  return client;
}

export async function askOpenAI({ question, contextText, sources }) {
  const openai = getClient();

  const completion = await openai.chat.completions.create({
    model: env.openrouterModel,
    messages: [
      {
        role: "system",
        content:
          "Você é um assistente especialista em One Piece. Responda em português do Brasil. Use prioritariamente o contexto fornecido. Quando houver diferença entre manga, anime e live action, deixe isso explícito. Em caso de conflito de canonicidade, priorize o mangá. Se o contexto não trouxer evidência suficiente, diga isso com clareza. No final, inclua um bloco curto chamado 'Fontes usadas'. Não invente capítulos, episódios, datas ou escalações."
      },
      {
        role: "user",
        content: `Pergunta do usuário:\n${question}\n\nContexto recuperado:\n${contextText || "Nenhum contexto local encontrado."}\n\nQuantidade de fontes recuperadas: ${sources.length}`
      }
    ],
    temperature: 0.3
  });

  return {
    text: completion.choices?.[0]?.message?.content || "Sem resposta do modelo.",
    raw: completion
  };
}
