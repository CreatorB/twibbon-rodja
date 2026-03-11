import "./style.css";
import { DEFAULT_TEMPLATE_PRESETS, FONT_OPTIONS, OUTPUT_SIZES, loadTemplateData } from "./templates.js";

const imageCache = new Map();

const elements = {
  tabButtons: Array.from(document.querySelectorAll(".tab-button")),
  tabPanels: Array.from(document.querySelectorAll(".tab-panel")),
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
  studioMeta: document.getElementById("studioMeta"),
  studioGrid: document.getElementById("studioGrid"),
  studioControls: document.getElementById("studioControls"),
  studioActions: document.getElementById("studioActions"),
  studioPreviewWrap: document.getElementById("studioPreviewWrap"),
  studioMobileHint: document.getElementById("studioMobileHint"),

  presetXRange: document.getElementById("presetXRange"),
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

const state = {
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

function parsePercentRange(element) {
  return Number(element.value) / 100;
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
    ctx.font = `700 ${forcedFontSize}px ${fontFamily}`;
    const lines = wrapText(ctx, text, fitWidth);
    return {
      fontSize: forcedFontSize,
      lines: lines.slice(0, box.maxLines),
      lineHeight: Math.round(forcedFontSize * box.lineHeight),
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
    maxFont: Math.max(20, Math.round(preset.textBox.maxFont * (width / 1080))),
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
    return;
  }

  const file = new File([blob], filename, { type: "image/png" });
  const data = { files: [file] };
  if (navigator.canShare && navigator.canShare(data)) {
    try {
      await navigator.share(data);
    } catch {
      alert("Proses share dibatalkan atau gagal.");
    }
    return;
  }

  alert("Fitur share belum didukung perangkat ini.");
}

function initSimpleCards() {
  simpleCards.clear();
  elements.simplePreviewList.innerHTML = "";

  templates.forEach((template) => {
    const card = document.createElement("article");
    card.className = "simple-card";
    card.innerHTML = `
      <h3>${template.title}</h3>
      <p>${template.description}</p>
      <canvas class="simple-canvas"></canvas>
      <div class="simple-actions">
        <button type="button" class="small-btn">Download</button>
        <button type="button" class="small-btn ghost">Share</button>
      </div>
    `;

    elements.simplePreviewList.appendChild(card);
    const canvas = card.querySelector("canvas");
    const [downloadButton, shareButton] = card.querySelectorAll("button");

    simpleCards.set(template.id, { template, canvas });
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
    const card = document.createElement("article");
    card.className = "simple-card";
    card.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.description}</p>
      <canvas class="simple-canvas"></canvas>
      <div class="simple-actions">
        <button type="button" class="small-btn">Download</button>
        <button type="button" class="small-btn ghost">Share</button>
      </div>
    `;

    elements.galleryPreviewList.appendChild(card);
    const canvas = card.querySelector("canvas");
    const [downloadButton, shareButton] = card.querySelectorAll("button");

    galleryCards.set(item.id, { card: item, canvas });
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

  const jobs = Array.from(simpleCards.values()).map(async ({ template, canvas }) => {
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
  });

  await Promise.all(jobs);
  if (token !== renderState.simpleToken) {
    return;
  }
}

async function renderGalleryPreviews() {
  const token = ++renderState.galleryToken;
  const previewWidth = 540;

  const jobs = Array.from(galleryCards.values()).map(async ({ card, canvas }) => {
    const image = await loadImage(card.imagePath);
    const ratio = image.height / image.width;
    const previewHeight = Math.round(previewWidth * ratio);
    await renderImageOnly(canvas, card.imagePath, previewWidth, previewHeight);
  });

  await Promise.all(jobs);
  if (token !== renderState.galleryToken) {
    return;
  }
}

function getStudioPreset() {
  return readPresetControls(getTemplateById(elements.studioTemplateSelect.value));
}

async function renderStudio() {
  const token = ++renderState.studioToken;
  const size = getSizeById(elements.studioSizeSelect.value);
  const font = getFontById(elements.studioFontSelect.value);
  const preset = getStudioPreset();

  elements.studioMeta.textContent = `${size.width} x ${size.height} • ${preset.title}`;

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
  });

  if (token !== renderState.studioToken) {
    return;
  }

  state.studioLastTextBounds = result.textBounds;
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
  downloadBlob(blob, `ycs-${templateId}-${size.width}x${size.height}.png`);
}

async function handleSimpleShare(templateId) {
  const blob = await renderSimpleBlob(templateId);
  const size = getSizeById(elements.simpleSizeSelect.value);
  await shareBlob(blob, `ycs-${templateId}-${size.width}x${size.height}.png`);
}

async function handleGreetingDownload(cardId) {
  const blob = await renderGreetingBlob(cardId);
  if (!blob) {
    alert("Kartu tidak ditemukan.");
    return;
  }
  downloadBlob(blob, `ycs-greeting-${cardId}.png`);
}

async function handleGreetingShare(cardId) {
  const blob = await renderGreetingBlob(cardId);
  if (!blob) {
    alert("Kartu tidak ditemukan.");
    return;
  }
  await shareBlob(blob, `ycs-greeting-${cardId}.png`);
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

  elements.simpleSizeSelect.value = OUTPUT_SIZES[0].id;
  elements.studioSizeSelect.value = OUTPUT_SIZES[0].id;
  elements.studioFontSelect.value = FONT_OPTIONS[0].id;
  elements.studioTemplateSelect.value = templates[0]?.id ?? "";
  elements.simpleNameInput.value = "Nama Antum";
  elements.studioNameInput.value = "Nama Antum";

  setPresetControlsFromTemplate(getTemplateById(elements.studioTemplateSelect.value));
}

async function bootstrap() {
  const data = await loadTemplateData();
  templates = data.twibbonTemplates;
  greetingCards = data.greetingCards;

  populateControls();
  initSimpleCards();
  initGalleryCards();
  setupTabs();
  setupFab();
  setupResponsiveStudioLayout();
  setupStudioMobileHint();

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
    setPresetControlsFromTemplate(getTemplateById(elements.studioTemplateSelect.value));
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
    elements.studioOffsetXRange.value = "0";
    elements.studioOffsetYRange.value = "0";
    elements.studioFontSizeRange.value = "68";
    setPresetControlsFromTemplate(getTemplateById(elements.studioTemplateSelect.value));
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
    downloadBlob(blob, `ycs-studio-${template.id}-${size.width}x${size.height}.png`);
  });

  elements.studioShareButton.addEventListener("click", async () => {
    const blob = await renderStudioBlob();
    if (!blob) {
      return;
    }
    const size = getSizeById(elements.studioSizeSelect.value);
    const template = getStudioPreset();
    await shareBlob(blob, `ycs-studio-${template.id}-${size.width}x${size.height}.png`);
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
    elements.studioTemplateSelect.value = template.id;
    setPresetControlsFromTemplate(template);
    scheduleStudioRender();
  });

  await renderSimplePreviews();
  await renderStudio();
  await renderGalleryPreviews();
}

bootstrap();
