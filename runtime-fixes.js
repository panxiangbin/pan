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
  loadScript("portraits-data.js")
    .then(() => loadScript("portraits.js"))
    .catch(error => console.error("人物剧照模块加载失败：", error));
})();
