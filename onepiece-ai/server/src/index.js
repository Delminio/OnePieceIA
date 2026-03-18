import express from "express";
import cors from "cors";
import askRouter from "./routes/ask.js";
import { env } from "./config/env.js";

const app = express();

app.use(
  cors({
    origin: env.clientOrigin === "*" ? true : env.clientOrigin
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "onepiece-ai-server"
  });
});

app.use(askRouter);

app.listen(env.port, () => {
  console.log(`Servidor rodando na porta ${env.port}`);
});
