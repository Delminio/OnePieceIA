import { env } from "../config/env.js";
import { compactExcerpt, queryVariants, scoreByOverlap } from "../utils/text.js";

const cache = new Map();
const CACHE_TTL_MS = 1000 * 60 * 30;

function buildApiUrl() {
  return new URL("/api.php", env.wikiBaseUrl);
}

async function fetchJson(url) {
  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "onepiece-ai/2.0 (+https://github.com/)"
    }
  });

  if (!response.ok) {
    throw new Error(`Falha ao consultar a wiki: ${response.status}`);
  }

  return response.json();
}

async function searchWikiTitles(query) {
  const url = buildApiUrl();
  url.searchParams.set("action", "query");
  url.searchParams.set("list", "search");
  url.searchParams.set("srsearch", query);
  url.searchParams.set("srlimit", "3");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const data = await fetchJson(url);
  return (data?.query?.search || []).map((item) => item.title);
}

async function fetchWikiPage(title) {
  const cacheKey = `page:${title}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.value;

  const url = buildApiUrl();
  url.searchParams.set("action", "query");
  url.searchParams.set("prop", "extracts|info");
  url.searchParams.set("titles", title);
  url.searchParams.set("explaintext", "1");
  url.searchParams.set("inprop", "url");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const data = await fetchJson(url);
  const pages = data?.query?.pages || {};
  const page = Object.values(pages)[0];

  const value = page?.extract
    ? {
        id: String(page.pageid || title),
        title: page.title || title,
        url: page.fullurl || `${env.wikiBaseUrl}/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`,
        content: page.extract
      }
    : null;

  cache.set(cacheKey, { at: Date.now(), value });
  return value;
}

export async function searchWiki(question, limit = 4) {
  if (!env.wikiLiveEnabled) return [];

  const titles = new Set();
  for (const variant of queryVariants(question).slice(0, 4)) {
    try {
      const found = await searchWikiTitles(variant);
      for (const title of found) titles.add(title);
    } catch {
      // ignora falha parcial da wiki e segue com o restante
    }
  }

  const pages = [];
  for (const title of [...titles].slice(0, 6)) {
    try {
      const page = await fetchWikiPage(title);
      if (!page) continue;
      pages.push({
        id: page.id,
        title: page.title,
        category: "wiki",
        source: "one_piece_wiki",
        url: page.url,
        content: page.content,
        excerpt: compactExcerpt(page.content),
        score: scoreByOverlap(question, `${page.title} ${page.content}`)
      });
    } catch {
      // segue sem derrubar a resposta
    }
  }

  return pages
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
