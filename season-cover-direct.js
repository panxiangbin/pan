(() => {
  "use strict";

  const covers = window.SEASON_COVERS || {};
  const overlay = document.getElementById("seasonGuideOverlay");
  const panelContent = document.getElementById("panelContent");
  if (!overlay || Object.keys(covers).length !== 8) return;

  function seasonNumberFrom(element) {
    const card = element.closest?.(".season-card");
    const raw = card?.dataset.seasonNumber
      || card?.dataset.seasonId?.replace("season-", "")
      || element.dataset.seasonArt;
    const value = Number(raw);
    return Number.isFinite(value) && value >= 1 && value <= 8 ? value : 0;
  }

  function applyCover(element, detail = false) {
    const seasonNumber = seasonNumberFrom(element);
    const cover = covers[seasonNumber];
    if (!seasonNumber || !cover) return;

    const gradient = detail
      ? "linear-gradient(180deg, rgba(4,8,11,.02) 0%, rgba(4,8,11,.10) 58%, rgba(4,8,11,.58) 100%)"
      : "linear-gradient(180deg, rgba(4,8,11,0) 0%, rgba(4,8,11,.02) 66%, rgba(4,8,11,.24) 100%)";

    element.style.setProperty("background-image", `${gradient}, url("${cover}")`, "important");
    element.style.setProperty("background-size", "100% 100%, cover", "important");
    element.style.setProperty("background-position", "center, center", "important");
    element.style.setProperty("background-repeat", "no-repeat", "important");
    element.dataset.coverSource = cover;
  }

  function refresh() {
    overlay.querySelectorAll(".season-card-art").forEach(element => applyCover(element, false));
    document.querySelectorAll(".season-detail-visual[data-season-art]").forEach(element => applyCover(element, true));
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
  if (panelContent) observer.observe(panelContent, { childList: true, subtree: true });

  window.addEventListener("pageshow", scheduleRefresh);
  window.addEventListener("hashchange", () => window.setTimeout(scheduleRefresh, 60));
  scheduleRefresh();
})();
