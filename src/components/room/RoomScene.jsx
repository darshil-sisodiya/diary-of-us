import { useEffect, useId, useState } from "react";
import { allPhotos } from "../../utils/content.js";

/* ==========================================================================
   The room: an isometric "dollhouse" drawn in SVG.
   P(x, y, z) maps room coordinates to the screen:
     x runs along the right wall (0 → WX), y along the left wall (0 → WY),
     z is height. Wall and floor decorations are drawn flat, then mapped onto
     their surface with an affine matrix (M_LEFT, M_RIGHT, onFloor, onFaceY…).
   ========================================================================== */
const BX = 440, BY = 380, WX = 600, WY = 460, H = 360, T = 16, F = 26;
const P = (x, y, z = 0) => [BX + 0.866 * (x - y), BY + 0.5 * (x + y) - z];
const pts = (...ps) => ps.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");
const M_LEFT = `matrix(0.866 -0.5 0 1 ${BX - 0.866 * WY} ${BY + 0.5 * WY})`; // u = WY - y, v = -z
const M_RIGHT = `matrix(0.866 0.5 0 1 ${BX} ${BY})`; // u = x, v = -z
const onFloor = (z = 0) => `matrix(0.866 0.5 -0.866 0.5 ${BX} ${BY - z})`;
const onFaceY = (c) => `matrix(0.866 0.5 0 1 ${BX - 0.866 * c} ${BY + 0.5 * c})`; // plane y = c, u = x
const onFaceX = (c) => `matrix(-0.866 0.5 0 1 ${BX + 0.866 * c} ${BY + 0.5 * c})`; // plane x = c, u = y

/* Deep, contrasty pinks with white furniture and a few pops of gold, mint and green. */
const C = {
  wallL: "#b8285f",
  wallR: "#cf3a76",
  paperL: "#c93a72",
  paperR: "#dd4f88",
  wainL: "#ea6c9f",
  wainR: "#f584b2",
  wainLine: "#d1578a",
  rail: "#ffe6f0",
  top: "#ffd3e4",
  endL: "#e0679a",
  endR: "#bb4479",
  tileA: "#f7a6c6",
  tileB: "#e9739f",
  slabL: "#b03a6c",
  slabR: "#8f2a57",
  white: "#fff5f9",
  hot: "#ff3f8e",
  berry: "#d81b6a",
  blush: "#ffc3da",
  gold: "#ffc94a",
  mint: "#5fdcc0",
  leaf: "#34b874",
  leafDark: "#1f9459",
  pot: "#ffe8f0",
  lens: "#3a2a4f",
  neon: "#ff4fb2",
  string: "#ffd27a",
  lavender: "#b58cff",
  cat: "#ffc37c",
  catStripe: "#f09a45",
  bulbs: ["#ffe27a", "#ffffff", "#ffb3d6", "#fff3b0", "#ffd0f0"],
  seals: { rose: "#ff3f8e", lavender: "#9a6bff", butter: "#ffb62e", blue: "#3ea8ff", peach: "#ff7d4f" },
};

const mix = (hex, t, to = "#ffffff") => {
  const a = parseInt(hex.slice(1), 16);
  const b = parseInt(to.slice(1), 16);
  const ch = (s) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};
const dark = (c, t = 0.2) => mix(c, t, "#4a0f2e");
const heartPath = "M12 21C6.5 16.8 2.5 13.2 2.5 8.6 2.5 5.7 4.8 3.5 7.6 3.5c1.8 0 3.4 1 4.4 2.6 1-1.6 2.6-2.6 4.4-2.6 2.8 0 5.1 2.2 5.1 5.1 0 4.6-4 8.2-9.5 12.4z";
const Heart = ({ x, y, s = 1, fill, ...rest }) => (
  <path d={heartPath} fill={fill} transform={`translate(${x} ${y}) scale(${s}) translate(-12 -12)`} {...rest} />
);

