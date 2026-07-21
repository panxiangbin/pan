(() => {
  "use strict";

  const episodeData = window.SEASON_EPISODE_DATA || {};
  const overlay = document.getElementById("seasonGuideOverlay");
  const panelContent = document.getElementById("panelContent");
  if (!overlay || !Object.keys(episodeData).length) return;

  const PROGRESS_KEY = "seven-kingdoms-episode-progress-v1";
  const SPOILER_KEY = "seven-kingdoms-spoiler-season";
  let refreshFrame = 0;

  function readProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function spoilerLevel() {
    const value = Number(localStorage.getItem(SPOILER_KEY));
    return Number.isFinite(value) && value >= 1 && value <= 8 ? value : 8;
  }

  function setText(node, value) {
    if (node && node.textContent !== value) node.textContent = value;
  }

  function setWidth(node, value) {
    if (node && node.style.width !== value) node.style.width = value;
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

  function nextUnlockedEpisode(progress) {
    const level = spoilerLevel();
    for (let season = 1; season <= level; season += 1) {
      const next = (episodeData[season] || []).find(item => !progress[`${season}:${item.episode}`]);
      if (next) return { season, episode: next.episode, lockedComplete: false };
    }
    return { season: 1, episode: 1, lockedComplete: level < 8 };
  }

  function openEpisode(season, episode) {
    const hash = `#season-${season}-episode-${episode}`;
    if (location.hash === hash) window.dispatchEvent(new HashChangeEvent("hashchange"));
    else location.hash = hash;
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
        <span aria-hidden="true"><i data-overall-episode-bar></i></span>
        <button type="button" data-overall-episode-continue><span>继续全剧阅读</span><strong aria-hidden="true">→</strong></button>`;
      host.appendChild(block);
      block.querySelector("[data-overall-episode-continue]")?.addEventListener("click", event => {
        const button = event.currentTarget;
        if (button.dataset.lockedComplete === "true") {
          overlay.querySelector("#seasonSpoilerLevel")?.focus();
          return;
        }
        openEpisode(Number(button.dataset.season), Number(button.dataset.episode));
      });
    }

    const stats = totalStats(progress);
    const next = nextUnlockedEpisode(progress);
    const text = block.querySelector("[data-overall-episode-text]");
    const bar = block.querySelector("[data-overall-episode-bar]");
    const continueButton = block.querySelector("[data-overall-episode-continue]");

    setText(text, `逐集阅读：${stats.read} / ${stats.total} 集`);
    setWidth(bar, `${stats.total ? Math.round(stats.read / stats.total * 100) : 0}%`);
    if (continueButton) {
      const seasonValue = String(next.season);
      const episodeValue = String(next.episode);
      const lockedValue = String(next.lockedComplete);
      if (continueButton.dataset.season !== seasonValue) continueButton.dataset.season = seasonValue;
      if (continueButton.dataset.episode !== episodeValue) continueButton.dataset.episode = episodeValue;
      if (continueButton.dataset.lockedComplete !== lockedValue) continueButton.dataset.lockedComplete = lockedValue;
      continueButton.classList.toggle("locked-complete", next.lockedComplete);
      const label = continueButton.querySelector("span");
      const labelText = next.lockedComplete
        ? `已读完前${spoilerLevel()}季，解锁后继续`
        : stats.read === stats.total
          ? "八季已读完，重新从第1集浏览"
          : `继续：第${next.season}季第${next.episode}集`;
      setText(label, labelText);
    }
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

      setText(block.querySelector("[data-card-episode-text]"), `逐集 ${stats.read}/${stats.total}`);
      setText(block.querySelector("[data-card-episode-percent]"), stats.read === stats.total ? "全部读完" : `${stats.percent}%`);
      setWidth(block.querySelector("[data-card-episode-bar]"), `${stats.percent}%`);
      card.classList.toggle("episodes-complete", stats.read === stats.total);
    });
  }

  function refresh() {
    refreshFrame = 0;
    const progress = readProgress();
    ensureOverall(progress);
    ensureSeasonCards(progress);
  }

  function scheduleRefresh() {
    if (refreshFrame) return;
    refreshFrame = window.requestAnimationFrame(refresh);
  }

  const observer = new MutationObserver(scheduleRefresh);
  observer.observe(overlay, { childList: true, subtree: true });
  if (panelContent) observer.observe(panelContent, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
  overlay.querySelector("#seasonSpoilerLevel")?.addEventListener("change", scheduleRefresh);
  window.addEventListener("storage", event => {
    if (event.key === PROGRESS_KEY || event.key === SPOILER_KEY) scheduleRefresh();
  });
  window.addEventListener("pageshow", scheduleRefresh);
  scheduleRefresh();
})();