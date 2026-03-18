import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { scoreByTokenOverlap, truncate } from "../utils/text.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const knowledgePath = path.resolve(__dirname, "../data/knowledge.json");
const knowledge = JSON.parse(fs.readFileSync(knowledgePath, "utf-8"));

export function searchLocalKnowledge(question, limit = 5) {
  const ranked = knowledge
    .map((item) => ({
      ...item,
      score: scoreByTokenOverlap(question, `${item.title} ${item.text} ${item.category}`)
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => ({
      source: item.source,
      title: item.title,
      category: item.category,
      url: item.url,
      excerpt: truncate(item.text, 500)
    }));

  return ranked;
}
