(() => {
  "use strict";

  const overlay = document.getElementById("seasonGuideOverlay");
  const spoilerSelect = overlay?.querySelector("#seasonSpoilerLevel");
  if (!overlay || !spoilerSelect) return;

  const styleId = "season-lock-dialog-styles";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      .season-lock-cover {
        pointer-events: none;
        user-select: none;
      }
      .season-lock-cover::after {
        content: "点击查看解锁选项";
        display: block;
        margin-top: 9px;
        color: #d6c08b;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: .04em;
      }
      .season-card.locked {
        cursor: pointer;
      }
      .season-card.locked:hover,
      .season-card.locked:focus-visible {
        opacity: .9;
        border-color: rgba(198, 168, 103, .42);
      }
      .season-lock-dialog-backdrop {
        position: fixed;
        inset: 0;
        z-index: 90;
        display: grid;
        place-items: center;
        padding: 20px;
        background: rgba(3, 7, 10, .76);
        backdrop-filter: blur(8px);
      }
      .season-lock-dialog {
        width: min(460px, 100%);
        padding: 24px;
        border: 1px solid rgba(198, 168, 103, .28);
        border-radius: 18px;
        color: #eee3c9;
        background:
          radial-gradient(circle at 100% 0%, rgba(179, 89, 60, .17), transparent 38%),
          linear-gradient(145deg, #18232a, #0d1418);
        box-shadow: 0 28px 90px rgba(0, 0, 0, .58);
      }
      .season-lock-dialog .eyebrow {
        display: block;
        margin-bottom: 8px;
      }
      .season-lock-dialog h3 {
        margin: 0 0 10px;
        color: #f3e7ca;
        font-family: Georgia, "Noto Serif SC", serif;
        font-size: 24px;
      }
      .season-lock-dialog p {
        margin: 0;
        color: #aebbbc;
        font-size: 14px;
        line-height: 1.75;
      }
      .season-lock-dialog-note {
        margin-top: 14px !important;
        padding: 10px 12px;
        border-left: 2px solid rgba(198, 168, 103, .55);
        border-radius: 0 10px 10px 0;
        background: rgba(198, 168, 103, .07);
        color: #c9bfa7 !important;
        font-size: 12px !important;
      }
      .season-lock-dialog-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 20px;
      }
      .season-lock-dialog-actions button {
        min-height: 46px;
        padding: 9px 12px;
        border: 1px solid rgba(255, 255, 255, .1);
        border-radius: 11px;
        color: #e8dfcb;
        background: rgba(255, 255, 255, .045);
        cursor: pointer;
      }
      .season-lock-dialog-actions button:hover,
      .season-lock-dialog-actions button:focus-visible {
        border-color: rgba(198, 168, 103, .35);
        background: rgba(198, 168, 103, .1);
      }
      .season-lock-dialog-actions [data-season-unlock-confirm] {
        border-color: rgba(198, 168, 103, .34);
        color: #fff0c9;
        background: rgba(198, 168, 103, .14);
      }
      @media (max-width: 520px) {
        .season-lock-dialog-backdrop { padding: 12px; }
        .season-lock-dialog { padding: 19px; border-radius: 15px; }
        .season-lock-dialog h3 { font-size: 21px; }
        .season-lock-dialog-actions { grid-template-columns: 1fr; }
        .season-lock-dialog-actions button { min-height: 50px; font-size: 15px; }
      }
      @media (prefers-reduced-motion: reduce) {
        .season-lock-dialog-backdrop { backdrop-filter: none; }
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
    if (!seasonNumber || seasonNumber <= currentLevel) return;

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
        <div class="season-lock-dialog-actions">
          <button type="button" data-season-unlock-cancel>继续保护</button>
          <button type="button" data-season-unlock-confirm>解锁到第${seasonNumber}季</button>
        </div>
      </section>`;

    overlay.appendChild(backdrop);

    backdrop.addEventListener("click", event => {
      if (event.target === backdrop) closeDialog();
    });
    backdrop.querySelector("[data-season-unlock-cancel]")?.addEventListener("click", closeDialog);
    backdrop.querySelector("[data-season-unlock-confirm]")?.addEventListener("click", () => {
      localStorage.setItem("seven-kingdoms-spoiler-season", String(seasonNumber));
      spoilerSelect.value = String(seasonNumber);
      spoilerSelect.dispatchEvent(new Event("change", { bubbles: true }));
      closeDialog();

      window.setTimeout(() => {
        const unlockedCard = overlay.querySelector(`.season-card[data-season-number="${seasonNumber}"]`);
        unlockedCard?.focus({ preventScroll: true });
        unlockedCard?.click();
      }, 90);
    });

    window.setTimeout(() => {
      backdrop.querySelector("[data-season-unlock-confirm]")?.focus();
    }, 0);
  }

  overlay.addEventListener("click", event => {
    const card = event.target.closest?.(".season-card.locked");
    if (!card || !overlay.contains(card)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openLockedSeasonDialog(card);
  }, true);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && overlay.querySelector("[data-season-lock-dialog]")) {
      event.preventDefault();
      closeDialog();
    }
  });
})();