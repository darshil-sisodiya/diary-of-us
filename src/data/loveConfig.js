/* ============================================================================
 *  ♡  OUR LITTLE LOVE DIARY — THE ONLY FILE YOU NEED TO EDIT  ♡
 * ============================================================================
 *
 *  Everything you see on the website (words, photos, colours, music, which
 *  sections exist) comes from this file. You never need to touch the React
 *  components or the CSS.
 *
 *  THE GOLDEN RULES
 *  ----------------
 *  1. Anything still written like  "[SOMETHING IN CAPITALS]"  is a placeholder.
 *     Placeholders are hidden automatically, so she never sees them.
 *     Replace them with your own words whenever you're ready.
 *  2. An empty string  ""  (or deleting the line) hides that piece of text.
 *  3. enabled: false  removes a whole section. The navigation adapts by itself.
 *  4. {her} and {you} are replaced by the nicknames in `site` below.
 *     Example:  "for {her}, with all my love"  →  "for Bunny, with all my love".
 *     If the nickname is still a placeholder, the whole line hides itself.
 *  5. Line breaks: use \n inside a string to start a new line.
 *  6. Photos: put files in  public/images/date-1/  (etc.) and write the path
 *     as  "/images/date-1/photo-1.jpg". A missing photo simply doesn't show —
 *     no broken-image icons, ever.
 *
 *  Keep the commas and quotes exactly as they are and you can't break anything.
 * ========================================================================== */

