import "./style.css";
import { DEFAULT_APP_CONFIG, DEFAULT_TEMPLATE_PRESETS, FONT_OPTIONS, OUTPUT_SIZES, loadTemplateData } from "./templates.js";

const imageCache = new Map();
const PRESET_HELPER_FOLLOW_STUDIO = "__studio__";

const elements = {
  tabButtons: Array.from(document.querySelectorAll(".tab-button")),
  tabPanels: Array.from(document.querySelectorAll(".tab-panel")),
  heroEyebrow: document.getElementById("heroEyebrow"),
  heroTitle: document.getElementById("heroTitle"),
  heroDescription: document.getElementById("heroDescription"),
  tabLabelSimple: document.getElementById("tabLabelSimple"),
  tabLabelStudio: document.getElementById("tabLabelStudio"),
  tabLabelGallery: document.getElementById("tabLabelGallery"),
  bottomTabLabelSimple: document.getElementById("bottomTabLabelSimple"),
  bottomTabLabelStudio: document.getElementById("bottomTabLabelStudio"),
  bottomTabLabelGallery: document.getElementById("bottomTabLabelGallery"),
  simpleSectionTitle: document.getElementById("simpleSectionTitle"),
  simpleSectionDescription: document.getElementById("simpleSectionDescription"),
  simpleSectionHelper: document.getElementById("simpleSectionHelper"),
  studioSectionTitle: document.getElementById("studioSectionTitle"),
  studioSectionDescription: document.getElementById("studioSectionDescription"),
  gallerySectionTitle: document.getElementById("gallerySectionTitle"),
  gallerySectionDescription: document.getElementById("gallerySectionDescription"),
  footerCreditPrefix: document.getElementById("footerCreditPrefix"),
  footerCreditBy: document.getElementById("footerCreditBy"),
  footerCreditLink: document.getElementById("footerCreditLink"),
  footerSourceLink: document.getElementById("footerSourceLink"),
  simpleNameInput: document.getElementById("simpleNameInput"),
  simpleSizeSelect: document.getElementById("simpleSizeSelect"),
  simplePreviewList: document.getElementById("simplePreviewList"),

  studioTemplateSelect: document.getElementById("studioTemplateSelect"),
  studioUploadInput: document.getElementById("studioUploadInput"),
  studioNameInput: document.getElementById("studioNameInput"),
  studioSizeSelect: document.getElementById("studioSizeSelect"),
  studioFontSelect: document.getElementById("studioFontSelect"),
  studioColorInput: document.getElementById("studioColorInput"),
  studioFontSizeRange: document.getElementById("studioFontSizeRange"),
  studioOffsetXRange: document.getElementById("studioOffsetXRange"),
  studioOffsetYRange: document.getElementById("studioOffsetYRange"),
  studioResetButton: document.getElementById("studioResetButton"),
  studioDownloadButton: document.getElementById("studioDownloadButton"),
  studioShareButton: document.getElementById("studioShareButton"),
  studioCanvas: document.getElementById("studioCanvas"),
  studioCanvasShell: document.getElementById("studioCanvasShell"),
  studioMeta: document.getElementById("studioMeta"),
  studioUsageBadge: document.getElementById("studioUsageBadge"),
  studioUsageCount: document.getElementById("studioUsageCount"),
  studioGrid: document.getElementById("studioGrid"),
  studioControls: document.getElementById("studioControls"),
  studioActions: document.getElementById("studioActions"),
  studioPreviewWrap: document.getElementById("studioPreviewWrap"),
  studioMobileHint: document.getElementById("studioMobileHint"),

  presetXRange: document.getElementById("presetXRange"),
  presetTemplateSelect: document.getElementById("presetTemplateSelect"),
  presetYRange: document.getElementById("presetYRange"),
  presetWidthRange: document.getElementById("presetWidthRange"),
  presetLinesRange: document.getElementById("presetLinesRange"),
  presetMinFontRange: document.getElementById("presetMinFontRange"),
  presetMaxFontRange: document.getElementById("presetMaxFontRange"),
  presetLineHeightRange: document.getElementById("presetLineHeightRange"),
  presetOutput: document.getElementById("presetOutput"),
  copyPresetButton: document.getElementById("copyPresetButton"),

  galleryPreviewList: document.getElementById("galleryPreviewList"),
  bottomNavButtons: Array.from(document.querySelectorAll(".bottom-nav-btn")),
  fabScrollTop: document.getElementById("fabScrollTop"),
};

const simpleCards = new Map();
const galleryCards = new Map();
let templates = [...DEFAULT_TEMPLATE_PRESETS];
let greetingCards = [];

const renderState = {
  simpleToken: 0,
  studioToken: 0,
  galleryToken: 0,
};

const STUDIO_HINT_STORAGE_KEY = "ycs-studio-drag-hint-dismissed";
const COUNTER_KEYS = {
  total: "total_used",
  download: "total_download",
  share: "total_share",
};
const COUNTER_COOLDOWN_MS = 4000;
const COUNTER_FLUSH_LIMIT = 24;
const COUNTER_QUEUE_MAX = 300;
const ITEM_COUNTER_PREFIX = "item_used_";

const state = {
  appConfig: {
    ...DEFAULT_APP_CONFIG,
  },
  studioPreviewReady: false,
  studioLastImagePath: "",
  studioLastTextBounds: null,
  studioHintDismissTimer: null,
  studioDrag: {
    active: false,
    pointerId: null,
    rafId: 0,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
  },
  usageCounter: {
    namespace: "",
    totals: {
      [COUNTER_KEYS.total]: 0,
      [COUNTER_KEYS.download]: 0,
      [COUNTER_KEYS.share]: 0,
    },
    itemTotals: {},
    queue: [],
    cooldown: new Map(),
    initialized: false,
    offline: false,
  },
};

