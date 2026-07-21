(() => {
  "use strict";

  const episodeData = window.SEASON_EPISODE_DATA || {};
  const world = window.WORLD_DATA || {};
  const panelContent = document.getElementById("panelContent");
  const panelType = document.getElementById("panelType");
  const modebar = document.querySelector(".modebar");
  if (!panelContent || !panelType || !Object.keys(episodeData).length) return;

  const CHARACTER_HOUSES = {
    "奈德": "stark", "凯特琳": "stark", "罗柏": "stark", "珊莎": "stark", "艾莉亚": "stark", "布兰": "stark", "琼恩": "stark",
    "泰温": "lannister", "瑟曦": "lannister", "詹姆": "lannister", "提利昂": "lannister", "乔佛里": "lannister",
    "丹妮莉丝": "targaryen", "乔拉": "targaryen", "灰虫子": "targaryen", "弥桑黛": "targaryen",
    "史坦尼斯": "baratheon", "劳勃": "baratheon", "蓝礼": "baratheon",
    "席恩": "greyjoy", "雅拉": "greyjoy", "攸伦": "greyjoy",
    "奥柏伦": "martell", "玛格丽": "tyrell", "奥莲娜": "tyrell", "拉姆斯": "bolton", "卢斯·波顿": "bolton"
  };

  const WAR_EPISODES = {
    "劳勃起义": [[1, 1]],
    "五王之战": [[1, 10], [2, 1], [2, 10]],
    "黑水河": [[2, 9]],
    "红色婚礼": [[3, 9]],
    "私生子之战": [[6, 9]],
    "漫长之夜": [[8, 3]],
    "君临陷落": [[8, 5], [8, 6]]
  };

  function esc(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
  }

  function spoilerLevel() {
    const level = Number(localStorage.getItem("seven-kingdoms-spoiler-season"));
    return Number.isFinite(level) && level >= 1 && level <= 8 ? level : 8;
  }

  function allEpisodes() {
    const result = [];
    Object.entries(episodeData).forEach(([season, items]) => items.forEach(item => result.push({ ...item, season: Number(season) })));
    return result;
  }

  function currentContext() {
    const type = panelType.textContent.trim();
    const title = panelContent.querySelector(".hero-card h1, .hero-card h2")?.textContent.trim() || "";
    if (type === "地点档案") {
      const location = world.locations?.find(item => item.name === title);
      return location ? { kind: "location", id: location.id, title: location.name } : null;
    }
    if (type === "家族势力") {
      const house = world.houses?.find(item => item.name === title);
      return house ? { kind: "house", id: house.id, title: house.name } : null;
    }
    if (type === "战争时间") {
      const event = world.timeline?.find(item => item.title === title);
      return event ? { kind: "war", id: event.id, label: event.label, title: event.title } : null;
    }
    return null;
  }

  function matches(context) {
    const maxSeason = spoilerLevel();
    if (context.kind === "war") {
      return (WAR_EPISODES[context.label] || []).map(([season, episode]) => {
        const item = episodeData[season]?.find(entry => entry.episode === episode);
        return item && season <= maxSeason ? { ...item, season } : null;
      }).filter(Boolean);
    }

    return allEpisodes().filter(item => {
      if (item.season > maxSeason) return false;
      if (context.kind === "location") return item.location === context.id;
      if (context.kind === "house") {
        const placeHouse = world.locations?.find(place => place.id === item.location)?.house;
        return placeHouse === context.id || item.characters.some(name => CHARACTER_HOUSES[name] === context.id);
      }
      return false;
    });
  }

  function openEpisode(season, episode) {
    history.replaceState(null, "", `#season-${season}-episode-${episode}`);
    const button = modebar?.querySelector(".season-mode-button");
    button?.click();
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }

  function render() {
    panelContent.querySelector(".story-backlinks")?.remove();
    const context = currentContext();
    if (!context) return;
    const items = matches(context).slice(0, 8);
    if (!items.length) return;

    const section = document.createElement("section");
    section.className = "info-section story-backlinks";
    section.innerHTML = `
      <div class="story-backlinks-heading">
        <div><span class="eyebrow">Story Connections</span><h3>相关逐集剧情</h3></div>
        <span>${items.length}个关键节点</span>
      </div>
      <div class="story-backlinks-list">
        ${items.map(item => `<button type="button" data-backlink-season="${item.season}" data-backlink-episode="${item.episode}"><strong>S${item.season}E${String(item.episode).padStart(2, "0")}</strong><span><b>${esc(item.title)}</b><small>${esc(item.summary)}</small></span><i aria-hidden="true">→</i></button>`).join("")}
      </div>
      <p class="story-backlinks-note">仅显示剧透保护范围内的内容，点击可直接进入对应单集。</p>`;

    const continueSection = [...panelContent.querySelectorAll(".info-section")].find(node => node.querySelector("h3")?.textContent.trim() === "继续探索");
    if (continueSection) continueSection.insertAdjacentElement("beforebegin", section);
    else panelContent.appendChild(section);

    section.querySelectorAll("[data-backlink-season]").forEach(button => {
      button.addEventListener("click", () => openEpisode(Number(button.dataset.backlinkSeason), Number(button.dataset.backlinkEpisode)));
    });
  }

  let queued = false;
  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; render(); });
  };

  new MutationObserver(schedule).observe(panelContent, { childList: true, subtree: true });
  new MutationObserver(schedule).observe(panelType, { childList: true, subtree: true, characterData: true });
  window.addEventListener("storage", event => { if (event.key === "seven-kingdoms-spoiler-season") schedule(); });
  schedule();
})();
