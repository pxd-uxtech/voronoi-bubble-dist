# VoronoiBubble

[Korean README](README.ko.md)

VoronoiBubble is a practical renderer for drawing Voronoi treemaps easily, with optional semantic position hints. Pass tidy-style flat rows with `group -> subgroup -> item -> size` columns and it renders a three-level responsive SVG directly. You do not need to build `d3.hierarchy()` data, wire resize code, or hand-tune a raw geometric layout.

Traditional Voronoi treemaps are good at showing hierarchy and area, but the cell positions usually carry little meaning. VoronoiBubble keeps the hierarchy and size encoding, while `positions` lets you guide groups or subgroups with UMAP-like coordinates so similar concepts can appear near each other.

This makes it especially useful for qualitative data maps from reviews, surveys, and interviews. It also fits prepared hierarchies such as government budgets, book maps, document taxonomies, organization sizes, and project portfolios. VoronoiBubble is the rendering engine used by AffinityBubble.

![VoronoiBubble example: customer review topic map with group -> subgroup -> item hierarchy](docs/images/hero.png)

## Features

- **Three-level Voronoi treemap**: `group` (depth 1) -> `subgroup` (depth 2) -> `item` (depth 3), with separate labels and pebble-style outlines for upper levels.
- **Tidy-style flat rows**: render `{ group, subgroup, item, size }[]` directly. Use `levels` and `value` when your column names differ.
- **Easy colors and sentiment colormaps**: use `colors: "waterLilies"` for built-in palette presets, set `groupColors` for direct group colors, or use `sentiment: "score"` to map numeric ratings to a red-yellow-green diverging palette.
- **Positioning hints and readable labels**: use `positions` for depth-aware relative placement, or `VoronoiBubbleHelpers.createGridPositions()` for a stable grid order. Default label adjustment reduces overlap inside cell boundaries.
- **Popups and hover callbacks**: `onClick` with `showVoronoiPopup` works without extra CSS; `onHover` and `onSubgroupLabelHover` let you attach custom tooltips.
- **Responsive SVG**: generated charts use `viewBox`, `width: 100%`, and `height: auto`.
- **Reproducible layouts**: the same `seedRandom` gives the same layout.
- **Custom HTML labels**: `renderGroupLabel` and `renderSubgroupLabel` can return HTML rendered through `foreignObject`.

## Quick Start

```html
<div id="chart"></div>

<script type="module">
  import { VoronoiBubble, VoronoiBubbleHelpers } from 'https://cdn.jsdelivr.net/gh/pxd-uxtech/voronoi-bubble-dist@v2.0.1/dist/voronoi-bubble.standalone.js';

  const data = [
    { group: 'Positive', subgroup: 'Delivery', item: 'Fast delivery', size: 30, score: 5 },
    { group: 'Positive', subgroup: 'Quality', item: 'Good material', size: 25, score: 5 },
    { group: 'Neutral', subgroup: 'Packaging', item: 'Acceptable packaging', size: 12, score: 3 },
    { group: 'Negative', subgroup: 'Price', item: 'Too expensive', size: 15, score: 2 },
    { group: 'Negative', subgroup: 'Support', item: 'Slow response', size: 8, score: 1 },
  ];

  const svg = new VoronoiBubble().render(data, {
    width: 1200,
    height: 900,
    title: 'Customer Feedback',
    caption: 'Review topic map',
    showGroupLabel: true,
    showPercent: true,
    colors: 'waterLilies',
    // Use groupColors when you want exact group colors:
    // groupColors: { Positive: '#4CAF50', Neutral: '#FFC107', Negative: '#F44336' },
    sentiment: 'score',
    positions: VoronoiBubbleHelpers.createGridPositions(
      ['Positive', 'Neutral', 'Negative'],
      { depth: 1 }
    ),
  });

  document.getElementById('chart').appendChild(svg);
</script>
```

See [`examples/`](examples/) for runnable examples. `examples/index.html` is the gallery.

## Use Cases

- Qualitative maps from customer reviews, survey open responses, interviews, and coded text.
- Government budgets, organization costs, team sizes, and portfolio maps.
- Book maps, literature reviews, document classifications, and knowledge taxonomies.
- Semantic maps where embedding or UMAP coordinates are passed through `positions`.

## Label Guidance

Use `subgroup` as a short heading, preferably five words or fewer. Put longer explanations in an extra field such as `description`, `summary`, or `review`, then show that field in a popup or tooltip. VoronoiBubble treats default subgroup labels as heading-like text and wraps them to at most two phrase lines.

## CDN

```text
https://cdn.jsdelivr.net/gh/pxd-uxtech/voronoi-bubble-dist@v2.0.1/dist/voronoi-bubble.standalone.js
```

