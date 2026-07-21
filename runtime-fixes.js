(() => {
  "use strict";

  const relationshipOverlay = document.getElementById("relationshipOverlay");
  if (relationshipOverlay) {
    relationshipOverlay.addEventListener("pointerdown", event => event.stopPropagation());
    relationshipOverlay.addEventListener("pointermove", event => event.stopPropagation());
    relationshipOverlay.addEventListener("pointerup", event => event.stopPropagation());
    relationshipOverlay.addEventListener("wheel", event => event.stopPropagation(), { passive: true });
  }

  function ensureStylesheet(href) {
    let existing = document.querySelector(`link[href="${href}"]`);
    if (existing?.dataset.failed === "true") {
      existing.remove();
      existing = null;
    }
    if (existing) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.addEventListener("error", () => {
      link.dataset.failed = "true";
    }, { once: true });
    document.head.appendChild(link);
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      let existing = document.querySelector(`script[src="${src}"]`);
      if (existing?.dataset.failed === "true") {
        existing.remove();
        existing = null;
      }

      if (existing) {
        if (existing.dataset.loaded === "true") resolve();
        else {
          existing.addEventListener("load", resolve, { once: true });
          existing.addEventListener("error", reject, { once: true });
        }
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.defer = true;
      script.addEventListener("load", () => {
        script.dataset.loaded = "true";
        resolve();
      }, { once: true });
      script.addEventListener("error", event => {
        script.dataset.failed = "true";
        reject(new Error(`脚本加载失败：${src}`, { cause: event }));
      }, { once: true });
      document.body.appendChild(script);
    });
  }

  ensureStylesheet("portraits.css");
  ensureStylesheet("seasons.css");
  ensureStylesheet("season-details.css");
  ensureStylesheet("season-navigation.css");
  ensureStylesheet("module-fallback.css");

  let episodeFeaturesPromise = null;

  function seasonButton() {
    return document.querySelector(".season-mode-button");
  }

  function setEpisodeLoading(loading) {
    const button = seasonButton();
    if (!button) return;
    button.classList.toggle("episode-module-loading", loading);
    button.setAttribute("aria-busy", String(loading));
  }

  function clearEpisodeLoadError() {
    document.querySelector(".episode-load-error")?.remove();
  }

  function showEpisodeLoadError() {
    const seasonOverlay = document.getElementById("seasonGuideOverlay");
    if (!seasonOverlay || seasonOverlay.querySelector(".episode-load-error")) return;

    const notice = document.createElement("section");
    notice.className = "episode-load-error";
    notice.setAttribute("role", "alert");
    notice.innerHTML = `
      <span aria-hidden="true">!</span>
      <div>
        <strong>逐集剧情暂时没有加载成功</strong>
        <small>章节导读仍可正常使用。可能是网络瞬断，点击重试即可继续加载73集内容。</small>
      </div>
      <button type="button">重新加载逐集剧情</button>`;

    const anchor = seasonOverlay.querySelector(".season-progress-card")
      || seasonOverlay.querySelector(".season-header");
    anchor?.insertAdjacentElement("beforebegin", notice);

    notice.querySelector("button")?.addEventListener("click", event => {
      const button = event.currentTarget;
      button.disabled = true;
      button.textContent = "正在重新加载…";
      clearEpisodeLoadError();
      loadEpisodeFeatures().catch(error => console.error("逐集剧情重试失败：", error));
    });
  }

  function loadEpisodeFeatures() {
    if (episodeFeaturesPromise) return episodeFeaturesPromise;

    setEpisodeLoading(true);
    ensureStylesheet("episode-guide.css");
    ensureStylesheet("episode-overview.css");
    ensureStylesheet("episode-search.css");
    ensureStylesheet("episode-links.css");

    episodeFeaturesPromise = loadScript("episode-data.js")
      .then(() => loadScript("episode-guide.js"))
      .then(() => loadScript("episode-overview.js"))
      .then(() => loadScript("episode-search.js"))
      .then(() => loadScript("episode-links.js"))
      .then(() => {
        clearEpisodeLoadError();
        setEpisodeLoading(false);
      })
      .catch(error => {
        episodeFeaturesPromise = null;
        setEpisodeLoading(false);
        showEpisodeLoadError();
        throw error;
      });

    return episodeFeaturesPromise;
  }

  const portraitFeatures = loadScript("portraits-data.js")
    .then(() => loadScript("portraits.js"));

  const seasonFeatures = loadScript("season-cover-sprite.js")
    .then(() => loadScript("seasons-data.js"))
    .then(() => loadScript("season-media-data.js"))
    .then(() => loadScript("seasons.js"))
    .then(() => loadScript("season-details.js"))
    .then(() => {
      seasonButton()?.addEventListener("click", () => {
        loadEpisodeFeatures().catch(error => console.error("逐集剧情模块加载失败：", error));
      }, { once: true });

      if (/^#season-[1-8]-episode-\d{1,2}$/.test(location.hash)) {
        return loadEpisodeFeatures();
      }

      const preload = () => loadEpisodeFeatures()
        .catch(error => console.error("逐集剧情模块预加载失败：", error));
      if ("requestIdleCallback" in window) window.requestIdleCallback(preload, { timeout: 5000 });
      else window.setTimeout(preload, 3200);
      return null;
    });

  Promise.all([portraitFeatures, seasonFeatures])
    .catch(error => console.error("扩展模块加载失败：", error));
})();
