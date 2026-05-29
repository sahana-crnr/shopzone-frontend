const SYNONYM_GROUPS: Record<string, string[]> = {
  shoes: ["shoes", "shoe", "sneakers", "sneaker", "footwear", "trainers"],
  headphones: [
    "headphones",
    "headphone",
    "earbuds",
    "earbud",
    "earphones",
    "audio",
  ],
  watches: ["watch", "watches", "smartwatch", "smartwatches", "wearable"],
  bags: ["bag", "bags", "backpack", "backpacks", "rucksack", "luggage"],
  "home-appliances": [
    "home appliances",
    "toaster",
    "microwave",
    "blender",
    "kettle",
    "airfryer",
    "air fryer",
    "iron",
    "heater",
    "fan",
    "purifier",
    "dehumidifier",
    "humidifier",
    "massager",
  ],
  laptop: ["laptop", "notebook", "ultrabook"],
  speakers: ["speaker", "speakers", "soundbar"],
  electronics: ["electronics"],
  sports: ["sports", "outdoor", "fitness", "yoga", "mat"],
};

const termToGroup = new Map<string, string>();

Object.entries(SYNONYM_GROUPS).forEach(([group, terms]) => {
  terms.forEach((term) => termToGroup.set(term.toLowerCase(), group));
});

const normalize = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

export const expandSearchTerm = (value: string) => {
  const normalized = normalize(value);
  if (!normalized) {
    return [];
  }

  const expanded = new Set<string>();

  const directGroup = termToGroup.get(normalized);
  if (directGroup) {
    SYNONYM_GROUPS[directGroup].forEach((term) => expanded.add(term));
    expanded.add(normalized);
  }

  normalized.split(" ").forEach((token) => {
    const group = termToGroup.get(token);
    if (group) {
      SYNONYM_GROUPS[group].forEach((term) => expanded.add(term));
      expanded.add(group);
      return;
    }

    expanded.add(token);
  });

  expanded.add(normalized);
  return Array.from(expanded);
};

export const scoreSearchMatch = (
  query: string,
  haystackParts: string[],
) => {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) {
    return 0;
  }

  const haystack = haystackParts.join(" ").toLowerCase();
  const queryTerms = normalizedQuery.split(" ").filter(Boolean);

  const matchesAllTerms = queryTerms.every((term) => {
    const expandedTerms = expandSearchTerm(term);
    return expandedTerms.some((expandedTerm) => haystack.includes(expandedTerm));
  });

  if (!matchesAllTerms) {
    return 0;
  }

  let score = 0;
  if (haystack.startsWith(normalizedQuery)) score += 500;
  if (haystack.includes(normalizedQuery)) score += 250;

  for (const term of queryTerms) {
    const expandedTerms = expandSearchTerm(term);
    for (const expandedTerm of expandedTerms) {
      if (haystack.includes(expandedTerm)) {
        score += 40;
      }
    }
  }

  return score;
};