| Situation | File | Loading style |
|---|---|---|
| `import` / `import()` (recommended) | `voronoi-bubble.standalone.js` | ESM, all dependencies bundled |
| `<script>` tag or local `file://` | `voronoi-bubble.standalone.umd.js` | global `VoronoiBubbleModule` |
| Bundlers such as Vite/Webpack | `voronoi-bubble.esm.js` | peer dependencies required |
| Peer dependencies loaded separately | `voronoi-bubble.umd.js` / `voronoi-bubble.min.js` | global `VoronoiBubble` |

Do not load `.umd.js` with `import()`. UMD exposes globals; it does not provide ESM named exports.

## Positioning

`positions` are scale-free, depth-aware relative placement hints:

```js
new VoronoiBubble().render(data, {
  positions: [
    { key: 'Positive', depth: 1, x: 1, y: 0 },
    { key: 'Neutral', depth: 1, x: 0.5, y: 0.5 },
    { key: 'Negative', depth: 1, x: 0, y: 1 },
  ],
});
```

If you have UMAP coordinates for all depth-2 subgroups, pass them as-is. VoronoiBubble normalizes coordinates by depth. If you only need a stable reading order, use the grid helper:

```js
const groups = ['Positive', 'Neutral', 'Negative', 'Other'];

new VoronoiBubble().render(data, {
  positions: VoronoiBubbleHelpers.createGridPositions(groups, { depth: 1 }),
});
```

## Documentation

- [docs/API.md](docs/API.md): data format, options, callbacks, Public CSS API, popups, sentiment colormaps, positions, and label options.
- [docs/MIGRATION.md](docs/MIGRATION.md): v1 -> v2 rename guide.
- [docs/OPEN_CORE_STRATEGY.md](docs/OPEN_CORE_STRATEGY.md): open renderer, AffinityBubble API boundary, agent strategy, and positions policy.
- [docs/NEXT_STEPS.md](docs/NEXT_STEPS.md): follow-up work for labels, fonts, colors, examples, and agent distribution.
- [CHANGELOG.md](CHANGELOG.md): release history.
- [CONTRIBUTING.md](CONTRIBUTING.md): development and release workflow.
- [examples/](examples/): runnable examples.

## Agent Instructions

This repository includes agent instructions in `skills/voronoi-bubble/`. ChatGPT, Codex, Claude, and other coding agents can use the skill to map user data to `group -> subgroup -> item -> size` rows and generate browser-openable Voronoi treemap HTML with popups.

- Default output: single HTML file using the CDN UMD bundle (`skills/voronoi-bubble/assets/cdn-popup-template.html`).
- Offline output: HTML using local `./dist/voronoi-bubble.standalone.umd.js` (`skills/voronoi-bubble/assets/local-popup-template.html`).
- Plugin packaging: `.codex-plugin/plugin.json` packages the skill as a skills-only plugin.

Ask an agent for something like: “Create a popup-enabled Voronoi treemap HTML chart from this data.” Add an MCP server or ChatGPT UI later if you need automatic analysis, hosted rendering, or live external data.

## Development

```bash
npm install
npm test
npm run build
npm run dev
```

Examples import `../dist/voronoi-bubble.standalone.js`, so run `npm run build` before opening them.

### Repository Structure

| Path | Description |
|---|---|
| `src/VoronoiBubble.js` | Main renderer, options, events, and layout pipeline |
| `src/VoronoiBubbleHelpers.js` | Colors, font scale, positioning helpers, sentiment palettes |
| `src/LabelAdjuster.js` | Label overlap reduction inside cell boundaries |
| `src/PebbleRenderer.js` | Pebble-style rounded outlines |
| `src/PopupHelpers.js` | `createDOMPopup`, `getBubbleStyles`, `getPopupStyles` |
| `src/nestingForVoronoi.js` | Flat rows -> hierarchical data conversion |
| `src/utils/showVoronoiPopup.js` | Default popup helper with `{field}` formatting |
| `src/index.js` | Public exports |
| `examples/` | Runnable examples and gallery |
| `tests/` | Vitest + jsdom tests |
| `dist/` | Build output, gitignored in this source repository |

## Distribution

Build outputs are published to [`pxd-uxtech/voronoi-bubble-dist`](https://github.com/pxd-uxtech/voronoi-bubble-dist). See [CONTRIBUTING.md](CONTRIBUTING.md) for the maintainer release procedure.

## License

[MIT](LICENSE) — Licensor: UXtechLab. Originally created by [@taekie](https://github.com/taekie).

- Non-commercial and personal use is free.
- Commercial use requires a separate UXtechLab license.
- This version automatically converts to MIT on **2029-01-01**.

See [LICENSE](LICENSE) for the full terms.
