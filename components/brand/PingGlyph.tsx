export function PingGlyph({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1024 1024"
      className={`ping-glyph size-9 text-ping-black ${className}`}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g strokeWidth="26">
        <path d="M218 324H706V455H286V338" />
        <path d="M552 377h1M611 377h1" strokeWidth="34" />

        <path d="M214 430V562H706" />
        <path d="M214 510H706" />
        <path d="M214 562H704" />

        <path d="M214 656L706 584" />
        <path d="M214 657H706" />

        <path d="M214 735H706V869" />
        <path d="M214 735V869H306V785" />

        <path d="M723 262A166 166 0 0 1 880 356" />
        <path d="M721 207A225 225 0 0 1 935 356" />
        <path d="M729 146A290 290 0 0 1 1000 356" />
      </g>
    </svg>
  );
}
