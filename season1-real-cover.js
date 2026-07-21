(() => {
  "use strict";

  const VERSION = "season1-real-13";
  const PART_URLS = [
    "assets/upload-season1/part-01.txt",
    "assets/upload-season1/part-02.txt",
    "assets/upload-season1/part-03.txt",
    "assets/upload-season1/part-04a.txt",
    "assets/upload-season1/part-04b.txt",
    "assets/upload-season1/part-05.txt",
    "assets/upload-season1/part-06.txt",
    "assets/upload-season1/part-07.txt"
  ].map(path => `${path}?v=${VERSION}`);

  function setCover(element, source) {
    if (!element) return;
    element.style.setProperty(
      "background-image",
      `linear-gradient(180deg, rgba(3,7,10,.02), rgba(3,7,10,.38)), url("${source}")`,
      "important"
    );
    element.style.setProperty("background-size", "100% 100%, cover", "important");
    element.style.setProperty("background-position", "center, center", "important");
    element.style.setProperty("background-repeat", "no-repeat", "important");
    element.dataset.coverSource = "season-1-realistic-webp";
  }

  function applyCover(source) {
    window.SEASON_COVERS = Object.freeze({
      ...(window.SEASON_COVERS || {}),
      1: source
    });

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
    if (image.naturalWidth !== 960 || image.naturalHeight !== 540) {
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

    let frame = 0;
    const refresh = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        applyCover(source);
      });
    };
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("pageshow", refresh);
    window.addEventListener("hashchange", () => setTimeout(refresh, 80));
    window.dispatchEvent(new CustomEvent("season-real-cover-ready", { detail: { season: 1 } }));
  }

  loadRealCover().catch(error => console.error("第1季写实封面加载失败：", error));
})();