import OpenAI from "openai";
import { env } from "../config/env.js";

let client = null;

function getClient() {
  if (!env.openaiApiKey) {
    throw new Error("OPENAI_API_KEY não configurada.");
  }

  if (!client) {
    client = new OpenAI({ apiKey: env.openaiApiKey });
  }

  return client;
}

export async function askOpenAI({ question, contextText, sources }) {
  const openai = getClient();

  const tools = [];
  if (env.openaiWebSearchEnabled) {
    tools.push({ type: "web_search" });
  }

  const response = await openai.responses.create({
    model: env.openaiModel,
    reasoning: { effort: env.openaiReasoningEffort },
    tools,
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "Você é um assistente especialista em One Piece. Responda em português do Brasil. Use prioritariamente o contexto fornecido. Quando houver diferença entre manga, anime e live action, deixe isso explícito. Em caso de conflito de canonicidade, priorize o mangá. Se o contexto não trouxer evidência suficiente, diga isso com clareza. No final, inclua um bloco curto chamado 'Fontes usadas'. Não invente capítulos, episódios, datas ou escalações."
          }
        ]
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Pergunta do usuário:\n${question}\n\nContexto recuperado:\n${contextText || "Nenhum contexto local encontrado."}\n\nQuantidade de fontes recuperadas: ${sources.length}`
          }
        ]
      }
    ]
  });

  return {
    text: response.output_text,
    raw: response
  };
}
