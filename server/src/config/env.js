import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 3000),
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  openaiModel: process.env.OPENAI_MODEL || "gpt-5.4",
  openaiReasoningEffort: process.env.OPENAI_REASONING_EFFORT || "low",
  openaiWebSearchEnabled: String(process.env.OPENAI_WEB_SEARCH_ENABLED || "false") === "true",
  wikiLiveEnabled: String(process.env.WIKI_LIVE_ENABLED || "true") === "true",
  wikiBaseUrl: process.env.WIKI_BASE_URL || "https://onepiece.fandom.com",
  clientOrigin: process.env.CLIENT_ORIGIN || "*"
};
