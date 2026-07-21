(() => {
  "use strict";

  const overlay = document.getElementById("relationshipOverlay");
  if (overlay) {
    overlay.addEventListener("pointerdown", event => event.stopPropagation());
    overlay.addEventListener("pointermove", event => event.stopPropagation());
    overlay.addEventListener("pointerup", event => event.stopPropagation());
    overlay.addEventListener("wheel", event => event.stopPropagation(), { passive: true });
  }

  function ensureStylesheet(href) {
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
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
      script.addEventListener("error", reject, { once: true });
      document.body.appendChild(script);
    });
  }

  ensureStylesheet("portraits.css");
  ensureStylesheet("seasons.css");
  ensureStylesheet("season-details.css");
  ensureStylesheet("season-navigation.css");

  let episodeFeaturesPromise = null;
  function loadEpisodeFeatures() {
    if (episodeFeaturesPromise) return episodeFeaturesPromise;
    ensureStylesheet("episode-guide.css");
    ensureStylesheet("episode-overview.css");
    ensureStylesheet("episode-search.css");
    ensureStylesheet("episode-links.css");
    episodeFeaturesPromise = loadScript("episode-data.js")
      .then(() => loadScript("episode-guide.js"))
      .then(() => loadScript("episode-overview.js"))
      .then(() => loadScript("episode-search.js"))
      .then(() => loadScript("episode-links.js"));
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
      const seasonButton = document.querySelector(".season-mode-button");
      seasonButton?.addEventListener("click", loadEpisodeFeatures, { once: true });

      if (/^#season-[1-8]-episode-\d{1,2}$/.test(location.hash)) {
        return loadEpisodeFeatures();
      }

      const preload = () => loadEpisodeFeatures().catch(error => console.error("逐集剧情模块加载失败：", error));
      if ("requestIdleCallback" in window) window.requestIdleCallback(preload, { timeout: 5000 });
      else window.setTimeout(preload, 3200);
      return null;
    });

  Promise.all([portraitFeatures, seasonFeatures])
    .catch(error => console.error("扩展模块加载失败：", error));
})();
