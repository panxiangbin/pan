(() => {
  "use strict";

  const VERSION = "season1-real-11";
  const PART_COUNT = 7;
  const PART_URLS = Array.from({ length: PART_COUNT }, (_, index) =>
    `assets/upload-season1/part-${String(index + 1).padStart(2, "0")}.txt?v=${VERSION}`
  );

  function setCover(element, source) {
    if (!element) return;
    element.style.backgroundImage = `linear-gradient(180deg, rgba(3,7,10,.02), rgba(3,7,10,.38)), url("${source}")`;
    element.style.backgroundSize = "100% 100%, cover";
    element.style.backgroundPosition = "center, center";
    element.style.backgroundRepeat = "no-repeat";
    element.dataset.coverSource = "season-1-realistic-webp";
  }

  function applyCover(source) {
    window.SEASON_COVERS = window.SEASON_COVERS || {};
    window.SEASON_COVERS[1] = source;

    document.querySelectorAll('.season-card[data-season-number="1"] .season-card-art')
      .forEach(element => setCover(element, source));
    document.querySelectorAll('.season-detail-visual[data-season-art="1"]')
      .forEach(element => setCover(element, source));

    const panelType = document.getElementById("panelType")?.textContent.trim();
    if (panelType === "第1季剧情") {
      document.querySelectorAll("#panelContent .season-detail-hero")
        .forEach(element => setCover(element, source));
    }
  }

  async function decodeSource(source) {
    const image = new Image();
    image.src = source;
    await image.decode();
    if (image.naturalWidth < 900 || image.naturalHeight < 500) {
      throw new Error(`第1季封面尺寸异常：${image.naturalWidth}×${image.naturalHeight}`);
    }
  }

  async function loadRealCover() {
    const responses = await Promise.all(PART_URLS.map(url => fetch(url, { cache: "no-store" })));
    const failed = responses.find(response => !response.ok);
    if (failed) throw new Error(`第1季封面数据加载失败：HTTP ${failed.status}`);

    const chunks = await Promise.all(responses.map(response => response.text()));
    const base64 = chunks.join("").replace(/\s+/g, "");
    const source = `data:image/webp;base64,${base64}`;
    await decodeSource(source);
    applyCover(source);

    const observer = new MutationObserver(() => requestAnimationFrame(() => applyCover(source)));
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("pageshow", () => applyCover(source));
    window.addEventListener("hashchange", () => setTimeout(() => applyCover(source), 80));
    window.dispatchEvent(new CustomEvent("season-real-cover-ready", { detail: { season: 1 } }));
  }

  loadRealCover().catch(error => console.error("第1季写实封面加载失败：", error));
})();