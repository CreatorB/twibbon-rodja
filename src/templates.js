export const DEFAULT_TEMPLATE_PRESETS = [
  {
    id: "rodja-frame",
    title: "Rodja Frame",
    description: "Template unit Rodja",
    imagePath: "/templates/ycs-frame/twibbon-rodja.jpg",
    textBox: {
      x: 0.5,
      y: 0.69,
      maxWidth: 0.56,
      maxLines: 2,
      minFont: 28,
      maxFont: 54,
      lineHeight: 1.08,
      align: "center",
    },
    textStyle: {
      mainColor: "#fff6d6",
      shadowColor: "rgba(48, 12, 4, 0.45)",
    },
  },
  {
    id: "rodja-2-frame",
    title: "Rodja 2 Frame",
    description: "Template unit Rodja varian 2",
    imagePath: "/templates/ycs-frame/twibbon-rodja-2.png",
    textBox: {
      x: 0.5,
      y: 0.742,
      maxWidth: 0.62,
      maxLines: 2,
      minFont: 20,
      maxFont: 40,
      lineHeight: 1.04,
      align: "center",
    },
    textStyle: {
      mainColor: "#f8dca0",
      shadowColor: "rgba(53, 10, 6, 0.45)",
    },
  },
  {
    id: "syathiby-frame",
    title: "Syathiby Frame",
    description: "Template unit Syathiby",
    imagePath: "/templates/ycs-frame/twibbon-syathiby.png",
    textBox: {
      x: 0.5,
      y: 0.665,
      maxWidth: 0.48,
      maxLines: 2,
      minFont: 24,
      maxFont: 44,
      lineHeight: 1.06,
      align: "center",
    },
    textStyle: {
      mainColor: "#ffffff",
      shadowColor: "rgba(9, 52, 35, 0.3)",
    },
  },
  {
    id: "kias-frame",
    title: "KIAS Frame",
    description: "Template unit KIAS",
    imagePath: "/templates/ycs-frame/twibbon-kias.png",
    textBox: {
      x: 0.5,
      y: 0.355,
      maxWidth: 0.52,
      maxLines: 2,
      minFont: 22,
      maxFont: 42,
      lineHeight: 1.06,
      align: "center",
    },
    textStyle: {
      mainColor: "#ffffff",
      shadowColor: "rgba(7, 70, 98, 0.22)",
    },
  },
  {
    id: "pkbm-cahaya-sunnah-frame",
    title: "PKBM Cahaya Sunnah Frame",
    description: "Template unit PKBM Cahaya Sunnah",
    imagePath: "/templates/ycs-frame/twibbon-pkbm-cahaya-sunnah.jpeg",
    textBox: {
      x: 0.5,
      y: 0.68,
      maxWidth: 0.58,
      maxLines: 2,
      minFont: 20,
      maxFont: 40,
      lineHeight: 1.04,
      align: "center",
    },
    textStyle: {
      mainColor: "#fff6d6",
      shadowColor: "rgba(48, 12, 4, 0.45)",
    },
  },
  {
    id: "sdit-cahaya-sunnah-frame",
    title: "SDIT Cahaya Sunnah Frame",
    description: "Template unit SDIT Cahaya Sunnah",
    imagePath: "/templates/ycs-frame/twibbon-sdit-cahaya-sunnah.jpeg",
    textBox: {
      x: 0.5,
      y: 0.55,
      maxWidth: 0.58,
      maxLines: 2,
      minFont: 20,
      maxFont: 40,
      lineHeight: 1.04,
      align: "center",
    },
    textStyle: {
      mainColor: "#ff8c00",
      shadowColor: "rgba(255, 140, 0, 0.25)",
    },
  },
  {
    id: "stq-syathiby-frame",
    title: "STQ Syathiby Frame",
    description: "Template unit STQ Syathiby",
    imagePath: "/templates/ycs-frame/twibbon-stq-syathiby.jpeg",
    textBox: {
      x: 0.5,
      y: 0.60,
      maxWidth: 0.5,
      maxLines: 2,
      minFont: 20,
      maxFont: 38,
      lineHeight: 1.03,
      align: "center",
    },
    textStyle: {
      mainColor: "#1d7a63",
      shadowColor: "rgba(100, 180, 160, 0.2)",
    },
  },
];

export const DEFAULT_GREETING_CARDS = [];

export const OUTPUT_SIZES = [
  { id: "1080x1350", label: "Portrait 4:5", width: 1080, height: 1350 },
  { id: "1080x1080", label: "Square 1:1", width: 1080, height: 1080 },
  { id: "1080x1920", label: "Story 9:16", width: 1080, height: 1920 },
];

