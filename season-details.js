(() => {
  "use strict";

  const media = window.SEASON_MEDIA_DATA || {};
  const sprite = window.SEASON_COVER_SPRITE || "";
  const panelContent = document.getElementById("panelContent");
  const panelType = document.getElementById("panelType");
  const seasonOverlay = document.getElementById("seasonGuideOverlay");
  const modebar = document.querySelector(".modebar");

  if (!panelContent || !seasonOverlay) return;

  const CHAPTER_PROGRESS_KEY = "seven-kingdoms-chapter-progress-v1";
  const POSITIONS = [
    [0, 0], [33.333, 0], [66.667, 0], [100, 0],
    [0, 100], [33.333, 100], [66.667, 100], [100, 100]
  ];

  const CHARACTER_IDS = new Map([
    ["奈德", "ned"], ["凯特琳", "catelyn"], ["罗柏", "robb"],
    ["珊莎", "sansa"], ["艾莉亚", "arya"], ["布兰", "bran"], ["琼恩", "jon"],
    ["泰温", "tywin"], ["瑟曦", "cersei"], ["詹姆", "jaime"], ["提利昂", "tyrion"],
    ["布蕾妮", "brienne"], ["丹妮莉丝", "daenerys"], ["乔拉", "jorah"], ["山姆", "sam"],
    ["史坦尼斯", "stannis"], ["小指头", "littlefinger"], ["瓦里斯", "varys"],
    ["波隆", "bronn"], ["夜王", "nightking"]
  ]);

  function esc(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[char]));
  }

  function readChapterProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(CHAPTER_PROGRESS_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function chapterKey(seasonNumber, index) {
    return `${seasonNumber}:${index + 1}`;
  }

  function isChapterDone(seasonNumber, index) {
    return Boolean(readChapterProgress()[chapterKey(seasonNumber, index)]);
  }

  function setChapterDone(seasonNumber, index, done) {
    const progress = readChapterProgress();
    const key = chapterKey(seasonNumber, index);
    if (done) progress[key] = true;
    else delete progress[key];
    localStorage.setItem(CHAPTER_PROGRESS_KEY, JSON.stringify(progress));
  }

  function artStyle(element, seasonNumber) {
    if (!element || !sprite) return;
    const [x, y] = POSITIONS[Math.max(0, Math.min(7, seasonNumber - 1))];
    element.style.backgroundImage = `linear-gradient(180deg, rgba(5,9,12,.05), rgba(5,9,12,.86)), url("${sprite}")`;
    element.style.backgroundSize = "100% 100%, 400% 200%";
    element.style.backgroundPosition = `center, ${x}% ${y}%`;
    element.style.backgroundRepeat = "no-repeat";
  }

  function seasonNumberFromCard(card) {
    const raw = card?.dataset.seasonNumber || card?.dataset.seasonId?.replace("season-", "");
    const value = Number(raw);
    return Number.isFinite(value) ? value : 0;
  }

  function decorateCards() {
    seasonOverlay.querySelectorAll(".season-card[data-season-id]").forEach(card => {
      if (card.dataset.detailsReady === "true") return;
      const seasonNumber = seasonNumberFromCard(card);
      const seasonMedia = media[seasonNumber];
      if (!seasonNumber || !seasonMedia) return;
      const body = card.querySelector(".season-card-body");
      if (!body) return;

      const visual = document.createElement("span");
      visual.className = "season-card-art";
      visual.setAttribute("aria-hidden", "true");
      artStyle(visual, seasonNumber);
      body.insertBefore(visual, body.firstChild);

      const meta = card.querySelector(".season-card-meta");
      if (meta && !meta.querySelector(".season-chapter-count")) {
        const count = document.createElement("span");
        count.className = "season-chapter-count";
        count.textContent = `${seasonMedia.chapters.length}段剧情章节`;
        meta.appendChild(count);
      }
      card.dataset.detailsReady = "true";
    });
  }

  function goToPlace(placeId) {
    modebar?.querySelector('[data-mode="places"]')?.click();
    window.setTimeout(() => {
      document.querySelector(`.location-marker[data-location-id="${placeId}"]`)
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }, 140);
  }

  function openCharacter(characterId) {
    if (!characterId) return;
    const relationButton = document.getElementById("relationshipModeButton")
      || document.querySelector('[data-mode="relationships"]')
      || document.querySelector(".relationship-mode-button");
    relationButton?.click();

    window.setTimeout(() => {
      const node = document.querySelector(`[data-character-id="${characterId}"]`)
        || document.querySelector(`[data-character="${characterId}"]`)
        || document.querySelector(`[data-node-id="${characterId}"]`);
      if (node) {
        node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        return;
      }
      history.replaceState(null, "", `#character-${characterId}`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }, 120);
  }

  function characterMarkup(name) {
    const characterId = CHARACTER_IDS.get(name);
    if (!characterId) return `<span>${esc(name)}</span>`;
    return `<button type="button" data-season-character="${esc(characterId)}" aria-label="查看${esc(name)}的人物关系">${esc(name)}<i aria-hidden="true">→</i></button>`;
  }

  function chapterMarkup(chapter, index, seasonNumber) {
    const place = window.WORLD_DATA?.locations?.find(item => item.id === chapter.location);
    const done = isChapterDone(seasonNumber, index);
    return `
      <article class="season-chapter-card${done ? " is-read" : ""}" id="season-${seasonNumber}-chapter-${index + 1}" tabindex="-1" data-season-chapter-card="${index}">
        <div class="season-chapter-number" aria-hidden="true">${done ? "✓" : String(index + 1).padStart(2, "0")}</div>
        <div class="season-chapter-body">
          <div class="season-chapter-topline">
            <span class="season-chapter-range">${esc(chapter.range)}</span>
            ${place ? `<button class="season-chapter-place" data-season-chapter-place="${esc(place.id)}" type="button">⌖ ${esc(place.name)}</button>` : ""}
          </div>
          <h4>${esc(chapter.title)}</h4>
          <p>${esc(chapter.summary)}</p>
          <div class="season-chapter-characters" aria-label="相关人物，点击可查看人物关系">
            ${chapter.characters.map(characterMarkup).join("")}
          </div>
          <div class="season-chapter-tension"><strong>这一段的关键：</strong>${esc(chapter.tension)}</div>
          <button class="season-chapter-read-toggle${done ? " is-read" : ""}" type="button" data-season-chapter-read="${index}" aria-pressed="${done}">
            <span>${done ? "已读完这一章" : "标记这一章已读"}</span><strong aria-hidden="true">${done ? "✓" : "+"}</strong>
          </button>
        </div>
      </article>`;
  }

  function jumpToChapter(seasonNumber, index) {
    const target = panelContent.querySelector(`#season-${seasonNumber}-chapter-${index + 1}`);
    if (!target) return;
    target.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    target.focus({ preventScroll: true });
  }

  function updateChapterProgressUI(seasonNumber, seasonMedia) {
    const cards = [...panelContent.querySelectorAll("[data-season-chapter-card]")];
    const doneCount = cards.filter(card => card.classList.contains("is-read")).length;
    const total = seasonMedia.chapters.length;
    const percent = total ? Math.round(doneCount / total * 100) : 0;
    const text = panelContent.querySelector("[data-season-reading-progress-text]");
    const bar = panelContent.querySelector("[data-season-reading-progress-bar]");
    if (text) text.textContent = `已读 ${doneCount} / ${total} 章`;
    if (bar) bar.style.width = `${percent}%`;

    panelContent.querySelectorAll("[data-season-chapter-jump]").forEach(button => {
      const index = Number(button.dataset.seasonChapterJump);
      const done = isChapterDone(seasonNumber, index);
      button.classList.toggle("is-read", done);
      button.setAttribute("aria-label", `${seasonMedia.chapters[index].range} ${seasonMedia.chapters[index].title}${done ? "，已读" : ""}`);
    });

    const continueButton = panelContent.querySelector("[data-season-continue-reading]");
    if (continueButton) {
      const firstUnread = seasonMedia.chapters.findIndex((_, index) => !isChapterDone(seasonNumber, index));
      continueButton.dataset.seasonContinueReading = String(firstUnread === -1 ? 0 : firstUnread);
      continueButton.querySelector("span").textContent = firstUnread === -1 ? "本季已全部读完，重新浏览" : `继续阅读：第${firstUnread + 1}章`;
    }
  }

  function toggleChapterRead(seasonNumber, seasonMedia, index) {
    const next = !isChapterDone(seasonNumber, index);
    setChapterDone(seasonNumber, index, next);
    const card = panelContent.querySelector(`[data-season-chapter-card="${index}"]`);
    const button = panelContent.querySelector(`[data-season-chapter-read="${index}"]`);
    card?.classList.toggle("is-read", next);
    if (card) card.querySelector(".season-chapter-number").textContent = next ? "✓" : String(index + 1).padStart(2, "0");
    if (button) {
      button.classList.toggle("is-read", next);
      button.setAttribute("aria-pressed", String(next));
      button.querySelector("span").textContent = next ? "已读完这一章" : "标记这一章已读";
      button.querySelector("strong").textContent = next ? "✓" : "+";
    }
    updateChapterProgressUI(seasonNumber, seasonMedia);
  }

  function decorateDetailPanel() {
    const match = panelType?.textContent.trim().match(/^第([1-8])季剧情$/);
    if (!match) return;
    const seasonNumber = Number(match[1]);
    const seasonMedia = media[seasonNumber];
    const alreadyRendered = panelContent.dataset.chapterSeason === String(seasonNumber)
      && panelContent.querySelector(".season-chapter-section")
      && panelContent.querySelector(".season-detail-visual");
    if (!seasonMedia || alreadyRendered) return;

    const hero = panelContent.querySelector(".season-detail-hero");
    if (!hero) return;
    panelContent.querySelectorAll(".season-detail-visual, .season-chapter-section").forEach(node => node.remove());

    const visual = document.createElement("section");
    visual.className = "season-detail-visual";
    visual.dataset.seasonArt = String(seasonNumber);
    visual.setAttribute("role", "img");
    visual.setAttribute("aria-label", seasonMedia.alt || `第${seasonNumber}季原创剧情配图`);
    visual.innerHTML = `
      <div class="season-detail-visual-copy">
        <span>原创剧情配图</span>
        <strong>第${seasonNumber}季 · 图文导览</strong>
        <small>图片负责气氛和剧情识别，正文提供可放大的准确文字。</small>
      </div>`;
    artStyle(visual, seasonNumber);
    hero.insertAdjacentElement("afterend", visual);

    const chapterSection = document.createElement("section");
    chapterSection.className = "info-section season-chapter-section";
    chapterSection.innerHTML = `
      <div class="season-chapter-heading">
        <div><span class="eyebrow">Episode Story Chapters</span><h3>剧情细化 · ${seasonMedia.chapters.length}个章节</h3></div>
        <span class="season-chapter-total">人物和地点均可联动查看</span>
      </div>
      <div class="season-reading-progress">
        <div><strong data-season-reading-progress-text>已读 0 / ${seasonMedia.chapters.length} 章</strong><small>进度只保存在当前浏览器</small></div>
        <span class="season-reading-progress-track" aria-hidden="true"><i data-season-reading-progress-bar></i></span>
        <button type="button" data-season-continue-reading="0"><span>继续阅读</span><strong aria-hidden="true">↓</strong></button>
      </div>
      <nav class="season-chapter-nav" aria-label="本季章节快速跳转">
        ${seasonMedia.chapters.map((chapter, index) => `<button type="button" data-season-chapter-jump="${index}"><strong>${String(index + 1).padStart(2, "0")}</strong><span>${esc(chapter.range)}</span></button>`).join("")}
      </nav>
      <div class="season-chapter-list">${seasonMedia.chapters.map((chapter, index) => chapterMarkup(chapter, index, seasonNumber)).join("")}</div>`;

    const summarySection = [...panelContent.querySelectorAll(".info-section")]
      .find(section => section.querySelector("h3")?.textContent.trim() === "本季概述");
    if (summarySection) summarySection.insertAdjacentElement("afterend", chapterSection);
    else visual.insertAdjacentElement("afterend", chapterSection);

    chapterSection.querySelectorAll("[data-season-chapter-jump]").forEach(button => {
      button.addEventListener("click", () => jumpToChapter(seasonNumber, Number(button.dataset.seasonChapterJump)));
    });
    chapterSection.querySelectorAll("[data-season-chapter-place]").forEach(button => {
      button.addEventListener("click", () => goToPlace(button.dataset.seasonChapterPlace));
    });
    chapterSection.querySelectorAll("[data-season-character]").forEach(button => {
      button.addEventListener("click", () => openCharacter(button.dataset.seasonCharacter));
    });
    chapterSection.querySelectorAll("[data-season-chapter-read]").forEach(button => {
      button.addEventListener("click", () => toggleChapterRead(seasonNumber, seasonMedia, Number(button.dataset.seasonChapterRead)));
    });
    chapterSection.querySelector("[data-season-continue-reading]")?.addEventListener("click", event => {
      jumpToChapter(seasonNumber, Number(event.currentTarget.dataset.seasonContinueReading));
    });

    panelContent.dataset.chapterSeason = String(seasonNumber);
    updateChapterProgressUI(seasonNumber, seasonMedia);
  }

  function clearPanelMarker() {
    if (!panelType?.textContent.trim().match(/^第([1-8])季剧情$/)) delete panelContent.dataset.chapterSeason;
  }

  function refresh() {
    decorateCards();
    clearPanelMarker();
    decorateDetailPanel();
  }

  const observer = new MutationObserver(() => window.requestAnimationFrame(refresh));
  observer.observe(seasonOverlay, { childList: true, subtree: true });
  observer.observe(panelContent, { childList: true, subtree: true });
  if (panelType) observer.observe(panelType, { childList: true, characterData: true, subtree: true });
  window.addEventListener("hashchange", () => window.setTimeout(refresh, 80));
  window.addEventListener("pageshow", refresh);
  refresh();
})();
