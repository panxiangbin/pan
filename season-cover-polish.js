(() => {
  "use strict";

  const overlay = document.getElementById("seasonGuideOverlay");
  const sprite = window.SEASON_COVER_SPRITE || "";
  if (!overlay || !sprite) return;

  const POSITIONS = [
    [0, 0], [33.333, 0], [66.667, 0], [100, 0],
    [0, 100], [33.333, 100], [66.667, 100], [100, 100]
  ];

  function seasonNumberFrom(element) {
    const card = element.closest?.(".season-card");
    const raw = card?.dataset.seasonNumber
      || card?.dataset.seasonId?.replace("season-", "")
      || element.dataset.seasonArt;
    const value = Number(raw);
    return Number.isFinite(value) ? value : 0;
  }

  function applyArt(element, detail = false) {
    const seasonNumber = seasonNumberFrom(element);
    if (!seasonNumber) return;
    const [x, y] = POSITIONS[Math.max(0, Math.min(7, seasonNumber - 1))];
    const gradient = detail
      ? "linear-gradient(180deg, rgba(4,8,11,.01) 0%, rgba(4,8,11,.06) 58%, rgba(4,8,11,.42) 100%)"
      : "linear-gradient(180deg, rgba(4,8,11,0) 0%, rgba(4,8,11,.025) 64%, rgba(4,8,11,.28) 100%)";

    element.style.setProperty("background-image", `${gradient}, url("${sprite}")`, "important");
    element.style.setProperty("background-size", "100% 100%, 400% 200%", "important");
    element.style.setProperty("background-position", `center, ${x}% ${y}%`, "important");
    element.style.setProperty("background-repeat", "no-repeat", "important");
  }

  function refresh() {
    overlay.querySelectorAll(".season-card-art").forEach(element => applyArt(element, false));
    document.querySelectorAll(".season-detail-visual[data-season-art]").forEach(element => applyArt(element, true));
  }

  let frame = 0;
  function scheduleRefresh() {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      refresh();
    });
  }

  const observer = new MutationObserver(scheduleRefresh);
  observer.observe(overlay, { childList: true, subtree: true });

  const panelContent = document.getElementById("panelContent");
  if (panelContent) observer.observe(panelContent, { childList: true, subtree: true });

  window.addEventListener("pageshow", scheduleRefresh);
  scheduleRefresh();
})();