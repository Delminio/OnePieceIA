import { env } from "../config/env.js";
import { truncate } from "../utils/text.js";

function buildApiUrl(params) {
  const url = new URL("/api.php", env.wikiBaseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "onepiece-ai/1.0 (+https://github.com/)"
    }
  });

  if (!response.ok) {
    throw new Error(`Wiki request failed with status ${response.status}`);
  }

  return response.json();
}

export async function searchWiki(question, limit = 3) {
  if (!env.wikiLiveEnabled) return [];

  try {
    const searchUrl = buildApiUrl({
      action: "query",
      list: "search",
      srsearch: question,
      srlimit: limit,
      format: "json",
      origin: "*"
    });

    const searchData = await fetchJson(searchUrl);
    const searchResults = searchData?.query?.search || [];

    const pages = [];

    for (const result of searchResults) {
      const title = result.title;
      const pageUrl = new URL(`/wiki/${encodeURIComponent(title.replace(/\s+/g, "_"))}`, env.wikiBaseUrl).toString();
      const extractUrl = buildApiUrl({
        action: "query",
        prop: "extracts",
        titles: title,
        explaintext: 1,
        exintro: 1,
        format: "json",
        origin: "*"
      });

      const extractData = await fetchJson(extractUrl);
      const pagesObj = extractData?.query?.pages || {};
      const firstPage = Object.values(pagesObj)[0];
      const excerpt = truncate(firstPage?.extract || result.snippet || "", 600);

      pages.push({
        source: "One Piece Wiki",
        title,
        category: "wiki",
        url: pageUrl,
        excerpt
      });
    }

    return pages;
  } catch (error) {
    console.error("[wikiService]", error.message);
    return [];
  }
}
