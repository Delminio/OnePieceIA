import { Router } from "express";
import { retrieveContext } from "../services/retrieverService.js";
import { askOpenAI } from "../services/openaiService.js";

const router = Router();

router.post("/ask", async (req, res) => {
  try {
    const { question, mode = "hybrid" } = req.body || {};

    if (!question || typeof question !== "string") {
      return res.status(400).json({
        error: "Envie uma pergunta válida em 'question'."
      });
    }

    const validModes = ["local", "wiki", "hybrid"];
    const safeMode = validModes.includes(mode) ? mode : "hybrid";

    const retrieval = await retrieveContext(question, safeMode);
    const completion = await askOpenAI({
      question,
      contextText: retrieval.contextText,
      sources: retrieval.sources
    });

    return res.json({
      question,
      mode: safeMode,
      answer: completion.text,
      sources: retrieval.sources
    });
  } catch (error) {
    console.error("[/ask]", error);
    return res.status(500).json({
      error: error.message || "Erro interno ao processar a pergunta."
    });
  }
});

export default router;