/** Shaded box with a soft top-edge highlight. */
function Box({ x, y, z = 0, dx, dy, dz, c, top, left, right, rim = true }) {
  const A = P(x, y + dy, z + dz), B = P(x + dx, y + dy, z + dz), Cc = P(x + dx, y, z + dz);
  const t = pts(P(x, y, z + dz), Cc, B, A);
  const l = pts(P(x, y + dy, z), P(x + dx, y + dy, z), B, A);
  const r = pts(P(x + dx, y, z), P(x + dx, y + dy, z), B, Cc);
  return (
    <g>
      <polygon points={l} fill={left || c} />
      <polygon points={l} fill="url(#room-face)" />
      <polygon points={r} fill={right || dark(c, 0.22)} />
      <polygon points={r} fill="url(#room-face)" />
      <polygon points={t} fill={top || mix(c, 0.25)} />
      {rim && <polyline points={pts(A, B, Cc)} fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.4" strokeLinejoin="round" />}
    </g>
  );
}

/** Glossy cylinder standing at (x, y, z). */
function Cyl({ x, y, z = 0, r, h, c, top }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [cx, cy] = P(x, y, z);
  const rx = r * 1.2247, ry = r * 0.7071;
  return (
    <g>
      <defs>
        <linearGradient id={`cy${id}`} x1="0" x2="1">
          <stop offset="0" stopColor={mix(c, 0.3)} />
          <stop offset="0.45" stopColor={c} />
          <stop offset="1" stopColor={dark(c, 0.3)} />
        </linearGradient>
      </defs>
      <path d={`M${cx - rx} ${cy}V${cy - h}H${cx + rx}V${cy}A${rx} ${ry} 0 0 1 ${cx - rx} ${cy}Z`} fill={`url(#cy${id})`} />
      <ellipse cx={cx} cy={cy - h} rx={rx} ry={ry} fill={top || mix(c, 0.3)} />
      <ellipse cx={cx - rx * 0.25} cy={cy - h - ry * 0.15} rx={rx * 0.45} ry={ry * 0.35} fill="#fff" opacity="0.35" />
    </g>
  );
}

function Obj({ id, label, onOpen, className = "", children }) {
  return (
    <g
      className={`obj ${className}`}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={() => onOpen(id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(id);
        }
      }}
    >
      {children}
    </g>
  );
}

