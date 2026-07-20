(() => {
  "use strict";

  const seasons = window.SEASON_GUIDE_DATA || [];
  const modebar = document.querySelector(".modebar");
  const mapViewport = document.getElementById("mapViewport");
  const sidePanel = document.getElementById("sidePanel");
  const panelType = document.getElementById("panelType");
  const panelContent = document.getElementById("panelContent");
  const mapStatus = document.getElementById("mapStatus");
  const timelinePanel = document.getElementById("timelinePanel");

  if (!seasons.length || !modebar || !mapViewport || !panelContent) return;

  const STORAGE_KEYS = {
    spoiler: "seven-kingdoms-spoiler-season",
    completed: "seven-kingdoms-completed-seasons"
  };

  function esc(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function readNumber(key, fallback) {
    const value = Number(localStorage.getItem(key));
    return Number.isFinite(value) && value >= 1 && value <= 8 ? value : fallback;
  }

  function readCompleted() {
    try {
      const values = JSON.parse(localStorage.getItem(STORAGE_KEYS.completed) || "[]");
      return new Set(Array.isArray(values) ? values.map(Number).filter(item => item >= 1 && item <= 8) : []);
    } catch {
      return new Set();
    }
  }

  function saveCompleted() {
    localStorage.setItem(STORAGE_KEYS.completed, JSON.stringify([...completed].sort((a, b) => a - b)));
  }

  let spoilerLevel = readNumber(STORAGE_KEYS.spoiler, 8);
  let completed = readCompleted();
  let activeSeason = null;

  const seasonButton = document.createElement("button");
  seasonButton.className = "mode-button season-mode-button";
  seasonButton.type = "button";
  seasonButton.innerHTML = "<span>▦</span>八季剧情";
  const libraryButton = modebar.querySelector('[data-mode="library"]');
  modebar.insertBefore(seasonButton, libraryButton || null);

  const overlay = document.createElement("section");
  overlay.id = "seasonGuideOverlay";
  overlay.className = "season-overlay";
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="season-header">
      <div>
        <span class="eyebrow">Eight-Season Story Guide</span>
        <h2>八季剧情导览</h2>
        <p>按季度梳理权力变化、人物转折和关键地点，并保留自己的观看进度。</p>
      </div>
      <div class="season-tools">
        <label>剧透保护
          <select id="seasonSpoilerLevel" aria-label="选择已经看到的季度">
            ${seasons.map(item => `<option value="${item.season}">我已看到第${item.season}季</option>`).join("")}
          </select>
        </label>
        <button id="clearSeasonProgress" type="button">清除进度</button>
      </div>
    </div>
    <div class="season-progress-card">
      <div class="season-progress-copy">
        <strong id="seasonProgressText">观看进度</strong>
        <small>点击季度卡片进入详细导览，已看完的季度可以单独标记。</small>
      </div>
      <div class="season-progress-track" aria-hidden="true"><i id="seasonProgressBar"></i></div>
    </div>
    <div id="seasonGrid" class="season-grid"></div>
  `;
  mapViewport.appendChild(overlay);

  const spoilerSelect = overlay.querySelector("#seasonSpoilerLevel");
  const clearProgressButton = overlay.querySelector("#clearSeasonProgress");
  const progressText = overlay.querySelector("#seasonProgressText");
  const progressBar = overlay.querySelector("#seasonProgressBar");
  const grid = overlay.querySelector("#seasonGrid");

  spoilerSelect.value = String(spoilerLevel);

  overlay.addEventListener("pointerdown", event => event.stopPropagation());
  overlay.addEventListener("pointermove", event => event.stopPropagation());
  overlay.addEventListener("pointerup", event => event.stopPropagation());
  overlay.addEventListener("wheel", event => event.stopPropagation(), { passive: true });

  function updateProgress() {
    const count = completed.size;
    const percent = count / seasons.length * 100;
    progressText.textContent = `观看进度：${count} / ${seasons.length} 季`;
    progressBar.style.width = `${percent}%`;
  }

  function renderSeasonGrid() {
    updateProgress();
    grid.innerHTML = seasons.map(item => {
      const isCompleted = completed.has(item.season);
      const isLocked = item.season > spoilerLevel;
      return `
        <button class="season-card${isCompleted ? " completed" : ""}${isLocked ? " locked" : ""}" data-season-id="${item.id}" data-season-number="${item.season}" type="button" aria-label="第${item.season}季 ${esc(item.title)}">
          <div class="season-card-body">
            <div class="season-card-topline">
              <span class="season-number">第${item.season}季</span>
              <span class="season-state${isCompleted ? " done" : ""}">${isCompleted ? "✓ 已看完" : `${item.episodes}集`}</span>
            </div>
            <h3>${esc(item.title)}</h3>
            <p>${esc(item.subtitle)}</p>
            <div class="season-card-meta"><span>${esc(item.tone)}</span><span>${item.keyEvents.length}个关键事件</span></div>
          </div>
          ${isLocked ? `<span class="season-lock-cover"><span><strong>剧透保护中</strong><small>你设置为看到第${spoilerLevel}季</small></span></span>` : ""}
        </button>
      `;
    }).join("");

    grid.querySelectorAll("[data-season-id]").forEach(button => {
      button.addEventListener("click", () => {
        const season = seasons.find(item => item.id === button.dataset.seasonId);
        if (!season) return;
        if (season.season > spoilerLevel) showLockedPanel(season);
        else showSeasonPanel(season.season);
      });
    });
  }

  function locationButtons(item) {
    return item.locations.map(placeId => {
      const place = window.WORLD_DATA?.locations?.find(location => location.id === placeId);
      if (!place) return "";
      return `<button class="panel-button" data-season-place="${place.id}" type="button"><span>${esc(place.name)} · ${esc(place.region)}</span><span>⌖</span></button>`;
    }).join("");
  }

  function bindPanelActions() {
    panelContent.querySelectorAll("[data-season-open]").forEach(button => {
      button.addEventListener("click", () => showSeasonPanel(Number(button.dataset.seasonOpen)));
    });

    panelContent.querySelectorAll("[data-season-place]").forEach(button => {
      button.addEventListener("click", () => goToPlace(button.dataset.seasonPlace));
    });

    panelContent.querySelectorAll("[data-season-complete]").forEach(button => {
      button.addEventListener("click", () => toggleCompleted(Number(button.dataset.seasonComplete)));
    });

    panelContent.querySelectorAll("[data-season-back]").forEach(button => {
      button.addEventListener("click", showSeasonIntro);
    });

    panelContent.querySelectorAll("[data-unlock-season]").forEach(button => {
      button.addEventListener("click", () => {
        spoilerLevel = Number(button.dataset.unlockSeason);
        localStorage.setItem(STORAGE_KEYS.spoiler, String(spoilerLevel));
        spoilerSelect.value = String(spoilerLevel);
        renderSeasonGrid();
        showSeasonPanel(spoilerLevel);
      });
    });
  }

  function showSeasonIntro() {
    activeSeason = null;
    panelType.textContent = "八季剧情";
    panelContent.innerHTML = `
      <article class="hero-card season-detail-hero" data-mark="8">
        <span class="eyebrow">Story Guide</span>
        <h1>八季剧情总览</h1>
        <p>这不是简单复述剧情，而是把每一季最重要的权力变化、人物选择、战争节点和地图位置串起来。</p>
        <div class="meta-row"><span class="meta-chip">8季</span><span class="meta-chip">73集</span><span class="meta-chip">剧透等级可调</span></div>
      </article>
      <section class="info-section">
        <h3>推荐浏览顺序</h3>
        <div class="action-list">
          ${seasons.slice(0, 4).map(item => `<button class="panel-button" data-season-open="${item.season}" type="button"><span>第${item.season}季 · ${esc(item.title)}</span><span>→</span></button>`).join("")}
        </div>
      </section>
      <section class="info-section">
        <h3>进度与剧透</h3>
        <p>观看进度保存在当前浏览器中，不需要登录。上方“剧透保护”可以隐藏尚未看到季度的标题和内容。</p>
      </section>
    `;
    bindPanelActions();
  }

  function showLockedPanel(item) {
    activeSeason = item.season;
    panelType.textContent = "剧透保护";
    panelContent.innerHTML = `
      <article class="hero-card" data-mark="锁">
        <span class="eyebrow">Spoiler Protection</span>
        <h1>第${item.season}季暂未展开</h1>
        <p>你目前把剧透等级设置为“看到第${spoilerLevel}季”。这一季包含后续人物命运和战争结果。</p>
      </article>
      <section class="info-section">
        <div class="action-list">
          <button class="panel-button" data-unlock-season="${item.season}" type="button"><span>我已经看过，解锁到第${item.season}季</span><span>解锁</span></button>
          <button class="panel-button" data-season-back type="button"><span>返回八季总览</span><span>←</span></button>
        </div>
      </section>
    `;
    bindPanelActions();
    if (window.matchMedia("(max-width: 820px)").matches) sidePanel?.classList.add("open");
  }

  function showSeasonPanel(seasonNumber) {
    const item = seasons.find(season => season.season === seasonNumber);
    if (!item) return;
    if (item.season > spoilerLevel) {
      showLockedPanel(item);
      return;
    }

    activeSeason = item.season;
    const isCompleted = completed.has(item.season);
    const previous = seasons.find(season => season.season === item.season - 1);
    const next = seasons.find(season => season.season === item.season + 1);

    panelType.textContent = `第${item.season}季剧情`;
    panelContent.innerHTML = `
      <article class="hero-card season-detail-hero" data-mark="${item.season}">
        <span class="eyebrow">第${item.season}季 · ${item.episodes}集</span>
        <h1>${esc(item.title)}</h1>
        <p>${esc(item.subtitle)}</p>
        <div class="meta-row"><span class="meta-chip">${esc(item.tone)}</span><span class="meta-chip">${item.keyEvents.length}个关键事件</span></div>
      </article>
      <section class="info-section"><h3>本季概述</h3><p>${esc(item.summary)}</p></section>
      <section class="info-section"><h3>关键事件</h3><ol>${item.keyEvents.map(event => `<li>${esc(event)}</li>`).join("")}</ol></section>
      <section class="info-section"><h3>核心人物</h3><div class="season-character-chips">${item.characters.map(name => `<span>${esc(name)}</span>`).join("")}</div></section>
      <section class="info-section"><h3>地图上的本季</h3><div class="action-list">${locationButtons(item)}</div></section>
      <section class="info-section"><h3>这一季真正讲了什么</h3><p>${esc(item.theme)}</p></section>
      <section class="info-section"><div class="season-spoiler-box"><strong>核心结果</strong><p>${esc(item.spoiler)}</p></div></section>
      <section class="info-section">
        <div class="season-detail-actions">
          <button class="panel-button season-complete-button${isCompleted ? " completed" : ""}" data-season-complete="${item.season}" type="button"><span>${isCompleted ? "已标记看完" : "标记这一季已看完"}</span><span>${isCompleted ? "✓" : "+"}</span></button>
          <button class="panel-button" data-season-back type="button"><span>返回八季总览</span><span>总览</span></button>
          ${previous ? `<button class="panel-button" data-season-open="${previous.season}" type="button"><span>上一季：${esc(previous.title)}</span><span>←</span></button>` : ""}
          ${next ? `<button class="panel-button" data-season-open="${next.season}" type="button"><span>下一季：${esc(next.title)}</span><span>→</span></button>` : ""}
        </div>
      </section>
    `;

    bindPanelActions();
    mapStatus.textContent = `第${item.season}季 · ${item.title}`;
    history.replaceState(null, "", `#season-${item.season}`);
    if (window.matchMedia("(max-width: 820px)").matches) sidePanel?.classList.add("open");
  }

  function toggleCompleted(seasonNumber) {
    if (completed.has(seasonNumber)) completed.delete(seasonNumber);
    else completed.add(seasonNumber);
    saveCompleted();
    renderSeasonGrid();
    showSeasonPanel(seasonNumber);
  }

  function goToPlace(placeId) {
    leaveSeasonMode();
    const placesButton = modebar.querySelector('[data-mode="places"]');
    placesButton?.click();
    window.setTimeout(() => {
      const marker = document.querySelector(`.location-marker[data-location-id="${placeId}"]`);
      marker?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }, 100);
  }

  function enterSeasonMode() {
    const relationOverlay = document.getElementById("relationshipOverlay");
    if (relationOverlay) relationOverlay.hidden = true;
    mapViewport.classList.remove("relationship-mode");

    document.querySelectorAll(".mode-button").forEach(button => button.classList.remove("active"));
    seasonButton.classList.add("active");
    overlay.hidden = false;
    mapViewport.classList.add("season-mode");
    if (timelinePanel) timelinePanel.hidden = true;
    mapStatus.textContent = "八季剧情导览 · 点击季度查看详细脉络";
    renderSeasonGrid();

    if (activeSeason && activeSeason <= spoilerLevel) showSeasonPanel(activeSeason);
    else showSeasonIntro();
  }

  function leaveSeasonMode() {
    overlay.hidden = true;
    mapViewport.classList.remove("season-mode");
    seasonButton.classList.remove("active");
    if (location.hash.startsWith("#season-")) history.replaceState(null, "", location.pathname + location.search);
  }

  spoilerSelect.addEventListener("change", () => {
    spoilerLevel = Number(spoilerSelect.value);
    localStorage.setItem(STORAGE_KEYS.spoiler, String(spoilerLevel));
    renderSeasonGrid();
    if (activeSeason) {
      const item = seasons.find(season => season.season === activeSeason);
      if (item && activeSeason > spoilerLevel) showLockedPanel(item);
      else if (item) showSeasonPanel(activeSeason);
    }
  });

  clearProgressButton.addEventListener("click", () => {
    if (!completed.size || window.confirm("确定清除八季观看进度吗？")) {
      completed = new Set();
      saveCompleted();
      renderSeasonGrid();
      if (activeSeason) showSeasonPanel(activeSeason);
    }
  });

  seasonButton.addEventListener("click", enterSeasonMode);
  modebar.querySelectorAll('[data-mode], .relation-mode-button').forEach(button => button.addEventListener("click", leaveSeasonMode));

  const hashMatch = location.hash.match(/^#season-([1-8])$/);
  if (hashMatch) {
    const seasonNumber = Number(hashMatch[1]);
    window.setTimeout(() => {
      activeSeason = seasonNumber;
      enterSeasonMode();
      if (seasonNumber > spoilerLevel) showLockedPanel(seasons[seasonNumber - 1]);
      else showSeasonPanel(seasonNumber);
    }, 170);
  }

  renderSeasonGrid();
})();
