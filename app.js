(() => {
  "use strict";

  const data = window.WORLD_DATA;
  if (!data) {
    document.body.innerHTML = "<p style='padding:24px'>资料加载失败，请刷新页面。</p>";
    return;
  }

  const SVG_NS = "http://www.w3.org/2000/svg";
  const locationMap = new Map(data.locations.map(item => [item.id, item]));
  const houseMap = new Map(data.houses.map(item => [item.id, item]));
  const routeMap = new Map(data.routes.map(item => [item.id, item]));
  const timelineMap = new Map(data.timeline.map(item => [item.id, item]));
  const libraryMap = new Map(data.library.map(item => [item.id, item]));

  const els = {
    panel: document.getElementById("sidePanel"),
    panelType: document.getElementById("panelType"),
    panelContent: document.getElementById("panelContent"),
    openPanel: document.getElementById("openPanel"),
    closePanel: document.getElementById("closePanel"),
    locationLayer: document.getElementById("locationLayer"),
    routeLayer: document.getElementById("routeLayer"),
    territoryLayer: document.getElementById("territoryLayer"),
    eventLayer: document.getElementById("eventLayer"),
    mapScene: document.getElementById("mapScene"),
    mapViewport: document.getElementById("mapViewport"),
    mapStatus: document.getElementById("mapStatus"),
    mapLegend: document.getElementById("mapLegend"),
    dragHint: document.getElementById("dragHint"),
    globalSearch: document.getElementById("globalSearch"),
    clearSearch: document.getElementById("clearSearch"),
    searchResults: document.getElementById("searchResults"),
    homeButton: document.getElementById("homeButton"),
    zoomIn: document.getElementById("zoomIn"),
    zoomOut: document.getElementById("zoomOut"),
    resetView: document.getElementById("resetView"),
    timelinePanel: document.getElementById("timelinePanel"),
    timelineRange: document.getElementById("timelineRange"),
    timelineTicks: document.getElementById("timelineTicks"),
    timelineYear: document.getElementById("timelineYear"),
    timelineTitle: document.getElementById("timelineTitle"),
    timelineDetail: document.getElementById("timelineDetail")
  };

  const state = {
    mode: "places",
    selectedLocation: null,
    selectedHouse: null,
    selectedRoute: null,
    timelineIndex: 0,
    transform: { x: 0, y: 0, scale: 1 },
    dragging: false,
    dragStart: { x: 0, y: 0 },
    transformStart: { x: 0, y: 0 }
  };

  function svgEl(tag, attrs = {}) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, String(value)));
    return node;
  }

  function escapeHTML(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function slugLabel(type) {
    return {
      location: "地点",
      house: "家族",
      route: "人物",
      timeline: "战争",
      library: "资料"
    }[type] || "资料";
  }

  function openPanelOnMobile() {
    if (window.matchMedia("(max-width: 820px)").matches) {
      els.panel.classList.add("open");
    }
  }

  function closePanelOnMobile() {
    els.panel.classList.remove("open");
  }

  function setPanel(type, html, shouldOpen = true) {
    els.panelType.textContent = type;
    els.panelContent.innerHTML = html;
    bindPanelActions();
    if (shouldOpen) openPanelOnMobile();
  }

  function renderLocationMarkers() {
    els.locationLayer.replaceChildren();

    data.locations.forEach(location => {
      const group = svgEl("g", {
        class: "location-marker",
        transform: `translate(${location.x} ${location.y})`,
        tabindex: "0",
        role: "button",
        "aria-label": `${location.name}，${location.subtitle}`,
        "data-location-id": location.id
      });

      const ring = svgEl("circle", { class: "marker-ring", r: location.type === "capital" ? 13 : 10 });
      const core = location.type === "castle"
        ? svgEl("rect", { class: "marker-core", x: -4, y: -4, width: 8, height: 8, rx: 1 })
        : svgEl("circle", { class: "marker-core", r: 4 });

      const labelWidth = Math.max(64, location.name.length * 18 + 20);
      const labelBg = svgEl("rect", {
        class: "marker-label-bg",
        x: -labelWidth / 2,
        y: 17,
        width: labelWidth,
        height: 28,
        rx: 8
      });
      const label = svgEl("text", { x: 0, y: 37 });
      label.textContent = location.name;

      group.append(ring, core, labelBg, label);
      group.addEventListener("click", event => {
        event.stopPropagation();
        showLocation(location.id);
      });
      group.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          showLocation(location.id);
        }
      });
      els.locationLayer.appendChild(group);
    });
  }

  function updateMarkerStates(activeIds = [], houseId = null) {
    const activeSet = new Set(activeIds);
    document.querySelectorAll(".location-marker").forEach(marker => {
      const id = marker.dataset.locationId;
      const location = locationMap.get(id);
      marker.classList.toggle("active", activeSet.has(id));

      let dimmed = false;
      if (activeSet.size > 0) dimmed = !activeSet.has(id);
      if (houseId) dimmed = location?.house !== houseId;
      marker.classList.toggle("dimmed", dimmed);
    });
  }

  function clearOverlays() {
    els.routeLayer.replaceChildren();
    els.territoryLayer.replaceChildren();
    els.eventLayer.replaceChildren();
    updateMarkerStates();
  }

  function showLocation(id, options = {}) {
    const location = locationMap.get(id);
    if (!location) return;

    state.selectedLocation = id;
    if (!options.keepMode && state.mode !== "places") setMode("places", false);
    clearOverlays();
    updateMarkerStates([id]);
    els.mapStatus.textContent = `${location.name} · ${location.region}`;

    const people = location.people.map(person => `<span class="tag">${escapeHTML(person)}</span>`).join("");
    const events = location.events.map(event => `<li>${escapeHTML(event)}</li>`).join("");
    const facts = Object.entries(location.facts)
      .map(([key, value]) => `<div class="fact-card"><small>${escapeHTML(key)}</small><strong>${escapeHTML(value)}</strong></div>`)
      .join("");

    const relatedHouse = houseMap.get(location.house);
    const relatedHouseButton = relatedHouse
      ? `<button class="panel-button" data-action="house" data-id="${relatedHouse.id}" type="button"><span>查看${escapeHTML(relatedHouse.name)}</span><span>→</span></button>`
      : "";

    const relatedRoutes = data.routes
      .filter(route => route.points.includes(id))
      .slice(0, 4)
      .map(route => `<button class="panel-button" data-action="route" data-id="${route.id}" type="button"><span>${escapeHTML(route.name)}经过这里</span><span>→</span></button>`)
      .join("");

    setPanel("地点档案", `
      <article class="hero-card" data-mark="${escapeHTML(location.name.slice(0, 1))}">
        <span class="eyebrow">${escapeHTML(location.region)}</span>
        <h1>${escapeHTML(location.name)}</h1>
        <p>${escapeHTML(location.subtitle)}</p>
        <div class="meta-row">
          <span class="meta-chip">${location.type === "capital" ? "政治中心" : location.type === "castle" ? "城堡要塞" : "区域"}</span>
          ${location.aliases.map(alias => `<span class="meta-chip">${escapeHTML(alias)}</span>`).join("")}
        </div>
      </article>
      <section class="info-section">
        <h3>地点概述</h3>
        <p>${escapeHTML(location.summary)}</p>
      </section>
      <section class="info-section">
        <h3>历史与剧情</h3>
        <p>${escapeHTML(location.history)}</p>
      </section>
      <section class="info-section">
        <h3>关键信息</h3>
        <div class="fact-grid">${facts}</div>
      </section>
      <section class="info-section">
        <h3>相关人物</h3>
        <div class="meta-row">${people}</div>
      </section>
      <section class="info-section">
        <h3>重要事件</h3>
        <ul>${events}</ul>
      </section>
      <section class="info-section">
        <h3>继续探索</h3>
        <div class="action-list">${relatedHouseButton}${relatedRoutes || "<p>暂无人物路线资料。</p>"}</div>
      </section>
    `);

    focusMapPoint(location.x, location.y, 1.45);
  }

  function renderWelcome() {
    const quickLocations = ["winterfell", "kings-landing", "the-wall", "dragonstone", "highgarden", "braavos"]
      .map(id => locationMap.get(id))
      .filter(Boolean)
      .map(location => `<button class="panel-button" data-action="location" data-id="${location.id}" type="button"><span>${escapeHTML(location.name)}</span><span>→</span></button>`)
      .join("");

    setPanel("地图导览", `
      <article class="hero-card" data-mark="七">
        <span class="eyebrow">Interactive Westeros Atlas</span>
        <h1>从地图读懂七国</h1>
        <p>点击城堡与城市查看历史，切换家族势力、人物路线和战争时间线。地图为原创同人示意图，重点表现剧情关系，而非精确地理测绘。</p>
        <div class="meta-row">
          <span class="meta-chip">${data.locations.length}个地点</span>
          <span class="meta-chip">${data.houses.length}大家族</span>
          <span class="meta-chip">${data.routes.length}条人物路线</span>
          <span class="meta-chip">${data.timeline.length}场关键战争</span>
        </div>
      </article>
      <section class="info-section">
        <h3>推荐入口</h3>
        <div class="action-list">${quickLocations}</div>
      </section>
      <section class="info-section">
        <h3>网站怎么玩</h3>
        <ol>
          <li>在地图上点击地点，查看人物、家族和重大事件。</li>
          <li>进入“家族”模式，观察各势力控制范围与兴衰。</li>
          <li>进入“人物路线”，跟随琼恩、艾莉亚、提利昂等人的旅程。</li>
          <li>拖动战争时间线，查看七国权力版图如何变化。</li>
        </ol>
      </section>
      <section class="info-section">
        <h3>内容说明</h3>
        <p>第一版以电视剧主线为主，并补充少量原著背景。后续可继续扩展人物关系图、武力榜、骑士制度、武器百科和原著差异。</p>
      </section>
    `, false);
  }

  function renderHousesList() {
    const cards = data.houses.map(house => `
      <button class="filter-button" data-action="house" data-id="${house.id}" type="button">
        <span class="house-symbol" style="color:${house.color}">${escapeHTML(house.symbol)}</span>
        <strong>${escapeHTML(house.name)}</strong>
        <small>${escapeHTML(house.words)}</small>
      </button>
    `).join("");

    setPanel("家族势力", `
      <article class="hero-card" data-mark="旗">
        <span class="eyebrow">Great Houses</span>
        <h2>谁在统治七国？</h2>
        <p>选择一个家族，地图会高亮它的核心领地，并展示族语、领袖、盟友、敌人与关键转折。</p>
      </article>
      <section class="info-section">
        <div class="filter-grid">${cards}</div>
      </section>
    `, false);
  }

  function showHouse(id) {
    const house = houseMap.get(id);
    if (!house) return;
    if (state.mode !== "houses") setMode("houses", false);
    state.selectedHouse = id;
    clearOverlays();
    renderTerritory(house);
    updateMarkerStates([], id);
    els.mapStatus.textContent = `${house.name} · ${house.seat}`;

    setPanel("家族势力", `
      <article class="hero-card" data-mark="${escapeHTML(house.symbol)}">
        <span class="eyebrow">${escapeHTML(house.seat)}</span>
        <h1>${escapeHTML(house.name)}</h1>
        <p>“${escapeHTML(house.words)}”</p>
        <div class="meta-row"><span class="meta-chip">家徽意象：${escapeHTML(house.symbol)}</span></div>
      </article>
      <section class="info-section">
        <h3>家族概述</h3>
        <p>${escapeHTML(house.summary)}</p>
      </section>
      <section class="info-section">
        <h3>核心人物</h3>
        <div class="meta-row">${house.leaders.map(item => `<span class="tag">${escapeHTML(item)}</span>`).join("")}</div>
      </section>
      <section class="info-section">
        <div class="fact-grid">
          <div class="fact-card"><small>盟友</small><strong>${escapeHTML(house.allies.join("、"))}</strong></div>
          <div class="fact-card"><small>主要敌人</small><strong>${escapeHTML(house.enemies.join("、"))}</strong></div>
        </div>
      </section>
      <section class="info-section">
        <h3>兴衰节点</h3>
        <ol>${house.turningPoints.map(item => `<li>${escapeHTML(item)}</li>`).join("")}</ol>
      </section>
      <section class="info-section">
        <button class="panel-button" data-action="houses-list" type="button"><span>返回全部家族</span><span>←</span></button>
      </section>
    `);
  }

  function renderTerritory(house) {
    house.regions.forEach(([x1, y1, x2, y2]) => {
      const rect = svgEl("rect", {
        class: "territory-region",
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1,
        rx: 42,
        fill: house.color
      });
      els.territoryLayer.appendChild(rect);
    });
  }

  function renderRoutesList() {
    const cards = data.routes.map(route => `
      <button class="filter-button" data-action="route" data-id="${route.id}" type="button">
        <span class="house-symbol" style="color:${route.color}">路</span>
        <strong>${escapeHTML(route.name)}</strong>
        <small>${escapeHTML(route.title)}</small>
      </button>
    `).join("");

    setPanel("人物路线", `
      <article class="hero-card" data-mark="路">
        <span class="eyebrow">Character Routes</span>
        <h2>跟着人物穿越世界</h2>
        <p>路线并非逐站精确复刻，而是把人物最重要的剧情地点串联起来，帮助理解他们的成长与选择。</p>
      </article>
      <section class="info-section"><div class="filter-grid">${cards}</div></section>
    `, false);
  }

  function showRoute(id) {
    const route = routeMap.get(id);
    if (!route) return;
    if (state.mode !== "routes") setMode("routes", false);
    state.selectedRoute = id;
    clearOverlays();

    const locations = route.points.map(pointId => locationMap.get(pointId)).filter(Boolean);
    const uniqueIds = [...new Set(route.points)];
    updateMarkerStates(uniqueIds);
    drawRoute(route, locations);
    els.mapStatus.textContent = `${route.name} · ${route.title}`;

    const stages = route.stages.map((stage, index) => {
      const location = locations[index] || locations[locations.length - 1];
      return `<li><button class="panel-button" data-action="location" data-id="${location?.id || ""}" type="button"><span><strong>${index + 1}. ${escapeHTML(location?.name || "旅程")}</strong><br><small>${escapeHTML(stage)}</small></span><span>⌖</span></button></li>`;
    }).join("");

    setPanel("人物路线", `
      <article class="hero-card" data-mark="${escapeHTML(route.name.slice(0, 1))}">
        <span class="eyebrow">${escapeHTML(route.title)}</span>
        <h1>${escapeHTML(route.name)}</h1>
        <p>${escapeHTML(route.summary)}</p>
        <div class="meta-row"><span class="meta-chip">${uniqueIds.length}个关键地点</span><span class="meta-chip">${route.stages.length}段旅程</span></div>
      </article>
      <section class="info-section">
        <h3>路线节点</h3>
        <ol class="action-list" style="padding-left:0;list-style:none">${stages}</ol>
      </section>
      <section class="info-section">
        <button class="panel-button" data-action="routes-list" type="button"><span>返回人物列表</span><span>←</span></button>
      </section>
    `);

    if (locations.length) {
      const avgX = locations.reduce((sum, item) => sum + item.x, 0) / locations.length;
      const avgY = locations.reduce((sum, item) => sum + item.y, 0) / locations.length;
      focusMapPoint(avgX, avgY, 1.05);
    }
  }

  function drawRoute(route, locations) {
    if (locations.length < 2) return;
    const d = locations.map((location, index) => `${index === 0 ? "M" : "L"} ${location.x} ${location.y}`).join(" ");
    const path = svgEl("path", { class: "route-path", d, style: `color:${route.color}` });
    els.routeLayer.appendChild(path);

    locations.forEach((location, index) => {
      const node = svgEl("circle", {
        class: "route-node",
        cx: location.x,
        cy: location.y,
        r: index === 0 || index === locations.length - 1 ? 9 : 6,
        style: `color:${route.color}`
      });
      els.routeLayer.appendChild(node);
    });
  }

  function setupTimeline() {
    els.timelineRange.max = String(data.timeline.length - 1);
    els.timelineTicks.innerHTML = data.timeline.map(event => `<span>${escapeHTML(event.label)}</span>`).join("");
    els.timelineRange.addEventListener("input", () => showTimelineEvent(Number(els.timelineRange.value)));
  }

  function showTimelineEvent(index) {
    const event = data.timeline[index];
    if (!event) return;
    state.timelineIndex = index;
    if (state.mode !== "timeline") setMode("timeline", false);
    clearOverlays();

    event.powers.forEach(powerId => {
      const house = houseMap.get(powerId);
      if (house) renderTerritory(house);
    });

    const location = locationMap.get(event.location);
    if (location) {
      updateMarkerStates([location.id]);
      const marker = svgEl("g", {
        class: "event-marker",
        transform: `translate(${location.x} ${location.y})`,
        "data-event-id": event.id
      });
      marker.append(svgEl("circle", { r: 21 }));
      const text = svgEl("text", { y: 6 });
      text.textContent = "战";
      marker.append(text);
      marker.addEventListener("click", () => showTimelineEvent(index));
      els.eventLayer.appendChild(marker);
      focusMapPoint(location.x, location.y, 1.25);
    }

    els.timelineRange.value = String(index);
    els.timelineYear.textContent = event.year;
    els.timelineTitle.textContent = event.title;
    els.timelineDetail.innerHTML = `<strong>${escapeHTML(event.label)}</strong>：${escapeHTML(event.summary)}`;
    els.mapStatus.textContent = `${event.label} · ${event.title}`;

    const powerTags = event.powers.map(id => houseMap.get(id)).filter(Boolean).map(house => `<span class="tag">${escapeHTML(house.name)}</span>`).join("");
    setPanel("战争时间", `
      <article class="hero-card" data-mark="战">
        <span class="eyebrow">${escapeHTML(event.year)}</span>
        <h1>${escapeHTML(event.title)}</h1>
        <p>${escapeHTML(event.summary)}</p>
        <div class="meta-row">${powerTags}</div>
      </article>
      <section class="info-section">
        <h3>战场位置</h3>
        ${location ? `<button class="panel-button" data-action="location" data-id="${location.id}" type="button"><span>${escapeHTML(location.name)} · ${escapeHTML(location.region)}</span><span>⌖</span></button>` : ""}
      </section>
      <section class="info-section">
        <h3>前后事件</h3>
        <div class="action-list">
          ${index > 0 ? `<button class="panel-button" data-action="timeline-index" data-id="${index - 1}" type="button"><span>上一阶段：${escapeHTML(data.timeline[index - 1].label)}</span><span>←</span></button>` : ""}
          ${index < data.timeline.length - 1 ? `<button class="panel-button" data-action="timeline-index" data-id="${index + 1}" type="button"><span>下一阶段：${escapeHTML(data.timeline[index + 1].label)}</span><span>→</span></button>` : ""}
        </div>
      </section>
    `, false);
  }

  function renderLibrary() {
    const cards = data.library.map(section => `
      <button class="library-card" data-action="library" data-id="${section.id}" type="button">
        <span class="house-symbol">${escapeHTML(section.icon)}</span>
        <strong>${escapeHTML(section.name)}</strong>
        <small>${escapeHTML(section.summary)}</small>
      </button>
    `).join("");

    setPanel("专题资料库", `
      <article class="hero-card" data-mark="卷">
        <span class="eyebrow">Knowledge Library</span>
        <h2>地图之外的七国</h2>
        <p>这里整理人物、战争、骑士武力和政治制度。第一版为专题索引，后续会继续拆成独立深度页面。</p>
      </article>
      <section class="info-section"><div class="library-grid">${cards}</div></section>
    `, false);
  }

  function showLibrarySection(id) {
    const section = libraryMap.get(id);
    if (!section) return;
    if (state.mode !== "library") setMode("library", false);
    clearOverlays();
    els.mapStatus.textContent = `专题资料 · ${section.name}`;

    const items = section.items.map(([title, summary]) => `
      <article class="fact-card" style="margin-bottom:9px">
        <strong>${escapeHTML(title)}</strong>
        <small style="margin-top:6px;line-height:1.6">${escapeHTML(summary)}</small>
      </article>
    `).join("");

    setPanel("专题资料库", `
      <article class="hero-card" data-mark="${escapeHTML(section.icon)}">
        <span class="eyebrow">专题索引</span>
        <h1>${escapeHTML(section.name)}</h1>
        <p>${escapeHTML(section.summary)}</p>
      </article>
      <section class="info-section">${items}</section>
      <section class="info-section"><button class="panel-button" data-action="library-list" type="button"><span>返回资料库</span><span>←</span></button></section>
    `);
  }

  function setMode(mode, render = true) {
    state.mode = mode;
    state.selectedLocation = null;
    state.selectedHouse = null;
    state.selectedRoute = null;

    document.querySelectorAll(".mode-button").forEach(button => {
      button.classList.toggle("active", button.dataset.mode === mode);
    });

    clearOverlays();
    els.timelinePanel.hidden = mode !== "timeline";

    if (!render) return;

    switch (mode) {
      case "places":
        els.mapStatus.textContent = "点击地图地点查看详细资料";
        renderWelcome();
        break;
      case "houses":
        els.mapStatus.textContent = "选择家族，查看核心势力范围";
        renderHousesList();
        break;
      case "routes":
        els.mapStatus.textContent = "选择人物，查看他的关键旅程";
        renderRoutesList();
        break;
      case "timeline":
        els.mapStatus.textContent = "拖动时间线，观察战争进程";
        showTimelineEvent(state.timelineIndex);
        break;
      case "library":
        els.mapStatus.textContent = "人物、战争、骑士与权谋专题";
        renderLibrary();
        break;
    }
  }

  function bindPanelActions() {
    els.panelContent.querySelectorAll("[data-action]").forEach(button => {
      button.addEventListener("click", () => {
        const action = button.dataset.action;
        const id = button.dataset.id;
        switch (action) {
          case "location": showLocation(id); break;
          case "house": showHouse(id); break;
          case "route": showRoute(id); break;
          case "houses-list": renderHousesList(); clearOverlays(); break;
          case "routes-list": renderRoutesList(); clearOverlays(); break;
          case "timeline-index": showTimelineEvent(Number(id)); break;
          case "library": showLibrarySection(id); break;
          case "library-list": renderLibrary(); break;
        }
      });
    });
  }

  function buildSearchIndex() {
    const records = [];
    data.locations.forEach(item => records.push({
      type: "location",
      id: item.id,
      name: item.name,
      summary: item.subtitle,
      keywords: [item.region, item.house, ...item.aliases, ...item.people, ...item.events].join(" ")
    }));
    data.houses.forEach(item => records.push({
      type: "house",
      id: item.id,
      name: item.name,
      summary: `${item.words} · ${item.seat}`,
      keywords: [item.symbol, ...item.leaders, ...item.allies, ...item.enemies].join(" ")
    }));
    data.routes.forEach(item => records.push({
      type: "route",
      id: item.id,
      name: item.name,
      summary: item.title,
      keywords: item.stages.join(" ")
    }));
    data.timeline.forEach(item => records.push({
      type: "timeline",
      id: item.id,
      name: item.label,
      summary: item.title,
      keywords: `${item.year} ${item.summary}`
    }));
    data.library.forEach(item => records.push({
      type: "library",
      id: item.id,
      name: item.name,
      summary: item.summary,
      keywords: item.items.flat().join(" ")
    }));
    return records;
  }

  const searchIndex = buildSearchIndex();

  function performSearch(query) {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      els.searchResults.hidden = true;
      els.searchResults.replaceChildren();
      return;
    }

    const terms = normalized.split(/\s+/).filter(Boolean);
    const matches = searchIndex
      .map(record => {
        const haystack = `${record.name} ${record.summary} ${record.keywords}`.toLowerCase();
        const score = terms.reduce((total, term) => {
          if (record.name.toLowerCase().includes(term)) return total + 8;
          if (record.summary.toLowerCase().includes(term)) return total + 4;
          if (haystack.includes(term)) return total + 1;
          return total - 20;
        }, 0);
        return { ...record, score };
      })
      .filter(item => item.score >= 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);

    els.searchResults.innerHTML = matches.length
      ? matches.map(item => `
        <button class="search-item" data-search-type="${item.type}" data-search-id="${item.id}" type="button">
          <span class="search-icon">${{ location: "⌖", house: "⚑", route: "➜", timeline: "战", library: "卷" }[item.type]}</span>
          <span class="search-copy"><strong>${escapeHTML(item.name)}</strong><small>${escapeHTML(item.summary)}</small></span>
          <span class="search-kind">${slugLabel(item.type)}</span>
        </button>
      `).join("")
      : `<div class="empty-state"><div><strong>没有找到</strong><span>换一个人物、地点或家族名称试试。</span></div></div>`;

    els.searchResults.hidden = false;
    els.searchResults.querySelectorAll(".search-item").forEach(button => {
      button.addEventListener("click", () => {
        const { searchType, searchId } = button.dataset;
        if (searchType === "location") showLocation(searchId);
        if (searchType === "house") showHouse(searchId);
        if (searchType === "route") showRoute(searchId);
        if (searchType === "timeline") showTimelineEvent(data.timeline.findIndex(item => item.id === searchId));
        if (searchType === "library") showLibrarySection(searchId);
        els.searchResults.hidden = true;
        els.globalSearch.blur();
      });
    });
  }

  function applyTransform() {
    const { x, y, scale } = state.transform;
    els.mapScene.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }

  function setZoom(nextScale) {
    state.transform.scale = Math.min(2.6, Math.max(.72, nextScale));
    applyTransform();
    els.dragHint.style.opacity = "0";
  }

  function focusMapPoint(x, y, scale = 1.3) {
    if (window.matchMedia("(max-width: 820px)").matches) return;
    const viewportRect = els.mapViewport.getBoundingClientRect();
    const svgScaleX = viewportRect.width / 1400;
    const svgScaleY = viewportRect.height / 900;
    const pxX = x * svgScaleX;
    const pxY = y * svgScaleY;
    state.transform.scale = Math.min(2.2, Math.max(.8, scale));
    state.transform.x = viewportRect.width / 2 - pxX;
    state.transform.y = viewportRect.height / 2 - pxY;
    applyTransform();
  }

  function resetMapView() {
    state.transform = { x: 0, y: 0, scale: 1 };
    applyTransform();
    els.dragHint.style.opacity = "1";
  }

  function setupMapInteraction() {
    els.mapViewport.addEventListener("pointerdown", event => {
      if (event.target.closest?.(".location-marker") || event.target.closest?.(".event-marker")) return;
      state.dragging = true;
      state.dragStart = { x: event.clientX, y: event.clientY };
      state.transformStart = { x: state.transform.x, y: state.transform.y };
      els.mapViewport.classList.add("dragging");
      els.mapViewport.setPointerCapture(event.pointerId);
    });

    els.mapViewport.addEventListener("pointermove", event => {
      if (!state.dragging) return;
      state.transform.x = state.transformStart.x + event.clientX - state.dragStart.x;
      state.transform.y = state.transformStart.y + event.clientY - state.dragStart.y;
      applyTransform();
      els.dragHint.style.opacity = "0";
    });

    const endDrag = () => {
      state.dragging = false;
      els.mapViewport.classList.remove("dragging");
    };
    els.mapViewport.addEventListener("pointerup", endDrag);
    els.mapViewport.addEventListener("pointercancel", endDrag);

    els.mapViewport.addEventListener("wheel", event => {
      event.preventDefault();
      const direction = event.deltaY > 0 ? -0.12 : 0.12;
      setZoom(state.transform.scale + direction);
    }, { passive: false });
  }

  function setupEvents() {
    document.querySelectorAll(".mode-button").forEach(button => {
      button.addEventListener("click", () => setMode(button.dataset.mode));
    });

    els.globalSearch.addEventListener("input", () => performSearch(els.globalSearch.value));
    els.globalSearch.addEventListener("keydown", event => {
      if (event.key === "Escape") {
        els.searchResults.hidden = true;
        els.globalSearch.blur();
      }
    });

    els.clearSearch.addEventListener("click", () => {
      els.globalSearch.value = "";
      performSearch("");
      els.globalSearch.focus();
    });

    document.addEventListener("click", event => {
      if (!event.target.closest(".search-wrap")) els.searchResults.hidden = true;
    });

    els.homeButton.addEventListener("click", () => {
      setMode("places");
      resetMapView();
    });
    els.openPanel.addEventListener("click", openPanelOnMobile);
    els.closePanel.addEventListener("click", closePanelOnMobile);
    els.zoomIn.addEventListener("click", () => setZoom(state.transform.scale + .18));
    els.zoomOut.addEventListener("click", () => setZoom(state.transform.scale - .18));
    els.resetView.addEventListener("click", resetMapView);

    window.addEventListener("resize", () => {
      if (!window.matchMedia("(max-width: 820px)").matches) els.panel.classList.remove("open");
    });
  }

  function init() {
    renderLocationMarkers();
    setupTimeline();
    setupMapInteraction();
    setupEvents();
    renderWelcome();
    applyTransform();
  }

  init();
})();
