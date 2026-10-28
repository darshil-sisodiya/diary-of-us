import { useEffect, useRef, useState } from "react";
import { Camera, Download, RotateCcw } from "lucide-react";
import { loveConfig as config } from "../../data/loveConfig.js";
import { allPhotos, text } from "../../utils/content.js";
import { useLoadedPhotos, useReducedMotion } from "../../hooks/useReducedMotion.js";
import { HeartBurst } from "../Bursts.jsx";
import { Heart } from "../Doodles.jsx";
import { SceneHeader } from "./SceneFrame.jsx";

const colors = config.theme?.colors || {};
const FRAMES = [
  { id: "pink", label: "pink frame", bg: colors.pink || "#f4c2c8", ink: colors.ink || "#5a3833" },
  { id: "lavender", label: "lavender frame", bg: colors.lavender || "#dccff0", ink: colors.ink || "#5a3833" },
  { id: "butter", label: "butter frame", bg: colors.butter || "#f8e8ad", ink: colors.ink || "#5a3833" },
  { id: "film", label: "film frame", bg: "#3e3238", ink: colors.paper || "#fffaf3" },
];
const FILTERS = [
  { id: "natural", css: "none" },
  { id: "warm", css: "sepia(0.22) saturate(1.25) brightness(1.04)" },
  { id: "b&w", css: "grayscale(1) contrast(1.1) brightness(1.05)" },
  { id: "dreamy", css: "brightness(1.1) saturate(0.85) contrast(0.9)" },
];
const HEART = new Path2D("M12 21C6.5 16.8 2.5 13.2 2.5 8.6 2.5 5.7 4.8 3.5 7.6 3.5c1.8 0 3.4 1 4.4 2.6 1-1.6 2.6-2.6 4.4-2.6 2.8 0 5.1 2.2 5.1 5.1 0 4.6-4 8.2-9.5 12.4z");
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** Draws `src` into the box like CSS object-fit: cover, with an optional focus point (0–1). */
function drawCover(ctx, src, w0, h0, x, y, w, h, fx = 0.5, fy = 0.5) {
  const s = Math.max(w / w0, h / h0);
  const sw = w / s;
  const sh = h / s;
  ctx.drawImage(src, (w0 - sw) * fx, (h0 - sh) * fy, sw, sh, x, y, w, h);
}

const parseFocus = (f = "") => {
  const [a, b] = String(f).split(/\s+/).map((v) => ({ left: 0, top: 0, center: 50, right: 100, bottom: 100 })[v] ?? parseFloat(v));
  return [Number.isFinite(a) ? a / 100 : 0.5, Number.isFinite(b) ? b / 100 : 0.5];
};

/** Builds the final strip image and returns it as a PNG data URL. */
async function makeStrip(shots, frame, filter) {
  const pb = config.photobooth || {};
  const hand = config.theme?.fonts?.handwritten || "Caveat";
  const type = config.theme?.fonts?.typewriter || "Courier Prime";
  await Promise.all([document.fonts.load(`700 46px "${hand}"`), document.fonts.load(`22px "${type}"`)]).catch(() => {});

  const W = 600, pad = 30, fw = W - pad * 2, fh = Math.round((fw * 3) / 4), gap = 20, footer = 150;
  const H = pad + shots.length * fh + (shots.length - 1) * gap + footer;
  const canvas = Object.assign(document.createElement("canvas"), { width: W, height: H });
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = frame.bg;
  ctx.fillRect(0, 0, W, H);

  shots.forEach((s, i) => {
    ctx.filter = filter.css;
    drawCover(ctx, s.src, s.w, s.h, pad, pad + i * (fh + gap), fw, fh, s.fx, s.fy);
    ctx.filter = "none";
  });

  const base = H - footer;
  const caption = text(pb.stripCaption);
  ctx.fillStyle = frame.ink;
  ctx.textAlign = "center";
  if (caption) {
    ctx.font = `700 46px "${hand}", cursive`;
    ctx.fillText(caption, W / 2, base + 70);
  }
  if (pb.showDateOnStrip !== false) {
    const d = new Date();
    ctx.font = `22px "${type}", monospace`;
    ctx.globalAlpha = 0.75;
    ctx.fillText(`${String(d.getDate()).padStart(2, "0")} . ${String(d.getMonth() + 1).padStart(2, "0")} . ${d.getFullYear()}`, W / 2, base + (caption ? 112 : 84));
    ctx.globalAlpha = 1;
  }
  [[pad + 26, base + (caption ? 58 : 76)], [W - pad - 26, base + (caption ? 58 : 76)]].forEach(([x, y], i) => {
    ctx.save();
    ctx.translate(x - 15, y - 15);
    ctx.scale(1.25, 1.25);
    ctx.fillStyle = i ? colors.rose || "#c98a90" : "#fff";
    ctx.fill(HEART);
    ctx.restore();
  });
  return canvas.toDataURL("image/png");
}

