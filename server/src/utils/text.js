export function normalizeText(value = "") {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function tokenize(value = "") {
  return normalizeText(value)
    .replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
}

export function scoreByTokenOverlap(question, text) {
  const qTokens = new Set(tokenize(question));
  const tTokens = tokenize(text);

  let score = 0;
  for (const token of tTokens) {
    if (qTokens.has(token)) score += 1;
  }

  return score;
}

export function truncate(value = "", max = 1200) {
  if (value.length <= max) return value;
  return `${value.slice(0, max)}...`;
}
