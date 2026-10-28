import { loveConfig as config } from "../data/loveConfig.js";
import { LAYOUTS, THEMES, pagePhotos, text } from "../utils/content.js";
import { DOODLES, MapPin } from "./Doodles.jsx";
import { HeartBurst } from "./Bursts.jsx";
import PhotoGallery from "./PhotoGallery.jsx";

/** One memory page: words on the left, photos on the right (stacked on phones). */
export default function DiaryPage({ item }) {
  const { page } = item;
  const show = config.display || {};
  const layout = LAYOUTS.includes(page.layout) ? page.layout : config.diary?.defaultLayout || "polaroid-grid";
  const theme = THEMES.includes(page.theme) ? page.theme : "rose";
  const id = `page-${item.key}`;

  const kicker = text(page.kicker);
  const title = text(page.title);
  const subtitle = text(page.subtitle);
  const date = show.dates !== false ? text(page.dateLabel) : "";
  const place = show.dates !== false ? text(page.place) : "";
  const story = text(page.description);
  const note = show.notes !== false ? text(page.note) : "";
  const stickers = show.stickers !== false ? (page.stickers || []).filter((s) => DOODLES[s]).slice(0, 3) : [];

  return (
    <article className={`diary-page theme-${theme}`} aria-labelledby={title ? id : undefined}>
      <div className={`page-words ${story ? "" : "is-short"}`}>
        {kicker && <p className="page-kicker">{kicker}</p>}
        {title && (
          <h2 id={id} className="page-title">
            {title}
            <HeartBurst kind="sparkle" count={6} spread={80} rise={20} />
          </h2>
        )}
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
        {(date || place) && (
          <p className="page-meta">
            {date && <span className="page-date">{date}</span>}
            {place && (
              <span className="page-place">
                <MapPin />
                {place}
              </span>
            )}
          </p>
        )}
        {story && <p className={`page-story ${page.typewriter ? "is-typewriter" : ""}`}>{story}</p>}
        {note && (
          <aside className="sticky-note">
            <span className="photo-tape" aria-hidden="true" />
            {note}
          </aside>
        )}
      </div>

      <div className="page-photos">
        <PhotoGallery photos={pagePhotos(page)} layout={layout} />
      </div>

      {stickers.map((s, i) => {
        const Icon = DOODLES[s];
        return <Icon key={i} className={`page-sticker page-sticker--${i} sticker-wiggle`} />;
      })}
    </article>
  );
}
