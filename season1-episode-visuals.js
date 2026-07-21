(() => {
  "use strict";

  const IMAGE_VERSION = "s1-episode-media-1";
  const images = Object.freeze({
    1: `assets/season1-episodes/episode-01.webp?v=${IMAGE_VERSION}`
  });
  const panelContent = document.getElementById("panelContent");
  const panelType = document.getElementById("panelType");
  if (!panelContent || !panelType) return;

  const dialog = document.createElement("div");
  dialog.className = "episode-story-dialog";
  dialog.hidden = true;
  dialog.innerHTML = `
    <section class="episode-story-dialog-panel" role="dialog" aria-modal="true" aria-labelledby="episodeStoryTitle">
      <button class="episode-story-dialog-close" type="button" aria-label="关闭完整图文剧情">×</button>
      <img alt="" width="480" height="600" decoding="async">
      <div class="episode-story-dialog-body">
        <small></small>
        <h3 id="episodeStoryTitle"></h3>
        <p></p>
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

  function openDialog(episode, trigger) {
    const item = episodeItem(episode);
    const image = images[episode];
    if (!item || !image) return;
    lastFocused = trigger;
    const visual = dialog.querySelector("img");
    visual.src = image;
    visual.alt = `第1季第${episode}集《${item.title}》剧情配图`;
    dialog.querySelector("small").textContent = `第1季 · 第${episode}集完整图文剧情`;
    dialog.querySelector("h3").textContent = item.title;
    dialog.querySelector("p").textContent = item.summary;
    dialog.querySelector(".episode-story-dialog-turning").innerHTML = `<strong>本集关键转折：</strong>${item.turning}`;
    dialog.hidden = false;
    document.body.classList.add("episode-story-open");
    dialog.querySelector(".episode-story-dialog-close").focus();
  }

  function decorate() {
    if (panelType.textContent.trim() !== "第1季剧情") return;
    panelContent.querySelectorAll(".season-episode-card[data-episode-card]").forEach(card => {
      const episode = Number(card.dataset.episodeCard);
      const image = images[episode];
      if (!image || card.querySelector(".season-episode-media")) return;
      const item = episodeItem(episode);
      const media = document.createElement("button");
      media.type = "button";
      media.className = "season-episode-media";
      media.dataset.episodeStoryOpen = String(episode);
      media.innerHTML = `
        <img src="${image}" alt="第1季第${episode}集《${item?.title || "逐集剧情"}》剧情配图" width="480" height="600" loading="lazy" decoding="async">
        <span class="season-episode-media-copy"><strong>查看本集完整图文剧情</strong><span>点击放大阅读 →</span></span>`;
      card.insertAdjacentElement("afterbegin", media);
      card.classList.add("has-episode-image");
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
