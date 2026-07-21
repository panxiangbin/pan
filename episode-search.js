(() => {
  "use strict";

  const episodeData = window.SEASON_EPISODE_DATA || {};
  const seasons = window.SEASON_GUIDE_DATA || [];
  const overlay = document.getElementById("seasonGuideOverlay");
  if (!overlay || !Object.keys(episodeData).length) return;

  const MAX_RESULTS = 12;
  let activeIndex = -1;
  let currentResults = [];

  function esc(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[char]));
  }

  function spoilerLevel() {
    const level = Number(localStorage.getItem("seven-kingdoms-spoiler-season"));
    return Number.isFinite(level) && level >= 1 && level <= 8 ? level : 8;
  }

  function placeName(placeId) {
    return window.WORLD_DATA?.locations?.find(item => item.id === placeId)?.name || "";
  }

  function seasonTitle(seasonNumber) {
    return seasons.find(item => item.season === seasonNumber)?.title || `第${seasonNumber}季`;
  }

  function allEpisodes() {
    return Object.entries(episodeData).flatMap(([seasonKey, list]) => {
      const season = Number(seasonKey);
      return list.map(item => ({
        ...item,
        season,
        seasonTitle: seasonTitle(season),
        placeName: placeName(item.location),
        searchText: [
          `第${season}季`,
          `第${item.episode}集`,
          seasonTitle(season),
          item.title,
          item.summary,
          item.turning,
          item.characters.join(" "),
          placeName(item.location)
        ].join(" ").toLowerCase()
      }));
    });
  }

  const index = allEpisodes();

  const search = document.createElement("section");
  search.className = "episode-global-search";
  search.innerHTML = `
    <div class="episode-global-search-bar">
      <label for="episodeGlobalSearch">
        <span>搜索八季 73 集</span>
        <input id="episodeGlobalSearch" type="search" placeholder="例如：红色婚礼、琼恩、临冬城、龙" autocomplete="off" aria-controls="episodeGlobalResults" aria-expanded="false">
      </label>
      <button type="button" data-episode-search-clear hidden>清除</button>
    </div>
    <div class="episode-global-search-hint"><span>可搜索人物、地点、单集标题和剧情关键词</span><strong data-episode-search-scope></strong></div>
    <div id="episodeGlobalResults" class="episode-global-results" role="listbox" aria-label="逐集剧情搜索结果" hidden></div>`;

  const progressCard = overlay.querySelector(".season-progress-card");
  if (progressCard) progressCard.insertAdjacentElement("beforebegin", search);
  else overlay.querySelector(".season-header")?.insertAdjacentElement("afterend", search);

  const input = search.querySelector("#episodeGlobalSearch");
  const clearButton = search.querySelector("[data-episode-search-clear]");
  const resultsHost = search.querySelector("#episodeGlobalResults");
  const scopeText = search.querySelector("[data-episode-search-scope]");

  function updateScope() {
    const level = spoilerLevel();
    scopeText.textContent = level === 8 ? "当前搜索范围：全部八季" : `剧透保护：只搜索第1—${level}季`;
  }

  function resultMarkup(item, indexNumber) {
    return `
      <button type="button" role="option" aria-selected="false" data-search-result-index="${indexNumber}" data-search-season="${item.season}" data-search-episode="${item.episode}">
        <span class="episode-global-result-number">S${item.season} · E${String(item.episode).padStart(2, "0")}</span>
        <span class="episode-global-result-copy">
          <strong>${esc(item.title)}</strong>
          <small>${esc(item.seasonTitle)}${item.placeName ? ` · ${esc(item.placeName)}` : ""}</small>
          <p>${esc(item.summary)}</p>
        </span>
        <span class="episode-global-result-arrow" aria-hidden="true">→</span>
      </button>`;
  }

  function setActive(indexNumber) {
    const buttons = [...resultsHost.querySelectorAll("[data-search-result-index]")];
    if (!buttons.length) {
      activeIndex = -1;
      return;
    }
    activeIndex = Math.max(0, Math.min(buttons.length - 1, indexNumber));
    buttons.forEach((button, indexValue) => {
      const selected = indexValue === activeIndex;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", String(selected));
    });
    buttons[activeIndex]?.scrollIntoView({ block: "nearest" });
  }

  function closeResults() {
    resultsHost.hidden = true;
    input.setAttribute("aria-expanded", "false");
    activeIndex = -1;
  }

  function openEpisode(season, episode) {
    closeResults();
    input.blur();
    const hash = `#season-${season}-episode-${episode}`;
    if (location.hash === hash) window.dispatchEvent(new HashChangeEvent("hashchange"));
    else location.hash = hash;
  }

  function bindResults() {
    resultsHost.querySelectorAll("[data-search-result-index]").forEach(button => {
      button.addEventListener("mouseenter", () => setActive(Number(button.dataset.searchResultIndex)));
      button.addEventListener("click", () => openEpisode(Number(button.dataset.searchSeason), Number(button.dataset.searchEpisode)));
    });
  }

  function searchEpisodes(query) {
    const normalized = query.trim().toLowerCase();
    clearButton.hidden = !normalized;
    updateScope();

    if (!normalized) {
      currentResults = [];
      resultsHost.innerHTML = "";
      closeResults();
      return;
    }

    const level = spoilerLevel();
    const allowed = index.filter(item => item.season <= level);
    const hiddenMatches = index.filter(item => item.season > level && item.searchText.includes(normalized)).length;
    currentResults = allowed.filter(item => item.searchText.includes(normalized)).slice(0, MAX_RESULTS);

    if (!currentResults.length) {
      resultsHost.innerHTML = `
        <div class="episode-global-empty">
          <strong>没有找到匹配内容</strong>
          <span>${hiddenMatches ? `另有 ${hiddenMatches} 条结果被剧透保护隐藏` : "换一个人物、地点或剧情关键词试试"}</span>
        </div>`;
    } else {
      resultsHost.innerHTML = `
        <div class="episode-global-result-summary">找到 ${currentResults.length} 条结果${hiddenMatches ? `，另有 ${hiddenMatches} 条受剧透保护` : ""}</div>
        ${currentResults.map(resultMarkup).join("")}`;
    }

    resultsHost.hidden = false;
    input.setAttribute("aria-expanded", "true");
    activeIndex = -1;
    bindResults();
  }

  input.addEventListener("input", event => searchEpisodes(event.target.value));
  input.addEventListener("focus", () => {
    if (input.value.trim()) searchEpisodes(input.value);
  });
  input.addEventListener("keydown", event => {
    const buttons = resultsHost.querySelectorAll("[data-search-result-index]");
    if (event.key === "ArrowDown" && buttons.length) {
      event.preventDefault();
      setActive(activeIndex + 1);
    } else if (event.key === "ArrowUp" && buttons.length) {
      event.preventDefault();
      setActive(activeIndex <= 0 ? buttons.length - 1 : activeIndex - 1);
    } else if (event.key === "Enter" && activeIndex >= 0 && currentResults[activeIndex]) {
      event.preventDefault();
      const item = currentResults[activeIndex];
      openEpisode(item.season, item.episode);
    } else if (event.key === "Escape") {
      closeResults();
    }
  });

  clearButton.addEventListener("click", () => {
    input.value = "";
    input.focus();
    searchEpisodes("");
  });

  document.addEventListener("pointerdown", event => {
    if (!search.contains(event.target)) closeResults();
  });

  overlay.querySelector("#seasonSpoilerLevel")?.addEventListener("change", () => {
    updateScope();
    if (input.value.trim()) searchEpisodes(input.value);
  });

  updateScope();
})();
