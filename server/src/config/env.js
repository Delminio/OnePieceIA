import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 3000),
  clientOrigin: process.env.CLIENT_ORIGIN || "*",
  openRouterApiKey: process.env.OPENROUTER_API_KEY || "",
  openRouterBaseUrl: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  openRouterModel: process.env.OPENROUTER_MODEL || "openrouter/free",
  openRouterSiteUrl: process.env.OPENROUTER_SITE_URL || "https://example.com",
  openRouterAppName: process.env.OPENROUTER_APP_NAME || "One Piece AI",
  wikiLiveEnabled: String(process.env.WIKI_LIVE_ENABLED || "true") === "true",
  wikiBaseUrl: process.env.WIKI_BASE_URL || "https://onepiece.fandom.com",
  maxHistoryMessages: Number(process.env.MAX_HISTORY_MESSAGES || 8),
  maxSources: Number(process.env.MAX_SOURCES || 8)
};