function debounce(fn, delay = 120) {
  let timeoutId = null;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

function getSizeById(sizeId) {
  return OUTPUT_SIZES.find((size) => size.id === sizeId) ?? OUTPUT_SIZES[0];
}

function getTemplateById(templateId) {
  return templates.find((template) => template.id === templateId) ?? templates[0] ?? DEFAULT_TEMPLATE_PRESETS[0];
}

function getFontById(fontId) {
  return FONT_OPTIONS.find((font) => font.id === fontId) ?? FONT_OPTIONS[0];
}

function getSuggestedFontId(templateId) {
  const suggested = {
    "rodja-frame": "playfair",
    "rodja-2-frame": "playfair",
    "syathiby-frame": "instrument-serif",
    "kias-frame": "plus-jakarta",
    "albarkah-frame": "cormorant",
    "pkbm-cahaya-sunnah-frame": "playfair",
    "sdit-cahaya-sunnah-frame": "playfair",
    "tk-cahaya-sunnah-frame": "playfair",
    "stq-syathiby-frame": "instrument-serif",
  };

  return suggested[templateId] ?? FONT_OPTIONS[0].id;
}

function parsePercentRange(element) {
  return Number(element.value) / 100;
}

function getPresetHelperBaseTemplate() {
  const presetTemplateId = elements.presetTemplateSelect?.value;
  if (presetTemplateId && presetTemplateId !== PRESET_HELPER_FOLLOW_STUDIO) {
    return getTemplateById(presetTemplateId);
  }
  return getTemplateById(elements.studioTemplateSelect.value);
}

function readPresetControls(baseTemplate) {
  const maxFont = Number(elements.presetMaxFontRange.value);
  const minFont = Math.min(Number(elements.presetMinFontRange.value), maxFont);

  return {
    ...baseTemplate,
    textBox: {
      ...baseTemplate.textBox,
      x: parsePercentRange(elements.presetXRange),
      y: parsePercentRange(elements.presetYRange),
      maxWidth: parsePercentRange(elements.presetWidthRange),
      maxLines: Number(elements.presetLinesRange.value),
      minFont,
      maxFont,
      lineHeight: Number(elements.presetLineHeightRange.value) / 100,
      align: baseTemplate.textBox.align,
    },
  };
}

function setPresetControlsFromTemplate(template) {
  elements.presetXRange.value = String(Math.round(template.textBox.x * 100));
  elements.presetYRange.value = String(Math.round(template.textBox.y * 100));
  elements.presetWidthRange.value = String(Math.round(template.textBox.maxWidth * 100));
  elements.presetLinesRange.value = String(template.textBox.maxLines);
  elements.presetMinFontRange.value = String(template.textBox.minFont);
  elements.presetMaxFontRange.value = String(template.textBox.maxFont);
  elements.presetLineHeightRange.value = String(Math.round(template.textBox.lineHeight * 100));
  elements.studioColorInput.value = template.textStyle?.mainColor || "#f8e08b";
}

function updatePresetOutput(template) {
  const image = template.imagePath.startsWith("/templates/ycs-frame/")
    ? template.imagePath.replace("/templates/ycs-frame/", "")
    : template.imagePath;

  elements.presetOutput.value = JSON.stringify(
    {
      id: template.id,
      title: template.title,
      description: template.description,
      image,
      textBox: {
        x: Number(template.textBox.x.toFixed(3)),
        y: Number(template.textBox.y.toFixed(3)),
        maxWidth: Number(template.textBox.maxWidth.toFixed(3)),
        maxLines: template.textBox.maxLines,
        minFont: template.textBox.minFont,
        maxFont: template.textBox.maxFont,
        lineHeight: Number(template.textBox.lineHeight.toFixed(2)),
        align: template.textBox.align,
      },
      textStyle: {
        mainColor: template.textStyle?.mainColor || "#f8e08b",
        shadowColor: template.textStyle?.shadowColor || "rgba(0, 0, 0, 0.45)",
      },
    },
    null,
    2,
  );
}

function buildPresetHelperOptions() {
  return [
    { value: PRESET_HELPER_FOLLOW_STUDIO, label: "Ikuti template aktif" },
    ...templates
      .filter((template) => template.id !== "uploaded-template")
      .map((template) => ({
        value: template.id,
        label: template.title,
      })),
  ];
}

function populatePresetHelperSelect() {
  const currentValue = elements.presetTemplateSelect.value;
  const options = buildPresetHelperOptions();
  buildSelectOptions(elements.presetTemplateSelect, options);

  const hasCurrent = options.some((option) => option.value === currentValue);
  elements.presetTemplateSelect.value = hasCurrent ? currentValue : PRESET_HELPER_FOLLOW_STUDIO;
}

function applyStudioDefaults(template) {
  elements.studioFontSelect.value = FONT_OPTIONS[0].id;
  elements.studioColorInput.value = template.textStyle?.mainColor || "#f8e08b";
  elements.studioFontSizeRange.value = String(template.textBox.maxFont);
  elements.studioOffsetXRange.value = "0";
  elements.studioOffsetYRange.value = "0";
}

async function loadImage(url) {
  if (imageCache.has(url)) {
    return imageCache.get(url);
  }

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

  imageCache.set(url, image);
  return image;
}

function drawCoverImage(ctx, image, width, height) {
  const imageRatio = image.width / image.height;
  const canvasRatio = width / height;
  let drawWidth = width;
  let drawHeight = height;
  let offsetX = 0;
  let offsetY = 0;

  if (imageRatio > canvasRatio) {
    drawWidth = height * imageRatio;
    offsetX = (width - drawWidth) / 2;
  } else {
    drawHeight = width / imageRatio;
    offsetY = (height - drawHeight) / 2;
  }

  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
}

function wrapText(ctx, text, maxWidth) {
  const trimmed = text.trim();
  if (!trimmed) {
    return [""];
  }

  const normalized = trimmed.replace(/\s+/g, " ");
  const words = normalized.split(" ");
  const lines = [];

  const breakWordToFit = (word) => {
    const chunks = [];
    let currentChunk = "";
    for (const char of word) {
      const candidate = currentChunk + char;
      if (currentChunk && ctx.measureText(candidate).width > maxWidth) {
        chunks.push(currentChunk);
        currentChunk = char;
      } else {
        currentChunk = candidate;
      }
    }
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    return chunks;
  };

  let currentLine = "";
  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      currentLine = candidate;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }

      if (ctx.measureText(word).width <= maxWidth) {
        currentLine = word;
      } else {
        const chunks = breakWordToFit(word);
        lines.push(...chunks.slice(0, -1));
        currentLine = chunks[chunks.length - 1] || "";
      }
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length ? lines : [""];
}

function fitTextToBox(ctx, text, box, fontFamily, forcedFontSize = null, options = {}) {
  const hardMin = options.allowBelowMin ? Math.min(box.minFont, options.minFloor ?? 10) : box.minFont;
  const safePadding = Math.max(0.75, Math.min(1, options.safePadding ?? 0.94));
  const fitWidth = box.maxWidth * safePadding;

  if (forcedFontSize) {
    let size = Math.max(hardMin, forcedFontSize);
    while (size >= hardMin) {
      ctx.font = `700 ${size}px ${fontFamily}`;
      const lines = wrapText(ctx, text, fitWidth);
      const widest = Math.max(...lines.map((line) => ctx.measureText(line).width));
      if (lines.length <= box.maxLines && widest <= fitWidth) {
        return {
          fontSize: size,
          lines,
          lineHeight: Math.round(size * box.lineHeight),
        };
      }
      size -= 2;
    }

    ctx.font = `700 ${hardMin}px ${fontFamily}`;
    return {
      fontSize: hardMin,
      lines: wrapText(ctx, text, fitWidth).slice(0, box.maxLines),
      lineHeight: Math.round(hardMin * box.lineHeight),
    };
  }

  let size = box.maxFont;
  while (size >= hardMin) {
    ctx.font = `700 ${size}px ${fontFamily}`;
    const lines = wrapText(ctx, text, fitWidth);
    const widest = Math.max(...lines.map((line) => ctx.measureText(line).width));
    if (lines.length <= box.maxLines && widest <= fitWidth) {
      return {
        fontSize: size,
        lines,
        lineHeight: Math.round(size * box.lineHeight),
      };
    }
    size -= 2;
  }

  ctx.font = `700 ${hardMin}px ${fontFamily}`;
  return {
    fontSize: hardMin,
    lines: wrapText(ctx, text, fitWidth).slice(0, box.maxLines),
    lineHeight: Math.round(hardMin * box.lineHeight),
  };
}

