// Tiny hand-drawn-style SVG doodles. Fill = currentColor, outline = soft ink.
const svg = (children, viewBox = "0 0 24 24") =>
  function Doodle({ className = "", style, title }) {
    return (
      <svg
        viewBox={viewBox}
        className={`doodle ${className}`}
        style={style}
        aria-hidden={title ? undefined : true}
        role={title ? "img" : undefined}
        focusable="false"
      >
        {title && <title>{title}</title>}
        {children}
      </svg>
    );
  };

const petals = [0, 72, 144, 216, 288];

export const Heart = svg(
  <path d="M12 21C6.5 16.8 2.5 13.2 2.5 8.6 2.5 5.7 4.8 3.5 7.6 3.5c1.8 0 3.4 1 4.4 2.6 1-1.6 2.6-2.6 4.4-2.6 2.8 0 5.1 2.2 5.1 5.1 0 4.6-4 8.2-9.5 12.4z" />
);

export const Star = svg(
  <path d="M12 2.8l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z" />
);

export const Sparkle = svg(
  <path d="M12 2c.8 5.5 4.5 9.2 10 10-5.5.8-9.2 4.5-10 10-.8-5.5-4.5-9.2-10-10 5.5-.8 9.2-4.5 10-10z" />
);

export const Flower = svg(
  <>
    {petals.map((a) => (
      <ellipse key={a} cx="12" cy="6.6" rx="3.5" ry="4.4" transform={`rotate(${a} 12 12)`} />
    ))}
    <circle cx="12" cy="12" r="2.9" className="doodle-center" />
  </>
);

export const Bow = svg(
  <>
    <path d="M12 11C8 6 3 6.2 3.5 10.5 4 14 8 13.5 12 11z" />
    <path d="M12 11c4-5 9-4.8 8.5-.5-.5 3.5-4.5 3-8.5.5z" />
    <path d="M11.2 12 8 20.2l2.1-.6 1.6 1.4.5-9z" />
    <path d="m12.8 12 3.2 8.2-2.1-.6-1.6 1.4-.5-9z" />
    <circle cx="12" cy="11.2" r="1.9" />
  </>
);

export const Cloud = svg(
  <path d="M7 18h10.5a4 4 0 0 0 .6-7.95A5.5 5.5 0 0 0 7.6 9.2 4.4 4.4 0 0 0 7 18z" />
);

export const Petal = svg(<path d="M12 3c5 4 5 12 0 18-5-6-5-14 0-18z" />);

export const Paperclip = svg(
  <path
    className="doodle-line"
    d="M8 7v9a4 4 0 0 0 8 0V5.5a2.5 2.5 0 0 0-5 0V15a1 1 0 0 0 2 0V7"
  />
);

export const MapPin = svg(
  <>
    <path d="M12 21.5s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z" />
    <circle cx="12" cy="10.5" r="2.2" className="doodle-center" />
  </>
);

export const DOODLES = { heart: Heart, star: Star, sparkle: Sparkle, flower: Flower, bow: Bow, cloud: Cloud, petal: Petal };

/** A little wrapped bouquet for the last page. */
export function Bouquet({ className = "" }) {
  const blooms = [
    { x: 30, y: 34, c: "var(--pink)", s: 1.25 },
    { x: 58, y: 20, c: "var(--rose)", s: 1.4 },
    { x: 84, y: 36, c: "var(--lavender)", s: 1.2 },
    { x: 44, y: 54, c: "var(--peach)", s: 1.1 },
    { x: 72, y: 56, c: "var(--butter)", s: 1.15 },
  ];
  return (
    <svg viewBox="0 0 120 150" className={`doodle bouquet ${className}`} aria-hidden="true" focusable="false">
      <g className="doodle-line" strokeWidth="1.6">
        {blooms.map((b) => (
          <path key={b.x} d={`M60 112 Q${(b.x + 60) / 2} ${b.y + 40} ${b.x} ${b.y}`} />
        ))}
      </g>
      <g style={{ fill: "var(--leaf)" }}>
        <ellipse cx="38" cy="78" rx="10" ry="4.5" transform="rotate(-35 38 78)" />
        <ellipse cx="84" cy="80" rx="10" ry="4.5" transform="rotate(35 84 80)" />
        <ellipse cx="22" cy="54" rx="8" ry="3.6" transform="rotate(-60 22 54)" />
        <ellipse cx="98" cy="58" rx="8" ry="3.6" transform="rotate(60 98 58)" />
      </g>
      {blooms.map((b) => (
        <g key={b.x} transform={`translate(${b.x - 12 * b.s} ${b.y - 12 * b.s}) scale(${b.s})`} style={{ color: b.c }}>
          {petals.map((a) => (
            <ellipse key={a} cx="12" cy="6.6" rx="3.5" ry="4.4" transform={`rotate(${a} 12 12)`} />
          ))}
          <circle cx="12" cy="12" r="2.9" className="doodle-center" />
        </g>
      ))}
      <path d="M28 82h64l-26 62h-12z" style={{ fill: "var(--paper)" }} />
      <path d="M28 82h64l-26 62h-12z" style={{ fill: "var(--pink)" }} opacity=".35" />
      <path d="M44 84l14 58M76 84l-14 58" className="doodle-line" opacity=".4" />
      <g transform="translate(46 92) scale(1.15)" style={{ color: "var(--rose)" }}>
        <path d="M12 11C8 6 3 6.2 3.5 10.5 4 14 8 13.5 12 11z" />
        <path d="M12 11c4-5 9-4.8 8.5-.5-.5 3.5-4.5 3-8.5.5z" />
        <path d="M11.2 12 8 20.2l2.1-.6 1.6 1.4.5-9z" />
        <path d="m12.8 12 3.2 8.2-2.1-.6-1.6 1.4-.5-9z" />
        <circle cx="12" cy="11.2" r="1.9" />
      </g>
    </svg>
  );
}
