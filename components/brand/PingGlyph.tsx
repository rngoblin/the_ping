export function PingGlyph({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 160 130"
      className={`size-9 text-ping-black ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="butt"
      strokeLinejoin="miter"
    >
      <path d="M34 39H108V62H46V39" strokeWidth="7" />
      <path d="M34 39H46" strokeWidth="7" />
      <path d="M83 50h.1M92 50h.1" strokeWidth="8" strokeLinecap="round" />

      <path d="M34 64V76H108" strokeWidth="7" />
      <path d="M34 83H108" strokeWidth="7" />
      <path d="M34 95L108 83" strokeWidth="7" />
      <path d="M34 97H108" strokeWidth="7" />

      <path d="M34 108H108V125" strokeWidth="7" />
      <path d="M34 108V125H48V113" strokeWidth="7" />

      <path d="M112 31A20 20 0 0 1 132 51" strokeWidth="7" />
      <path d="M112 18A33 33 0 0 1 145 51" strokeWidth="7" />
      <path d="M112 6A45 45 0 0 1 157 51" strokeWidth="7" />
    </svg>
  );
}