async function renderCardToCanvas({
  canvas,
  imagePath,
  preset,
  width,
  height,
  name,
  fontFamily,
  mainColor,
  forcedFontSize,
  offsetX = 0,
  offsetY = 0,
  autoShrink = false,
}) {
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;

  const image = await loadImage(imagePath);
  ctx.clearRect(0, 0, width, height);
  drawCoverImage(ctx, image, width, height);

  const box = {
    ...preset.textBox,
    maxWidth: width * preset.textBox.maxWidth,
    minFont: Math.max(12, Math.round(preset.textBox.minFont * (width / 1080))),
    maxFont: Math.round(preset.textBox.maxFont * (width / 1080)),
  };

  const fit = fitTextToBox(
    ctx,
    name,
    box,
    fontFamily,
    forcedFontSize ? Math.round(forcedFontSize * (width / 1080)) : null,
    { allowBelowMin: autoShrink, minFloor: 8, safePadding: autoShrink ? 0.88 : 0.94 },
  );

  const textX = width * (preset.textBox.x + offsetX);
  const textY = height * (preset.textBox.y + offsetY);

  ctx.textAlign = preset.textBox.align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = mainColor || preset.textStyle?.mainColor || "#f8e08b";
  ctx.shadowColor = preset.textStyle?.shadowColor || "rgba(0, 0, 0, 0.45)";
  ctx.shadowBlur = 12;

  const startY = textY - ((fit.lines.length - 1) * fit.lineHeight) / 2;
  fit.lines.forEach((line, index) => {
    ctx.fillText(line, textX, startY + index * fit.lineHeight);
  });

  ctx.shadowBlur = 0;

  const widestLine = Math.max(...fit.lines.map((line) => ctx.measureText(line).width));
  const align = preset.textBox.align;
  const boundsX = align === "left" ? textX : align === "right" ? textX - widestLine : textX - widestLine / 2;
  return {
    textBounds: {
      x: boundsX,
      y: startY - fit.lineHeight * 0.5,
      width: widestLine,
      height: fit.lineHeight * fit.lines.length,
    },
  };
}

async function renderImageOnly(canvas, imagePath, width, height) {
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;
  const image = await loadImage(imagePath);
  ctx.clearRect(0, 0, width, height);
  drawCoverImage(ctx, image, width, height);
}

function buildSelectOptions(select, options) {
  select.innerHTML = "";
  options.forEach((option) => {
    const node = document.createElement("option");
    node.value = option.value;
    node.textContent = option.label;
    select.appendChild(node);
  });
}

function activateTab(target) {
  elements.tabButtons.forEach((item) => {
    const active = item.dataset.target === target;
    item.classList.toggle("active", active);
    item.setAttribute("aria-selected", String(active));
  });
  elements.tabPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.id === target);
  });
  elements.bottomNavButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.target === target);
  });
}

function setupTabs() {
  elements.tabButtons.forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.target));
  });
  elements.bottomNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activateTab(button.dataset.target);
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function setupFab() {
  window.addEventListener("scroll", () => {
    elements.fabScrollTop.classList.toggle("visible", window.scrollY > 200);
  }, { passive: true });
  elements.fabScrollTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function setupResponsiveStudioLayout() {
  const { studioGrid, studioControls, studioActions, studioPreviewWrap } = elements;
  if (!studioGrid || !studioControls || !studioActions || !studioPreviewWrap) {
    return;
  }

  const isMobile = window.matchMedia("(max-width: 699px)").matches;
  if (isMobile) {
    if (studioPreviewWrap.parentElement !== studioControls) {
      studioControls.insertBefore(studioPreviewWrap, studioActions);
    }
  } else if (studioPreviewWrap.parentElement !== studioGrid) {
    studioGrid.appendChild(studioPreviewWrap);
  }
}

function setupStudioMobileHint() {
  const hint = elements.studioMobileHint;
  if (!hint) {
    return;
  }

  try {
    if (window.localStorage.getItem(STUDIO_HINT_STORAGE_KEY) === "1") {
      hint.classList.add("is-hidden");
    }
  } catch {
    // Ignore storage errors on restricted browsers.
  }
}

function dismissStudioMobileHint() {
  const hint = elements.studioMobileHint;
  if (!hint || hint.classList.contains("is-hidden") || hint.classList.contains("is-dismissing")) {
    return;
  }

  hint.classList.add("is-dismissing");
  if (state.studioHintDismissTimer) {
    clearTimeout(state.studioHintDismissTimer);
  }
  state.studioHintDismissTimer = setTimeout(() => {
    hint.classList.remove("is-dismissing");
    hint.classList.add("is-hidden");
    try {
      window.localStorage.setItem(STUDIO_HINT_STORAGE_KEY, "1");
    } catch {
      // Ignore storage errors on restricted browsers.
    }
    state.studioHintDismissTimer = null;
  }, 170);
}

function getCounterNamespace() {
  return state.usageCounter.namespace || DEFAULT_APP_CONFIG.counterNamespace;
}

function getFileNamePrefix() {
  return state.appConfig.fileNamePrefix || DEFAULT_APP_CONFIG.fileNamePrefix;
}

function updateMetaContent(selector, value) {
  if (!value) {
    return;
  }
  const node = document.querySelector(selector);
  if (node) {
    node.setAttribute("content", value);
  }
}

function applyAppConfig() {
  const config = state.appConfig;

  if (elements.heroEyebrow) {
    elements.heroEyebrow.textContent = config.heroEyebrow;
  }
  if (elements.heroTitle) {
    elements.heroTitle.textContent = config.heroTitle;
  }
  if (elements.heroDescription) {
    elements.heroDescription.textContent = config.heroDescription;
  }
  if (elements.tabLabelSimple) {
    elements.tabLabelSimple.textContent = config.tabLabelSimple;
  }
  if (elements.tabLabelStudio) {
    elements.tabLabelStudio.textContent = config.tabLabelStudio;
  }
  if (elements.tabLabelGallery) {
    elements.tabLabelGallery.textContent = config.tabLabelGallery;
  }
  if (elements.bottomTabLabelSimple) {
    elements.bottomTabLabelSimple.textContent = config.tabLabelSimple;
  }
  if (elements.bottomTabLabelStudio) {
    elements.bottomTabLabelStudio.textContent = config.tabLabelStudio;
  }
  if (elements.bottomTabLabelGallery) {
    elements.bottomTabLabelGallery.textContent = config.tabLabelGallery;
  }
  if (elements.simpleSectionTitle) {
    elements.simpleSectionTitle.textContent = config.simpleSectionTitle;
  }
  if (elements.simpleSectionDescription) {
    elements.simpleSectionDescription.textContent = config.simpleSectionDescription;
  }
  if (elements.simpleSectionHelper) {
    elements.simpleSectionHelper.textContent = config.simpleSectionHelper;
  }
  if (elements.studioSectionTitle) {
    elements.studioSectionTitle.textContent = config.studioSectionTitle;
  }
  if (elements.studioSectionDescription) {
    elements.studioSectionDescription.textContent = config.studioSectionDescription;
  }
  if (elements.gallerySectionTitle) {
    elements.gallerySectionTitle.textContent = config.gallerySectionTitle;
  }
  if (elements.gallerySectionDescription) {
    elements.gallerySectionDescription.textContent = config.gallerySectionDescription;
  }
  if (elements.footerCreditPrefix) {
    elements.footerCreditPrefix.textContent = config.footerCreditPrefix;
  }
  if (elements.footerCreditBy) {
    elements.footerCreditBy.textContent = config.footerCreditBy;
  }
  if (elements.footerCreditLink) {
    elements.footerCreditLink.textContent = config.footerCreditLinkText;
    elements.footerCreditLink.href = config.footerCreditLinkHref;
  }
  if (elements.footerSourceLink) {
    elements.footerSourceLink.textContent = config.footerSourceLinkText;
    elements.footerSourceLink.href = config.footerSourceLinkHref;
  }

  document.title = config.pageTitle;

  updateMetaContent('meta[name="description"]', config.metaDescription);
  updateMetaContent('meta[property="og:title"]', config.pageTitle);
  updateMetaContent('meta[property="og:description"]', config.metaDescription);
  updateMetaContent('meta[name="twitter:title"]', config.pageTitle);
  updateMetaContent('meta[name="twitter:description"]', config.metaDescription);

  const canonicalNode = document.querySelector('link[rel="canonical"]');
  if (canonicalNode && config.canonicalUrl) {
    canonicalNode.setAttribute("href", config.canonicalUrl);
  }

  updateMetaContent('meta[property="og:url"]', config.canonicalUrl);
}

function getCounterStorageKey(type) {
  return `${type}:${state.usageCounter.namespace}`;
}

function readJsonStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJsonStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota/restrictions.
  }
}

