(() => {
  "use strict";

  const episodeData = window.SEASON_EPISODE_DATA || {};
  const overlay = document.getElementById("seasonGuideOverlay");
  const panelContent = document.getElementById("panelContent");
  if (!overlay || !Object.keys(episodeData).length) return;

  const PROGRESS_KEY = "seven-kingdoms-episode-progress-v1";

  function readProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function seasonStats(seasonNumber, progress) {
    const list = episodeData[seasonNumber] || [];
    const read = list.filter(item => progress[`${seasonNumber}:${item.episode}`]).length;
    return { read, total: list.length, percent: list.length ? Math.round(read / list.length * 100) : 0 };
  }

  function totalStats(progress) {
    return Object.keys(episodeData).reduce((result, key) => {
      const stats = seasonStats(Number(key), progress);
      result.read += stats.read;
      result.total += stats.total;
      return result;
    }, { read: 0, total: 0 });
  }

  function ensureOverall(progress) {
    const host = overlay.querySelector(".season-progress-card");
    if (!host) return;
    let block = host.querySelector(".episode-overall-progress");
    if (!block) {
      block = document.createElement("div");
      block.className = "episode-overall-progress";
      block.innerHTML = `
        <div><strong data-overall-episode-text>逐集阅读进度</strong><small>八季 73 集，记录保存在当前浏览器</small></div>
        <span aria-hidden="true"><i data-overall-episode-bar></i></span>`;
      host.appendChild(block);
    }
    const stats = totalStats(progress);
    const text = block.querySelector("[data-overall-episode-text]");
    const bar = block.querySelector("[data-overall-episode-bar]");
    if (text) text.textContent = `逐集阅读：${stats.read} / ${stats.total} 集`;
    if (bar) bar.style.width = `${stats.total ? Math.round(stats.read / stats.total * 100) : 0}%`;
  }

  function ensureSeasonCards(progress) {
    overlay.querySelectorAll(".season-card[data-season-number]").forEach(card => {
      const seasonNumber = Number(card.dataset.seasonNumber);
      const stats = seasonStats(seasonNumber, progress);
      const body = card.querySelector(".season-card-body");
      if (!body || !stats.total) return;

      let block = body.querySelector(".season-card-episode-progress");
      if (!block) {
        block = document.createElement("span");
        block.className = "season-card-episode-progress";
        block.innerHTML = `<span><strong data-card-episode-text></strong><small data-card-episode-percent></small></span><i aria-hidden="true"><b data-card-episode-bar></b></i>`;
        body.appendChild(block);
      }

      block.querySelector("[data-card-episode-text]").textContent = `逐集 ${stats.read}/${stats.total}`;
      block.querySelector("[data-card-episode-percent]").textContent = stats.read === stats.total ? "全部读完" : `${stats.percent}%`;
      block.querySelector("[data-card-episode-bar]").style.width = `${stats.percent}%`;
      card.classList.toggle("episodes-complete", stats.read === stats.total);
    });
  }

  function refresh() {
    const progress = readProgress();
    ensureOverall(progress);
    ensureSeasonCards(progress);
  }

  const observer = new MutationObserver(() => window.requestAnimationFrame(refresh));
  observer.observe(overlay, { childList: true, subtree: true });
  if (panelContent) observer.observe(panelContent, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  window.addEventListener("storage", event => {
    if (event.key === PROGRESS_KEY) refresh();
  });
  window.addEventListener("pageshow", refresh);
  refresh();
})();