export default function Photobooth() {
  const pb = config.photobooth || {};
  const shotsWanted = Math.min(4, Math.max(2, Number(pb.shots) || 4));
  const countdown = Math.min(5, Math.max(1, Number(pb.countdown) || 3));
  const { reduced } = useReducedMotion();
  const { photos } = useLoadedPhotos(allPhotos());

  const video = useRef(null);
  const output = useRef(null);
  const stream = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | starting | live | shooting | printing | done | error
  const [frame, setFrame] = useState(FRAMES[0]);
  const [filter, setFilter] = useState(FILTERS[0]);
  const [count, setCount] = useState(0);
  const [taken, setTaken] = useState(0);
  const [flash, setFlash] = useState(false);
  const [strip, setStrip] = useState("");

  useEffect(() => () => stream.current?.getTracks().forEach((t) => t.stop()), []);

  // On phones the strip prints below the booth, so bring it into view.
  useEffect(() => {
    if (status === "done" && window.innerWidth <= 760) output.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
  }, [status, reduced]);

  const startCamera = async () => {
    setStatus("starting");
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      stream.current = s;
      video.current.srcObject = s;
      await video.current.play();
      setStatus("live");
    } catch {
      setStatus("error");
    }
  };

  const grab = () => {
    const v = video.current;
    const c = Object.assign(document.createElement("canvas"), { width: 800, height: 600 });
    const ctx = c.getContext("2d");
    ctx.translate(800, 0);
    ctx.scale(-1, 1); // mirror, like the preview
    drawCover(ctx, v, v.videoWidth, v.videoHeight, 0, 0, 800, 600);
    return { src: c, w: 800, h: 600, fx: 0.5, fy: 0.5 };
  };

  const shoot = async () => {
    setStatus("shooting");
    setStrip("");
    const shots = [];
    for (let i = 0; i < shotsWanted; i++) {
      for (let c = countdown; c > 0; c--) {
        setCount(c);
        await wait(i === 0 ? 800 : 650);
      }
      setCount(0);
      shots.push(grab());
      setTaken(i + 1);
      if (!reduced) {
        setFlash(true);
        await wait(180);
        setFlash(false);
      }
      await wait(350);
    }
    finish(shots);
  };

  const fromPhotos = async () => {
    const pick = [...photos].sort(() => Math.random() - 0.5).slice(0, shotsWanted);
    const shots = await Promise.all(
      pick.map(
        (p) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              const [fx, fy] = parseFocus(p.focus);
              resolve({ src: img, w: img.naturalWidth, h: img.naturalHeight, fx, fy });
            };
            img.src = p.src;
          })
      )
    );
    finish(shots);
  };

  const finish = async (shots) => {
    setStatus("printing");
    setStrip(await makeStrip(shots, frame, filter));
    setStatus("done");
    setTaken(0);
  };

  const again = () => {
    setStrip("");
    setStatus(stream.current ? "live" : "idle");
  };

  const busy = status === "shooting" || status === "printing";
  const camOn = !!stream.current && ["live", "shooting", "printing", "done"].includes(status);
  const canFallback = photos.length >= 2;

  return (
    <section className="booth-scene" aria-labelledby="scene-title">
      <SceneHeader section={pb} />

      <div className="booth-layout">
        <div className="booth">
          <div className="booth-marquee" aria-hidden="true">
            {Array.from({ length: 9 }, (_, i) => (
              <i key={i} style={{ animationDelay: `${i * -0.25}s` }} />
            ))}
          </div>
          <div className="booth-screen" style={{ "--frame": frame.bg }}>
            <video
              ref={video}
              playsInline
              muted
              className={camOn ? "is-on" : ""}
              style={{ filter: filter.css }}
              aria-label="camera preview"
            />
            {(status === "idle" || status === "starting") && (
              <div className="booth-idle">
                <span className="booth-curtain" aria-hidden="true" />
                <button type="button" className="btn btn-primary btn-lg" onClick={startCamera} disabled={status === "starting"}>
                  <Camera aria-hidden="true" />
                  {text(pb.startText) || "turn on the camera"}
                </button>
              </div>
            )}
            {status === "error" && (
              <div className="booth-idle">
                <span className="booth-curtain" aria-hidden="true" />
                {text(pb.noCameraText) && <p className="booth-error">{text(pb.noCameraText)}</p>}
                {canFallback && (
                  <button type="button" className="btn btn-primary" onClick={fromPhotos}>
                    {text(pb.fromPhotosText) || "use our photos"}
                  </button>
                )}
              </div>
            )}
            {!camOn && (status === "printing" || status === "done") && (
              <div className="booth-idle" aria-hidden="true">
                <span className="booth-curtain" />
              </div>
            )}
            {count > 0 && (
              <span key={`${taken}-${count}`} className="booth-count" aria-live="assertive">
                {count}
              </span>
            )}
            {flash && <span className="booth-flash" aria-hidden="true" />}
            {busy && status === "shooting" && (
              <ol className="booth-dots" aria-label={`${taken} of ${shotsWanted} photos taken`}>
                {Array.from({ length: shotsWanted }, (_, i) => (
                  <li key={i} className={i < taken ? "is-done" : ""} />
                ))}
              </ol>
            )}
          </div>

          <div className="booth-controls">
            <div className="booth-options" role="group" aria-label="frame colour">
              {FRAMES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`booth-swatch ${frame.id === f.id ? "is-on" : ""}`}
                  style={{ background: f.bg }}
                  onClick={() => setFrame(f)}
                  aria-label={f.label}
                  aria-pressed={frame.id === f.id}
                  disabled={busy}
                />
              ))}
            </div>
            <div className="booth-options" role="group" aria-label="filter">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`booth-chip ${filter.id === f.id ? "is-on" : ""}`}
                  onClick={() => setFilter(f)}
                  aria-pressed={filter.id === f.id}
                  disabled={busy}
                >
                  {f.id}
                </button>
              ))}
            </div>
            <button type="button" className="btn btn-primary btn-lg booth-shoot" onClick={shoot} disabled={!camOn || busy}>
              <Heart className="btn-heart beat" />
              {text(pb.shootText) || "take our photos"}
            </button>
          </div>
        </div>

        <div ref={output} className={`booth-output ${strip ? "has-strip" : ""}`}>
          <div className="booth-slot" aria-hidden="true" />
          <div className="booth-strip-wrap">
            {strip ? (
              <img src={strip} alt="our photobooth strip" className={`booth-strip ${reduced ? "" : "is-printing"}`} />
            ) : (
              <div className="booth-strip-empty" aria-hidden="true">
                <Heart />
              </div>
            )}
            {status === "done" && <HeartBurst count={10} spread={140} rise={60} />}
          </div>
          {status === "done" && (
            <div className="booth-actions">
              <a className="btn btn-primary" href={strip} download="our-photobooth-strip.png">
                <Download aria-hidden="true" />
                {text(pb.downloadText) || "save"}
              </a>
              <button type="button" className="btn btn-soft" onClick={again}>
                <RotateCcw aria-hidden="true" />
                {text(pb.retakeText) || "again"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
