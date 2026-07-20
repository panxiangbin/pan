(() => {
  "use strict";

  const portraits = window.CHARACTER_PORTRAITS || {};
  const panelContent = document.getElementById("panelContent");
  const panelType = document.getElementById("panelType");
  const relationOverlay = document.getElementById("relationshipOverlay");
  const footer = document.querySelector(".site-footer");

  if (!panelContent) return;

  function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function readyCount() {
    return Object.values(portraits).filter(item => item.image && item.sourceName && item.rights).length;
  }

  function currentCharacterId() {
    const hashMatch = location.hash.match(/^#character-([a-z0-9-]+)$/);
    if (hashMatch) return hashMatch[1];
    return document.querySelector(".relation-node.selected")?.dataset.characterId || "";
  }

  function sourceMarkup(item) {
    const source = item.sourceName
      ? (item.sourceUrl
        ? `<a href="${escapeHTML(item.sourceUrl)}" target="_blank" rel="noopener noreferrer">${escapeHTML(item.sourceName)}</a>`
        : escapeHTML(item.sourceName))
      : "尚未登记";

    return `
      <dl class="portrait-credit-list">
        <div class="portrait-credit-row"><dt>素材来源</dt><dd>${source}</dd></div>
        <div class="portrait-credit-row"><dt>使用依据</dt><dd>${escapeHTML(item.rights || "尚未登记")}</dd></div>
        <div class="portrait-credit-row"><dt>建议文件</dt><dd><code>${escapeHTML(item.expectedFile || "")}</code></dd></div>
      </dl>
    `;
  }

  function placeholderMarkup(item) {
    return `
      <div class="character-portrait-placeholder" role="img" aria-label="${escapeHTML(item.name)}剧照待添加">
        <span class="portrait-sigil">${escapeHTML(item.sigil || "人")}</span>
        <strong>待添加授权剧照</strong>
        <small>${escapeHTML(item.expectedFile || "")}</small>
      </div>
    `;
  }

  function portraitMediaMarkup(item) {
    if (!item.image) return placeholderMarkup(item);
    return `<img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.alt || `${item.name}人物剧照`)}" loading="lazy" decoding="async">`;
  }

  function decorateCharacterPanel() {
    if (panelType?.textContent.trim() !== "人物关系") return;
    const hero = panelContent.querySelector(".relation-character-hero");
    if (!hero || panelContent.querySelector(".character-portrait-section")) return;

    const id = currentCharacterId();
    const item = portraits[id];
    if (!item) return;

    const section = document.createElement("section");
    section.className = "info-section character-portrait-section";
    section.dataset.portraitId = id;
    section.innerHTML = `
      <div class="character-portrait-card">
        <div class="character-portrait-media">${portraitMediaMarkup(item)}</div>
        <div class="character-portrait-copy">
          <span class="portrait-status-badge${item.image ? " ready" : ""}">${item.image ? "已登记真实剧照" : "真实剧照预留位"}</span>
          <h3>电视剧人物形象</h3>
          <p>${escapeHTML(item.sceneNote || "这里用于展示一张人物剧照，并配合人物关系和剧情分析使用。")}</p>
          ${sourceMarkup(item)}
        </div>
      </div>
    `;

    hero.insertAdjacentElement("afterend", section);

    const img = section.querySelector("img");
    if (img) {
      img.addEventListener("error", () => {
        const media = section.querySelector(".character-portrait-media");
        if (media) media.innerHTML = placeholderMarkup(item);
        const badge = section.querySelector(".portrait-status-badge");
        if (badge) {
          badge.classList.remove("ready");
          badge.textContent = "图片加载失败，已显示占位";
        }
      }, { once: true });
    }
  }

  function decorateRelationIntro() {
    if (panelType?.textContent.trim() !== "人物关系") return;
    if (panelContent.querySelector(".relation-character-hero")) return;
    if (panelContent.querySelector(".portrait-policy-callout")) return;

    const hero = panelContent.querySelector('.hero-card[data-mark="网"]');
    if (!hero) return;

    const callout = document.createElement("section");
    callout.className = "info-section portrait-policy-callout";
    callout.innerHTML = `
      <strong>真实剧照功能已经接好</strong>
      <p>当前已登记 ${readyCount()} / ${Object.keys(portraits).length} 张。只有填写了图片、来源和使用依据的素材才会显示；其余人物继续使用原创符号占位。<a href="photo-credits.html">查看剧照来源与版权清单</a>。</p>
    `;
    hero.insertAdjacentElement("afterend", callout);
  }

  function ensureSvgDefs(graph) {
    let defs = graph.querySelector("defs[data-portrait-defs]");
    if (!defs) {
      defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      defs.dataset.portraitDefs = "true";
      graph.insertBefore(defs, graph.firstChild);
    }
    return defs;
  }

  function addPortraitToGraphNode(node, id, item, graph, defs) {
    if (!item.image || node.querySelector(".relation-node-portrait")) return;

    const clipId = `portrait-clip-${id}`;
    if (!defs.querySelector(`#${clipId}`)) {
      const clip = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
      clip.id = clipId;
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("r", "24");
      clip.appendChild(circle);
      defs.appendChild(clip);
    }

    const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
    image.setAttribute("class", "relation-node-portrait");
    image.setAttribute("href", item.image);
    image.setAttribute("x", "-24");
    image.setAttribute("y", "-24");
    image.setAttribute("width", "48");
    image.setAttribute("height", "48");
    image.setAttribute("preserveAspectRatio", "xMidYMid slice");
    image.setAttribute("clip-path", `url(#${clipId})`);
    image.setAttribute("aria-label", item.alt || `${item.name}人物剧照`);

    const sigil = node.querySelector(".relation-node-sigil");
    node.insertBefore(image, sigil || node.firstChild);
    node.classList.add("has-portrait");
  }

  function decorateGraphNodes() {
    const graph = relationOverlay?.querySelector("#relationshipGraph");
    if (!graph) return;
    const defs = ensureSvgDefs(graph);
    graph.querySelectorAll(".relation-node[data-character-id]").forEach(node => {
      const id = node.dataset.characterId;
      const item = portraits[id];
      if (item) addPortraitToGraphNode(node, id, item, graph, defs);
    });
  }

  function addFooterCreditLink() {
    if (!footer) return;
    const firstLine = footer.querySelector("p");
    if (!firstLine) return;

    if (!firstLine.dataset.portraitPolicyUpdated) {
      firstLine.replaceChildren(document.createTextNode("原创同人示意地图 · 非官方粉丝资料站 · 剧照仅在登记来源和使用依据后启用 "));
      firstLine.dataset.portraitPolicyUpdated = "true";
    }

    if (firstLine.querySelector(".photo-credit-link")) return;
    const link = document.createElement("a");
    link.className = "photo-credit-link";
    link.href = "photo-credits.html";
    link.textContent = "剧照来源与版权";
    firstLine.appendChild(link);
  }

  function refresh() {
    decorateCharacterPanel();
    decorateRelationIntro();
    decorateGraphNodes();
    addFooterCreditLink();
  }

  const observer = new MutationObserver(refresh);
  observer.observe(panelContent, { childList: true, subtree: true });
  if (relationOverlay) observer.observe(relationOverlay, { childList: true, subtree: true });

  window.addEventListener("hashchange", () => window.setTimeout(refresh, 0));
  window.addEventListener("pageshow", refresh);
  refresh();
})();
