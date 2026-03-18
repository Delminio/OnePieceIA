import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import askRouter from "./routes/ask.js";

const app = express();

app.use(
  cors({
    origin: env.clientOrigin === "*" ? true : env.clientOrigin
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    app: "One Piece AI",
    message: "API online. Use GET /health e POST /ask."
  });
});

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    provider: "openrouter",
    wikiLiveEnabled: env.wikiLiveEnabled,
    model: env.openRouterModel
  });
});

app.use(askRouter);

app.listen(env.port, () => {
  console.log(`Servidor rodando na porta ${env.port}`);
});
