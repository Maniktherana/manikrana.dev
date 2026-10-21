export type WorkKind = "project" | "component";

export type WorkItem = {
  slug: string;
  title: string;
  tagline?: string;
  kind: WorkKind;
  summary: string;
  tile: keyof typeof tileAspects;
  uses?: readonly string[];
  links?: readonly { label: string; href: string }[];
  files?: readonly string[];
  usage?: string;
  included?: string;
  notIncluded?: string;
  notes?: readonly string[];
};

export const SUMMARY_LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

export function plainSummary(item: WorkItem) {
  return item.summary.replace(SUMMARY_LINK, "$1");
}

export const tileAspects = {
  sm: 17 / 10,
  md: 17 / 14,
  lg: 17 / 18,
  xl: 17 / 22,
  square: 1,
  video: 16 / 9,
} as const;

export const work = [
  {
    slug: "agentsims",
    title: "Agentsims",
    tagline: "Tooling for mobile devs",
    kind: "project",
    summary: "Rich tooling for iOS and Android simulators for mobile devs.",
    tile: "square",
    uses: ["Bun", "Effect", "React"],
    links: [
      { label: "agentsims.dev", href: "https://agentsims.dev" },
      { label: "GitHub", href: "https://github.com/Maniktherana/agentsims" },
    ],
  },
  {
    slug: "gust",
    title: "Gust",
    tagline: "Text animation library",
    kind: "project",
    summary: "A React text animation component built on the Web Animations API.",
    tile: "square",
    links: [
      { label: "gust.manikrana.dev", href: "https://gust.manikrana.dev" },
      { label: "GitHub", href: "https://github.com/Maniktherana/gust" },
    ],
  },
  {
    slug: "voice-edge",
    title: "Voice edge",
    kind: "component",
    summary:
      "A WebGL glow that rises from one edge of a surface as you speak, and sweeps side to side while the reply is worked out.",
    tile: "xl",
    uses: ["WebGL", "Web Audio"],
    files: ["voice-edge.tsx", "shader.ts", "audio-response.ts", "palettes.ts"],
    usage: "usage.tsx",
    included:
      "The VoiceEdge wrapper: a glow along one edge of whatever it wraps, driven by the microphone or an analyser you pass in, with a sweeping processing state and seven palettes.",
    notIncluded:
      "The phone, its call controls and waveform, the transcript and the recorded voice note.",
  },
  {
    slug: "ai-chat",
    title: "AI chat",
    kind: "component",
    summary:
      "The layout shell of an AI chat app: a sidebar that folds to an icon rail, the chat as an inset card, and a side panel that docks beside it for sources or the thinking trace.",
    tile: "video",
    uses: ["motion"],
    files: ["ai-chat.tsx"],
    usage: "usage.tsx",
    included:
      "The shell: a sidebar that folds to a rail, the inset chat card with its header and footer, and a side panel that docks beside it, with the layout animations between them. Every area is a slot for your own content.",
    notIncluded:
      "The skeleton bars standing in for threads, messages, sources and the thinking trace, and the scripted tour.",
  },
  {
    slug: "agent-terminal",
    title: "Agent terminal",
    kind: "component",
    summary:
      "The Claude Code terminal from the agentsims.dev landing page, running an agent through two requests on its own. Prompts type into the composer, answers stream in word by word, and tool calls scroll past under a shimmering status line.",
    tile: "lg",
    uses: ["motion", "Web Animations API"],
    files: ["agent-terminal.tsx", "use-terminal-playback.ts"],
    usage: "usage.tsx",
    included:
      "The terminal view, which renders the rows, status word and composer text you give it, and a playback hook that steps a timed script through it.",
    notIncluded:
      "The Claude Code session it plays, the header text and logo, and the wrapper that scales it to fit. Write your own script, or feed it live rows from an agent.",
  },
  {
    slug: "message-composer",
    title: "Message composer",
    kind: "component",
    summary:
      "A chat composer that starts as a pill, stacks into a card when the text wraps, and carries attachments with an upload ring. Drop files on it to attach them; while a reply is working, send becomes stop.",
    tile: "lg",
    uses: ["motion"],
    files: ["message-composer.tsx", "attachments.tsx"],
    usage: "usage.tsx",
    included:
      "The composer, the attachment strip with its upload ring, and the drop overlay. You hold the attachments and the sending state, through props and callbacks.",
    notIncluded:
      "The typing loop and the simulated uploads and replies. Wire the callbacks to your own upload and chat code.",
  },
  {
    slug: "thinking-orb",
    title: "Thinking orbs",
    kind: "component",
    summary:
      "Three WebGL orbs for AI interfaces: Diffusion, Fold and Gemini. They think and listen, and the Gemini orb moves with your voice.",
    tile: "lg",
    uses: ["WebGL"],
    files: [
      "diffusion-orb.tsx",
      "fold-orb.tsx",
      "gemini-orb.tsx",
      "use-orb.ts",
      "orb-renderer.ts",
      "palettes.ts",
      "voice-response.ts",
    ],
    usage: "usage.tsx",
    notes: [
      "The band motion in diffusion-orb.tsx is adapted from thinking-orbs (MIT, Jakub Antalik); keep the attribution comment.",
    ],
    included:
      "DiffusionOrb, FoldOrb and GeminiOrb, the shared WebGL renderer and frame loop they draw through, and the voice follower that moves the Gemini orb with a level and four bands you feed it.",
    notIncluded:
      "The carousel, the recorded voice note and the analyser that plays it. Feed the Gemini orb from your own microphone or speech output.",
  },
  {
    slug: "dot-matrix",
    title: "Dot matrix",
    kind: "component",
    summary:
      "A thinking loader drawn as a small grid of dots. Five patterns light it up, from a scan to a helix, plus a wave you shape yourself; each dot keeps its color and only the brightness moves.",
    tile: "sm",
    uses: ["Canvas"],
    files: ["dot-matrix.tsx", "patterns.ts", "hues.ts", "draw.ts"],
    usage: "usage.tsx",
    included:
      "DotMatrix, its six patterns, a builder for wave patterns, four hue maps, and the canvas renderer that one shared frame loop paints. Grid and dot size, spacing, roundness, bevel, brightness range, speed and pausing are props.",
    notIncluded:
      "The cycle through the patterns on the tile, and the hue and pattern buttons on the stage.",
  },
  {
    slug: "sweep",
    title: "Sweep",
    kind: "component",
    summary:
      "A version of [glimm](https://glimm.dev/) that's contained to a parent element. A band of color that sweeps across a surface as it passes. It works as a loading state, or as a highlight that runs over content.",
    tile: "md",
    uses: ["WebGL"],
    files: ["sweep.tsx"],
    usage: "usage.tsx",
    included:
      "The Sweep wrapper, its four palettes, four directions, and a still band for reduced motion.",
    notIncluded: "The direction and palette buttons on the stage.",
  },
  {
    slug: "chat-showcase",
    title: "Chat showcase",
    kind: "component",
    summary:
      "A phone rises over a softly breathing gradient and plays one conversation after another, a message a second. A stepper along the top fills as each one plays, and jumps to any of them when you click it.",
    tile: "md",
    uses: ["motion"],
    files: [
      "chat-showcase.tsx",
      "messaging-app.tsx",
      "stepper.tsx",
      "gradient.tsx",
      "use-step-playback.ts",
      "@manikrana/ui/components/iphone.tsx",
    ],
    usage: "usage.tsx",
    included:
      "The whole box: the breathing gradient, the iPhone with a plain messaging app inside it, and the stepper. You pass the conversations and the contact, set the timing, and either control the step or leave it alone.",
    notIncluded:
      "The four sample conversations, and the pause while the tile is off screen. Feed it your own conversations, and pause it however suits your page.",
  },
  {
    slug: "slider",
    title: "Slider",
    kind: "component",
    summary: "My attempt at recreating the slider from [dialkit.dev](https://dialkit.dev).",
    tile: "sm",
    uses: ["motion"],
    files: ["@manikrana/ui/components/slider.tsx"],
    usage: "usage.tsx",
    included:
      "The slider with snapping, the rubber band past its ends, a typed value, keyboard control, and a hidden input for forms.",
    notIncluded: "The cursor that works it on the tile.",
  },
  {
    slug: "citation-preview",
    title: "Citation chips",
    kind: "component",
    summary:
      "Source chips that sit inline in an AI answer for an AI chat app. Hover one, or tap it on a phone, and the cited page opens above it with its image, favicon and title; a chip for several sources opens a row of their cards, each naming its domain.",
    tile: "lg",
    uses: ["Base UI"],
    files: [
      "citation-chips.tsx",
      "citation-preview.tsx",
      "@manikrana/ui/components/progressive-blur.tsx",
      "source-favicon.tsx",
      "source.ts",
    ],
    usage: "usage.tsx",
    notes: [
      "The cards are Base UI popovers that open on hover. On a touch screen a tap on a chip opens its card instead of following the link, and the card itself links to the source.",
    ],
    included:
      "CitationChip and CitationGroupChip with their hover cards: the image card with its progressive blur, a plain card when a source has no image, and favicons with a globe fallback. A chip for several sources opens a scrolling row of linked cards, one per source, each naming its domain. Each source comes in as an object with its URL, title, image, favicon and snippet.",
    notIncluded:
      "The question, the answer and the sources it cites, and the send, stream and cursor that play on the tile and stage. Parsing citations out of markdown and fetching link previews are left to your app.",
  },
  {
    slug: "image-tray",
    title: "Image tray",
    kind: "component",
    summary:
      "The web-search results for an AI chat: a strip of thumbnails under a reply, and a tray that springs up when you tap one. It shows the image under a progressive blur with its source, and lets you copy the link or visit the page.",
    tile: "xl",
    uses: ["motion"],
    files: ["image-tray.tsx", "image-strip.tsx", "@manikrana/ui/components/progressive-blur.tsx"],
    usage: "usage.tsx",
    included:
      "The strip, which scrolls sideways, dissolves into its background at whichever edge has more to show, and slides in images that arrive later; and the tray: the image under a progressive blur and scrim, the source's favicon, name and link, close, copy and visit buttons, and the spring that raises it. Drag its top edge down, tap outside or press Escape to close it. With reduced motion it fades in place.",
    notIncluded:
      "The chat around the strip, the talk covers it shows, and the scripted send, stream and tap on the tile. There is no toast for a copied link; onCopy is where to show one.",
  },
  {
    slug: "image-loader",
    title: "Image loader",
    kind: "component",
    summary:
      "The placeholder for AI image generation. a grid of tiny dots that flicker or weave, until the finished image fades in.",
    tile: "lg",
    uses: ["WebGL", "motion"],
    files: ["image-loader.tsx", "dot-grid.tsx", "dot-grid-shader.ts"],
    usage: "usage.tsx",
    included:
      "ImageLoader, a frame at the image's aspect ratio that plays the dot grid while generating and fades the image in once it has decoded, and DotGrid, the WebGL shader on its own, with its organic and weave patterns, four wave shapes and every other setting from the original.",
    notIncluded:
      "The cycle through the patterns and the pattern buttons. Set the status and image from your own generation API.",
  },
  {
    slug: "dynamic-island",
    title: "Dynamic Island",
    kind: "component",
    summary:
      "My attempt at recreating dynamic island from the [animations.dev](https://animations.dev) course.",
    tile: "md",
    uses: ["motion"],
    files: ["dynamic-island.tsx"],
    usage: "usage.tsx",
    included:
      "The island with its idle, call and timer views and the morph between them, driven by a view prop.",
    notIncluded:
      "The loop that cycles through the views on the tile, and the view buttons on the stage.",
  },
  {
    slug: "family-drawer",
    title: "Family drawer",
    kind: "component",
    summary:
      "My attempt at recreating the family drawer from the [animations.dev](https://animations.dev) course.",
    tile: "lg",
    uses: ["motion"],
    files: ["family-drawer.tsx"],
    usage: "usage.tsx",
    included:
      "The drawer's parts: a pill trigger that opens into a surface sized to its content, pages that crossfade as you move between them, a close button, and header, item and footer parts to build pages from.",
    notIncluded: "The wallet's pages: its options, private key, recovery phrase and remove.",
  },
] as const satisfies readonly WorkItem[];

export const projects = work.filter((item) => item.kind === "project");
export const components = work.filter((item) => item.kind === "component");
export const featured = [
  "agentsims",
  "gust",
  "voice-edge",
  "citation-preview",
  "thinking-orb",
  "message-composer",
].map((slug) => work.find((item) => item.slug === slug)!);

export type WorkList = "home" | "work";

export function findWork(slug: string): WorkItem | undefined {
  return work.find((item) => item.slug === slug);
}

export function neighbours(slug: string) {
  const index = work.findIndex((item) => item.slug === slug);
  return {
    previous: work[(index - 1 + work.length) % work.length]!,
    next: work[(index + 1) % work.length]!,
  };
}
