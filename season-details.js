(() => {
  "use strict";

  const media = window.SEASON_MEDIA_DATA || {};
  const sprite = window.SEASON_COVER_SPRITE || "";
  const panelContent = document.getElementById("panelContent");
  const panelType = document.getElementById("panelType");
  const seasonOverlay = document.getElementById("seasonGuideOverlay");
  const modebar = document.querySelector(".modebar");

  if (!panelContent || !seasonOverlay) return;

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
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
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
      const marker = document.querySelector(`.location-marker[data-location-id="${placeId}"]`);
      marker?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }, 140);
  }

  function openCharacter(characterId) {
    if (!characterId) return;
    const targetHash = `#character-${characterId}`;
    if (window.location.hash === targetHash) {
      window.location.reload();
      return;
    }
    window.location.hash = targetHash;
    window.location.reload();
  }

  function characterMarkup(name) {
    const characterId = CHARACTER_IDS.get(name);
    if (!characterId) return `<span>${esc(name)}</span>`;
    return `<button type="button" data-season-character="${esc(characterId)}" aria-label="查看${esc(name)}的人物关系">${esc(name)}<i aria-hidden="true">→</i></button>`;
  }

  function chapterMarkup(chapter, index) {
    const place = window.WORLD_DATA?.locations?.find(item => item.id === chapter.location);
    return `
      <article class="season-chapter-card" id="season-chapter-${index + 1}">
        <div class="season-chapter-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</div>
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
        </div>
      </article>
    `;
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
      </div>
    `;
    artStyle(visual, seasonNumber);
    hero.insertAdjacentElement("afterend", visual);

    const chapterSection = document.createElement("section");
    chapterSection.className = "info-section season-chapter-section";
    chapterSection.innerHTML = `
      <div class="season-chapter-heading">
        <div>
          <span class="eyebrow">Episode Story Chapters</span>
          <h3>剧情细化 · ${seasonMedia.chapters.length}个章节</h3>
        </div>
        <span class="season-chapter-total">人物和地点均可联动查看</span>
      </div>
      <div class="season-chapter-list">
        ${seasonMedia.chapters.map((chapter, index) => chapterMarkup(chapter, index)).join("")}
      </div>
    `;

    const summarySection = [...panelContent.querySelectorAll(".info-section")]
      .find(section => section.querySelector("h3")?.textContent.trim() === "本季概述");
    if (summarySection) summarySection.insertAdjacentElement("afterend", chapterSection);
    else visual.insertAdjacentElement("afterend", chapterSection);

    chapterSection.querySelectorAll("[data-season-chapter-place]").forEach(button => {
      button.addEventListener("click", () => goToPlace(button.dataset.seasonChapterPlace));
    });
    chapterSection.querySelectorAll("[data-season-character]").forEach(button => {
      button.addEventListener("click", () => openCharacter(button.dataset.seasonCharacter));
    });

    panelContent.dataset.chapterSeason = String(seasonNumber);
  }

  function clearPanelMarker() {
    const match = panelType?.textContent.trim().match(/^第([1-8])季剧情$/);
    if (!match) delete panelContent.dataset.chapterSeason;
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