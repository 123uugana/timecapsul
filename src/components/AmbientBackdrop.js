export function AmbientBackdrop() {
  return (
    <div className="ambient-backdrop" aria-hidden="true">
      <div className="ambient-aurora ambient-aurora-a" />
      <div className="ambient-aurora ambient-aurora-b" />
      <div className="starfield" />
      <div className="film-grain" />
      <div className="scanline" />
    </div>
  );
}
