(() => {
  "use strict";

  const characterData = [
    { id: "ned", name: "奈德·史塔克", house: "史塔克", sigil: "狼", title: "临冬城公爵 · 国王之手", x: 190, y: 160, summary: "把荣誉当作秩序基础，却在君临发现权力并不遵守北境规则。", places: ["winterfell", "kings-landing"], keywords: "艾德 奈德 国王之手" },
    { id: "catelyn", name: "凯特琳·史塔克", house: "徒利 / 史塔克", sigil: "鱼", title: "北境公爵夫人", x: 320, y: 120, summary: "连接史塔克与徒利的关键人物，也是五王之战中最清楚战争代价的人之一。", places: ["winterfell", "riverrun", "the-twins"], keywords: "凯特琳 徒利 红色婚礼" },
    { id: "robb", name: "罗柏·史塔克", house: "史塔克", sigil: "狼", title: "少狼主 · 北境之王", x: 240, y: 280, summary: "战场上几乎未尝败绩，却在联盟、婚约与政治信用上输掉战争。", places: ["winterfell", "riverrun", "the-twins"], keywords: "罗柏 少狼主 北境之王" },
    { id: "sansa", name: "珊莎·史塔克", house: "史塔克", sigil: "狼", title: "北境女王", x: 110, y: 390, summary: "从迷恋宫廷童话的少女，成长为能够识别权谋、维护北境利益的统治者。", places: ["winterfell", "kings-landing", "eyrie"], keywords: "珊莎 北境女王" },
    { id: "arya", name: "艾莉亚·史塔克", house: "史塔克", sigil: "狼", title: "无面者学徒 · 探索者", x: 300, y: 430, summary: "用名字名单抵抗失去家人的创伤，最终在复仇与自我身份之间选择做回艾莉亚。", places: ["winterfell", "kings-landing", "braavos", "the-twins"], keywords: "艾莉亚 无面者 二丫" },
    { id: "bran", name: "布兰·史塔克", house: "史塔克", sigil: "鸦", title: "三眼乌鸦 · 六国之王", x: 410, y: 250, summary: "从失去双腿的孩子成为承载历史记忆的三眼乌鸦，并在战争结束后登上王位。", places: ["winterfell", "beyond-wall", "kings-landing"], keywords: "布兰 三眼乌鸦" },
    { id: "jon", name: "琼恩·雪诺", house: "史塔克 / 坦格利安", sigil: "雪", title: "守夜人总司令 · 北境之王", x: 470, y: 410, summary: "身份横跨史塔克、坦格利安、守夜人与自由民，但他始终把责任放在王位之前。", places: ["winterfell", "the-wall", "beyond-wall", "dragonstone"], keywords: "琼恩 雪诺 伊耿" },
    { id: "tywin", name: "泰温·兰尼斯特", house: "兰尼斯特", sigil: "狮", title: "凯岩城公爵 · 国王之手", x: 690, y: 120, summary: "相信家族威望高于个人感情，以恐惧和效率维持秩序，却亲手制造了家族内部的裂痕。", places: ["casterly-rock", "kings-landing"], keywords: "泰温 兰尼斯特" },
    { id: "cersei", name: "瑟曦·兰尼斯特", house: "兰尼斯特", sigil: "狮", title: "七国女王", x: 800, y: 240, summary: "极度重视孩子与权力，把预言、恐惧和羞辱转化为对敌人的毁灭性报复。", places: ["kings-landing", "casterly-rock"], keywords: "瑟曦 女王" },
    { id: "jaime", name: "詹姆·兰尼斯特", house: "兰尼斯特", sigil: "剑", title: "御林铁卫 · 弑君者", x: 690, y: 350, summary: "在弑君者污名、对瑟曦的依恋和布蕾妮唤醒的骑士荣誉之间反复挣扎。", places: ["kings-landing", "riverrun", "winterfell", "highgarden"], keywords: "詹姆 弑君者" },
    { id: "tyrion", name: "提利昂·兰尼斯特", house: "兰尼斯特", sigil: "手", title: "国王之手 · 女王之手", x: 820, y: 430, summary: "用语言、知识与幽默保护自己，也不断承受家族偏见和错误判断造成的代价。", places: ["kings-landing", "eyrie", "meereen", "dragonstone"], keywords: "提利昂 小恶魔" },
    { id: "brienne", name: "布蕾妮·塔斯", house: "塔斯", sigil: "盾", title: "七国骑士 · 御林铁卫队长", x: 570, y: 545, summary: "没有骑士头衔时就一直遵守骑士精神，最终由詹姆正式册封并获得世界的承认。", places: ["riverrun", "winterfell", "kings-landing"], keywords: "布蕾妮 美人布蕾妮 骑士" },
    { id: "daenerys", name: "丹妮莉丝·坦格利安", house: "坦格利安", sigil: "龙", title: "龙之母 · 解放者", x: 900, y: 570, summary: "从流亡公主成长为征服者，解放奴隶的理想最终与绝对权力和战争创伤发生冲突。", places: ["vaes-dothrak", "meereen", "dragonstone", "winterfell", "kings-landing"], keywords: "丹妮莉丝 龙母 卡丽熙" },
    { id: "jorah", name: "乔拉·莫尔蒙", house: "莫尔蒙", sigil: "熊", title: "流亡骑士", x: 760, y: 590, summary: "最初受命监视丹妮莉丝，后来把忠诚和生命都交给了她。", places: ["vaes-dothrak", "meereen", "winterfell"], keywords: "乔拉 莫尔蒙" },
    { id: "sam", name: "山姆威尔·塔利", house: "塔利", sigil: "书", title: "守夜人 · 学士", x: 410, y: 590, summary: "不擅长传统战斗，却以知识、同情和勇气发现异鬼弱点与琼恩身世。", places: ["the-wall", "beyond-wall", "winterfell"], keywords: "山姆 塔利 学士" },
    { id: "stannis", name: "史坦尼斯·拜拉席恩", house: "拜拉席恩", sigil: "鹿", title: "龙石岛之王", x: 940, y: 330, summary: "把法律继承权看得高于亲情和人望，是优秀统帅，也因绝对化的使命感走向毁灭。", places: ["dragonstone", "kings-landing", "the-wall", "winterfell"], keywords: "史坦尼斯 拜拉席恩" },
    { id: "littlefinger", name: "培提尔·贝里席", house: "贝里席", sigil: "雀", title: "小指头 · 谷地守护", x: 600, y: 220, summary: "把混乱视为阶梯，利用金钱、秘密、婚姻和他人的欲望不断向上攀爬。", places: ["kings-landing", "eyrie", "winterfell"], keywords: "小指头 培提尔" },
    { id: "varys", name: "瓦里斯", house: "王国", sigil: "蛛", title: "情报总管", x: 580, y: 360, summary: "声称服务于王国与平民，用遍布大陆的小小鸟儿收集情报，并不断寻找他认可的统治者。", places: ["kings-landing", "meereen", "dragonstone"], keywords: "瓦里斯 八爪蜘蛛" },
    { id: "bronn", name: "波隆", house: "黑水河", sigil: "弩", title: "佣兵 · 高庭公爵", x: 720, y: 500, summary: "不相信荣誉叙事，只相信价格、机会和活下去的能力，是阶层跃升最夸张的人物之一。", places: ["eyrie", "kings-landing", "highgarden"], keywords: "波隆 佣兵 高庭" },
    { id: "nightking", name: "夜王", house: "亡者", sigil: "冰", title: "亡者之王", x: 520, y: 80, summary: "代表被遗忘的远古威胁；他的南下迫使长期争权的人类短暂联合。", places: ["beyond-wall", "the-wall", "winterfell"], keywords: "夜王 异鬼 亡者" }
  ];

  const relations = [
    ["ned", "catelyn", "love", "夫妻"], ["ned", "robb", "family", "父子"], ["ned", "sansa", "family", "父女"], ["ned", "arya", "family", "父女"], ["ned", "bran", "family", "父子"], ["ned", "jon", "family", "养父与外甥"],
    ["catelyn", "robb", "family", "母子"], ["catelyn", "sansa", "family", "母女"], ["catelyn", "arya", "family", "母女"], ["catelyn", "bran", "family", "母子"], ["catelyn", "jon", "conflict", "长期隔阂"],
    ["robb", "tywin", "enemy", "战争对手"], ["sansa", "cersei", "conflict", "宫廷控制"], ["sansa", "littlefinger", "conflict", "利用与反制"], ["arya", "nightking", "enemy", "终结者"], ["bran", "nightking", "enemy", "记忆与毁灭"],
    ["jon", "sam", "friend", "挚友"], ["jon", "daenerys", "love", "爱情与血统冲突"], ["jon", "nightking", "enemy", "人类存亡之敌"], ["jon", "stannis", "ally", "守夜人与王"],
    ["tywin", "cersei", "family", "父女"], ["tywin", "jaime", "family", "父子"], ["tywin", "tyrion", "conflict", "父子仇恨"], ["cersei", "jaime", "love", "孪生姐弟与恋人"], ["cersei", "tyrion", "enemy", "姐弟敌对"], ["jaime", "tyrion", "family", "兄弟"],
    ["jaime", "brienne", "love", "尊重、爱情与骑士精神"], ["tyrion", "bronn", "friend", "雇佣与友谊"], ["tyrion", "varys", "ally", "政治盟友"], ["tyrion", "daenerys", "ally", "女王与谋臣"], ["tyrion", "littlefinger", "conflict", "权谋对手"],
    ["daenerys", "jorah", "love", "忠诚与单恋"], ["daenerys", "varys", "conflict", "效忠与背叛"], ["daenerys", "nightking", "enemy", "生者与亡者"], ["stannis", "cersei", "enemy", "王位争夺"],
    ["littlefinger", "varys", "conflict", "情报与权谋对手"], ["brienne", "sansa", "ally", "誓言保护"], ["brienne", "arya", "ally", "史塔克守护者"], ["sam", "bran", "ally", "共同揭示琼恩身世"]
  ].map(([from, to, type, label]) => ({ from, to, type, label }));

  const relationMeta = {
    all: { label: "全部关系", color: "#c6a867" },
    family: { label: "家族血缘", color: "#9cc3d0" },
    love: { label: "爱情与婚姻", color: "#d28591" },
    friend: { label: "朋友与信任", color: "#8ec59b" },
    ally: { label: "政治与战场盟友", color: "#b7ab77" },
    conflict: { label: "矛盾与操控", color: "#c98958" },
    enemy: { label: "战争与死敌", color: "#c85d55" }
  };

  const houseColors = {
    "史塔克": "#9fc3cd", "徒利 / 史塔克": "#7ca9c9", "史塔克 / 坦格利安": "#d8e4e8",
    "兰尼斯特": "#c56c52", "坦格利安": "#bb5351", "拜拉席恩": "#cfb05b",
    "塔斯": "#7aa8b1", "莫尔蒙": "#8c9b7e", "塔利": "#94a76d", "贝里席": "#9b8b72",
    "王国": "#9c8fb3", "黑水河": "#aa8a67", "亡者": "#87b8c7"
  };

  const characterMap = new Map(characterData.map(item => [item.id, item]));
  const modebar = document.querySelector(".modebar");
  const mapViewport = document.getElementById("mapViewport");
  const sidePanel = document.getElementById("sidePanel");
  const panelType = document.getElementById("panelType");
  const panelContent = document.getElementById("panelContent");
  const mapStatus = document.getElementById("mapStatus");
  const timelinePanel = document.getElementById("timelinePanel");

  if (!modebar || !mapViewport || !sidePanel || !panelContent) return;

  const relationButton = document.createElement("button");
  relationButton.className = "mode-button relation-mode-button";
  relationButton.type = "button";
  relationButton.innerHTML = "<span>◎</span>人物关系";
  const libraryButton = modebar.querySelector('[data-mode="library"]');
  modebar.insertBefore(relationButton, libraryButton || null);

  const overlay = document.createElement("section");
  overlay.id = "relationshipOverlay";
  overlay.className = "relationship-overlay";
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="relation-header">
      <div>
        <span class="eyebrow">Character Network</span>
        <h2>人物关系图</h2>
        <p>点击人物，查看他与其他人的关系；线条颜色代表关系类型。</p>
      </div>
      <div class="relation-controls">
        <label>关系筛选
          <select id="relationTypeFilter">
            ${Object.entries(relationMeta).map(([key, item]) => `<option value="${key}">${item.label}</option>`).join("")}
          </select>
        </label>
        <label>寻找人物
          <input id="relationSearch" type="search" placeholder="输入：詹姆、布蕾妮……" autocomplete="off">
        </label>
        <button id="resetRelations" type="button">显示全部</button>
      </div>
    </div>
    <div class="relation-canvas-wrap">
      <svg id="relationshipGraph" viewBox="0 0 1040 680" role="img" aria-label="权力的游戏主要人物关系网络">
        <g id="relationEdges"></g>
        <g id="relationNodes"></g>
      </svg>
      <div class="relation-legend">
        ${Object.entries(relationMeta).filter(([key]) => key !== "all").map(([key, item]) => `<span><i style="--relation-color:${item.color}"></i>${item.label}</span>`).join("")}
      </div>
    </div>
  `;
  mapViewport.appendChild(overlay);

  const edgeLayer = overlay.querySelector("#relationEdges");
  const nodeLayer = overlay.querySelector("#relationNodes");
  const filter = overlay.querySelector("#relationTypeFilter");
  const search = overlay.querySelector("#relationSearch");
  const resetButton = overlay.querySelector("#resetRelations");

  let activeCharacter = null;
  let activeFilter = "all";
  let searchTerm = "";

  function esc(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));
  }

  function createSvg(tag, attrs = {}) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  }

  function visibleRelations() {
    return relations.filter(item => activeFilter === "all" || item.type === activeFilter);
  }

  function connectedIds(id) {
    const ids = new Set([id]);
    visibleRelations().forEach(item => {
      if (item.from === id) ids.add(item.to);
      if (item.to === id) ids.add(item.from);
    });
    return ids;
  }

  function renderGraph() {
    edgeLayer.replaceChildren();
    nodeLayer.replaceChildren();
    const currentRelations = visibleRelations();
    const connected = activeCharacter ? connectedIds(activeCharacter) : null;
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchingIds = new Set(characterData.filter(item => {
      if (!normalizedSearch) return true;
      return `${item.name} ${item.house} ${item.title} ${item.keywords}`.toLowerCase().includes(normalizedSearch);
    }).map(item => item.id));

    currentRelations.forEach(item => {
      const from = characterMap.get(item.from);
      const to = characterMap.get(item.to);
      if (!from || !to) return;
      const isConnected = !activeCharacter || item.from === activeCharacter || item.to === activeCharacter;
      const isSearchMatch = !normalizedSearch || (matchingIds.has(item.from) && matchingIds.has(item.to));
      const meta = relationMeta[item.type];
      const line = createSvg("line", {
        x1: from.x, y1: from.y, x2: to.x, y2: to.y,
        class: `relation-edge ${isConnected && isSearchMatch ? "is-active" : "is-dimmed"}`,
        stroke: meta.color,
        "data-from": item.from,
        "data-to": item.to,
        "data-label": item.label
      });
      edgeLayer.appendChild(line);
    });

    characterData.forEach(character => {
      const matchesFilter = !activeCharacter || connected.has(character.id);
      const matchesSearch = matchingIds.has(character.id);
      const group = createSvg("g", {
        class: `relation-node${character.id === activeCharacter ? " selected" : ""}${matchesFilter && matchesSearch ? "" : " dimmed"}`,
        transform: `translate(${character.x} ${character.y})`,
        tabindex: "0",
        role: "button",
        "aria-label": character.name,
        "data-character-id": character.id
      });
      const outer = createSvg("circle", { r: 31, class: "relation-node-ring", stroke: houseColors[character.house] || "#c6a867" });
      const inner = createSvg("circle", { r: 25, class: "relation-node-core", fill: houseColors[character.house] || "#776f61" });
      const sigil = createSvg("text", { y: 7, class: "relation-node-sigil" });
      sigil.textContent = character.sigil;
      const labelBg = createSvg("rect", { x: -57, y: 37, width: 114, height: 28, rx: 9, class: "relation-label-bg" });
      const label = createSvg("text", { y: 57, class: "relation-node-label" });
      label.textContent = character.name;
      group.append(outer, inner, sigil, labelBg, label);
      group.addEventListener("click", () => selectCharacter(character.id));
      group.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectCharacter(character.id);
        }
      });
      nodeLayer.appendChild(group);
    });
  }

  function relationCards(id) {
    return relations.filter(item => item.from === id || item.to === id).map(item => {
      const otherId = item.from === id ? item.to : item.from;
      const other = characterMap.get(otherId);
      const meta = relationMeta[item.type];
      return `<button class="relation-person-card" data-character-jump="${otherId}" type="button">
        <span class="relation-mini-sigil" style="--house-color:${houseColors[other.house] || "#c6a867"}">${esc(other.sigil)}</span>
        <span><strong>${esc(other.name)}</strong><small>${esc(item.label)} · ${esc(meta.label)}</small></span>
        <i style="--relation-color:${meta.color}"></i>
      </button>`;
    }).join("");
  }

  function showCharacterPanel(id) {
    const character = characterMap.get(id);
    if (!character) return;
    panelType.textContent = "人物关系";
    panelContent.innerHTML = `
      <article class="hero-card relation-character-hero" data-mark="${esc(character.sigil)}">
        <span class="eyebrow">${esc(character.house)}</span>
        <h1>${esc(character.name)}</h1>
        <p>${esc(character.title)}</p>
        <div class="meta-row"><span class="meta-chip">关系数量：${relations.filter(item => item.from === id || item.to === id).length}</span></div>
      </article>
      <section class="info-section"><h3>人物核心</h3><p>${esc(character.summary)}</p></section>
      <section class="info-section">
        <h3>相关地点</h3>
        <div class="action-list">
          ${character.places.map(placeId => {
            const place = window.WORLD_DATA?.locations?.find(item => item.id === placeId);
            return place ? `<button class="panel-button" data-relation-place="${placeId}" type="button"><span>${esc(place.name)} · ${esc(place.region)}</span><span>⌖</span></button>` : "";
          }).join("")}
        </div>
      </section>
      <section class="info-section"><h3>人物关系</h3><div class="relation-person-list">${relationCards(id)}</div></section>
      <section class="info-section relation-tip"><strong>看图方法</strong><p>当前人物和与他直接相连的人会保持高亮，其他人物会淡化。再次点击“显示全部”即可恢复全图。</p></section>
    `;

    panelContent.querySelectorAll("[data-character-jump]").forEach(button => button.addEventListener("click", () => selectCharacter(button.dataset.characterJump)));
    panelContent.querySelectorAll("[data-relation-place]").forEach(button => button.addEventListener("click", () => {
      leaveRelationMode();
      const placesButton = modebar.querySelector('[data-mode="places"]');
      placesButton?.click();
      window.setTimeout(() => {
        const marker = document.querySelector(`.location-marker[data-location-id="${button.dataset.relationPlace}"]`);
        marker?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }, 80);
    }));
    if (window.matchMedia("(max-width: 820px)").matches) sidePanel.classList.add("open");
  }

  function selectCharacter(id) {
    activeCharacter = id;
    const character = characterMap.get(id);
    if (!character) return;
    mapStatus.textContent = `${character.name} · ${character.title}`;
    renderGraph();
    showCharacterPanel(id);
    history.replaceState(null, "", `#character-${id}`);
  }

  function showRelationIntro() {
    panelType.textContent = "人物关系";
    panelContent.innerHTML = `
      <article class="hero-card" data-mark="网">
        <span class="eyebrow">Character Network</span>
        <h1>人物关系图</h1>
        <p>《权力的游戏》的复杂，不只是人物多，而是同一段关系可能同时包含亲情、爱情、联盟、操控和仇恨。</p>
        <div class="meta-row"><span class="meta-chip">${characterData.length}位核心人物</span><span class="meta-chip">${relations.length}条关键关系</span></div>
      </article>
      <section class="info-section"><h3>推荐从这里开始</h3><div class="action-list">
        ${["jon", "jaime", "tyrion", "sansa", "daenerys"].map(id => {
          const item = characterMap.get(id);
          return `<button class="panel-button" data-character-jump="${id}" type="button"><span>${esc(item.name)} · ${esc(item.title)}</span><span>→</span></button>`;
        }).join("")}
      </div></section>
      <section class="info-section"><h3>关系颜色</h3><div class="relation-key-list">
        ${Object.entries(relationMeta).filter(([key]) => key !== "all").map(([, item]) => `<span><i style="--relation-color:${item.color}"></i>${item.label}</span>`).join("")}
      </div></section>
    `;
    panelContent.querySelectorAll("[data-character-jump]").forEach(button => button.addEventListener("click", () => selectCharacter(button.dataset.characterJump)));
  }

  function enterRelationMode() {
    document.querySelectorAll(".mode-button").forEach(button => button.classList.remove("active"));
    relationButton.classList.add("active");
    overlay.hidden = false;
    mapViewport.classList.add("relationship-mode");
    timelinePanel.hidden = true;
    mapStatus.textContent = "人物关系图 · 点击人物查看直接关系";
    activeCharacter = null;
    activeFilter = "all";
    searchTerm = "";
    filter.value = "all";
    search.value = "";
    renderGraph();
    showRelationIntro();
  }

  function leaveRelationMode() {
    overlay.hidden = true;
    mapViewport.classList.remove("relationship-mode");
    relationButton.classList.remove("active");
    if (location.hash.startsWith("#character-")) history.replaceState(null, "", location.pathname + location.search);
  }

  relationButton.addEventListener("click", enterRelationMode);
  modebar.querySelectorAll('[data-mode]').forEach(button => button.addEventListener("click", leaveRelationMode));

  filter.addEventListener("change", () => {
    activeFilter = filter.value;
    renderGraph();
  });
  search.addEventListener("input", () => {
    searchTerm = search.value;
    renderGraph();
  });
  resetButton.addEventListener("click", () => {
    activeCharacter = null;
    activeFilter = "all";
    searchTerm = "";
    filter.value = "all";
    search.value = "";
    renderGraph();
    showRelationIntro();
    mapStatus.textContent = "人物关系图 · 点击人物查看直接关系";
  });

  const hashMatch = location.hash.match(/^#character-([a-z0-9-]+)$/);
  if (hashMatch && characterMap.has(hashMatch[1])) {
    window.setTimeout(() => {
      enterRelationMode();
      selectCharacter(hashMatch[1]);
    }, 120);
  }
})();
