const pageName = process.argv.slice(2).join(" ");
const baseUrl = process.env.WIKI_BASE_URL || "https://onepiece.fandom.com";

if (!pageName) {
  console.error('Use: node scripts/fetchWikiPage.js "Nome da página"');
  process.exit(1);
}

const url = new URL("/api.php", baseUrl);
url.searchParams.set("action", "query");
url.searchParams.set("prop", "extracts|info");
url.searchParams.set("titles", pageName);
url.searchParams.set("explaintext", "1");
url.searchParams.set("inprop", "url");
url.searchParams.set("format", "json");
url.searchParams.set("origin", "*");

const response = await fetch(url.toString(), {
  headers: {
    "User-Agent": "onepiece-ai/2.0 (+https://github.com/)"
  }
});

if (!response.ok) {
  throw new Error(`Falha ao buscar a wiki: ${response.status}`);
}

const data = await response.json();
console.log(JSON.stringify(data, null, 2));
