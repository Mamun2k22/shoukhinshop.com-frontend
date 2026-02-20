export const splitToBullets = (text = "") => {
  if (!text) return [];

  // 1️⃣ newline priority (admin will write one per line)
  const lines = String(text)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length > 1) return lines;

  // 2️⃣ fallback for old paragraph data
  return String(text)
    .split(/•\s*|(?<=\.)\s+|\s+\|\s+/g)
    .map((s) => s.trim().replace(/\.$/, ""))
    .filter(Boolean);
};