function formatCount(value) {
  return new Intl.NumberFormat("id-ID").format(Math.max(0, Number(value) || 0));
}

function animateCountIncrease(node, nextValue) {
  const prevValue = Number(node.dataset.countValue || 0);
  node.dataset.countValue = String(nextValue);
  if (nextValue <= prevValue) {
    return;
  }

  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  node.classList.remove("usage-pop");
  // Force reflow so repeated increments can retrigger the animation.
  void node.offsetWidth;
  node.classList.add("usage-pop");
}

function sanitizeCounterKeyPart(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9:-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function getSimpleSourceId(templateId) {
  return `simple:${templateId}`;
}

function getGallerySourceId(cardId) {
  return `gallery:${cardId}`;
}

function getStudioSourceId(templateId) {
  return `studio:${templateId}`;
}

function getTrackedSourceIds() {
  const ids = [
    ...Array.from(simpleCards.values()).map((item) => item.sourceId),
    ...Array.from(galleryCards.values()).map((item) => item.sourceId),
  ];

  const studioTemplateId = elements.studioTemplateSelect?.value;
  if (studioTemplateId) {
    ids.push(getStudioSourceId(studioTemplateId));
  }

  return Array.from(new Set(ids));
}

function getItemCounterKey(sourceId) {
  return `${ITEM_COUNTER_PREFIX}${sanitizeCounterKeyPart(sourceId)}`;
}

function getSourceIdByItemCounterKey(key) {
  if (!key.startsWith(ITEM_COUNTER_PREFIX)) {
    return null;
  }
  const normalized = key.slice(ITEM_COUNTER_PREFIX.length);

  if (normalized.includes(":")) {
    return normalized;
  }

  for (const sourceId of getTrackedSourceIds()) {
    if (sanitizeCounterKeyPart(sourceId) === normalized) {
      return sourceId;
    }
  }
  return null;
}

function getBadgeBySourceId(sourceId) {
  if (sourceId.startsWith("simple:")) {
    const id = sourceId.slice("simple:".length);
    return simpleCards.get(id)?.usageBadge || null;
  }
  if (sourceId.startsWith("gallery:")) {
    const id = sourceId.slice("gallery:".length);
    return galleryCards.get(id)?.usageBadge || null;
  }
  if (sourceId.startsWith("studio:")) {
    return elements.studioUsageBadge;
  }
  return null;
}

function updateCardUsageBadge(sourceId) {
  const countNode = sourceId.startsWith("studio:")
    ? elements.studioUsageCount
    : getBadgeBySourceId(sourceId)?.querySelector(".usage-count");
  if (!countNode) {
    return;
  }
  const count = state.usageCounter.itemTotals[sourceId] || 0;

  countNode.textContent = formatCount(count);
  animateCountIncrease(countNode, count);

  const badge = getBadgeBySourceId(sourceId);
  if (!badge) {
    return;
  }
  badge.classList.toggle("offline", state.usageCounter.offline);
}

function updateAllCardUsageBadges() {
  simpleCards.forEach((item) => updateCardUsageBadge(item.sourceId));
  galleryCards.forEach((item) => updateCardUsageBadge(item.sourceId));

  const studioTemplateId = elements.studioTemplateSelect?.value;
  if (studioTemplateId) {
    updateCardUsageBadge(getStudioSourceId(studioTemplateId));
  }
}

function loadCounterCache() {
  const cache = readJsonStorage(getCounterStorageKey("ycs-counter-cache"), null);
  if (cache && typeof cache === "object") {
    state.usageCounter.totals[COUNTER_KEYS.total] = Number(cache[COUNTER_KEYS.total]) || 0;
    state.usageCounter.totals[COUNTER_KEYS.download] = Number(cache[COUNTER_KEYS.download]) || 0;
    state.usageCounter.totals[COUNTER_KEYS.share] = Number(cache[COUNTER_KEYS.share]) || 0;
  }

  const itemCache = readJsonStorage(getCounterStorageKey("ycs-counter-item-cache"), null);
  state.usageCounter.itemTotals = itemCache && typeof itemCache === "object" ? itemCache : {};

  const queue = readJsonStorage(getCounterStorageKey("ycs-counter-queue"), []);
  state.usageCounter.queue = Array.isArray(queue) ? queue.filter((item) => typeof item === "string") : [];
}

function persistCounterState() {
  writeJsonStorage(getCounterStorageKey("ycs-counter-cache"), state.usageCounter.totals);
  writeJsonStorage(getCounterStorageKey("ycs-counter-item-cache"), state.usageCounter.itemTotals);
  writeJsonStorage(getCounterStorageKey("ycs-counter-queue"), state.usageCounter.queue);
}

function setCounterOffline(value) {
  state.usageCounter.offline = value;
  updateAllCardUsageBadges();
}

function enqueueCounterKey(key) {
  state.usageCounter.queue.push(key);
  if (state.usageCounter.queue.length > COUNTER_QUEUE_MAX) {
    state.usageCounter.queue = state.usageCounter.queue.slice(state.usageCounter.queue.length - COUNTER_QUEUE_MAX);
  }
  persistCounterState();
  updateAllCardUsageBadges();
}

function counterUrl(mode, key) {
  const namespace = encodeURIComponent(state.usageCounter.namespace);
  const safeKey = encodeURIComponent(key);
  return `https://api.countapi.xyz/${mode}/${namespace}/${safeKey}`;
}

async function countApiRequest(mode, key) {
  const response = await fetch(counterUrl(mode, key), { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`CountAPI ${mode} failed`);
  }
  const payload = await response.json();
  return Number(payload?.value) || 0;
}

async function refreshCountersFromApi() {
  const sources = getTrackedSourceIds();

  try {
    await Promise.all(
      sources.map(async (sourceId) => {
        const key = getItemCounterKey(sourceId);
        const value = await countApiRequest("get", key);
        state.usageCounter.itemTotals[sourceId] = value;
      }),
    );
    state.usageCounter.initialized = true;
    setCounterOffline(false);
    persistCounterState();
    return true;
  } catch {
    state.usageCounter.initialized = true;
    setCounterOffline(true);
    return false;
  } finally {
    updateAllCardUsageBadges();
  }
}

async function refreshSingleSourceCounter(sourceId) {
  try {
    const key = getItemCounterKey(sourceId);
    const value = await countApiRequest("get", key);
    state.usageCounter.itemTotals[sourceId] = value;
    setCounterOffline(false);
    persistCounterState();
  } catch {
    setCounterOffline(true);
  } finally {
    updateCardUsageBadge(sourceId);
  }
}

function applyCounterValue(key, value) {
  if (key.startsWith(ITEM_COUNTER_PREFIX)) {
    const sourceId = getSourceIdByItemCounterKey(key);
    if (sourceId) {
      state.usageCounter.itemTotals[sourceId] = value;
      updateCardUsageBadge(sourceId);
    }
    return;
  }
  state.usageCounter.totals[key] = value;
}

async function hitCounterKey(key) {
  try {
    const value = await countApiRequest("hit", key);
    applyCounterValue(key, value);
    state.usageCounter.initialized = true;
    setCounterOffline(false);
    persistCounterState();
    return true;
  } catch {
    if (key.startsWith(ITEM_COUNTER_PREFIX)) {
      const sourceId = getSourceIdByItemCounterKey(key);
      if (sourceId) {
        state.usageCounter.itemTotals[sourceId] = (state.usageCounter.itemTotals[sourceId] || 0) + 1;
      }
    }
    enqueueCounterKey(key);
    setCounterOffline(true);
    return false;
  }
}

async function flushCounterQueue() {
  if (!state.usageCounter.queue.length) {
    return true;
  }

  const pending = [...state.usageCounter.queue];
  state.usageCounter.queue = [];

  for (let index = 0; index < pending.length && index < COUNTER_FLUSH_LIMIT; index += 1) {
    const key = pending[index];
    try {
      const value = await countApiRequest("hit", key);
      applyCounterValue(key, value);
    } catch {
      const remaining = pending.slice(index);
      state.usageCounter.queue = [...remaining, ...state.usageCounter.queue];
      persistCounterState();
      setCounterOffline(true);
      return false;
    }
  }

  if (pending.length > COUNTER_FLUSH_LIMIT) {
    state.usageCounter.queue = [...pending.slice(COUNTER_FLUSH_LIMIT), ...state.usageCounter.queue];
  }

  state.usageCounter.initialized = true;
  setCounterOffline(false);
  persistCounterState();
  updateAllCardUsageBadges();
  return true;
}

function isCounterEventAllowed(action, sourceId) {
  const key = `${action}:${sourceId}`;
  const now = Date.now();
  const lastTime = state.usageCounter.cooldown.get(key) || 0;
  if (now - lastTime < COUNTER_COOLDOWN_MS) {
    return false;
  }
  state.usageCounter.cooldown.set(key, now);
  return true;
}

async function trackUsage(action, sourceId) {
  if (!state.appConfig.counterEnabled) {
    return;
  }
  if (!state.usageCounter.namespace) {
    return;
  }
  if (!isCounterEventAllowed(action, sourceId)) {
    return;
  }

  const actionKey = action === "share" ? COUNTER_KEYS.share : COUNTER_KEYS.download;
  const itemKey = getItemCounterKey(sourceId);
  await Promise.allSettled([
    hitCounterKey(COUNTER_KEYS.total),
    hitCounterKey(actionKey),
    hitCounterKey(itemKey),
  ]);

  if (!state.usageCounter.offline && state.usageCounter.queue.length) {
    await flushCounterQueue();
  }

  updateAllCardUsageBadges();
}

async function setupUsageCounter() {
  if (!state.appConfig.counterEnabled) {
    return;
  }
  state.usageCounter.namespace = getCounterNamespace();
  loadCounterCache();
  updateAllCardUsageBadges();

  await refreshCountersFromApi();
  if (state.usageCounter.queue.length) {
    await flushCounterQueue();
  }

  window.addEventListener("online", () => {
    flushCounterQueue();
    refreshCountersFromApi();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && state.usageCounter.queue.length) {
      flushCounterQueue();
    }
  });
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function shareBlob(blob, filename) {
  if (!blob) {
    alert("Gagal memproses gambar.");
    return false;
  }

  const file = new File([blob], filename, { type: "image/png" });
  const data = { files: [file] };
  if (navigator.canShare && navigator.canShare(data)) {
    try {
      await navigator.share(data);
      return true;
    } catch {
      alert("Proses share dibatalkan atau gagal.");
      return false;
    }
  }

  alert("Fitur share belum didukung perangkat ini.");
  return false;
}

function setCanvasShellLoaded(shell, loaded) {
  if (!shell) {
    return;
  }
  shell.classList.toggle("is-loaded", loaded);
}

function initSimpleCards() {
  simpleCards.clear();
  elements.simplePreviewList.innerHTML = "";

  templates.forEach((template) => {
    const sourceId = getSimpleSourceId(template.id);
    const card = document.createElement("article");
    card.className = "simple-card";
    card.innerHTML = `
      <div class="card-head">
        <h3>${template.title}</h3>
        <div class="usage-pill usage-pill-frame" title="Total dipakai">
          <span class="usage-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M4 18h16v2H2V4h2v14zm2-4 4-4 3 3 5-5 1.4 1.4-6.4 6.4-3-3-2.6 2.6L6 14z"/></svg>
          </span>
          <span class="usage-count">0</span>
        </div>
      </div>
      <p>${template.description}</p>
      <div class="canvas-shell" style="aspect-ratio: 1080 / 1350;">
        <div class="canvas-skeleton" aria-hidden="true"></div>
        <canvas class="simple-canvas"></canvas>
      </div>
      <div class="simple-actions">
        <button type="button" class="small-btn">Download</button>
        <button type="button" class="small-btn ghost">Share</button>
      </div>
    `;

    elements.simplePreviewList.appendChild(card);
    const canvas = card.querySelector("canvas");
    const canvasShell = card.querySelector(".canvas-shell");
    const usageBadge = card.querySelector(".usage-pill");
    const [downloadButton, shareButton] = card.querySelectorAll("button");

    simpleCards.set(template.id, { template, canvas, canvasShell, sourceId, usageBadge });
    updateCardUsageBadge(sourceId);
    downloadButton.addEventListener("click", () => handleSimpleDownload(template.id));
    shareButton.addEventListener("click", () => handleSimpleShare(template.id));
  });
}

function initGalleryCards() {
  galleryCards.clear();
  elements.galleryPreviewList.innerHTML = "";

  if (!greetingCards.length) {
    const empty = document.createElement("p");
    empty.className = "helper";
    empty.textContent = "Belum ada kartu di Gallery. Tambahkan data di freeFrames pada manifest untuk menampilkannya.";
    elements.galleryPreviewList.appendChild(empty);
    return;
  }

  greetingCards.forEach((item) => {
    const sourceId = getGallerySourceId(item.id);
    const card = document.createElement("article");
    card.className = "simple-card";
    card.innerHTML = `
      <div class="card-head">
        <h3>${item.title}</h3>
        <div class="usage-pill usage-pill-gallery" title="Total dipakai">
          <span class="usage-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M4 18h16v2H2V4h2v14zm2-4 4-4 3 3 5-5 1.4 1.4-6.4 6.4-3-3-2.6 2.6L6 14z"/></svg>
          </span>
          <span class="usage-count">0</span>
        </div>
      </div>
      <p>${item.description}</p>
      <div class="canvas-shell" style="aspect-ratio: 4 / 5;">
        <div class="canvas-skeleton" aria-hidden="true"></div>
        <canvas class="simple-canvas"></canvas>
      </div>
      <div class="simple-actions">
        <button type="button" class="small-btn">Download</button>
        <button type="button" class="small-btn ghost">Share</button>
      </div>
    `;

    elements.galleryPreviewList.appendChild(card);
    const canvas = card.querySelector("canvas");
    const canvasShell = card.querySelector(".canvas-shell");
    const usageBadge = card.querySelector(".usage-pill");
    const [downloadButton, shareButton] = card.querySelectorAll("button");

    galleryCards.set(item.id, { card: item, canvas, canvasShell, sourceId, usageBadge });
    updateCardUsageBadge(sourceId);
    downloadButton.addEventListener("click", () => handleGreetingDownload(item.id));
    shareButton.addEventListener("click", () => handleGreetingShare(item.id));
  });
}

async function renderSimplePreviews() {
  const token = ++renderState.simpleToken;
  const size = getSizeById(elements.simpleSizeSelect.value);
  const previewWidth = 540;
  const previewHeight = Math.round((size.height / size.width) * previewWidth);
  const name = elements.simpleNameInput.value.trim() || "Nama Antum";

  const jobs = Array.from(simpleCards.values()).map(async ({ template, canvas, canvasShell }) => {
    if (canvasShell) {
      canvasShell.style.aspectRatio = `${size.width} / ${size.height}`;
    }
    await renderCardToCanvas({
      canvas,
      imagePath: template.imagePath,
      preset: template,
      width: previewWidth,
      height: previewHeight,
      name,
      fontFamily: '"Sora", sans-serif',
      mainColor: template.textStyle?.mainColor,
      autoShrink: true,
    });
    setCanvasShellLoaded(canvasShell, true);
  });

  await Promise.all(jobs);
  if (token !== renderState.simpleToken) {
    return;
  }
}

async function renderGalleryPreviews() {
  const token = ++renderState.galleryToken;
  const previewWidth = 540;

  const jobs = Array.from(galleryCards.values()).map(async ({ card, canvas, canvasShell }) => {
    const image = await loadImage(card.imagePath);
    const ratio = image.height / image.width;
    const previewHeight = Math.round(previewWidth * ratio);
    if (canvasShell) {
      canvasShell.style.aspectRatio = `${previewWidth} / ${previewHeight}`;
    }
    await renderImageOnly(canvas, card.imagePath, previewWidth, previewHeight);
    setCanvasShellLoaded(canvasShell, true);
  });

  await Promise.all(jobs);
  if (token !== renderState.galleryToken) {
    return;
  }
}

function getStudioPreset() {
  const studioTemplate = getTemplateById(elements.studioTemplateSelect.value);
  const presetTemplate = readPresetControls(getPresetHelperBaseTemplate());

  return {
    ...studioTemplate,
    textBox: {
      ...presetTemplate.textBox,
    },
    textStyle: {
      ...studioTemplate.textStyle,
      ...presetTemplate.textStyle,
    },
  };
}

async function renderStudio() {
  const token = ++renderState.studioToken;
  const size = getSizeById(elements.studioSizeSelect.value);
  const font = getFontById(elements.studioFontSelect.value);
  const preset = getStudioPreset();
  const imageChanged = preset.imagePath !== state.studioLastImagePath || !state.studioPreviewReady;

  elements.studioMeta.textContent = `${size.width} x ${size.height} • ${preset.title}`;
  if (elements.studioCanvasShell) {
    elements.studioCanvasShell.style.aspectRatio = `${size.width} / ${size.height}`;
  }
  if (imageChanged) {
    setCanvasShellLoaded(elements.studioCanvasShell, false);
  }

  const result = await renderCardToCanvas({
    canvas: elements.studioCanvas,
    imagePath: preset.imagePath,
    preset,
    width: size.width,
    height: size.height,
    name: elements.studioNameInput.value.trim() || "Nama Antum",
    fontFamily: font.family,
    mainColor: elements.studioColorInput.value,
    forcedFontSize: Number(elements.studioFontSizeRange.value),
    offsetX: Number(elements.studioOffsetXRange.value) / 100,
    offsetY: Number(elements.studioOffsetYRange.value) / 100,
    autoShrink: true,
  });

  if (token !== renderState.studioToken) {
    return;
  }

  state.studioLastTextBounds = result.textBounds;
  state.studioLastImagePath = preset.imagePath;
  state.studioPreviewReady = true;
  setCanvasShellLoaded(elements.studioCanvasShell, true);
  updatePresetOutput(preset);
}

async function renderSimpleBlob(templateId) {
  const template = templates.find((item) => item.id === templateId);
  if (!template) {
    return null;
  }

  const size = getSizeById(elements.simpleSizeSelect.value);
  const offscreen = document.createElement("canvas");
  await renderCardToCanvas({
    canvas: offscreen,
    imagePath: template.imagePath,
    preset: template,
    width: size.width,
    height: size.height,
    name: elements.simpleNameInput.value.trim() || "Nama Antum",
    fontFamily: '"Sora", sans-serif',
    mainColor: template.textStyle?.mainColor,
    autoShrink: true,
  });

  return new Promise((resolve) => offscreen.toBlob((blob) => resolve(blob), "image/png"));
}

async function renderStudioBlob() {
  const size = getSizeById(elements.studioSizeSelect.value);
  const font = getFontById(elements.studioFontSelect.value);
  const preset = getStudioPreset();
  const offscreen = document.createElement("canvas");

  await renderCardToCanvas({
    canvas: offscreen,
    imagePath: preset.imagePath,
    preset,
    width: size.width,
    height: size.height,
    name: elements.studioNameInput.value.trim() || "Nama Antum",
    fontFamily: font.family,
    mainColor: elements.studioColorInput.value,
    forcedFontSize: Number(elements.studioFontSizeRange.value),
    offsetX: Number(elements.studioOffsetXRange.value) / 100,
    offsetY: Number(elements.studioOffsetYRange.value) / 100,
    autoShrink: true,
  });

  return new Promise((resolve) => offscreen.toBlob((blob) => resolve(blob), "image/png"));
}

async function renderGreetingBlob(cardId) {
  const card = greetingCards.find((item) => item.id === cardId);
  if (!card) {
    return null;
  }

  const image = await loadImage(card.imagePath);
  const offscreen = document.createElement("canvas");
  await renderImageOnly(offscreen, card.imagePath, image.width, image.height);
  return new Promise((resolve) => offscreen.toBlob((blob) => resolve(blob), "image/png"));
}

async function handleSimpleDownload(templateId) {
  const blob = await renderSimpleBlob(templateId);
  if (!blob) {
    alert("Gagal membuat gambar.");
    return;
  }
  const size = getSizeById(elements.simpleSizeSelect.value);
  downloadBlob(blob, `${getFileNamePrefix()}-${templateId}-${size.width}x${size.height}.png`);
  trackUsage("download", `simple:${templateId}`);
}

async function handleSimpleShare(templateId) {
  const blob = await renderSimpleBlob(templateId);
  const size = getSizeById(elements.simpleSizeSelect.value);
  const shared = await shareBlob(blob, `${getFileNamePrefix()}-${templateId}-${size.width}x${size.height}.png`);
  if (shared) {
    trackUsage("share", `simple:${templateId}`);
  }
}

async function handleGreetingDownload(cardId) {
  const blob = await renderGreetingBlob(cardId);
  if (!blob) {
    alert("Kartu tidak ditemukan.");
    return;
  }
  downloadBlob(blob, `${getFileNamePrefix()}-greeting-${cardId}.png`);
  trackUsage("download", `gallery:${cardId}`);
}

async function handleGreetingShare(cardId) {
  const blob = await renderGreetingBlob(cardId);
  if (!blob) {
    alert("Kartu tidak ditemukan.");
    return;
  }
  const shared = await shareBlob(blob, `${getFileNamePrefix()}-greeting-${cardId}.png`);
  if (shared) {
    trackUsage("share", `gallery:${cardId}`);
  }
}

function pointInRect(x, y, rect) {
  if (!rect) {
    return false;
  }
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

function getCanvasPointer(canvas, event) {
  const bounds = canvas.getBoundingClientRect();
  const scaleX = canvas.width / bounds.width;
  const scaleY = canvas.height / bounds.height;
  return {
    x: (event.clientX - bounds.left) * scaleX,
    y: (event.clientY - bounds.top) * scaleY,
  };
}

function bindStudioDrag(scheduleStudioRender) {
  const setStudioScrollLock = (locked) => {
    document.body.classList.toggle("no-scroll", locked);
    elements.studioCanvas.style.touchAction = locked ? "none" : "manipulation";
  };

  const stopDrag = (event) => {
    if (state.studioDrag.rafId) {
      cancelAnimationFrame(state.studioDrag.rafId);
      state.studioDrag.rafId = 0;
    }

    if (!state.studioDrag.active) {
      setStudioScrollLock(false);
      return;
    }

    state.studioDrag.active = false;
    state.studioDrag.pointerId = null;
    elements.studioCanvas.classList.remove("dragging");
    setStudioScrollLock(false);

    const pointerId = event?.pointerId;
    if (typeof pointerId === "number" && elements.studioCanvas.hasPointerCapture(pointerId)) {
      elements.studioCanvas.releasePointerCapture(pointerId);
    }
  };

  const requestDragRender = () => {
    if (state.studioDrag.rafId) {
      return;
    }
    state.studioDrag.rafId = requestAnimationFrame(() => {
      state.studioDrag.rafId = 0;
      renderStudio();
    });
  };

  elements.studioCanvas.addEventListener("pointerdown", (event) => {
    const point = getCanvasPointer(elements.studioCanvas, event);
    if (!pointInRect(point.x, point.y, state.studioLastTextBounds)) {
      stopDrag();
      return;
    }

    event.preventDefault();
    state.studioDrag.active = true;
    state.studioDrag.pointerId = event.pointerId;
    state.studioDrag.startX = point.x;
    state.studioDrag.startY = point.y;
    state.studioDrag.startOffsetX = Number(elements.studioOffsetXRange.value);
    state.studioDrag.startOffsetY = Number(elements.studioOffsetYRange.value);
    elements.studioCanvas.classList.add("dragging");
    setStudioScrollLock(true);
    dismissStudioMobileHint();
    elements.studioCanvas.setPointerCapture(event.pointerId);
  });

  elements.studioCanvas.addEventListener("pointermove", (event) => {
    if (!state.studioDrag.active || state.studioDrag.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();
    const point = getCanvasPointer(elements.studioCanvas, event);
    const deltaX = ((point.x - state.studioDrag.startX) / elements.studioCanvas.width) * 100;
    const deltaY = ((point.y - state.studioDrag.startY) / elements.studioCanvas.height) * 100;

    elements.studioOffsetXRange.value = String(Math.max(-30, Math.min(30, state.studioDrag.startOffsetX + deltaX)));
    elements.studioOffsetYRange.value = String(Math.max(-30, Math.min(30, state.studioDrag.startOffsetY + deltaY)));
    requestDragRender();
  });

  elements.studioCanvas.addEventListener("pointerup", stopDrag);
  elements.studioCanvas.addEventListener("pointercancel", stopDrag);
  elements.studioCanvas.addEventListener("touchmove", (event) => {
    if (state.studioDrag.active) {
      event.preventDefault();
    }
  }, { passive: false });

  document.addEventListener("pointerdown", (event) => {
    if (!state.studioDrag.active) {
      return;
    }

    if (event.target !== elements.studioCanvas) {
      stopDrag(event);
      return;
    }

    const point = getCanvasPointer(elements.studioCanvas, event);
    if (!pointInRect(point.x, point.y, state.studioLastTextBounds)) {
      stopDrag(event);
    }
  });

  document.addEventListener("pointerup", stopDrag);
  document.addEventListener("pointercancel", stopDrag);
  window.addEventListener("blur", () => stopDrag());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") {
      stopDrag();
    }
  });
}

