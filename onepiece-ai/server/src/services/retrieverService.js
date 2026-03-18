import { searchLocalKnowledge } from "./localKnowledgeService.js";
import { searchWiki } from "./wikiService.js";

export async function retrieveContext(question, mode = "hybrid") {
  const useLocal = mode === "local" || mode === "hybrid";
  const useWiki = mode === "wiki" || mode === "hybrid";

  const [localResults, wikiResults] = await Promise.all([
    useLocal ? Promise.resolve(searchLocalKnowledge(question, 5)) : Promise.resolve([]),
    useWiki ? searchWiki(question, 3) : Promise.resolve([])
  ]);

  const sources = [...localResults, ...wikiResults];

  const contextText = sources
    .map((item, index) => {
      return [
        `Fonte ${index + 1}: ${item.source}`,
        `Título: ${item.title}`,
        `Categoria: ${item.category}`,
        `URL: ${item.url}`,
        `Trecho: ${item.excerpt}`
      ].join("\n");
    })
    .join("\n\n");

  return {
    sources,
    contextText
  };
}
