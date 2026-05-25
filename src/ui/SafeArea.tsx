/**
 * Réserve l'espace de la safe-area haute du device (notch / barre de statut).
 * Fallback à 12 px pour laisser un minimum de respiration sur desktop.
 */
export function TopSpacer() {
  return (
    <div
      className="shrink-0"
      style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)' }}
    />
  );
}