export const loveConfig = {
  /* ------------------------------------------------------------------------
   * THE BASICS
   * ---------------------------------------------------------------------- */
  site: {
    title: "our shared braincell", // text in the browser tab
    herNickname: "[HER NICKNAME]", // used wherever you write {her}
    yourNickname: "[YOUR NICKNAME]", // used wherever you write {you}
  },

  /* ------------------------------------------------------------------------
   * MASTER SWITCHES — true = on, false = off.
   * Sections also have their own `enabled` below; a section only shows when
   * BOTH are true, so either one is enough to switch it off.
   * ---------------------------------------------------------------------- */
  features: {
    intro: true, // the envelope opening screen
    diaryCover: true, // the closed-book cover / home page
    datePages: true, // the memory pages
    loveNote: true, // the letter
    ending: true, // the last page
    finalSurprise: true, // the secret envelope on the last page
    floatingDecorations: true, // hearts, stars & flowers drifting in the background
    customCursor: false, // tiny heart cursor (desktop only)
    clickHearts: true, // a tiny heart pops wherever she clicks / taps
    musicPlayer: true, // little play/pause button (only if a song file exists)
    photoLightbox: true, // tap a photo to see it big
    progressIndicator: true, // four little hearts: "Memory 2 of 4"
    footer: false, // "made with love" line at the bottom

    // ---- the room and the things in it ----
    room: true, // the cozy room home page (false = open straight on the diary)
    photobooth: true, // the camera on the shelf
    photoWall: true, // the corkboard
    notes: true, // the three little notes on the clothesline
    memoryMatch: false, // a deck of cards on the shelf (memory game) — set to true to bring it back
    artStudio: true, // the easel on the floor (our painting timelapse)
    wordle: true, // the little letter board on the wall (our live wordle)
    roomCat: true, // the sleepy cat on the bed
  },

  /* ------------------------------------------------------------------------
   * 1. THE OPENING SURPRISE (the envelope)
   * ---------------------------------------------------------------------- */
  intro: {
    enabled: true,
    kicker: "For my cutie pie,", // small line above the heading
    heading: "Hii my babyyy ♡",
    message: "this is a little something for you", // a short line under the heading
    envelopeLabel: "for Srimayee", // handwritten on the envelope
    letterText: "a little place for us", // written on the card that slides out
    buttonText: "Open your little surprise",
    skipText: "skip straight in", // small link for skipping the animation
  },

  /* ------------------------------------------------------------------------
   * THE ROOM — the home page. Every object in it opens something.
   * Labels are the little handwritten tags next to each object.
   * ---------------------------------------------------------------------- */
  room: {
    enabled: true,
    kicker: "welcome to", // small line above the heading
    heading: "our little room",
    hint: "tap anything ♡",
    backLabel: "back to our room", // button on every page inside the room
    labels: {
      diary: "our diary",
      photobooth: "photobooth",
      photoWall: "photo wall",
      memoryMatch: "memory game",
      artStudio: "art studio",
      wordle: "our wordle",
      // the notes take their labels from the notes section below
    },
    catSays: "prrr ♡", // what the cat says when she taps it
    showRealSky: true, // the window shows morning / day / sunset / night by her clock
  },

  /* ------------------------------------------------------------------------
   * 2. THE DIARY COVER (also the "home" page)
   * ---------------------------------------------------------------------- */
  cover: {
    enabled: true,
    label: "[OPTIONAL TINY LABEL, E.G. EST. 2025]", // little stamp at the top of the cover
    title: "You and Me",
    subtitle: "", // optional line under the title
    dedication: "for {her}, from {you}", // handwritten line on the cover
    buttonText: "Start reading ♡",
  },

  /* ------------------------------------------------------------------------
   * 3. THE DATE PAGES
   *
   *  layout — how the 4 photos are arranged. Pick one per page:
   *     "polaroid-grid"     four Polaroids, each slightly tilted
   *     "scrapbook-collage" photos layered over each other with tape
   *     "film-strip"        a little film contact sheet (landscape frames)
   *     "photo-grid"        a clean, tidy 2 × 2 grid
   *     "featured-photo"    one big photo + three small ones
   *     "scattered-photos"  pinned to the page at playful angles
   *
   *  theme — the page's colour mood: "rose", "peach", "lavender", "butter", "blue"
   *  stickers — up to 3 decorations around the page:
   *     "heart", "star", "flower", "sparkle", "bow", "cloud"
   *  typewriter — true writes the story in typewriter letters.
   *
   *  PHOTO FIELDS
   *     src      "/images/date-1/photo-1.jpg"  (leave "" to remove the slot)
   *     alt      describe the photo for screen readers
   *     caption  handwritten text under the photo (optional)
   *     stamp    orange camera-style date stamp, e.g. "12 03 25" (optional)
   *     fit      "cover" fills the frame (may crop) | "contain" shows the whole photo
   *     focus    which part stays visible when cropping: "center", "top",
   *              "bottom", "left", "right", or e.g. "50% 30%"
   * ---------------------------------------------------------------------- */
  diary: {
    enabled: true,
    defaultLayout: "polaroid-grid", // used if a page's layout is missing or misspelled

    pages: [
      {
        id: "first-date",
        enabled: true,
        kicker: "Date no. 1",
        title: "Our First Date",
        subtitle: "Photoboth date",
        dateLabel: "27th sept. 2026",
        place: "[OPTIONAL PLACE]",
        description: "This was the first time we met and i really thought it will be so akward because i am so shy around new people, i love how we clicked pretty much instantly and i felt like i could be myself with you, i loved taking photobooth photos with you baby they were genuinely soso pretty and cute. i could not explain how happy i was to hold your hands for the first time after we were leaving for home, it really really made my entire day light up with so much happiness and i really really like you baby and i am so happy to have you in my life.",
        typewriter: false,
        note: "my baby", // sticky note on the page
        theme: "rose",
        layout: "polaroid-grid",
        stickers: ["flower", "heart", "sparkle"],
        photos: [
          { src: "/images/date-1/photo-1.jpg", alt: "Selfie of us in a photo booth, her wearing reindeer antlers and blowing a kiss", caption: "[OPTIONAL CAPTION]", stamp: "", fit: "cover", focus: "50% 45%" },
          { src: "/images/date-1/photo-2.jpg", alt: "Selfie of us at a cosy café at night, her sticking her tongue out", caption: "[OPTIONAL CAPTION]", stamp: "", fit: "cover", focus: "50% 74%" },
          { src: "/images/date-1/photo-3.jpg", alt: "Another photo booth selfie with the reindeer antlers, her sticking her tongue out", caption: "[OPTIONAL CAPTION]", stamp: "", fit: "cover", focus: "50% 40%" },
          { src: "/images/date-1/photo-4.jpg", alt: "Photo booth shot of us in antlers and mouse ears, making silly hand signs", caption: "[OPTIONAL CAPTION]", stamp: "", fit: "cover", focus: "48% 40%" },
        ],
      },
      {
        id: "second-date",
        enabled: true,
        kicker: "Date no. 2",
        title: "Our Second Date",
        subtitle: "Bowling date",
        dateLabel: "4th Oct. 2026",
        place: "[OPTIONAL PLACE]",
        description: "We were going bowling and i was really excited to see you again, i know we just met once but i already was kinda missing you and i was so happy that i was gonna see my baby again, we went bowling and yeah we all know what happened in there heheheh (pls dont beat me up), after that we were in auto and you were biting my fingers and it was so damnn cute and i loved cudling with you the entire time in the cafe, your teacher coming there was so funny.",
        typewriter: false,
        note: "my pretty girl",
        theme: "peach",
        layout: "scrapbook-collage",
        stickers: ["bow", "star", "heart"],
        photos: [
          { src: "/images/date-2/photo-1.jpg", alt: "Close-up selfie of us, her sticking her tongue out", caption: "[OPTIONAL CAPTION]", stamp: "", fit: "cover", focus: "45% 0%" },
          { src: "/images/date-2/photo-2.jpg", alt: "Selfie of us, him squishing her cheeks while she pouts", caption: "[OPTIONAL CAPTION]", stamp: "", fit: "cover", focus: "50% 32%" },
          { src: "/images/date-2/photo-3.jpg", alt: "Night selfie of us, her wearing his glasses", caption: "[OPTIONAL CAPTION]", stamp: "", fit: "cover", focus: "62% 45%" },
          { src: "/images/date-2/photo-4.jpg", alt: "Blurry, laughing selfie of us in the car", caption: "[OPTIONAL CAPTION]", stamp: "", fit: "cover", focus: "50% 62%" },
        ],
      },
      {
        id: "third-date",
        enabled: true,
        kicker: "Date no. 3",
        title: "Our Third Date",
        subtitle: "Movie date",
        dateLabel: "20th Oct. 2026",
        place: "[OPTIONAL PLACE]",
        description: "I hadn't seen you for more than two weeks and i geniuely was not able to keep my feelings for you inside of me, i wanted to ask you out so bad and i remember how nervous i was, i was sososos happy when we were in that movie theatre and you told yes to being my girlfriend, i loved our first kiss, it was so damnn hot and cute and i still replaly it in my head everyday. Thanks for being my girlfriend baby, you are everything i wanted and so much more.",
        typewriter: true,
        note: "thanks for being my girlfriend", // sticky note on the page
        theme: "lavender",
        layout: "film-strip",
        stickers: ["star", "cloud", "sparkle"],
        photos: [
          { src: "/images/date-3/photo-1.jpg", alt: "Photo booth selfie of us in cat ears, her blowing a kiss", caption: "[OPTIONAL CAPTION]", stamp: "", fit: "cover", focus: "50% 40%" },
          { src: "/images/date-3/photo-2.jpg", alt: "Photo booth shot of us in cat and bear ears, fingers on our lips", caption: "[OPTIONAL CAPTION]", stamp: "", fit: "cover", focus: "50% 35%" },
          { src: "/images/date-3/photo-3.jpg", alt: "Selfie of us in the cinema seats, her sticking her tongue out", caption: "[OPTIONAL CAPTION]", stamp: "", fit: "cover", focus: "50% 50%" },
          { src: "/images/date-3/photo-4.jpg", alt: "Our hands side by side wearing matching cat-charm bracelets", caption: "[OPTIONAL CAPTION]", stamp: "", fit: "cover", focus: "50% 58%" },
        ],
      },
      {
        id: "fourth-date",
        enabled: true,
        kicker: "Date no. 4",
        title: "Our Fourth Date",
        subtitle: "Mall date",
        dateLabel: "25th Oct. 2026",
        place: "[OPTIONAL PLACE]",
        description: "This was going to be our first date as boyfriend and girlfriend and i was sososos happy to see you again, i was missing you like crazy and past few days i loved how we were talking so much and it was the best thing ever, i love talking to you baby it always makes my days better. Anyways i loved eating mcd with you and going to that photobooth and honestly i will never forget making out and biting you in that park, it was so hot and cute and i cant stop thinking about it. I really miss you as im typing all this i so wish you were here.", 
        note: "you are so adorable", // sticky note on the page
        theme: "butter",
        layout: "featured-photo",
        stickers: ["flower", "bow", "heart"],
        photos: [
          { src: "/images/date-4/photo-1.jpg", alt: "Selfie of us, her hand resting on his chin while she sticks her tongue out", caption: "[OPTIONAL CAPTION]", stamp: "", fit: "cover", focus: "50% 40%" },
          { src: "/images/date-4/photo-2.jpg", alt: "Sunset selfie of us in a garden with a statue behind us", caption: "[OPTIONAL CAPTION]", stamp: "", fit: "cover", focus: "38% 40%" },
          { src: "/images/date-4/photo-3.jpg", alt: "Printed photo booth picture of us posing together", caption: "[OPTIONAL CAPTION]", stamp: "", fit: "cover", focus: "50% 32%" },
          { src: "/images/date-4/photo-4.jpg", alt: "Close-up selfie of us, her sticking her tongue out", caption: "[OPTIONAL CAPTION]", stamp: "", fit: "cover", focus: "66% 45%" },
        ],
      },
      {
        id: "fifth-date",
        enabled: true,
        kicker: "Date no. 5",
        title: "Our Fifth Date",
        subtitle: "Painting date",
        dateLabel: "31st October 2026",
        place: "[OPTIONAL PLACE]",
        description: "I wanna start with how much i missed you, i really hate being away from you but i was so happy we were going to see each other and going on a cute date heheheh, i was so excited to paint with you baby and omg you looked so damnn hot, like i was like ouu shii how's she this hot and the note you made me was so damnn cute along with the other gifts you gave me, they were all sososo cutieeeee. I was so bad at painting but i enjoyed watching you paint cus you looked so cute while painting and i was just getting to admire you, i had so much fun taking your photos and i was so happy when you liked them heehe, we got so many cute photos and it was genuinely our best date so far, i loved playing with your stomach and our short makeout session too, i wish i could have kissed you more but it really was the best day <3",
        typewriter: false,
        note: "my pretty artist", // sticky note on the page
        theme: "blue",
        layout: "scattered-photos",
        stickers: ["star", "sparkle", "heart"],
        photos: [
          { src: "/images/date-5/photo-1.jpg", alt: "Close-up selfie of us, him kissing her cheek while she sticks her tongue out", caption: "[OPTIONAL CAPTION]", stamp: "", fit: "cover", focus: "50% 45%" },
          { src: "/images/date-5/photo-2.jpg", alt: "Selfie of us at the pottery café, him squishing her cheeks while she pouts", caption: "[OPTIONAL CAPTION]", stamp: "", fit: "cover", focus: "50% 40%" },
          { src: "/images/date-5/photo-3.jpg", alt: "Selfie of us both pouting, her hand on his cheek", caption: "[OPTIONAL CAPTION]", stamp: "", fit: "cover", focus: "50% 35%" },
          { src: "/images/date-5/photo-4.jpg", alt: "Selfie of us, him resting on her shoulder while she sticks her tongue out", caption: "[OPTIONAL CAPTION]", stamp: "", fit: "cover", focus: "55% 35%" },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------------
   * 4. THE LOVE LETTER
   *  It only appears once at least one paragraph (or intro/closing) is written.
   *  placement — where the letter sits in the diary:
   *     "beforeEnding"  after the 4th date, right before the last page (default)
   *     "afterCover"    first thing after the cover
   *     "afterEnding"   after the last page, as a bonus
   *     1, 2 or 3       (a number, no quotes) after that date page
   * ---------------------------------------------------------------------- */
  loveNote: {
    enabled: true,
    placement: "beforeEnding",
    title: "<3",
    intro: "Dear {her},", // opening line
    paragraphs: [
      // Add as many paragraphs as you like — one string per paragraph.
      "I cant wait to go on more dates with you, i really really miss you and i wish you were here right now",
      "[WRITE YOUR SECOND PARAGRAPH HERE]",
      "[WRITE YOUR THIRD PARAGRAPH HERE]",
    ],
    closing: "[OPTIONAL CLOSING LINE, E.G. FOREVER YOURS,]",
    signature: "{you}",
    postscript: "[OPTIONAL P.S.]",
  },

  /* ------------------------------------------------------------------------
   * 5. THE LAST PAGE + THE SECRET ENVELOPE
   *  The secret envelope only appears once revealMessage is written.
   * ---------------------------------------------------------------------- */
  ending: {
    enabled: false,
    kicker: "the last page (for now)",
    heading: "And this is only the beginning...",
    message: "[WRITE YOUR FINAL MESSAGE HERE]",
    revealEnabled: true,
    revealPrompt: "psst... there's one more thing in here",
    revealButtonText: "One last little surprise",
    revealMessage: "[WRITE YOUR SECRET MESSAGE HERE]",
    revealSignature: "— {you}",
  },

  /* ------------------------------------------------------------------------
   * 6. THE PHOTOBOOTH (the camera on the shelf)
   *  Uses her camera to take a strip of photos she can save.
   *  Nothing is uploaded anywhere — the photos never leave her device.
   *  Note: browsers only allow the camera on https:// sites (any normal host
   *  like Netlify is https) or on localhost while you're testing.
   * ---------------------------------------------------------------------- */
  photobooth: {
    enabled: true,
    title: "our photobooth",
    subtitle: "four snaps, one strip, zero retakes (okay, unlimited retakes)",
    startText: "turn on the camera",
    shootText: "take our photos",
    retakeText: "again!",
    downloadText: "save the strip",
    shots: 4, // photos per strip (2–4)
    countdown: 3, // seconds before each photo
    stripCaption: "{her} & {you}", // written at the bottom of the strip
    showDateOnStrip: true,
    noCameraText: "the camera's being shy — want a strip made from our photos instead?",
    fromPhotosText: "make one from our photos",
  },

  /* ------------------------------------------------------------------------
   * 7. THE PHOTO WALL (the corkboard)
   *  All the diary photos are pinned here automatically. She can drag them
   *  around and tap one to flip it over (the back shows its caption).
   *  extraPhotos: add more photos that aren't in the diary, e.g.
   *    { src: "/images/extra/beach.jpg", note: "that one windy day", alt: "us at the beach" }
   * ---------------------------------------------------------------------- */
  photoWall: {
    enabled: true,
    title: "our photo wall",
    subtitle: "drag them around · tap one to flip it",
    includeDiaryPhotos: true,
    extraPhotos: [],
    shuffleText: "shuffle",
  },

  /* ------------------------------------------------------------------------
   * 7½. THE ART STUDIO (the easel on the floor)
   *  The timelapse plays on the canvas; the photo hangs beside it.
   * ---------------------------------------------------------------------- */
  artStudio: {
    enabled: true,
    title: "our little art studio",
    subtitle: "painting date · 31st October 2026",
    roomPhoto: "/images/painting/her-painting.jpg", // shown on the easel in the room
    video: "/images/painting/timelapse.mp4",
    videoTitle: "Us, Painting",
    videoNote: "", // small line under the title ("" hides it)
    photo: "/images/painting/our-painting.jpg",
    photoTitle: "Our Masterpieces",
    photoNote: "",
    playText: "play",
    pauseText: "pause",
  },

  /* ------------------------------------------------------------------------
   * 7¾. OUR WORDLE (the letter board on the wall)
   *  One secret word (picked at random from ~2,300 everyday words), one shared
   *  board, and we take turns guessing. Updates live on both phones (Firebase).
   * ---------------------------------------------------------------------- */
  wordle: {
    enabled: true,
    title: "our wordle",
    subtitle: "one word, two brains, taking turns ♡",
    herName: "Srimayee",
    yourName: "Darshil",
    tries: 6,
    database: "https://dada-91b67-default-rtdb.asia-southeast1.firebasedatabase.app",
    room: "us-xxyYjlvr3MmFA35Q", // must match the Firebase rules
  },

  /* ------------------------------------------------------------------------
   * 8. THE MEMORY GAME (cards on the shelf — off by default, see features)
   *  Find the matching pairs. Uses up to 8 of your photos automatically.
   * ---------------------------------------------------------------------- */
  memoryMatch: {
    enabled: true,
    title: "memory game",
    subtitle: "find all the pairs",
    movesLabel: "moves",
    pairsLabel: "pairs",
    winTitle: "you found them all ♡",
    winMessage: "in {moves} moves. not bad at all.",
    playAgainText: "play again",
    notEnoughPhotos: "add a few photos to the diary first ♡",
  },

  /* ------------------------------------------------------------------------
   * 9. THE THREE NOTES (envelopes on the clothesline in the room)
   *  Each note opens as its own little letter. Same fields as the love letter:
   *  label (the tag in the room), title, intro, paragraphs, closing, signature.
   *  seal: wax-seal colour — "rose", "lavender", "butter", "blue", "peach"
   *  Tip: titles like "open when you miss me" work really well here.
   * ---------------------------------------------------------------------- */
  notes: {
    enabled: true,
    heading: "little notes for you ♡", // the ribbon banner under the envelopes ("" to hide it)
    items: [
      {
        label: "note 1",
        seal: "rose",
        title: "Hi baby",
        intro: "Dear {her},",
        paragraphs: ["I really did not expect for us to come this far when we first started talking, i remember how you were so chalant and energetic which made talking to you soso fun, we talked about desi crime and i was genuinely so happy when you told you too listened to them, we talked about our favorite cases and so many other things we had in common. I loved how you never made me feel like i am the only one who is trying to converse, i loved how you talked to me with the same energy and there was just something about you that made me want to talk to you more and more, as days went by i didnt even realsie it but i had gotten used to talking to you everyday about everyday things and it really really made me feel so grateful that i can talk about my day without feeling judged, you slowly became my comfort and i couldnt ask for more <3."],
        closing: "",
        signature: "{you}",
      },
      {
        label: "note 2",
        seal: "lavender",
        title: "Hi girlfriend",
        intro: "Dear {her},",
        paragraphs: ["I just want you to know that i am glad i met you baby, you made me have something to look forward to everyday and i love how you are my first and last thought everyday, i love sleeping thinking about you and waking with thoughts of you. you really are the best thing that happened to me this year, everything about you is so nice and cute and i fucking love talking to you, i feel like i can talk to you for an entire day without feeling like i wanna hangup or not talk to you and i am just so grateful that i have a person like this who is my girlfriend because i still cant believe you are my girlfriend, you are so cute and hot and adorable and i am sooooo glad you are my girlfriend babyyy and i also hope you know ill do anything i can to treat you well <3."],
        closing: "",
        signature: "{you}",
      },
      {
        label: "note 3",
        seal: "butter",
        title: "Hi cutie",
        intro: "Dear {her},",
        paragraphs: ["I know we have been fighting since yesterday and i am like writing this right now when you are eating dinner, i know we have been fighting since last night and hurting each other but in all honesty i fucking miss you so damnn much right now, i just wanna come and be with you and talk to you for hours right now, i hate when we fight and i hate today but i hope you know i really really really like you my baby and none of these small fights are ever gonna change that, we hurt each other sometimes and its okay it does not define our relationship, we tell things we dont mean at times but its never gonna change the fact that i like you so damnnn muchhhhh"],
        closing: "",
        signature: "{you}",
      },
    ],
  },

  /* ------------------------------------------------------------------------
   * BUTTON & NAVIGATION WORDS
   * {current} and {total} are filled in automatically.
   * ---------------------------------------------------------------------- */
  navigation: {
    previous: "Previous",
    next: "Next page",
    home: "Cover",
    backToMemories: "back to our memories",
    readAgain: "Read our story again ♡",
    progressLabel: "Memory {current} of {total}",
    noteLabel: "a little letter",
    endingLabel: "the last page",
    pageNumber: "~ {page} ~", // shown at the bottom of each page
    // Read aloud by screen readers for icon-only buttons:
    playMusic: "Play our song",
    pauseMusic: "Pause the music",
    closePhoto: "Close photo",
    previousPhoto: "Previous photo",
    nextPhoto: "Next photo",
  },

  /* ------------------------------------------------------------------------
   * MUSIC
   *  Put an .mp3 file in public/music/ and write its path below.
   *  Music never starts on its own — only after she presses play
   *  (or opens the envelope, if startWithDiary is true).
   *  The button hides itself if the file doesn't exist.
   * ---------------------------------------------------------------------- */
  music: {
    enabled: true,
    src: "/music/our-song.mp3",
    title: "[OPTIONAL SONG NAME]", // shown next to the button
    startWithDiary: false, // true = starts playing when she opens the envelope
    volume: 0.5, // 0 to 1
  },

  /* ------------------------------------------------------------------------
   * SOUND EFFECTS
   * ---------------------------------------------------------------------- */
  sounds: {
    pageTurn: false, // soft paper "swish" when turning pages
    volume: 0.35, // 0 to 1
  },

  /* ------------------------------------------------------------------------
   * ANIMATION
   *  intensity:
   *     "full"    everything on (default)
   *     "gentle"  fewer decorations, softer page transitions
   *     "off"     no movement at all (also applied automatically when her
   *               device asks for reduced motion)
   *  pageTransition: "flip" (turns like a book page) | "slide" | "fade"
   *     (phones always use a gentle slide so it stays smooth)
   * ---------------------------------------------------------------------- */
  animation: {
    intensity: "full",
    pageTransition: "flip",
  },

  /* ------------------------------------------------------------------------
   * BACKGROUND DECORATIONS
   * ---------------------------------------------------------------------- */
  decorations: {
    density: "medium", // "low" | "medium" | "high"
    types: ["heart", "star", "flower", "sparkle", "bow", "cloud", "petal"],
  },

  /* ------------------------------------------------------------------------
   * LITTLE DETAILS — show (true) or hide (false)
   * ---------------------------------------------------------------------- */
  display: {
    photoCaptions: true,
    dates: true, // date labels & places on the memory pages
    dateStamps: true, // orange camera stamps on photos
    stickers: true, // stickers & tape on the pages
    notes: true, // the sticky notes on the memory pages
    pageNumbers: true,
  },

  /* ------------------------------------------------------------------------
   * FOOTER
   * ---------------------------------------------------------------------- */
  footer: {
    text: "made with all my love",
  },

  /* ------------------------------------------------------------------------
   * COLOURS & FONTS
   *  Colours are normal CSS colours (hex codes like "#f4c2c8").
   *  Keep "ink" dark so text stays easy to read.
   * ---------------------------------------------------------------------- */
  theme: {
    colors: {
      background: "#fbf1ea", // warm cream page background
      blush: "#f7e1dc", // pale blush used for soft glows
      paper: "#fffaf3", // ivory diary paper
      ink: "#5a3833", // main text — warm dark brown
      inkSoft: "#86615b", // secondary text
      rose: "#c98a90", // dusty rose — primary accent
      roseDeep: "#9c5560", // darker rose for small accent text
      pink: "#f4c2c8", // pastel pink — buttons & highlights
      lavender: "#dccff0",
      peach: "#f9d4bf",
      butter: "#f8e8ad",
      blue: "#cde1f1",
      leaf: "#bfd1b2", // little leaves in the bouquet
    },
    fonts: {
      handwritten: "Caveat", // titles, notes, captions
      body: "Nunito", // normal reading text & buttons
      typewriter: "Courier Prime", // pages with typewriter: true
      // If you change a font above, copy the matching link from fonts.google.com here:
      googleFontsUrl:
        "https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Courier+Prime&family=Nunito:wght@400;600;700;800&display=swap",
    },
  },
};
