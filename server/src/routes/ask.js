import { Router } from "express";
import { retrieveContext } from "../services/retrieverService.js";
import { generateAnswer } from "../services/llmService.js";

const router = Router();

router.post("/ask", async (req, res) => {
  try {
    const { question, mode = "hybrid", history = [], spoilerLevel = "normal" } = req.body || {};

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Envie uma pergunta válida em 'question'." });
    }

    const { context, sources } = await retrieveContext(question, mode);
    const answer = await generateAnswer({ question, history, context, spoilerLevel });

    return res.json({
      ok: true,
      answer,
      sources,
      meta: {
        mode,
        contextLength: context.length,
        sourceCount: sources.length
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error?.message || "Erro interno ao processar a pergunta."
    });
  }
});

export default router;
