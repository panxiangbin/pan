(() => {
  "use strict";

  const seasons = window.SEASON_GUIDE_DATA || [];
  const overlay = document.getElementById("seasonGuideOverlay");
  const spoilerSelect = overlay?.querySelector("#seasonSpoilerLevel");
  const sidePanel = document.getElementById("sidePanel");
  const panelType = document.getElementById("panelType");
  const panelContent = document.getElementById("panelContent");
  const mapStatus = document.getElementById("mapStatus");
  const modebar = document.querySelector(".modebar");
  const closePanelButton = document.getElementById("closePanel");

  if (!overlay || !spoilerSelect || !sidePanel || !panelType || !panelContent || !seasons.length) return;

  const COMPLETED_KEY = "seven-kingdoms-completed-seasons";

  function esc(value = "") {
    return String(value).replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[char]));
  }

  function readCompleted() {
    try {
      const values = JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]");
      return new Set(Array.isArray(values) ? values.map(Number).filter(value => value >= 1 && value <= 8) : []);
    } catch {
      return new Set();
    }
  }

  function saveCompleted(values) {
    localStorage.setItem(COMPLETED_KEY, JSON.stringify([...values].sort((a, b) => a - b)));
  }

  function locationButtons(item) {
    return item.locations.map(placeId => {
      const place = window.WORLD_DATA?.locations?.find(location => location.id === placeId);
      if (!place) return "";
      return `<button class="panel-button" data-season-controller-place="${esc(place.id)}" type="button"><span>${esc(place.name)} · ${esc(place.region)}</span><span>⌖</span></button>`;
    }).join("");
  }

  function showDrawer() {
    sidePanel.classList.add("open", "season-detail-open");
    sidePanel.setAttribute("aria-live", "polite");
    window.setTimeout(() => panelType.focus?.({ preventScroll: true }), 0);
  }

  function closeDrawer() {
    sidePanel.classList.remove("open", "season-detail-open");
    sidePanel.removeAttribute("aria-live");
  }

  function updateCardCompleted(seasonNumber, completed) {
    const card = overlay.querySelector(`.season-card[data-season-number="${seasonNumber}"]`);
    if (!card) return;
    card.classList.toggle("completed", completed);
    const state = card.querySelector(".season-state");
    if (state) {
      state.classList.toggle("done", completed);
      const season = seasons.find(item => item.season === seasonNumber);
      state.textContent = completed ? "✓ 已看完" : `${season?.episodes || ""}集`;
    }
  }

  function bindDetailActions(seasonNumber) {
    panelContent.querySelectorAll("[data-season-controller-open]").forEach(button => {
      button.addEventListener("click", () => openSeason(Number(button.dataset.seasonControllerOpen)));
    });

    panelContent.querySelectorAll("[data-season-controller-place]").forEach(button => {
      button.addEventListener("click", () => {
        closeDrawer();
        modebar?.querySelector('[data-mode="places"]')?.click();
        window.setTimeout(() => {
          document.querySelector(`.location-marker[data-location-id="${button.dataset.seasonControllerPlace}"]`)
            ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        }, 130);
      });
    });

    panelContent.querySelector("[data-season-controller-complete]")?.addEventListener("click", () => {
      const completed = readCompleted();
      const next = !completed.has(seasonNumber);
      if (next) completed.add(seasonNumber);
      else completed.delete(seasonNumber);
      saveCompleted(completed);
      updateCardCompleted(seasonNumber, next);
      openSeason(seasonNumber);
    });

    panelContent.querySelector("[data-season-controller-close]")?.addEventListener("click", closeDrawer);
  }

  function openSeason(seasonNumber) {
    const item = seasons.find(season => season.season === Number(seasonNumber));
    if (!item) return;

    const currentLevel = Number(spoilerSelect.value) || 1;
    if (item.season > currentLevel) {
      const card = overlay.querySelector(`.season-card[data-season-number="${item.season}"]`);
      if (card) openLockedSeasonDialog(card);
      return;
    }

    const completed = readCompleted();
    const isCompleted = completed.has(item.season);
    const previous = seasons.find(season => season.season === item.season - 1);
    const next = seasons.find(season => season.season === item.season + 1);

    panelType.textContent = `第${item.season}季剧情`;
    panelType.setAttribute("tabindex", "-1");
    panelContent.innerHTML = `
      <article class="hero-card season-detail-hero" data-mark="${item.season}">
        <span class="eyebrow">第${item.season}季 · ${item.episodes}集</span>
        <h1>${esc(item.title)}</h1>
        <p>${esc(item.subtitle)}</p>
        <div class="meta-row"><span class="meta-chip">${esc(item.tone)}</span><span class="meta-chip">${item.keyEvents.length}个关键事件</span></div>
      </article>
      <section class="info-section"><h3>本季概述</h3><p>${esc(item.summary)}</p></section>
      <section class="info-section"><h3>关键事件</h3><ol>${item.keyEvents.map(event => `<li>${esc(event)}</li>`).join("")}</ol></section>
      <section class="info-section"><h3>核心人物</h3><div class="season-character-chips">${item.characters.map(name => `<span>${esc(name)}</span>`).join("")}</div></section>
      <section class="info-section"><h3>地图上的本季</h3><div class="action-list">${locationButtons(item)}</div></section>
      <section class="info-section"><h3>这一季真正讲了什么</h3><p>${esc(item.theme)}</p></section>
      <section class="info-section"><div class="season-spoiler-box"><strong>核心结果</strong><p>${esc(item.spoiler)}</p></div></section>
      <section class="info-section">
        <div class="season-detail-actions">
          <button class="panel-button season-complete-button${isCompleted ? " completed" : ""}" data-season-controller-complete type="button"><span>${isCompleted ? "已标记看完" : "标记这一季已看完"}</span><span>${isCompleted ? "✓" : "+"}</span></button>
          <button class="panel-button" data-season-controller-close type="button"><span>关闭剧情详情</span><span>×</span></button>
          ${previous ? `<button class="panel-button" data-season-controller-open="${previous.season}" type="button"><span>上一季：${esc(previous.title)}</span><span>←</span></button>` : ""}
          ${next ? `<button class="panel-button" data-season-controller-open="${next.season}" type="button"><span>下一季：${esc(next.title)}</span><span>→</span></button>` : ""}
        </div>
      </section>`;

    bindDetailActions(item.season);
    showDrawer();
    mapStatus && (mapStatus.textContent = `第${item.season}季 · ${item.title}`);
    history.replaceState(null, "", `#season-${item.season}`);

    overlay.querySelectorAll(".season-card").forEach(card => {
      const selected = Number(card.dataset.seasonNumber) === item.season;
      card.classList.toggle("is-active-season", selected);
      card.setAttribute("aria-current", selected ? "true" : "false");
    });
  }

  const styleId = "season-lock-dialog-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .season-lock-cover { pointer-events: none; user-select: none; }
      .season-lock-cover::after { content: "点击查看解锁选项"; display: block; margin-top: 9px; color: #d6c08b; font-size: 11px; font-weight: 700; letter-spacing: .04em; }
      .season-card { touch-action: manipulation; }
      .season-card.locked { cursor: pointer; }
      .season-card.is-active-season { border-color: rgba(198,168,103,.7); box-shadow: 0 0 0 2px rgba(198,168,103,.14), 0 14px 34px rgba(0,0,0,.28); }
      .season-card.locked:hover, .season-card.locked:focus-visible { opacity: .9; border-color: rgba(198,168,103,.42); }
      .season-lock-dialog-backdrop { position: fixed; inset: 0; z-index: 130; display: grid; place-items: center; padding: 20px; background: rgba(3,7,10,.76); backdrop-filter: blur(8px); }
      .season-lock-dialog { width: min(460px,100%); padding: 24px; border: 1px solid rgba(198,168,103,.28); border-radius: 18px; color: #eee3c9; background: radial-gradient(circle at 100% 0%,rgba(179,89,60,.17),transparent 38%),linear-gradient(145deg,#18232a,#0d1418); box-shadow: 0 28px 90px rgba(0,0,0,.58); }
      .season-lock-dialog .eyebrow { display:block; margin-bottom:8px; }
      .season-lock-dialog h3 { margin:0 0 10px; color:#f3e7ca; font-family:Georgia,"Noto Serif SC",serif; font-size:24px; }
      .season-lock-dialog p { margin:0; color:#aebbbc; font-size:14px; line-height:1.75; }
      .season-lock-dialog-note { margin-top:14px!important; padding:10px 12px; border-left:2px solid rgba(198,168,103,.55); border-radius:0 10px 10px 0; background:rgba(198,168,103,.07); color:#c9bfa7!important; font-size:12px!important; }
      .season-lock-dialog-actions { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:20px; }
      .season-lock-dialog-actions button { min-height:46px; padding:9px 12px; border:1px solid rgba(255,255,255,.1); border-radius:11px; color:#e8dfcb; background:rgba(255,255,255,.045); cursor:pointer; }
      .season-lock-dialog-actions button:hover, .season-lock-dialog-actions button:focus-visible { border-color:rgba(198,168,103,.35); background:rgba(198,168,103,.1); }
      .season-lock-dialog-actions [data-season-unlock-confirm] { border-color:rgba(198,168,103,.34); color:#fff0c9; background:rgba(198,168,103,.14); }
      @media (min-width:821px) {
        .side-panel.season-detail-open { position:fixed; top:132px; right:16px; bottom:16px; z-index:120; width:min(520px,44vw); max-height:none; padding:18px 20px 28px; border:1px solid rgba(198,168,103,.24); border-radius:18px; box-shadow:0 24px 80px rgba(0,0,0,.62); }
        .side-panel.season-detail-open #closePanel { display:grid!important; place-items:center; width:36px; height:36px; border:1px solid rgba(255,255,255,.1); border-radius:10px; background:rgba(255,255,255,.055); cursor:pointer; }
      }
      @media (max-width:520px) {
        .season-lock-dialog-backdrop { padding:12px; }
        .season-lock-dialog { padding:19px; border-radius:15px; }
        .season-lock-dialog h3 { font-size:21px; }
        .season-lock-dialog-actions { grid-template-columns:1fr; }
        .season-lock-dialog-actions button { min-height:50px; font-size:15px; }
      }
    `;
    document.head.appendChild(style);
  }

  let lastFocused = null;

  function closeDialog() {
    const backdrop = overlay.querySelector("[data-season-lock-dialog]");
    if (!backdrop) return;
    backdrop.remove();
    if (lastFocused?.isConnected) lastFocused.focus({ preventScroll: true });
    lastFocused = null;
  }

  function openLockedSeasonDialog(card) {
    const seasonNumber = Number(card.dataset.seasonNumber);
    const currentLevel = Number(spoilerSelect.value) || 1;
    if (!seasonNumber || seasonNumber <= currentLevel) {
      openSeason(seasonNumber);
      return;
    }

    closeDialog();
    lastFocused = card;
    const backdrop = document.createElement("div");
    backdrop.className = "season-lock-dialog-backdrop";
    backdrop.dataset.seasonLockDialog = "true";
    backdrop.innerHTML = `
      <section class="season-lock-dialog" role="dialog" aria-modal="true" aria-labelledby="seasonLockTitle" aria-describedby="seasonLockDescription">
        <span class="eyebrow">Spoiler Protection</span>
        <h3 id="seasonLockTitle">第${seasonNumber}季仍在剧透保护中</h3>
        <p id="seasonLockDescription">你目前设置为“看到第${currentLevel}季”。为了避免提前看到人物命运、战争结果和关键反转，这一季暂时被遮挡。</p>
        <p class="season-lock-dialog-note">解锁后会立即打开第${seasonNumber}季剧情，并把剧透保护范围同步调整到这一季。</p>
        <div class="season-lock-dialog-actions"><button type="button" data-season-unlock-cancel>继续保护</button><button type="button" data-season-unlock-confirm>解锁到第${seasonNumber}季</button></div>
      </section>`;
    overlay.appendChild(backdrop);
    backdrop.addEventListener("click", event => { if (event.target === backdrop) closeDialog(); });
    backdrop.querySelector("[data-season-unlock-cancel]")?.addEventListener("click", closeDialog);
    backdrop.querySelector("[data-season-unlock-confirm]")?.addEventListener("click", () => {
      localStorage.setItem("seven-kingdoms-spoiler-season", String(seasonNumber));
      spoilerSelect.value = String(seasonNumber);
      spoilerSelect.dispatchEvent(new Event("change", { bubbles: true }));
      closeDialog();
      window.setTimeout(() => openSeason(seasonNumber), 80);
    });
    window.setTimeout(() => backdrop.querySelector("[data-season-unlock-confirm]")?.focus(), 0);
  }

  overlay.addEventListener("click", event => {
    const card = event.target.closest?.(".season-card[data-season-number]");
    if (!card || !overlay.contains(card)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const seasonNumber = Number(card.dataset.seasonNumber);
    if (card.classList.contains("locked") || seasonNumber > (Number(spoilerSelect.value) || 1)) openLockedSeasonDialog(card);
    else openSeason(seasonNumber);
  }, true);

  closePanelButton?.addEventListener("click", closeDrawer, true);
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (overlay.querySelector("[data-season-lock-dialog]")) {
      event.preventDefault();
      closeDialog();
    } else if (sidePanel.classList.contains("season-detail-open")) {
      event.preventDefault();
      closeDrawer();
    }
  });

  window.SEASON_CARD_CONTROLLER = { open: openSeason, close: closeDrawer };
})();