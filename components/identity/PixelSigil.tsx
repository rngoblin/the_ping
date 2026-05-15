import { generateSigil } from "@/utils/generateSigil";

export function PixelSigil({
  seed,
  variant = 0,
  className = "",
  title
}: {
  seed: string;
  variant?: number;
  className?: string;
  title?: string;
}) {
  const sigil = generateSigil(seed, variant);

  return (
    <svg
      viewBox="0 0 16 16"
      role={title ? "img" : "presentation"}
      aria-label={title}
      className={`pixel-sigil ${className}`}
      shapeRendering="crispEdges"
    >
      {title ? <title>{title}</title> : null}
      <rect x="0" y="0" width="16" height="16" className="fill-ping-bg/35" />
      {sigil.pixels.map((pixel) => (
        <rect key={`${pixel.x}-${pixel.y}`} x={pixel.x} y={pixel.y} width="1" height="1" className={`sigil-${pixel.tone}`} />
      ))}
    </svg>
  );
}