export const FONT_OPTIONS = [
  { id: "sora", label: "Sora", family: '"Sora", sans-serif' },
  { id: "outfit", label: "Outfit", family: '"Outfit", sans-serif' },
  { id: "plus-jakarta", label: "Plus Jakarta Sans", family: '"Plus Jakarta Sans", sans-serif' },
  { id: "instrument-serif", label: "Instrument Serif", family: '"Instrument Serif", serif' },
  { id: "playfair", label: "Playfair Display", family: '"Playfair Display", serif' },
  { id: "cormorant", label: "Cormorant Garamond", family: '"Cormorant Garamond", serif' },
  { id: "marcellus", label: "Marcellus", family: '"Marcellus", serif' },
  { id: "trebuc", label: "Trebuchet", family: '"Trebuchet MS", sans-serif' },
  { id: "segoe", label: "Segoe UI", family: '"Segoe UI", sans-serif' },
];

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, parsed));
}

function toSafeId(value, fallbackId) {
  const safe = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return safe || fallbackId;
}

function normalizeTemplate(raw, index) {
  const fallback = DEFAULT_TEMPLATE_PRESETS[0];
  const rawTextBox = raw?.textBox || {};
  const fallbackId = `template-${index + 1}`;

  const imageName = String(raw?.image || raw?.imagePath || "").trim();
  const imagePath = imageName.startsWith("/") ? imageName : `/templates/ycs-frame/${imageName}`;

  return {
    id: toSafeId(raw?.id, fallbackId),
    title: String(raw?.title || `Template ${index + 1}`),
    description: String(raw?.description || "Template custom"),
    imagePath: imageName ? imagePath : fallback.imagePath,
    textBox: {
      x: clampNumber(rawTextBox.x, 0, 1, fallback.textBox.x),
      y: clampNumber(rawTextBox.y, 0, 1, fallback.textBox.y),
      maxWidth: clampNumber(rawTextBox.maxWidth, 0.2, 0.95, fallback.textBox.maxWidth),
      maxLines: Math.round(clampNumber(rawTextBox.maxLines, 1, 8, fallback.textBox.maxLines)),
      minFont: Math.round(clampNumber(rawTextBox.minFont, 12, 120, fallback.textBox.minFont)),
      maxFont: Math.round(clampNumber(rawTextBox.maxFont, 12, 160, fallback.textBox.maxFont)),
      lineHeight: clampNumber(rawTextBox.lineHeight, 0.8, 2.2, fallback.textBox.lineHeight),
      align: rawTextBox.align === "left" || rawTextBox.align === "right" ? rawTextBox.align : "center",
    },
    textStyle: {
      mainColor: String(raw?.textStyle?.mainColor || raw?.mainColor || fallback.textStyle?.mainColor || "#f8e08b"),
      shadowColor: String(raw?.textStyle?.shadowColor || raw?.shadowColor || fallback.textStyle?.shadowColor || "rgba(0, 0, 0, 0.45)"),
    },
  };
}

function normalizeGreetingCard(raw, index) {
  const fallbackId = `greeting-${index + 1}`;
  const imageName = String(raw?.image || raw?.imagePath || "").trim();
  const imagePath = imageName.startsWith("/") ? imageName : `/templates/free-frame/${imageName}`;

  return {
    id: toSafeId(raw?.id, fallbackId),
    title: String(raw?.title || `Kartu Ucapan ${index + 1}`),
    description: String(raw?.description || "Template ucapan siap pakai"),
    imagePath,
  };
}

function dedupeTemplateIds(items) {
  const seen = new Set();
  return items.map((item, index) => {
    let id = item.id;
    if (!id || seen.has(id)) {
      id = `${item.id || "item"}-${index + 1}`;
    }
    seen.add(id);
    return {
      ...item,
      id,
    };
  });
}

export async function loadTemplateData() {
  try {
    const response = await fetch("/templates/manifest.json", { cache: "no-store" });
    if (!response.ok) {
      return {
        twibbonTemplates: DEFAULT_TEMPLATE_PRESETS,
        greetingCards: DEFAULT_GREETING_CARDS,
      };
    }

    const payload = await response.json();
    const twibbonRaw = Array.isArray(payload?.ycsTemplates)
      ? payload.ycsTemplates
      : Array.isArray(payload?.templates)
        ? payload.templates
        : [];

    const greetingRaw = Array.isArray(payload?.freeFrames)
      ? payload.freeFrames
      : Array.isArray(payload?.greetingCards)
        ? payload.greetingCards
        : [];

    const twibbonTemplates = twibbonRaw.length
      ? dedupeTemplateIds(twibbonRaw.map((item, index) => normalizeTemplate(item, index)))
      : DEFAULT_TEMPLATE_PRESETS;

    const greetingCards = greetingRaw.length
      ? dedupeTemplateIds(greetingRaw.map((item, index) => normalizeGreetingCard(item, index)))
      : DEFAULT_GREETING_CARDS;

    return {
      twibbonTemplates,
      greetingCards,
    };
  } catch {
    return {
      twibbonTemplates: DEFAULT_TEMPLATE_PRESETS,
      greetingCards: DEFAULT_GREETING_CARDS,
    };
  }
}


