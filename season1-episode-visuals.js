(() => {
  "use strict";

  const IMAGE_VERSION = "s1-episode-media-3";
  const details = window.SEASON1_EPISODE_MEDIA || {};
  const images = Object.freeze(Object.fromEntries(
    Array.from({ length: 10 }, (_, index) => {
      const episode = index + 1;
      return [episode, `assets/season1-episodes/episode-${String(episode).padStart(2, "0")}.webp?v=${IMAGE_VERSION}`];
    })
  ));
  const panelContent = document.getElementById("panelContent");
  const panelType = document.getElementById("panelType");
  if (!panelContent || !panelType) return;

  const fallback = "assets/season-covers/season-1.svg?v=s1-episode-media-3";
  const dialog = document.createElement("div");
  dialog.className = "episode-story-dialog";
  dialog.hidden = true;
  dialog.innerHTML = `
    <section class="episode-story-dialog-panel" role="dialog" aria-modal="true" aria-labelledby="episodeStoryTitle">
      <button class="episode-story-dialog-close" type="button" aria-label="关闭完整图文剧情">×</button>
      <img alt="" width="720" height="900" decoding="async">
      <div class="episode-story-dialog-body">
        <small></small>
        <h3 id="episodeStoryTitle"></h3>
        <p class="episode-story-overview"></p>
        <div class="episode-story-events"><strong>本集关键事件</strong><ol></ol></div>
        <div class="episode-story-dialog-turning"></div>
      </div>
    </section>`;
  document.body.appendChild(dialog);

  let lastFocused = null;
  function closeDialog() {
    if (dialog.hidden) return;
    dialog.hidden = true;
    document.body.classList.remove("episode-story-open");
    lastFocused?.focus?.({ preventScroll: true });
    lastFocused = null;
  }

  function episodeItem(episode) {
    return window.SEASON_EPISODE_DATA?.[1]?.find(item => item.episode === episode);
  }

  function applyFallback(image) {
    if (image.dataset.fallbackApplied === "true") return;
    image.dataset.fallbackApplied = "true";
    image.src = fallback;
    image.closest(".season-episode-media, .episode-story-dialog-panel")?.classList.add("uses-fallback");
  }

  function openDialog(episode, trigger) {
    const item = episodeItem(episode);
    const extra = details[episode];
    if (!item) return;
    lastFocused = trigger;
    const visual = dialog.querySelector("img");
    visual.dataset.fallbackApplied = "false";
    visual.src = images[episode];
    visual.alt = extra?.alt || `第1季第${episode}集《${item.title}》剧情配图`;
    visual.onerror = () => applyFallback(visual);
    dialog.querySelector("small").textContent = `第1季 · 第${episode}集完整图文剧情`;
    dialog.querySelector("h3").textContent = item.title;
    dialog.querySelector(".episode-story-overview").textContent = extra?.overview || item.summary;
    dialog.querySelector(".episode-story-events ol").innerHTML = (extra?.events || []).map(event => `<li>${event}</li>`).join("");
    dialog.querySelector(".episode-story-events").hidden = !(extra?.events?.length);
    dialog.querySelector(".episode-story-dialog-turning").innerHTML = `<strong>本集关键转折：</strong>${item.turning}`;
    dialog.hidden = false;
    document.body.classList.add("episode-story-open");
    dialog.querySelector(".episode-story-dialog-close").focus();
  }

  function decorate() {
    if (panelType.textContent.trim() !== "第1季剧情") return;
    panelContent.querySelectorAll(".season-episode-card[data-episode-card]").forEach(card => {
      const episode = Number(card.dataset.episodeCard);
      if (!images[episode] || card.querySelector(".season-episode-media")) return;
      const item = episodeItem(episode);
      const extra = details[episode];
      const media = document.createElement("button");
      media.type = "button";
      media.className = "season-episode-media";
      media.dataset.episodeStoryOpen = String(episode);
      media.innerHTML = `
        <img src="${images[episode]}" alt="${extra?.alt || `第1季第${episode}集《${item?.title || "逐集剧情"}》剧情配图`}" width="720" height="900" loading="lazy" decoding="async">
        <span class="season-episode-media-copy"><strong>第${episode}集完整图文剧情</strong><span>点击查看大图与事件线 →</span></span>`;
      const image = media.querySelector("img");
      image.addEventListener("error", () => applyFallback(image), { once: true });
      card.insertAdjacentElement("afterbegin", media);
      card.classList.add("has-episode-image");

      if (extra?.overview && !card.querySelector(".season-episode-overview")) {
        const summary = card.querySelector(".season-episode-summary");
        const overview = document.createElement("p");
        overview.className = "season-episode-overview";
        overview.textContent = extra.overview;
        summary?.insertAdjacentElement("afterend", overview);
      }

      if (extra?.events?.length && !card.querySelector(".season-episode-event-list")) {
        const turning = card.querySelector(".season-episode-turning");
        const eventList = document.createElement("section");
        eventList.className = "season-episode-event-list";
        eventList.innerHTML = `<strong>关键事件</strong><ol>${extra.events.map(event => `<li>${event}</li>`).join("")}</ol>`;
        turning?.insertAdjacentElement("beforebegin", eventList);
      }
    });
  }

  panelContent.addEventListener("click", event => {
    const trigger = event.target.closest("[data-episode-story-open]");
    if (!trigger) return;
    openDialog(Number(trigger.dataset.episodeStoryOpen), trigger);
  });
  dialog.querySelector(".episode-story-dialog-close").addEventListener("click", closeDialog);
  dialog.addEventListener("click", event => { if (event.target === dialog) closeDialog(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeDialog(); });

  let frame = 0;
  const observer = new MutationObserver(() => {
    if (frame) return;
    frame = requestAnimationFrame(() => { frame = 0; decorate(); });
  });
  observer.observe(panelContent, { childList: true, subtree: true });
  observer.observe(panelType, { childList: true, subtree: true, characterData: true });
  window.addEventListener("pageshow", decorate);
  decorate();
})();