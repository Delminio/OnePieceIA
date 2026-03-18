const STOP_WORDS = new Set([
  "a","o","os","as","de","da","do","das","dos","e","é","em","um","uma","uns","umas","para","por","com","sem","na","no","nas","nos","que","quem","qual","quais","como","onde","quando","porque","porquê","sobre","se","ao","aos","às","and","the","of","to","in","on","for","what","who","is","are"
]);

export function normalizeText(text = "") {
  return String(text)
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text = "") {
  return normalizeText(text)
    .split(" ")
    .filter((token) => token && token.length > 1 && !STOP_WORDS.has(token));
}

export function uniqueTokens(text = "") {
  return [...new Set(tokenize(text))];
}

export function chunkText(text = "", chunkSize = 520) {
  const clean = String(text).replace(/\s+/g, " ").trim();
  if (!clean) return [];

  const sentences = clean.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + " " + sentence).trim().length <= chunkSize) {
      current = `${current} ${sentence}`.trim();
    } else {
      if (current) chunks.push(current);
      current = sentence;
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

export function scoreByOverlap(query, text) {
  const q = uniqueTokens(query);
  const t = tokenize(text);
  if (!q.length || !t.length) return 0;

  const freq = new Map();
  for (const token of t) freq.set(token, (freq.get(token) || 0) + 1);

  let score = 0;
  for (const token of q) {
    if (freq.has(token)) {
      score += 2 + Math.min(freq.get(token), 3) * 0.5;
    }
  }

  const exactPhrase = normalizeText(text).includes(normalizeText(query));
  if (exactPhrase) score += 4;

  return Number(score.toFixed(2));
}

export function compactExcerpt(text = "", maxLength = 220) {
  const clean = String(text).replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trim()}…`;
}

export function queryVariants(question = "") {
  const normalized = normalizeText(question);
  const variants = [question];

  if (normalized.includes("sanji")) variants.push("Vinsmoke Sanji Baratie Whole Cake Island");
  if (normalized.includes("luffy")) variants.push("Monkey D Luffy Straw Hat Nika Gear 5");
  if (normalized.includes("zoro")) variants.push("Roronoa Zoro swordsman Straw Hat");
  if (normalized.includes("nami")) variants.push("Nami navigator Straw Hat Arlong Park");
  if (normalized.includes("robin")) variants.push("Nico Robin archaeologist Ohara Straw Hat");
  if (normalized.includes("live action")) variants.push("Netflix live action adaptation cast differences");
  if (normalized.includes("manga")) variants.push("manga canon chapters SBS");
  if (normalized.includes("anime")) variants.push("anime adaptation episodes filler toei");

  return [...new Set(variants)];
}