function populateControls() {
  buildSelectOptions(
    elements.simpleSizeSelect,
    OUTPUT_SIZES.map((size) => ({ value: size.id, label: `${size.label} (${size.width} x ${size.height})` })),
  );

  buildSelectOptions(
    elements.studioSizeSelect,
    OUTPUT_SIZES.map((size) => ({ value: size.id, label: `${size.label} (${size.width} x ${size.height})` })),
  );

  buildSelectOptions(
    elements.studioFontSelect,
    FONT_OPTIONS.map((font) => ({ value: font.id, label: font.label })),
  );

  buildSelectOptions(
    elements.studioTemplateSelect,
    templates.map((template) => ({ value: template.id, label: template.title })),
  );

  populatePresetHelperSelect();

  elements.simpleSizeSelect.value = OUTPUT_SIZES[0].id;
  elements.studioSizeSelect.value = OUTPUT_SIZES[0].id;
  elements.studioTemplateSelect.value = templates[0]?.id ?? "";
  elements.presetTemplateSelect.value = PRESET_HELPER_FOLLOW_STUDIO;
  elements.simpleNameInput.value = "Nama Antum";
  elements.studioNameInput.value = "Nama Antum";

  applyStudioDefaults(getTemplateById(elements.studioTemplateSelect.value));
  setPresetControlsFromTemplate(getPresetHelperBaseTemplate());
}

