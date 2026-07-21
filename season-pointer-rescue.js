(() => {
  "use strict";

  const overlay = document.getElementById("seasonGuideOverlay");
  if (!overlay) return;

  const style = document.createElement("style");
  style.textContent = `
    #seasonGrid .season-card,
    #seasonGrid .season-card * {
      -webkit-user-select: none !important;
      user-select: none !important;
    }
    #seasonGrid .season-card {
      touch-action: manipulation;
    }
  `;
  document.head.appendChild(style);

  let pressedCard = null;
  let startX = 0;
  let startY = 0;
  let pointerId = null;
  let lastActivation = 0;

  function findCard(target) {
    const card = target?.closest?.(".season-card[data-season-number]");
    return card && overlay.contains(card) ? card : null;
  }

  function activate(card) {
    const seasonNumber = Number(card?.dataset.seasonNumber);
    if (!seasonNumber) return;
    lastActivation = Date.now();
    window.SEASON_CARD_CONTROLLER?.open(seasonNumber);
  }

  overlay.addEventListener("pointerdown", event => {
    const card = findCard(event.target);
    if (!card || event.button > 0) return;
    pressedCard = card;
    startX = event.clientX;
    startY = event.clientY;
    pointerId = event.pointerId;
    event.preventDefault();
    event.stopPropagation();
  }, true);

  overlay.addEventListener("pointerup", event => {
    const card = findCard(event.target);
    if (!pressedCard || pointerId !== event.pointerId) return;
    const moved = Math.hypot(event.clientX - startX, event.clientY - startY);
    const shouldOpen = card === pressedCard && moved < 14;
    pressedCard = null;
    pointerId = null;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (shouldOpen) activate(card);
  }, true);

  overlay.addEventListener("pointercancel", () => {
    pressedCard = null;
    pointerId = null;
  }, true);

  overlay.addEventListener("click", event => {
    const card = findCard(event.target);
    if (!card || Date.now() - lastActivation < 500) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    activate(card);
  }, true);
})();