function Tag({ x, y, text: label, r = -3 }) {
  if (!label) return null;
  const w = 30 + label.length * 10.5;
  return (
    <g className="tag" transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r})`}>
      <g className="tag-body">
        <rect x={-w / 2} y={-18} width={w} height={36} rx={18} />
        <text y={7} textAnchor="middle">
          {label}
        </text>
      </g>
    </g>
  );
}

/** A string of warm fairy lights along the top of a wall (flat wall coords). */
function FairyLights({ length, v = -340 }) {
  const n = Math.round(length / 115);
  const hooks = Array.from({ length: n + 1 }, (_, i) => (i * length) / n);
  const wire = hooks.slice(1).map((b, i) => `Q${(hooks[i] + b) / 2} ${v + 36} ${b} ${v}`).join(" ");
  const bulbs = [];
  hooks.slice(1).forEach((b, i) => {
    const a = hooks[i];
    [0.2, 0.4, 0.6, 0.8].forEach((t, k) => bulbs.push({ u: a + (b - a) * t, v: v + 72 * t * (1 - t), c: C.bulbs[(i * 4 + k) % 5], d: (i * 4 + k) * -0.41 }));
  });
  return (
    <g>
      <path d={`M0 ${v} ${wire}`} fill="none" stroke="#5b1840" strokeWidth="1.8" />
      {bulbs.map((b, i) => (
        <g key={i} className="bulb" style={{ animationDelay: `${b.d}s` }}>
          <circle cx={b.u} cy={b.v + 8} r="13" fill={b.c} opacity="0.55" filter="url(#room-glow)" />
          <rect x={b.u - 2.4} y={b.v} width="4.8" height="4.4" rx="1" fill="#5b1840" />
          <ellipse cx={b.u} cy={b.v + 9} rx="4.6" ry="6" fill={b.c} />
        </g>
      ))}
    </g>
  );
}

function Cat({ awake, says, onPet }) {
  const [cx, cy] = P(156, 352, 76);
  return (
    <g
      className={`room-cat ${awake ? "is-awake" : ""}`}
      role="button"
      tabIndex={0}
      aria-label="pet the cat"
      onClick={onPet}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onPet())}
      transform={`translate(${cx - 50} ${cy - 56}) scale(1.02)`}
    >
      <ellipse cx="54" cy="60" rx="46" ry="9" fill="#4a0f2e" opacity="0.18" />
      <g className="cat-body">
        <path d="M86 50c9-2 11-13 4-17" fill="none" stroke={C.catStripe} strokeWidth="8" strokeLinecap="round" />
        <ellipse cx="58" cy="44" rx="34" ry="17" fill={C.cat} />
        <ellipse cx="58" cy="37" rx="25" ry="7" fill="#fff" opacity="0.3" />
        <path d="M46 31c2 5 2 10 0 14M58 29c2 6 2 11 0 16M70 31c2 5 2 9 0 13" fill="none" stroke={C.catStripe} strokeWidth="2.8" strokeLinecap="round" />
        <path d="M14 30l3-15 10 9M35 24l7-13 3 14" fill={C.cat} />
        <path d="M17 21l1.5-5 4.5 4.5M39 17l3-4 1 5" fill="#ff8fbb" />
        <circle cx="28" cy="38" r="16" fill={C.cat} />
        <g className="cat-eyes-closed" fill="none" stroke="#4a2030" strokeWidth="1.9" strokeLinecap="round">
          <path d="M19 37q3 3 6 0M31 37q3 3 6 0" />
        </g>
        <g className="cat-eyes-open" fill="#2e1a26">
          <circle cx="22" cy="36" r="2.9" />
          <circle cx="34" cy="36" r="2.9" />
          <circle cx="23" cy="35" r="0.9" fill="#fff" />
          <circle cx="35" cy="35" r="0.9" fill="#fff" />
        </g>
        <path d="M26.5 41l1.8 1.8 1.8-1.8z" fill="#ff3f8e" />
        <circle cx="17" cy="43" r="3.3" fill="#ff8fbb" opacity="0.85" />
        <circle cx="39" cy="43" r="3.3" fill="#ff8fbb" opacity="0.85" />
        <path d="M24 51c-6 0-8 4-4 5h12c4-1 2-5-4-5z" fill={C.cat} />
      </g>
      {!awake && (
        <g className="cat-z" fill="#fff">
          <text x="6" y="6">z</text>
          <text x="17" y="-6">z</text>
        </g>
      )}
      {awake && says && (
        <g className="cat-bubble">
          <rect x="-8" y="-34" width={34 + says.length * 10} height="32" rx="16" />
          <text x={9 + (says.length * 10) / 2} y="-11" textAnchor="middle">
            {says}
          </text>
        </g>
      )}
    </g>
  );
}

export default function RoomScene({ sky, available, labels, notes, notesHeading, onOpen, catOn, catSays }) {
  const has = (id) => available.includes(id);
  const [catAwake, setCatAwake] = useState(false);
  const [broken, setBroken] = useState(() => new Set());
  useEffect(() => {
    if (!catAwake) return;
    const t = setTimeout(() => setCatAwake(false), 2600);
    return () => clearTimeout(t);
  }, [catAwake]);

  const photos = allPhotos();
  const photo = (i) => photos[i % Math.max(1, photos.length)];
  const markBroken = (src) => setBroken((s) => new Set(s).add(src));
  const pic = (p, x, y, w, h) =>
    p && !broken.has(p.src) ? (
      <image href={p.src} x={x} y={y} width={w} height={h} preserveAspectRatio="xMidYMid slice" onError={() => markBroken(p.src)} />
    ) : null;

  // three envelopes on a string, near the back corner of the right wall
  const lineV = (u) => -304 + 56 * ((u - 8) / 240) * (1 - (u - 8) / 240);
  const notePos = [46, 128, 210];

  return (
    <svg viewBox="0 -6 1000 960" className={`room-svg sky-${sky}`} role="group" aria-label="our room">
      <defs>
        <linearGradient id="room-face" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#4a0f2e" stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id="room-ceilingshade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a0624" stopOpacity="0.45" />
          <stop offset="0.45" stopColor="#3a0624" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="room-aoR" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3a0624" stopOpacity="0.35" />
          <stop offset="1" stopColor="#3a0624" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="room-aoL" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#3a0624" stopOpacity="0.28" />
          <stop offset="1" stopColor="#3a0624" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="room-floorAO" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a0f2e" stopOpacity="0.35" />
          <stop offset="1" stopColor="#4a0f2e" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="room-floorAOy" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4a0f2e" stopOpacity="0.3" />
          <stop offset="1" stopColor="#4a0f2e" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="room-gloss" cx="0.3" cy="0.25" r="0.75">
          <stop offset="0" stopColor="#fff" stopOpacity="0.4" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="room-backglow" cx="0.5" cy="0.55" r="0.5">
          <stop offset="0" stopColor="#ff4f9a" stopOpacity="0.28" />
          <stop offset="1" stopColor="#ff4f9a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="room-notesglow">
          <stop offset="0" stopColor="#fff0f7" stopOpacity="0.85" />
          <stop offset="0.55" stopColor="#ffb3d6" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ff9cc8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="room-lampglow">
          <stop offset="0" stopColor="#fff2b5" stopOpacity="0.95" />
          <stop offset="1" stopColor="#fff2b5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="room-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: "var(--sky-top)" }} />
          <stop offset="1" style={{ stopColor: "var(--sky-bottom)" }} />
        </linearGradient>
        <linearGradient id="room-curtain" x1="0" x2="1">
          <stop offset="0" stopColor="#ffd6e7" stopOpacity="0.95" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffd6e7" stopOpacity="0.95" />
        </linearGradient>
        <pattern id="room-heartsL" width="46" height="46" patternUnits="userSpaceOnUse">
          <path d={heartPath} transform="translate(6 6) scale(0.5)" fill={C.paperL} />
          <path d={heartPath} transform="translate(29 29) scale(0.5)" fill={C.paperL} />
        </pattern>
        <pattern id="room-heartsR" width="46" height="46" patternUnits="userSpaceOnUse">
          <path d={heartPath} transform="translate(6 6) scale(0.5)" fill={C.paperR} />
          <path d={heartPath} transform="translate(29 29) scale(0.5)" fill={C.paperR} />
        </pattern>
        <pattern id="room-checker" width="92" height="92" patternUnits="userSpaceOnUse">
          <rect width="46" height="46" fill={C.tileB} />
          <rect x="46" y="46" width="46" height="46" fill={C.tileB} />
        </pattern>
        <pattern id="room-felt" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.9" fill="#fff" opacity="0.35" />
          <circle cx="6" cy="6" r="0.9" fill={C.berry} opacity="0.2" />
        </pattern>
        <filter id="room-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="room-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* soft pink glow behind the room + ground shadow */}
      <ellipse cx="500" cy="500" rx="520" ry="470" fill="url(#room-backglow)" />
      <ellipse cx="515" cy="938" rx="420" ry="24" fill="#8f2a57" opacity="0.28" filter="url(#room-soft)" />

      {/* ================= shell ================= */}
      <polygon points={pts(P(0, 0, 0), P(0, WY, 0), P(0, WY, H), P(0, 0, H))} fill={C.wallL} />
      <polygon points={pts(P(0, 0, 0), P(WX, 0, 0), P(WX, 0, H), P(0, 0, H))} fill={C.wallR} />
      <g transform={M_LEFT}>
        <rect x="0" y={-H} width={WY} height={H - 126} fill="url(#room-heartsL)" />
        <rect x="0" y="-122" width={WY} height="122" fill={C.wainL} />
        {Array.from({ length: Math.floor(WY / 92) }, (_, i) => (
          <rect key={i} x={i * 92 + 12} y="-106" width="68" height="82" rx="4" fill="none" stroke={C.wainLine} strokeWidth="2.5" />
        ))}
        <rect x="0" y="-128" width={WY} height="10" fill={C.rail} />
        <rect x="0" y="-16" width={WY} height="16" fill={C.rail} />
        <rect x="0" y={-H} width={WY} height={H} fill="url(#room-ceilingshade)" />
        <rect x={WY - 60} y={-H} width="60" height={H} fill="url(#room-aoL)" />
      </g>
      <g transform={M_RIGHT}>
        <rect x="0" y={-H} width={WX} height={H - 126} fill="url(#room-heartsR)" />
        <rect x="0" y="-122" width={WX} height="122" fill={C.wainR} />
        {Array.from({ length: Math.floor(WX / 92) }, (_, i) => (
          <rect key={i} x={i * 92 + 12} y="-106" width="68" height="82" rx="4" fill="none" stroke={C.wainLine} strokeWidth="2.5" opacity="0.8" />
        ))}
        <rect x="0" y="-128" width={WX} height="10" fill={C.rail} />
        <rect x="0" y="-16" width={WX} height="16" fill={C.rail} />
        <rect x="0" y={-H} width={WX} height={H} fill="url(#room-ceilingshade)" />
        <rect x="0" y={-H} width="70" height={H} fill="url(#room-aoR)" />
      </g>
      <polygon points={pts(P(0, 0, H), P(0, WY, H), P(-T, WY, H), P(-T, -T, H))} fill={C.top} />
      <polygon points={pts(P(0, 0, H), P(-T, -T, H), P(WX, -T, H), P(WX, 0, H))} fill={C.top} />
      <polygon points={pts(P(0, WY, -F), P(-T, WY, -F), P(-T, WY, H), P(0, WY, H))} fill={C.endL} />
      <polygon points={pts(P(WX, 0, -F), P(WX, -T, -F), P(WX, -T, H), P(WX, 0, H))} fill={C.endR} />

      <polygon points={pts(P(0, 0), P(WX, 0), P(WX, WY), P(0, WY))} fill={C.tileA} />
      <g transform={onFloor()}>
        <rect width={WX} height={WY} fill="url(#room-checker)" />
        <rect width={WX} height={WY} fill="url(#room-gloss)" />
        <rect width={WX} height="70" fill="url(#room-floorAO)" />
        <rect width="70" height={WY} fill="url(#room-floorAOy)" />
      </g>
      <polygon points={pts(P(0, WY, 0), P(WX, WY, 0), P(WX, WY, -F), P(0, WY, -F))} fill={C.slabL} />
      <polygon points={pts(P(WX, 0, 0), P(WX, WY, 0), P(WX, WY, -F), P(WX, 0, -F))} fill={C.slabR} />
      <polyline points={pts(P(0, WY), P(WX, WY), P(WX, 0))} fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="2" />

      {/* ================= left wall: neon heart, arched window ================= */}
      <g transform={M_LEFT}>
        <g className="neon">
          <Heart x={110} y={-238} s={3.4} fill="none" stroke={C.neon} strokeWidth="3.2" filter="url(#room-glow)" />
          <Heart x={110} y={-238} s={3.4} fill="none" stroke={C.neon} strokeWidth="2.4" />
          <Heart x={110} y={-238} s={3.4} fill="none" stroke="#ffe3f2" strokeWidth="0.9" />
        </g>

        <path d="M248 -150V-270A87 87 0 0 1 422 -270V-150Z" fill={C.white} />
        <path d="M260 -160V-268A75 75 0 0 1 410 -268V-160Z" fill="url(#room-sky)" />
        <circle cx="372" cy="-268" r="15" className="win-orb" />
        <circle cx="380" cy="-274" r="13" className="win-moon-bite" />
        <g className="win-stars" fill="#fff">
          {[[285, -292], [310, -318], [300, -250], [345, -300], [395, -230], [330, -232], [275, -215]].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r="1.8" />
          ))}
        </g>
        <g className="win-clouds" fill="#fff">
          <path d="M276 -232h34a9 9 0 0 0-3.5-17 12.5 12.5 0 0 0-24 2 8 8 0 0 0-6.5 15z" />
          <path d="M346 -206h28a7.5 7.5 0 0 0-3-14 10 10 0 0 0-19 1.6 6.5 6.5 0 0 0-6 12.4z" />
        </g>
        <path d="M260 -178Q300 -204 338 -184T410 -190V-160H260Z" className="win-hills" />
        <rect x="333" y="-343" width="4" height="183" fill={C.white} />
        <rect x="260" y="-228" width="150" height="4" fill={C.white} />
        <path d="M232 -350H262C258 -300 256 -250 262 -214C254 -190 254 -168 258 -146H234C232 -170 236 -196 246 -214C236 -250 232 -300 232 -350Z" fill="url(#room-curtain)" />
        <path d="M438 -350H408C412 -300 414 -250 408 -214C416 -190 416 -168 412 -146H436C438 -170 434 -196 424 -214C434 -250 438 -300 438 -350Z" fill="url(#room-curtain)" />
        <circle cx="250" cy="-214" r="5" fill={C.gold} />
        <circle cx="420" cy="-214" r="5" fill={C.gold} />
        <rect x="224" y="-354" width="222" height="7" rx="3.5" fill={C.gold} />

        <FairyLights length={WY} />
      </g>
      <Box x={0} y={WY - 428} z={142} dx={20} dy={190} dz={9} c={C.white} />

      {/* ================= right wall: notes, pinboard, framed photo, shelf ================= */}
      <g transform={M_RIGHT}>
        {notes.length > 0 && (
          <>
            {/* soft glow + ribbon banner so the notes corner stands out */}
            <ellipse cx="128" cy="-238" rx="160" ry="104" fill="url(#room-notesglow)" className="notes-halo" />
            {notesHeading && (
              <g className="notes-banner">
                <path d="M14 -198H242L228 -182L242 -166H14L28 -182Z" fill={C.hot} />
                <path d="M28 -193H228M28 -171H228" stroke="#fff" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.75" />
                <text x="128" y="-176" textAnchor="middle">
                  {notesHeading}
                </text>
              </g>
            )}
          </>
        )}
        <FairyLights length={WX} />
        <path d="M8 -304Q128 -276 248 -304" fill="none" stroke={C.string} strokeWidth="2.6" />
        <circle cx="8" cy="-304" r="4.5" fill={C.gold} />
        <circle cx="248" cy="-304" r="4.5" fill={C.gold} />
      </g>

      {/* framed photo of you two */}
      <Box x={470} y={0} z={258} dx={112} dy={7} dz={74} c={C.white} />
      <g transform={onFaceY(7)}>
        <rect x="478" y="-324" width="96" height="58" fill={C.blush} />
        {pic(photo(0), 478, -324, 96, 58)}
      </g>

      {has("photoWall") && (
        <Obj id="photoWall" label={labels.photoWall || "photo wall"} onOpen={onOpen}>
          <Box x={250} y={0} z={186} dx={196} dy={9} dz={128} c={C.white} />
          <g transform={`${onFaceY(9)} translate(22 0)`}>
            <rect x="236" y="-306" width="180" height="112" rx="4" fill={C.blush} />
            <rect x="236" y="-306" width="180" height="112" rx="4" fill="url(#room-felt)" />
            {[[248, -296, -6, 1], [292, -300, 4, 2], [338, -294, -3, 3], [262, -250, 5, 4], [380, -252, -5, 5]].map(([x, y, r, k]) => (
              <g key={k} transform={`rotate(${r} ${x + 17} ${y + 20})`}>
                <rect x={x} y={y} width="34" height="40" rx="1.5" fill="#fff" />
                <rect x={x + 3} y={y + 3} width="28" height="28" fill={[C.blush, "#ffd9a8", "#cfe8ff", "#e6d4ff", "#c9f2e3"][k - 1]} />
                {pic(photo(k), x + 3, y + 3, 28, 28)}
                <circle cx={x + 17} cy={y + 2} r="3.4" fill={[C.hot, C.gold, C.mint, C.lavender, C.hot][k - 1]} />
              </g>
            ))}
            <rect x="320" y="-252" width="40" height="36" fill="#fff3a8" transform="rotate(-6 340 -234)" />
            <Heart x={340} y={-234} s={0.85} fill={C.hot} />
          </g>
        </Obj>
      )}

      {/* floating shelf */}
      <Box x={470} y={0} z={168} dx={7} dy={34} dz={22} c={C.white} rim={false} />
      <Box x={570} y={0} z={168} dx={7} dy={34} dz={22} c={C.white} rim={false} />
      <Box x={452} y={0} z={190} dx={142} dy={48} dz={10} c={C.white} />

      {has("photobooth") && (
        <Obj id="photobooth" label={labels.photobooth || "photobooth"} onOpen={onOpen}>
          <Box x={490} y={22} z={240} dx={28} dy={2} dz={22} c="#ffffff" rim={false} />
          <Box x={466} y={8} z={200} dx={72} dy={36} dz={40} c={C.mint} />
          <Box x={466} y={8} z={240} dx={72} dy={36} dz={11} c={C.white} />
          <g transform={onFaceY(44)}>
            <rect x="472" y="-236" width="4" height="34" fill={C.hot} />
            <rect x="476" y="-236" width="4" height="34" fill={C.gold} />
            <rect x="480" y="-236" width="4" height="34" fill="#3ea8ff" />
            <circle cx="504" cy="-220" r="18" fill={C.lens} />
            <circle cx="504" cy="-220" r="12.5" fill="#7fa8ff" />
            <circle cx="504" cy="-220" r="6" fill="#2e2f7a" />
            <circle cx="499" cy="-225" r="3.4" fill="#fff" opacity="0.9" />
            <rect x="518" y="-249" width="14" height="7" rx="2" fill="#fff8d6" />
            <rect x="472" y="-249" width="10" height="7" rx="2" fill={C.lens} />
          </g>
          <Cyl x={478} y={22} z={251} r={4.5} h={4} c={C.hot} />
        </Obj>
      )}

      {has("memoryMatch") && (
        <Obj id="memoryMatch" label={labels.memoryMatch || "memory game"} onOpen={onOpen}>
          <Box x={548} y={10} z={200} dx={30} dy={24} dz={4} c={C.lavender} rim={false} />
          <Box x={551} y={7} z={204} dx={30} dy={24} dz={4} c={C.gold} rim={false} />
          <Box x={546} y={12} z={208} dx={30} dy={24} dz={4} c={C.hot} />
        </Obj>
      )}
      {!has("memoryMatch") && (
        <>
          <Cyl x={572} y={24} z={200} r={12} h={18} c={C.pot} />
          {(() => {
            const [x, y] = P(572, 24, 218);
            return (
              <g>
                <ellipse cx={x - 10} cy={y - 13} rx="7.5" ry="16" fill={C.leafDark} transform={`rotate(-25 ${x - 10} ${y - 13})`} />
                <ellipse cx={x + 10} cy={y - 13} rx="7.5" ry="16" fill={C.leaf} transform={`rotate(25 ${x + 10} ${y - 13})`} />
                <ellipse cx={x} cy={y - 19} rx="7" ry="18" fill={C.leaf} />
              </g>
            );
          })()}
        </>
      )}

      {/* ================= floor: rug + shadows ================= */}
      <g transform={onFloor()}>
        <g transform="translate(340 300) rotate(-45) scale(9.5) translate(-12 -12)">
          <path d={heartPath} fill={C.white} />
          <path d={heartPath} fill="none" stroke={C.blush} strokeWidth="0.7" />
          <path d={heartPath} transform="translate(12 12) scale(0.8) translate(-12 -12)" fill="none" stroke={C.hot} strokeWidth="0.25" strokeDasharray="0.8 0.7" />
        </g>
        <g fill="#4a0f2e" opacity="0.22" filter="url(#room-soft)">
          <rect x="-4" y="244" width="236" height="216" rx="10" />
          <rect x="206" y="-2" width="240" height="120" rx="8" />
          <rect x="-2" y="180" width="80" height="70" rx="6" />
          <ellipse cx="96" cy="112" rx="56" ry="56" />
          <ellipse cx="372" cy="318" rx="38" ry="38" />
          <rect x="464" y="280" width="78" height="78" rx="6" />
          <ellipse cx="566" cy="78" rx="30" ry="30" />
        </g>
      </g>

      {/* beanbag under the window */}
      <Cyl x={96} y={112} r={48} h={30} c={C.lavender} />
      {(() => {
        const [x, y] = P(96, 112, 30);
        return <Heart x={x + 4} y={y - 14} s={1.7} fill={C.hot} />;
      })()}

      {/* ================= desk ================= */}
      <Box x={214} y={6} dx={12} dy={12} dz={104} c={C.white} rim={false} />
      <Box x={358} y={6} dx={82} dy={98} dz={104} c={C.white} />
      <g transform={onFaceY(104)}>
        <rect x="365" y="-96" width="68" height="40" rx="6" fill={C.blush} />
        <rect x="365" y="-50" width="68" height="40" rx="6" fill={C.blush} />
        <rect x="390" y="-79" width="18" height="5" rx="2.5" fill={C.gold} />
        <rect x="390" y="-33" width="18" height="5" rx="2.5" fill={C.gold} />
      </g>
      <Box x={214} y={92} dx={12} dy={12} dz={104} c={C.white} rim={false} />
      <Box x={206} y={0} z={104} dx={240} dy={110} dz={13} c={C.white} />

      {(() => {
        const [gx, gy] = P(420, 36, 175);
        return <circle cx={gx} cy={gy} r="74" fill="url(#room-lampglow)" className="lamp-glow" />;
      })()}
      <Cyl x={420} y={36} z={117} r={13} h={5} c={C.gold} />
      <path d={`M${P(420, 36, 122).join(" ")}L${P(420, 36, 172).join(" ")}`} stroke={C.gold} strokeWidth="4.5" strokeLinecap="round" />
      <Cyl x={420} y={36} z={168} r={22} h={28} c={C.blush} top="#fff3f8" />

      <Box x={334} y={30} z={117} dx={56} dy={52} dz={11} c={C.lavender} />
      <Box x={338} y={36} z={128} dx={48} dy={40} dz={10} c={C.mint} />
      <Cyl x={398} y={92} z={117} r={10} h={17} c={C.hot} />

      {has("diary") && (
        <Obj id="diary" label={labels.diary || "our diary"} onOpen={onOpen}>
          <Box x={248} y={50} z={117} dx={66} dy={22} dz={98} c={C.hot} top="#fff3dc" right={C.berry} />
          <g transform={onFaceY(72)}>
            <rect x="260" y="-198" width="42" height="30" rx="5" fill="#fff3dc" />
            <Heart x={281} y={-183} s={0.72} fill={C.hot} />
            <rect x="251" y="-213" width="4" height="94" fill="#fff" opacity="0.35" />
            <rect x="300" y="-127" width="7" height="15" fill={C.gold} />
          </g>
        </Obj>
      )}

      {/* ================= nightstand ================= */}
      <Box x={0} y={184} dx={74} dy={62} dz={72} c={C.white} />
      <g transform={onFaceY(246)}>
        <rect x="8" y="-62" width="58" height="26" rx="5" fill={C.blush} />
        <rect x="29" y="-51" width="16" height="4" rx="2" fill={C.gold} />
      </g>
      <Cyl x={36} y={214} z={72} r={10} h={14} c={C.hot} />
      {(() => {
        const [x, y] = P(36, 214, 86);
        return (
          <g>
            <circle cx={x} cy={y - 8} r="14" fill="#fff2b5" opacity="0.7" filter="url(#room-glow)" className="candle" />
            <path d={`M${x} ${y - 14}q4 6 0 9q-4-3 0-9z`} fill={C.gold} className="candle" />
          </g>
        );
      })()}

      {/* ================= bed ================= */}
      <Box x={0} y={250} dx={18} dy={208} dz={168} c={C.hot} />
      <g transform={onFaceX(18)}>
        {[0, 1, 2, 3].map((r) =>
          [0, 1, 2, 3, 4].map((k) => <circle key={`${r}${k}`} cx={272 + k * 40 + (r % 2) * 20} cy={-148 + r * 26} r="3.2" fill={C.berry} opacity="0.75" />)
        )}
      </g>
      <Box x={0} y={252} dx={226} dy={204} dz={42} c={C.white} />
      <Box x={18} y={260} z={42} dx={204} dy={190} dz={26} c="#ffffff" right="#f2dbe6" />
      <Box x={26} y={272} z={68} dx={56} dy={78} dz={22} c="#ffffff" right="#f0d9e5" />
      <Box x={26} y={362} z={68} dx={56} dy={78} dz={22} c="#ffffff" right="#f0d9e5" />
      <Box x={96} y={256} z={60} dx={130} dy={198} dz={16} c={C.berry} top="#ff5aa2" />
      <Box x={96} y={256} z={76} dx={18} dy={198} dz={3} c={C.blush} rim={false} />
      <g transform={onFloor(79)}>
        {[[140, 282], [182, 300], [150, 336], [196, 360], [138, 404], [186, 424]].map(([x, y]) => (
          <Heart key={`${x}${y}`} x={x} y={y} s={0.6} fill="#fff" opacity="0.8" />
        ))}
      </g>
      {(() => {
        const [x, y] = P(54, 330, 104);
        return <Heart x={x} y={y} s={2.1} fill={C.hot} stroke="#fff" strokeWidth="0.8" />;
      })()}
      {catOn && <Cat awake={catAwake} says={catSays} onPet={() => setCatAwake(true)} />}

      {/* pouf on the rug + floor plant */}
      <Cyl x={372} y={318} r={32} h={30} c={C.hot} />
      {(() => {
        const [x, y] = P(372, 318, 30);
        return <circle cx={x} cy={y} r="4.5" fill={C.gold} />;
      })()}
      <Cyl x={566} y={78} r={24} h={44} c={C.pot} />
      {(() => {
        const [x, y] = P(566, 78, 44);
        return (
          <g>
            {[[-30, -40, -40, C.leafDark], [28, -42, 38, C.leafDark], [-15, -62, -14, C.leaf], [15, -64, 16, C.leaf], [0, -78, 0, C.leaf]].map(([dx, dy, r, f], i) => (
              <ellipse key={i} cx={x + dx} cy={y + dy} rx="13" ry="36" fill={f} transform={`rotate(${r} ${x + dx} ${y + dy})`} />
            ))}
          </g>
        );
      })()}

      {/* gift boxes in the front corner */}
      <Box x={470} y={286} dx={64} dy={64} dz={48} c={C.white} />
      <g fill={C.gold}>
        <rect x="496" y="286" width="12" height="64" transform={onFloor(48)} />
        <rect x="470" y="312" width="64" height="12" transform={onFloor(48)} />
        <rect x="496" y="-48" width="12" height="48" transform={onFaceY(350)} />
        <rect x="312" y="-48" width="12" height="48" transform={onFaceX(534)} opacity="0.85" />
      </g>
      <Box x={482} y={300} z={48} dx={40} dy={38} dz={32} c={C.hot} />
      <g fill={C.gold}>
        <rect x="497" y="300" width="10" height="38" transform={onFloor(80)} />
        <rect x="482" y="314" width="40" height="10" transform={onFloor(80)} />
        <rect x="497" y="-80" width="10" height="32" transform={onFaceY(338)} />
        <rect x="314" y="-80" width="10" height="32" transform={onFaceX(522)} opacity="0.85" />
      </g>
      {(() => {
        const [x, y] = P(502, 319, 82);
        return (
          <g fill={C.gold}>
            <ellipse cx={x - 9} cy={y - 6} rx="9" ry="6" transform={`rotate(-20 ${x - 9} ${y - 6})`} />
            <ellipse cx={x + 9} cy={y - 6} rx="9" ry="6" transform={`rotate(20 ${x + 9} ${y - 6})`} />
            <circle cx={x} cy={y - 4} r="4" />
          </g>
        );
      })()}

      {/* ================= the three notes ================= */}
      {notes.map((n, i) => {
        const u = notePos[i];
        const v = lineV(u);
        return (
          <Obj key={n.id} id={n.id} label={n.label || `note ${i + 1}`} onOpen={onOpen} className="note">
            <g transform={M_RIGHT}>
              <g transform={`translate(${u} ${v}) scale(1.42)`}>
                <g className="sway" style={{ animationDelay: `${i * -1.3}s` }}>
                  <rect x="-3.5" y="-6" width="7" height="15" rx="2" fill={C.gold} />
                  <rect x="-27" y="4" width="54" height="44" rx="3.5" fill="#fff" />
                  <path d="M-27 5L0 22L27 5" fill="#ffe4ee" stroke="#f4b9cf" strokeWidth="0.8" />
                  <circle cx="0" cy="21" r="7" fill={C.seals[n.seal] || C.seals.rose} />
                  <Heart x={0} y={21} s={0.3} fill="#fff" />
                  <text x="0" y="42" textAnchor="middle" className="env-label">
                    {n.label}
                  </text>
                </g>
              </g>
            </g>
          </Obj>
        );
      })}

      {/* tags on top of everything (clickable too) */}
      <g className="tags" aria-hidden="true">
        {[
          has("photoWall") && { id: "photoWall", at: P(348, 9, 172), text: labels.photoWall, r: -3 },
          has("diary") && { id: "diary", at: P(282, 110, 92), text: labels.diary, r: 3 },
          has("photobooth") && { id: "photobooth", at: P(504, 48, 158), text: labels.photobooth, r: -3 },
          has("memoryMatch") && { id: "memoryMatch", at: P(562, 48, 222), text: labels.memoryMatch, r: 3 },
        ]
          .filter(Boolean)
          .map((t) => (
            <g key={t.id} className="tag-hit" onClick={() => onOpen(t.id)}>
              <Tag x={t.at[0]} y={t.at[1]} text={t.text} r={t.r} />
            </g>
          ))}
      </g>
    </svg>
  );
}
