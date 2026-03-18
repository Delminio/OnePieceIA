import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 3000),
  openrouterApiKey: process.env.OPENROUTER_API_KEY || "",
  openrouterModel: process.env.OPENROUTER_MODEL || "openrouter/free",
  openrouterBaseUrl: process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
  openrouterSiteUrl: process.env.OPENROUTER_SITE_URL || "",
  openrouterAppName: process.env.OPENROUTER_APP_NAME || "One Piece AI",
  wikiLiveEnabled: String(process.env.WIKI_LIVE_ENABLED || "true") === "true",
  wikiBaseUrl: process.env.WIKI_BASE_URL || "https://onepiece.fandom.com",
  clientOrigin: process.env.CLIENT_ORIGIN || "*"
};
