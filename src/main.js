import "./style.css";

const elements = {
  nameInput: document.getElementById("nama"),
  generateButton: document.getElementById("generateButton"),
  loadingText: document.getElementById("loadingText"),
  canvas: document.getElementById("flyerCanvas"),
  downloadSection: document.getElementById("downloadSection"),
  downloadLink: document.getElementById("downloadLink"),
  shareButton: document.getElementById("shareButton"),
};

const ctx = elements.canvas.getContext("2d");

function wrapText(text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = words[0] || "";

  for (let i = 1; i < words.length; i += 1) {
    const testLine = `${currentLine} ${words[i]}`;
    if (ctx.measureText(testLine).width > maxWidth) {
      lines.push(currentLine);
      currentLine = words[i];
    } else {
      currentLine = testLine;
    }
  }

  lines.push(currentLine);
  return lines;
}

function renderName(name) {
  ctx.font = "600 40px Segoe UI";
  ctx.fillStyle = "#ffd700";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const lines = wrapText(name, 650);
  const posX = elements.canvas.width / 2;
  const posY = 1100;
  const lineHeight = 50;
  const startY = posY - ((lines.length - 1) * lineHeight) / 2;

  lines.forEach((line, index) => {
    ctx.fillText(line, posX, startY + index * lineHeight);
  });
}

function updateUiRendering(isRendering) {
  elements.loadingText.style.display = isRendering ? "block" : "none";
  elements.canvas.style.display = isRendering ? "none" : "block";
  elements.downloadSection.style.display = isRendering ? "none" : "block";
}

function generateFlyer() {
  const nama = elements.nameInput.value.trim() || "Nama Antum";
  updateUiRendering(true);

  const img = new Image();
  img.src = `/twibbon.png?t=${Date.now()}`;

  img.onload = () => {
    ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);
    ctx.drawImage(img, 0, 0, elements.canvas.width, elements.canvas.height);
    renderName(nama);

    updateUiRendering(false);
    elements.canvas.scrollIntoView({ behavior: "smooth", block: "nearest" });
    elements.downloadLink.href = elements.canvas.toDataURL("image/png");
  };

  img.onerror = () => {
    updateUiRendering(false);
    alert("Gambar template gagal dimuat. Pastikan twibbon.png tersedia.");
  };
}

function shareImage() {
  elements.canvas.toBlob((blob) => {
    if (!blob) {
      alert("Gagal memproses gambar.");
      return;
    }

    const file = new File([blob], "ucapan-idulfitri.png", {
      type: "image/png",
    });

    const data = { files: [file] };

    if (navigator.canShare && navigator.canShare(data)) {
      navigator.share(data).catch(() => {
        alert("Gagal membagikan gambar.");
      });
      return;
    }

    alert("Fitur berbagi tidak didukung di perangkat ini.");
  });
}

elements.generateButton.addEventListener("click", generateFlyer);
elements.shareButton.addEventListener("click", shareImage);

elements.nameInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    generateFlyer();
  }
});
