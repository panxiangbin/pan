(() => {
  "use strict";

  const episodeData = window.SEASON_EPISODE_DATA || {};
  const world = window.WORLD_DATA;
  const panelContent = document.getElementById("panelContent");
  const modebar = document.querySelector(".modebar");
  if (!panelContent || !world || !Object.keys(episodeData).length) return;

  const CHARACTER_HOUSES = new Map([
    ["奈德", "stark"], ["凯特琳", "stark"], ["罗柏", "stark"], ["珊莎", "stark"], ["艾莉亚", "stark"], ["布兰", "stark"], ["琼恩", "stark"],
    ["泰温", "lannister"], ["瑟曦", "lannister"], ["詹姆", "lannister"], ["提利昂", "lannister"], ["乔佛里", "lannister"],
    ["丹妮莉丝", "targaryen"], ["乔拉", "targaryen"],
    ["劳勃", "baratheon"], ["史坦尼斯", "baratheon"],
    ["奥柏伦", "martell"], ["小指头", "arryn"]
  ]);

  const WAR_LINKS = new Map([
    ["1:9", "five-kings"], ["1:10", "five-kings"],
    ["2:1", "five-kings"], ["2:2", "five-kings"], ["2:3", "five-kings"], ["2:4", "five-kings"], ["2:5", "five-kings"], ["2:6", "five-kings"], ["2:7", "five-kings"], ["2:8", "five-kings"],
    ["2:9", "blackwater"], ["2:10", "five-kings"],
    ["3:9", "red-wedding"],
    ["6:9", "bastards"],
    ["8:3", "long-night"],
    ["8:5", "fall-kings-landing"]
  ]);

  const houseMap = new Map(world.houses.map(item => [item.id, item]));
  const timelineIndex = new Map(world.timeline.map((item, index) => [item.id, index]));

  function openHouse(houseId) {
    modebar?.querySelector('[data-mode="houses"]')?.click();
    window.setTimeout(() => {
      document.querySelector(`.filter-button[data-action="house"][data-id="${houseId}"]`)
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }, 120);
  }

  function openWar(warId) {
    const index = timelineIndex.get(warId);
    if (!Number.isInteger(index)) return;
    modebar?.querySelector('[data-mode="timeline"]')?.click();
    window.setTimeout(() => {
      const range = document.getElementById("timelineRange");
      if (!range) return;
      range.value = String(index);
      range.dispatchEvent(new Event("input", { bubbles: true }));
    }, 120);
  }

  function houseIdsForEpisode(item) {
    const ids = [];
    item.characters.forEach(name => {
      const id = CHARACTER_HOUSES.get(name);
      if (id && !ids.includes(id)) ids.push(id);
    });
    const locationHouse = world.locations.find(location => location.id === item.location)?.house;
    if (houseMap.has(locationHouse) && !ids.includes(locationHouse)) ids.push(locationHouse);
    return ids.slice(0, 4);
  }

  function decorateCard(card) {
    if (card.dataset.powerLinksReady === "true") return;
    const seasonMatch = card.id.match(/^season-(\d+)-episode-(\d+)$/);
    if (!seasonMatch) return;
    const season = Number(seasonMatch[1]);
    const episode = Number(seasonMatch[2]);
    const item = episodeData[season]?.find(entry => entry.episode === episode);
    if (!item) return;

    const houseIds = houseIdsForEpisode(item);
    const warId = WAR_LINKS.get(`${season}:${episode}`);
    const war = warId ? world.timeline.find(event => event.id === warId) : null;
    if (!houseIds.length && !war) {
      card.dataset.powerLinksReady = "true";
      return;
    }

    const block = document.createElement("div");
    block.className = "season-episode-power-links";
    block.setAttribute("aria-label", "相关家族与战争，可点击联动查看");
    block.innerHTML = `
      <strong>继续联动</strong>
      <div>
        ${houseIds.map(id => {
          const house = houseMap.get(id);
          return `<button type="button" data-episode-house="${id}"><span aria-hidden="true">${house.symbol}</span>${house.name}</button>`;
        }).join("")}
        ${war ? `<button type="button" class="war-link" data-episode-war="${war.id}"><span aria-hidden="true">战</span>${war.label}</button>` : ""}
      </div>`;

    const turning = card.querySelector(".season-episode-turning");
    if (turning) turning.insertAdjacentElement("beforebegin", block);
    else card.querySelector(".season-episode-actions")?.insertAdjacentElement("beforebegin", block);

    block.querySelectorAll("[data-episode-house]").forEach(button => {
      button.addEventListener("click", () => openHouse(button.dataset.episodeHouse));
    });
    block.querySelectorAll("[data-episode-war]").forEach(button => {
      button.addEventListener("click", () => openWar(button.dataset.episodeWar));
    });
    card.dataset.powerLinksReady = "true";
  }

  function refresh() {
    panelContent.querySelectorAll(".season-episode-card").forEach(decorateCard);
  }

  const observer = new MutationObserver(() => window.requestAnimationFrame(refresh));
  observer.observe(panelContent, { childList: true, subtree: true });
  window.addEventListener("pageshow", refresh);
  refresh();
})();
