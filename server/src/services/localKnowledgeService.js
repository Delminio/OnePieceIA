import rawKnowledge from "../data/knowledge.json" with { type: "json" };
import { chunkText, compactExcerpt, scoreByOverlap } from "../utils/text.js";

const knowledgeChunks = rawKnowledge.flatMap((entry) => {
  const chunks = chunkText(entry.content, 420);
  return chunks.map((chunk, index) => ({
    id: `${entry.id}::${index}`,
    title: entry.title,
    category: entry.category,
    source: entry.source,
    url: entry.url,
    content: chunk,
    excerpt: compactExcerpt(chunk)
  }));
});

export function searchLocalKnowledge(question, limit = 5) {
  return knowledgeChunks
    .map((item) => ({ ...item, score: scoreByOverlap(question, `${item.title} ${item.content} ${item.category}`) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
