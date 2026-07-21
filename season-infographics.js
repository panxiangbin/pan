(() => {
  "use strict";

  const panelContent = document.getElementById("panelContent");
  const panelType = document.getElementById("panelType");
  if (!panelContent || !panelType) return;

  const TITLES = {
    1: "权力游戏开局",
    2: "五王之战",
    3: "联盟崩塌",
    4: "审判与复仇",
    5: "信仰与统治",
    6: "史塔克归来",
    7: "龙与亡者",
    8: "终局"
  };

  function currentSeason() {
    const match = panelType.textContent.trim().match(/^第([1-8])季剧情$/);
    return match ? Number(match[1]) : 0;
  }

  function render() {
    const season = currentSeason();
    const existing = panelContent.querySelector(".season-infographic");

    if (!season) {
      existing?.remove();
      return;
    }

    if (existing?.dataset.season === String(season)) return;
    existing?.remove();

    const anchor = panelContent.querySelector(".season-detail-visual");
    if (!anchor) return;

    const title = TITLES[season];
    const src = `assets/season-detail/season-${season}.svg`;
    const figure = document.createElement("figure");
    figure.className = "season-infographic";
    figure.dataset.season = String(season);
    figure.innerHTML = `
      <a class="season-infographic-image" href="${src}" target="_blank" rel="noopener" aria-label="打开第${season}季高清剧情信息图">
        <img src="${src}" alt="第${season}季《${title}》原创剧情信息图" width="1600" height="900" loading="lazy" decoding="async" fetchpriority="low">
      </a>
      <figcaption>
        <span><strong>第${season}季高清剧情信息图</strong><small>准确文字采用矢量绘制，放大后仍然清晰。</small></span>
        <a href="${src}" target="_blank" rel="noopener">查看高清大图 ↗</a>
      </figcaption>`;

    const image = figure.querySelector("img");
    image?.addEventListener("load", () => figure.classList.add("is-loaded"), { once: true });
    image?.addEventListener("error", () => {
      figure.classList.add("has-error");
      const note = figure.querySelector("figcaption small");
      if (note) note.textContent = "图片暂时未加载成功，可点击右侧链接重新打开。";
    }, { once: true });

    anchor.insertAdjacentElement("afterend", figure);
  }

  const observer = new MutationObserver(() => window.requestAnimationFrame(render));
  observer.observe(panelContent, { childList: true, subtree: true });
  observer.observe(panelType, { childList: true, characterData: true, subtree: true });
  window.addEventListener("hashchange", () => window.setTimeout(render, 80));
  window.addEventListener("pageshow", render);
  render();
})();