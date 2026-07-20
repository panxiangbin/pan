(() => {
  "use strict";

  const overlay = document.getElementById("relationshipOverlay");
  if (!overlay) return;

  overlay.addEventListener("pointerdown", event => event.stopPropagation());
  overlay.addEventListener("pointermove", event => event.stopPropagation());
  overlay.addEventListener("pointerup", event => event.stopPropagation());
  overlay.addEventListener("wheel", event => event.stopPropagation(), { passive: true });
})();
