import { loveConfig as config } from "../data/loveConfig.js";
import { text } from "../utils/content.js";
import { Heart, Flower, Bow, Star, Sparkle } from "./Doodles.jsx";

export default function DiaryCover({ onStart, headingLevel = 1 }) {
  const c = config.cover || {};
  const label = text(c.label);
  const title = text(c.title);
  const subtitle = text(c.subtitle);
  const dedication = text(c.dedication);
  const button = text(c.buttonText) || "Open";
  const stickers = config.display?.stickers !== false;
  const H = `h${headingLevel}`;

  return (
    <div className="cover">
      <div className="cover-book">
        <span className="cover-spine" aria-hidden="true" />
        <span className="cover-ribbon" aria-hidden="true" />

        {label && <p className="cover-stamp">{label}</p>}

        <div className="cover-plate">
          <Heart className="cover-plate-heart" />
          {title && <H className="cover-title">{title}</H>}
          {subtitle && <p className="cover-subtitle">{subtitle}</p>}
        </div>

        {dedication && <p className="cover-dedication">{dedication}</p>}

        <button type="button" className="btn btn-primary btn-lg cover-start" onClick={onStart}>
          {button}
        </button>

        {stickers && (
          <>
            <Bow className="cover-sticker cover-sticker--bow sticker-wiggle" />
            <Flower className="cover-sticker cover-sticker--flower sticker-wiggle" />
            <Star className="cover-sticker cover-sticker--star sticker-wiggle" />
            <Sparkle className="cover-sticker cover-sticker--sparkle twinkle" />
            <span className="cover-seal beat" aria-hidden="true">
              <Heart />
            </span>
          </>
        )}
      </div>
    </div>
  );
}
