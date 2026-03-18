import { env } from "../config/env.js";
import { searchLocalKnowledge } from "./localKnowledgeService.js";
import { searchWiki } from "./wikiService.js";

function dedupeSources(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.source}|${item.title}|${item.excerpt}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function retrieveContext(question, mode = "hybrid") {
  const localPromise = mode === "wiki" ? Promise.resolve([]) : Promise.resolve(searchLocalKnowledge(question, 5));
  const wikiPromise = mode === "local" ? Promise.resolve([]) : searchWiki(question, 5);

  const [localResults, wikiResults] = await Promise.all([localPromise, wikiPromise]);

  const sources = dedupeSources([...localResults, ...wikiResults])
    .sort((a, b) => b.score - a.score)
    .slice(0, env.maxSources);

  const context = sources
    .map((source, index) => {
      return [
        `[Fonte ${index + 1}]`,
        `Título: ${source.title}`,
        `Tipo: ${source.category}`,
        `Origem: ${source.source}`,
        `URL: ${source.url}`,
        `Trecho: ${source.content}`
      ].join("\n");
    })
    .join("\n\n");

  return {
    context,
    sources
  };
}
