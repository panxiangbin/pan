(() => {
  "use strict";

  const episodeData = window.SEASON_EPISODE_DATA || {};
  const panelContent = document.getElementById("panelContent");
  const panelType = document.getElementById("panelType");
  const modebar = document.querySelector(".modebar");

  if (!panelContent || !panelType || !Object.keys(episodeData).length) return;

  const PROGRESS_KEY = "seven-kingdoms-episode-progress-v1";
  const VIEW_KEY = "seven-kingdoms-story-view-v1";
  const CHARACTER_IDS = new Map([
    ["奈德", "ned"], ["凯特琳", "catelyn"], ["罗柏", "robb"],
    ["珊莎", "sansa"], ["艾莉亚", "arya"], ["布兰", "bran"], ["琼恩", "jon"],
    ["泰温", "tywin"], ["瑟曦", "cersei"], ["詹姆", "jaime"], ["提利昂", "tyrion"],
    ["布蕾妮", "brienne"], ["丹妮莉丝", "daenerys"], ["乔拉", "jorah"], ["山姆", "sam"],
    ["史坦尼斯", "stannis"], ["小指头", "littlefinger"], ["瓦里斯", "varys"],
    ["波隆", "bronn"], ["夜王", "nightking"]
  ]);

  let deepLink = parseDeepLink();

  function esc(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[char]));
  }

  function parseDeepLink() {
    const match = location.hash.match(/^#season-([1-8])-episode-(\d{1,2})$/);
    if (!match) return null;
    const season = Number(match[1]);
    const episode = Number(match[2]);
    const list = episodeData[season] || [];
    return episode >= 1 && episode <= list.length ? { season, episode } : null;
  }

  function readProgress() {
    try {
      const parsed = JSON.parse(localStorage.getItem(PROGRESS_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function episodeKey(seasonNumber, episodeNumber) {
    return `${seasonNumber}:${episodeNumber}`;
  }

  function isEpisodeRead(seasonNumber, episodeNumber) {
    return Boolean(readProgress()[episodeKey(seasonNumber, episodeNumber)]);
  }

  function setEpisodeRead(seasonNumber, episodeNumber, read) {
    const progress = readProgress();
    const key = episodeKey(seasonNumber, episodeNumber);
    if (read) progress[key] = true;
    else delete progress[key];
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }

  function findPlace(placeId) {
    return window.WORLD_DATA?.locations?.find(item => item.id === placeId);
  }

  function goToPlace(placeId) {
    modebar?.querySelector('[data-mode="places"]')?.click();
    window.setTimeout(() => {
      document.querySelector(`.location-marker[data-location-id="${placeId}"]`)
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }, 150);
  }

  function openCharacter(characterId) {
    const relationButton = document.getElementById("relationshipModeButton")
      || document.querySelector('[data-mode="relationships"]')
      || document.querySelector(".relationship-mode-button");
    relationButton?.click();

    window.setTimeout(() => {
      const node = document.querySelector(`[data-character-id="${characterId}"]`)
        || document.querySelector(`[data-character="${characterId}"]`)
        || document.querySelector(`[data-node-id="${characterId}"]`);
      if (node) node.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      else {
        history.replaceState(null, "", `#character-${characterId}`);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    }, 130);
  }

  function characterMarkup(name) {
    const id = CHARACTER_IDS.get(name);
    if (!id) return `<span>${esc(name)}</span>`;
    return `<button type="button" data-episode-character="${esc(id)}" aria-label="查看${esc(name)}的人物关系">${esc(name)}<i aria-hidden="true">→</i></button>`;
  }

  function episodeMarkup(item, seasonNumber) {
    const place = findPlace(item.location);
    const read = isEpisodeRead(seasonNumber, item.episode);
    const searchText = [item.title, item.summary, item.turning, ...item.characters, place?.name || ""]
      .join(" ").toLowerCase();

    return `
      <article class="season-episode-card${read ? " is-read" : ""}" id="season-${seasonNumber}-episode-${item.episode}" tabindex="-1" data-episode-card="${item.episode}" data-search-text="${esc(searchText)}">
        <header class="season-episode-card-header">
          <span class="season-episode-number" aria-hidden="true">${read ? "✓" : `E${String(item.episode).padStart(2, "0")}`}</span>
          <div><small>第${seasonNumber}季 · 第${item.episode}集</small><h4>${esc(item.title)}</h4></div>
          ${place ? `<button class="season-episode-place" type="button" data-episode-place="${esc(place.id)}">⌖ ${esc(place.name)}</button>` : ""}
        </header>
        <p class="season-episode-summary">${esc(item.summary)}</p>
        <div class="season-episode-characters" aria-label="本集人物，点击可查看人物关系">${item.characters.map(characterMarkup).join("")}</div>
        <div class="season-episode-turning"><strong>本集转折：</strong>${esc(item.turning)}</div>
        <footer class="season-episode-actions">
          <button type="button" class="season-episode-read-toggle${read ? " is-read" : ""}" data-episode-read="${item.episode}" aria-pressed="${read}"><span>${read ? "本集已读" : "标记本集已读"}</span><strong aria-hidden="true">${read ? "✓" : "+"}</strong></button>
          <button type="button" class="season-episode-share" data-episode-share="${item.episode}"><span>复制本集链接</span><strong aria-hidden="true">↗</strong></button>
        </footer>
      </article>`;
  }

  function setStoryView(view, switcher, chapterSection, episodeSection, persist = true) {
    const target = view === "episodes" ? "episodes" : "chapters";
    switcher.querySelectorAll("[data-story-view]").forEach(button => {
      const selected = button.dataset.storyView === target;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", String(selected));
    });
    chapterSection.hidden = target !== "chapters";
    episodeSection.hidden = target !== "episodes";
    if (persist) localStorage.setItem(VIEW_KEY, target);
  }

  function jumpToEpisode(seasonNumber, episodeNumber) {
    const target = panelContent.querySelector(`#season-${seasonNumber}-episode-${episodeNumber}`);
    if (!target) return;
    const input = panelContent.querySelector("[data-episode-search]");
    if (input?.value) {
      input.value = "";
      filterEpisodes("");
    }
    target.hidden = false;
    target.scrollIntoView({
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start"
    });
    target.focus({ preventScroll: true });
  }

  function filterEpisodes(query) {
    const normalized = query.trim().toLowerCase();
    let visible = 0;
    panelContent.querySelectorAll("[data-episode-card]").forEach(card => {
      const matches = !normalized || card.dataset.searchText.includes(normalized);
      card.hidden = !matches;
      if (matches) visible += 1;
    });
    const status = panelContent.querySelector("[data-episode-filter-status]");
    if (status) status.textContent = normalized ? `找到 ${visible} 集` : `共 ${panelContent.querySelectorAll("[data-episode-card]").length} 集`;
  }

  function copyText(text) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy") ? resolve() : reject(new Error("copy failed"));
      } catch (error) {
        reject(error);
      } finally {
        area.remove();
      }
    });
  }

  function copyEpisodeLink(seasonNumber, episodeNumber, button) {
    const url = new URL(location.href);
    url.hash = `season-${seasonNumber}-episode-${episodeNumber}`;
    copyText(url.toString()).then(() => {
      const label = button.querySelector("span");
      if (!label) return;
      const oldText = label.textContent;
      label.textContent = "链接已复制";
      button.classList.add("copied");
      window.setTimeout(() => {
        label.textContent = oldText;
        button.classList.remove("copied");
      }, 1500);
    }).catch(() => {
      window.prompt("复制下面的本集链接：", url.toString());
    });
  }

  function updateEpisodeProgress(seasonNumber, list) {
    const readCount = list.filter(item => isEpisodeRead(seasonNumber, item.episode)).length;
    const percent = list.length ? Math.round(readCount / list.length * 100) : 0;
    const text = panelContent.querySelector("[data-episode-progress-text]");
    const bar = panelContent.querySelector("[data-episode-progress-bar]");
    const continueButton = panelContent.querySelector("[data-episode-continue]");
    const allButton = panelContent.querySelector("[data-episode-mark-all]");

    if (text) text.textContent = `已读 ${readCount} / ${list.length} 集`;
    if (bar) bar.style.width = `${percent}%`;

    panelContent.querySelectorAll("[data-episode-nav]").forEach(button => {
      const episode = Number(button.dataset.episodeNav);
      const read = isEpisodeRead(seasonNumber, episode);
      button.classList.toggle("is-read", read);
      button.setAttribute("aria-label", `第${episode}集${read ? "，已读" : ""}`);
    });

    const firstUnread = list.find(item => !isEpisodeRead(seasonNumber, item.episode));
    if (continueButton) {
      continueButton.dataset.episodeContinue = String(firstUnread?.episode || 1);
      continueButton.querySelector("span").textContent = firstUnread ? `继续阅读：第${firstUnread.episode}集` : "本季逐集内容已读完，重新浏览";
    }
    if (allButton) {
      allButton.dataset.allRead = String(readCount === list.length);
      allButton.querySelector("span").textContent = readCount === list.length ? "清除本季逐集进度" : "本季全部标记已读";
    }
  }

  function toggleEpisodeRead(seasonNumber, list, episodeNumber) {
    const next = !isEpisodeRead(seasonNumber, episodeNumber);
    setEpisodeRead(seasonNumber, episodeNumber, next);
    const card = panelContent.querySelector(`[data-episode-card="${episodeNumber}"]`);
    const button = panelContent.querySelector(`[data-episode-read="${episodeNumber}"]`);
    card?.classList.toggle("is-read", next);
    if (card) card.querySelector(".season-episode-number").textContent = next ? "✓" : `E${String(episodeNumber).padStart(2, "0")}`;
    if (button) {
      button.classList.toggle("is-read", next);
      button.setAttribute("aria-pressed", String(next));
      button.querySelector("span").textContent = next ? "本集已读" : "标记本集已读";
      button.querySelector("strong").textContent = next ? "✓" : "+";
    }
    updateEpisodeProgress(seasonNumber, list);
  }

  function markAllEpisodes(seasonNumber, list, clear) {
    list.forEach(item => setEpisodeRead(seasonNumber, item.episode, !clear));
    panelContent.dataset.episodeSeason = "";
    decorateEpisodePanel();
  }

  function decorateEpisodePanel() {
    const match = panelType.textContent.trim().match(/^第([1-8])季剧情$/);
    if (!match) return;
    const seasonNumber = Number(match[1]);
    const list = episodeData[seasonNumber];
    const chapterSection = panelContent.querySelector(".season-chapter-section");
    if (!list || !chapterSection) return;

    const ready = panelContent.dataset.episodeSeason === String(seasonNumber)
      && panelContent.querySelector(".season-view-switch")
      && panelContent.querySelector(".season-episode-section");
    if (ready) return;

    panelContent.querySelectorAll(".season-view-switch, .season-episode-section").forEach(node => node.remove());

    const switcher = document.createElement("div");
    switcher.className = "season-view-switch";
    switcher.setAttribute("role", "tablist");
    switcher.setAttribute("aria-label", "剧情阅读模式");
    switcher.innerHTML = `
      <button type="button" role="tab" data-story-view="chapters" aria-selected="true"><strong>章节导读</strong><span>5段主线脉络</span></button>
      <button type="button" role="tab" data-story-view="episodes" aria-selected="false"><strong>逐集剧情</strong><span>${list.length}集完整梳理</span></button>`;

    const episodeSection = document.createElement("section");
    episodeSection.className = "info-section season-episode-section";
    episodeSection.hidden = true;
    episodeSection.innerHTML = `
      <div class="season-episode-heading">
        <div><span class="eyebrow">Episode by Episode</span><h3>第${seasonNumber}季逐集剧情 · ${list.length}集</h3></div>
        <span data-episode-filter-status>共 ${list.length} 集</span>
      </div>
      <div class="season-episode-toolbar">
        <label><span>搜索本季</span><input type="search" data-episode-search placeholder="搜索人物、地点或剧情" autocomplete="off"></label>
        <div class="season-episode-progress-copy"><strong data-episode-progress-text>已读 0 / ${list.length} 集</strong><small>进度只保存在当前浏览器</small></div>
        <span class="season-episode-progress-track" aria-hidden="true"><i data-episode-progress-bar></i></span>
        <button type="button" data-episode-continue="1"><span>继续阅读</span><strong aria-hidden="true">↓</strong></button>
        <button type="button" data-episode-mark-all data-all-read="false"><span>本季全部标记已读</span><strong aria-hidden="true">✓</strong></button>
      </div>
      <nav class="season-episode-nav" aria-label="本季逐集快速跳转">
        ${list.map(item => `<button type="button" data-episode-nav="${item.episode}"><strong>${String(item.episode).padStart(2, "0")}</strong><span>第${item.episode}集</span></button>`).join("")}
      </nav>
      <div class="season-episode-list">${list.map(item => episodeMarkup(item, seasonNumber)).join("")}</div>`;

    chapterSection.insertAdjacentElement("beforebegin", switcher);
    chapterSection.insertAdjacentElement("afterend", episodeSection);

    switcher.querySelectorAll("[data-story-view]").forEach(button => {
      button.addEventListener("click", () => setStoryView(button.dataset.storyView, switcher, chapterSection, episodeSection));
    });
    episodeSection.querySelector("[data-episode-search]")?.addEventListener("input", event => filterEpisodes(event.target.value));
    episodeSection.querySelectorAll("[data-episode-nav]").forEach(button => {
      button.addEventListener("click", () => jumpToEpisode(seasonNumber, Number(button.dataset.episodeNav)));
    });
    episodeSection.querySelectorAll("[data-episode-place]").forEach(button => {
      button.addEventListener("click", () => goToPlace(button.dataset.episodePlace));
    });
    episodeSection.querySelectorAll("[data-episode-character]").forEach(button => {
      button.addEventListener("click", () => openCharacter(button.dataset.episodeCharacter));
    });
    episodeSection.querySelectorAll("[data-episode-read]").forEach(button => {
      button.addEventListener("click", () => toggleEpisodeRead(seasonNumber, list, Number(button.dataset.episodeRead)));
    });
    episodeSection.querySelectorAll("[data-episode-share]").forEach(button => {
      button.addEventListener("click", () => copyEpisodeLink(seasonNumber, Number(button.dataset.episodeShare), button));
    });
    episodeSection.querySelector("[data-episode-continue]")?.addEventListener("click", event => {
      jumpToEpisode(seasonNumber, Number(event.currentTarget.dataset.episodeContinue));
    });
    episodeSection.querySelector("[data-episode-mark-all]")?.addEventListener("click", event => {
      markAllEpisodes(seasonNumber, list, event.currentTarget.dataset.allRead === "true");
    });

    panelContent.dataset.episodeSeason = String(seasonNumber);
    updateEpisodeProgress(seasonNumber, list);

    const preferred = deepLink?.season === seasonNumber ? "episodes" : localStorage.getItem(VIEW_KEY) || "chapters";
    setStoryView(preferred, switcher, chapterSection, episodeSection, false);

    if (deepLink?.season === seasonNumber) {
      const targetEpisode = deepLink.episode;
      window.setTimeout(() => {
        jumpToEpisode(seasonNumber, targetEpisode);
        history.replaceState(null, "", `#season-${seasonNumber}-episode-${targetEpisode}`);
        deepLink = null;
      }, 120);
    }
  }

  function refresh() {
    const seasonMatch = panelType.textContent.trim().match(/^第([1-8])季剧情$/);
    if (!seasonMatch) delete panelContent.dataset.episodeSeason;
    decorateEpisodePanel();
  }

  function openInitialDeepLink() {
    if (!deepLink) return;
    document.querySelector(".season-mode-button")?.click();
    window.setTimeout(() => {
      document.querySelector(`.season-card[data-season-number="${deepLink.season}"]`)?.click();
    }, 180);
  }

  const observer = new MutationObserver(() => window.requestAnimationFrame(refresh));
  observer.observe(panelContent, { childList: true, subtree: true });
  observer.observe(panelType, { childList: true, characterData: true, subtree: true });
  window.addEventListener("pageshow", refresh);
  window.addEventListener("hashchange", () => {
    const next = parseDeepLink();
    if (!next) return;
    deepLink = next;
    openInitialDeepLink();
  });

  window.setTimeout(openInitialDeepLink, 180);
  refresh();
})();