async function bootstrap() {
  const data = await loadTemplateData();
  templates = data.twibbonTemplates;
  greetingCards = data.greetingCards;
  state.appConfig = {
    ...DEFAULT_APP_CONFIG,
    ...(data.appConfig || {}),
  };
  state.usageCounter.namespace = state.appConfig.counterNamespace;
  applyAppConfig();

  const versionLinkEl = document.getElementById("footerVersionLink");
  const buildTimeEl = document.getElementById("footerBuildTime");
  try {
    if (versionLinkEl) versionLinkEl.textContent = `v${__APP_VERSION__}`;
    if (buildTimeEl) {
      const d = new Date(__BUILD_TIME__);
      const pad = (n) => String(n).padStart(2, "0");
      const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
      const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      buildTimeEl.textContent = `Build: ${date}, ${time}`;
    }
  } catch (_) { /* build info not available */ }

  populateControls();
  initSimpleCards();
  initGalleryCards();
  setupTabs();
  setupFab();
  setupResponsiveStudioLayout();
  setupStudioMobileHint();
  await setupUsageCounter();

  window.addEventListener("resize", debounce(() => {
    setupResponsiveStudioLayout();
  }, 120));

  const scheduleSimpleRender = debounce(() => {
    renderSimplePreviews();
  }, 100);
  const scheduleStudioRender = debounce(() => {
    renderStudio();
  }, 80);

  bindStudioDrag(scheduleStudioRender);

  elements.simpleNameInput.addEventListener("input", scheduleSimpleRender);
  elements.simpleSizeSelect.addEventListener("change", scheduleSimpleRender);

  elements.studioTemplateSelect.addEventListener("change", () => {
    const studioTemplate = getTemplateById(elements.studioTemplateSelect.value);
    if (elements.presetTemplateSelect.value === PRESET_HELPER_FOLLOW_STUDIO) {
      setPresetControlsFromTemplate(getPresetHelperBaseTemplate());
    }
    applyStudioDefaults(studioTemplate);
    const studioSourceId = getStudioSourceId(elements.studioTemplateSelect.value);
    updateCardUsageBadge(studioSourceId);
    refreshSingleSourceCounter(studioSourceId);
    scheduleStudioRender();
  });
  elements.presetTemplateSelect.addEventListener("change", () => {
    setPresetControlsFromTemplate(getPresetHelperBaseTemplate());
    scheduleStudioRender();
  });
  elements.studioNameInput.addEventListener("input", scheduleStudioRender);
  elements.studioSizeSelect.addEventListener("change", scheduleStudioRender);
  elements.studioFontSelect.addEventListener("change", scheduleStudioRender);
  elements.studioColorInput.addEventListener("input", scheduleStudioRender);
  elements.studioFontSizeRange.addEventListener("input", scheduleStudioRender);
  elements.studioOffsetXRange.addEventListener("input", scheduleStudioRender);
  elements.studioOffsetYRange.addEventListener("input", scheduleStudioRender);

  [
    elements.presetXRange,
    elements.presetYRange,
    elements.presetWidthRange,
    elements.presetLinesRange,
    elements.presetMinFontRange,
    elements.presetMaxFontRange,
    elements.presetLineHeightRange,
  ].forEach((node) => {
    node.addEventListener("input", scheduleStudioRender);
  });

  elements.copyPresetButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(elements.presetOutput.value);
      elements.copyPresetButton.textContent = "Copied";
      setTimeout(() => {
        elements.copyPresetButton.textContent = "Copy JSON";
      }, 1200);
    } catch {
      alert("Gagal copy JSON. Silakan copy manual dari textarea.");
    }
  });

  elements.studioResetButton.addEventListener("click", () => {
    applyStudioDefaults(getTemplateById(elements.studioTemplateSelect.value));
    setPresetControlsFromTemplate(getPresetHelperBaseTemplate());
    scheduleStudioRender();
  });

  elements.studioDownloadButton.addEventListener("click", async () => {
    const blob = await renderStudioBlob();
    if (!blob) {
      alert("Gagal membuat gambar.");
      return;
    }
    const size = getSizeById(elements.studioSizeSelect.value);
    const template = getStudioPreset();
    downloadBlob(blob, `${getFileNamePrefix()}-studio-${template.id}-${size.width}x${size.height}.png`);
    trackUsage("download", `studio:${template.id}`);
  });

  elements.studioShareButton.addEventListener("click", async () => {
    const blob = await renderStudioBlob();
    if (!blob) {
      return;
    }
    const size = getSizeById(elements.studioSizeSelect.value);
    const template = getStudioPreset();
    const shared = await shareBlob(blob, `${getFileNamePrefix()}-studio-${template.id}-${size.width}x${size.height}.png`);
    if (shared) {
      trackUsage("share", `studio:${template.id}`);
    }
  });

  elements.studioUploadInput.addEventListener("change", (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const existing = templates.find((item) => item.id === "uploaded-template");
    if (existing?.imagePath.startsWith("blob:")) {
      imageCache.delete(existing.imagePath);
      URL.revokeObjectURL(existing.imagePath);
    }

    const objectUrl = URL.createObjectURL(file);
    const template = {
      id: "uploaded-template",
      title: "Template Pribadi",
      description: "Template upload lokal",
      imagePath: objectUrl,
      textBox: {
        x: 0.5,
        y: 0.72,
        maxWidth: 0.7,
        maxLines: 3,
        minFont: 24,
        maxFont: 64,
        lineHeight: 1.08,
        align: "center",
      },
      textStyle: {
        mainColor: "#f8e08b",
        shadowColor: "rgba(0, 0, 0, 0.45)",
      },
    };

    templates = templates.filter((item) => item.id !== "uploaded-template");
    templates.push(template);
    buildSelectOptions(
      elements.studioTemplateSelect,
      templates.map((item) => ({ value: item.id, label: item.title })),
    );
    populatePresetHelperSelect();
    elements.studioTemplateSelect.value = template.id;
    applyStudioDefaults(template);
    const studioSourceId = getStudioSourceId(template.id);
    updateCardUsageBadge(studioSourceId);
    refreshSingleSourceCounter(studioSourceId);
    if (elements.presetTemplateSelect.value === PRESET_HELPER_FOLLOW_STUDIO) {
      setPresetControlsFromTemplate(template);
    }
    scheduleStudioRender();
  });

  await renderSimplePreviews();
  await renderStudio();
  await renderGalleryPreviews();
}

bootstrap();
