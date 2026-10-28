# ♡ Our Little Love Diary

A tiny interactive website: an envelope opens into **our little room**, a 3D, isometric, dollhouse-style room where every object opens something:

| In the room | Opens |
|---|---|
| the pink book on the desk | **the diary**: cover, four memory pages, love letter, last page with a secret note |
| the camera on the shelf | **a photobooth**: uses her camera, makes a 4-photo strip she can save |
| the pink pinboard (with your photos on it) | **the photo wall**: every photo pinned up; drag them around, tap to flip |
| the three envelopes on the clothesline | **note 1, note 2, note 3**: three little letters |
| the sleepy cat on the bed | nothing, it's a cat (tap it anyway) |

The window shows the real sky for her time of day: morning, day, sunset or night, with the lamp glowing at night. The framed photo on the wall is your first diary photo. On phones, big buttons under the room open everything too.

The window shows the real sky for her time of day: morning, day, sunset or night.

**You only ever edit one file: `src/data/loveConfig.js`.** Every word, photo, colour and on/off switch lives there. You never need to touch the React components or the CSS.

---

## Run it on your computer

You need [Node.js](https://nodejs.org) (version 20 or newer).

```bash
npm install      # once
npm run dev      # opens a local preview, usually at http://localhost:5173
```

Leave `npm run dev` running while you edit. The page updates every time you save `loveConfig.js`.

Two other useful commands:

```bash
npm run check    # lists every placeholder you haven't filled in yet + missing photo files
npm run build    # makes the final website in the dist/ folder
```

---

## How the placeholders work (read this first)

The config is full of values like `"[WRITE ABOUT OUR FIRST DATE HERE]"`.

- **Anything in `[SQUARE BRACKETS WITH CAPITALS]` is automatically hidden.** She will never see placeholder text, even if you forget one.
- **An empty string `""` also hides that piece of text.** So does deleting the line.
- **`enabled: false` removes a whole section.** The navigation, page numbers and progress hearts adjust automatically.
- **`{her}` and `{you}` are replaced by the nicknames** you set in `site`. If a nickname is still a placeholder, any line that uses it hides itself.
- **Line breaks:** write `\n` inside a string to start a new line.

So you can personalise a little at a time. The site always looks finished. Run `npm run check` whenever you want a to-do list of what's left.

---

## Personalising, step by step

All of these are in `src/data/loveConfig.js`.

### 1. Nicknames
```js
site: {
  herNickname: "Bunny",
  yourNickname: "Bear",
},
```
They're used wherever the config says `{her}` or `{you}`: the envelope label, the cover dedication, the letter greeting and signature.

### 2. The welcome screen (envelope)
Edit the `intro` section: `kicker`, `heading`, `message`, `envelopeLabel`, `letterText`, `buttonText`, `skipText`.
Set `intro.enabled: false` to skip the envelope and open straight on the diary cover.

### 3. The diary cover
Edit `cover`: `label` (a tiny stamp), `title`, `subtitle`, `dedication`, `buttonText`.

### 4. The story for each date
`diary.pages` has four entries, one per date. In each one:

| Field | What it is |
|---|---|
| `kicker` | small line above the title ("Date no. 1") |
| `title` | the big handwritten title |
| `subtitle` | optional handwritten line under it |
| `dateLabel`, `place` | optional little date tag and location |
| `description` | your story. Use `\n` for new lines |
| `typewriter` | `true` writes the story in typewriter letters |
| `note` | optional sticky note on the page |
| `theme` | colour mood: `"rose"`, `"peach"`, `"lavender"`, `"butter"`, `"blue"` |
| `stickers` | up to 3 of `"heart"`, `"star"`, `"flower"`, `"sparkle"`, `"bow"`, `"cloud"` |

A page with no story and no photos still looks intentional: it shows its title and a little pressed-flower scrapbook card.

### 5. Adding, replacing or removing photos
1. Put your photos in `public/images/date-1/`, `date-2/`, `date-3/`, `date-4/`.
2. Name them `photo-1.jpg` … `photo-4.jpg` (that's what the config already points to), **or** use any name and change `src` to match, e.g. `src: "/images/date-1/picnic.jpg"`.
3. To remove a photo slot, set `src: ""`.

Missing or broken photos are hidden automatically. You'll never see a broken-image icon.

**Recommended photos:** JPG or WebP, around **1600 px on the long side**, ideally **under 500 KB** each (phone photos are often 3–5 MB, so shrink them with a tool like [squoosh.app](https://squoosh.app)). Portrait and landscape both work.

**Cropping:** frames have fixed shapes so the page never jumps around while loading. Per photo:
- `fit: "cover"` fills the frame and may crop the edges (default).
- `fit: "contain"` shows the whole photo with a little paper border.
- `focus` chooses what stays visible when cropping: `"top"`, `"bottom"`, `"left"`, `"right"`, `"center"`, or exact like `"50% 30%"`. Use `"top"` for portraits where heads get cut off.

### 6. Choosing a photo layout per date
Set `layout` on each page:

| Layout | Looks like |
|---|---|
| `"polaroid-grid"` | four tilted Polaroids with washi tape |
| `"scrapbook-collage"` | overlapping photos with tape and paper labels |
| `"film-strip"` | a dark film contact sheet of landscape frames with sprocket holes |
| `"photo-grid"` | a tidy 2 × 2 grid with a heart in the middle |
| `"featured-photo"` | one big Polaroid + three small ones |
| `"scattered-photos"` | pinned to the page at playful angles |

Every layout also adapts nicely if a page has only 1–3 photos. `diary.defaultLayout` is used if a layout name is misspelled.

### 7. Photo captions and date stamps
Each photo has `caption` (handwritten under or on it, and shown in the big viewer) and `stamp` (an orange camera-style date like `"12 03 25"`). Leave either as `""` to hide it. Turn all of them off with `display.photoCaptions` and `display.dateStamps`.

### 8. The love letter
```js
loveNote: {
  enabled: true,
  placement: "beforeEnding",   // or "afterCover", "afterEnding", or 1 / 2 / 3 (after that date)
  title: "A Little Note for You",
  intro: "Dear {her},",
  paragraphs: [
    "First paragraph…",
    "Second paragraph…",
    // add as many as you like
  ],
  closing: "Forever yours,",
  signature: "{you}",
  postscript: "P.S. …",
},
```
The letter only appears once at least one paragraph (or the intro or closing) is written. Remove it with `enabled: false` (or `features.loveNote: false`). It never counts as one of the four memories in the progress hearts.

### 9. The final surprise
In `ending`: `heading`, `message`, and the secret envelope (`revealPrompt`, `revealButtonText`, `revealMessage`, `revealSignature`).
The envelope only appears once `revealMessage` is written. When she taps it, the envelope opens, hearts float out, and your message types itself out. Turn it off with `revealEnabled: false` or `features.finalSurprise: false`.

### 10. Music
1. Put an `.mp3` in `public/music/`, e.g. `public/music/our-song.mp3`.
2. Set `music.src` to `"/music/our-song.mp3"` and optionally `music.title`.

Music **never autoplays**. A small play/pause button appears in the bottom-right corner. `startWithDiary: true` starts the song when she opens the envelope (that click counts as permission in browsers). If the file is missing, the button simply doesn't appear.
**Disable music:** `features.musicPlayer: false` (or `music.enabled: false`).

### 11. Animations and decorations
- `animation.intensity`: `"full"`, `"gentle"` (calmer, fewer decorations, slide instead of page-flip) or `"off"` (no movement).
- `animation.pageTransition`: `"flip"`, `"slide"` or `"fade"`. Phones always use a gentle slide.
- `features.floatingDecorations`: the drifting hearts/stars/flowers. `decorations.density` and `decorations.types` fine-tune them.
- `features.clickHearts`: the tiny heart that pops on every tap.
- `features.customCursor`: a heart-shaped mouse cursor (desktop only, off by default).
- `sounds.pageTurn`: a soft paper swish when turning pages (off by default).
- `display.stickers`, `display.notes`, `display.dates`, `display.pageNumbers`: the little extras.

If her phone or computer is set to "reduce motion", all movement is switched off automatically.

### 12. Colours and fonts
`theme.colors` holds every colour as a normal hex code. Keep `ink` dark so text stays readable.
`theme.fonts` sets the handwritten, body and typewriter fonts. If you change one, copy the matching embed link from [fonts.google.com](https://fonts.google.com) into `googleFontsUrl`.

### 13. Removing any section
| To remove | Set |
|---|---|
| Envelope intro | `features.intro: false` |
| Diary cover | `features.diaryCover: false` |
| A single date page | that page's `enabled: false` |
| All date pages | `features.datePages: false` |
| Letter | `features.loveNote: false` |
| Last page | `features.ending: false` |
| Secret envelope | `features.finalSurprise: false` |
| Photo viewer | `features.photoLightbox: false` |
| Progress hearts | `features.progressIndicator: false` |
| Footer | `features.footer: false` |
| The whole room (open straight on the diary) | `features.room: false` |
| Photobooth / photo wall / the three notes | `features.photobooth`, `photoWall`, `notes`: `false` |
| Memory game (off by default) | `features.memoryMatch: true` turns it **on**: a deck of cards appears on the shelf |
| The cat | `features.roomCat: false` |

When something is switched off, its object disappears from the room.

Button and navigation words (Next, Previous, "Memory 2 of 4", and so on) are in `navigation`.

---

## The room and everything in it

### 14. The room
`room` holds the heading ("our little room"), the hint, the "back to our room" button text, the little tag next to each object (`labels`), and what the cat says. `showRealSky: false` keeps the window on a sunny day instead of following her clock.

Every page in the room has its own address (`#diary`, `#photobooth`, `#photoWall`, `#note-1`, `#note-2`, `#note-3`), so the phone's back button works. Esc also takes her back to the room.

### 15. Photobooth
Edit `photobooth`: titles, button words, `stripCaption` (written at the bottom of the strip, `{her} & {you}` by default), `shots` (2–4) and `countdown` (seconds).
- The camera only switches on when she presses the button, and **nothing is ever uploaded**: the strip is made on her device and saved with "save the strip".
- Browsers only allow cameras on **https://** sites (Netlify, Vercel, GitHub Pages are all https) or on `localhost` while you test. Opening `dist/index.html` straight from a folder won't have the camera.
- If there's no camera, or she says no, she's offered a strip made from your diary photos instead.

### 16. The photo wall
All the diary photos are pinned up automatically. Add more with `photoWall.extraPhotos`, e.g.
```js
extraPhotos: [
  { src: "/images/extra/beach.jpg", note: "that windy day", alt: "us at the beach" },
],
```
The back of each photo shows its caption (or `note`), or the date title if there's no caption. Set `includeDiaryPhotos: false` to show only your extra photos.

### 17. The memory game (off by default)
Turn it on with `features.memoryMatch: true`. It uses up to 8 of your photos automatically (8 pairs, 16 cards). Edit the words in `memoryMatch`; `{moves}` in `winMessage` becomes her number of moves.

### 18. The three notes
`notes.items` has three notes, one per envelope. Each one works like the love letter: `label` (the tag in the room), `title`, `intro`, `paragraphs` (as many as you like), `closing` and `signature`, plus `seal` for the wax-seal colour (`rose`, `lavender`, `butter`, `blue`, `peach`).
Ideas: "open when you miss me", "open when you can't sleep", "open on a bad day".

---

## Putting it online

```bash
npm run build
```
This creates a `dist/` folder: a plain static website with no server, database or accounts. Upload that folder anywhere:

- **Netlify Drop** (easiest): drag the `dist` folder onto [app.netlify.com/drop](https://app.netlify.com/drop).
- **Vercel / Cloudflare Pages:** import the project; build command `npm run build`, output folder `dist`.
- **GitHub Pages:** push `dist/` to a `gh-pages` branch (or use a Pages action).

The site uses relative paths, so it also works from a sub-folder or a USB stick (open `dist/index.html` through any static file server; `npm run preview` is one).

Privacy: the page is marked `noindex`, so search engines are asked not to list it. Anyone with the link can still open it, so share the link only with her. There's no tracking or analytics. The only outside request is Google Fonts.

---

## Keyboard and accessibility

- ← / → turn pages, or swipe on a phone.
- In the photo viewer: ← / → change photo, Esc closes.
- Every button is a real button with a visible focus outline. Photos use your `alt` text (falling back to the caption).

## Project structure

```
src/
  data/loveConfig.js        ← everything you edit
  utils/content.js          placeholder detection, {her}/{you} filling, page order, photo list
  utils/sound.js            synthesised page-turn sound
  hooks/useReducedMotion.js motion preferences, media queries, swipe, typewriter, photo loading
  components/room/          the room page (Room.jsx) and the isometric 3D scene (RoomScene.jsx)
  components/scenes/        Photobooth, PhotoWall, MemoryMatch, SceneFrame
  components/               the diary: EnvelopeIntro, DiaryCover, DiaryBook, DiaryPage, PhotoGallery,
                            Lightbox, LoveNote, FinalSurprise, NavigationControls, MusicPlayer, …
  styles/                   global, animations, intro, diary, photos, room, scenes
public/
  images/date-1 … date-4/   your photos
  music/                    your songs
scripts/check.mjs           `npm run check`
```
