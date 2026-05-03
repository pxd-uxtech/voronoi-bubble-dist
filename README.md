# VoronoiBubble

Voronoi treemap visualization engine powering the ○○Bubble series.

Originally created by [@taekie](https://github.com/taekie).  
Copyright (c) 2025 UXtechLab. Licensed under [BUSL-1.1](https://mariadb.com/bsl11/).

<img src="files/example-preview.png" width="600" alt="VoronoiBubble Example">

## What's included beyond d3-voronoi-treemap

[d3-voronoi-treemap](https://github.com/Kcnarf/d3-voronoi-treemap) computes weighted Voronoi polygons — it outputs geometry only and requires a manually constructed `d3.hierarchy()` object. VoronoiBubble takes a flat array and handles everything else. Four key features stand out:

### 1. Flat array input — no manual hierarchy

d3-voronoi-treemap requires you to build a nested tree with `d3.hierarchy()` before passing data. VoronoiBubble accepts a plain flat array and converts it to a 3-level hierarchy internally (group → subgroup → item).

```javascript
// No d3.hierarchy() needed — just pass a flat array
const data = [
  { group: "Sales",     subgroup: "Domestic",      item: "Seoul",   value: 120 },
  { group: "Sales",     subgroup: "Domestic",      item: "Busan",   value:  80 },
  { group: "Marketing", subgroup: "International", item: "Tokyo",   value:  60 }
];

treemap.render(data, {
  levels: ['group', 'subgroup', 'item'],
  value: 'value',
  width: 900, height: 600
});
```

Use any field names you want — `levels` and `value` map them. The defaults are `levels: ['metaLabel', 'label', 'text']` and `value: 'bubbleSize'`.

### 2. Region position control

Voronoi layouts are non-deterministic by default — you can't control which region ends up where. VoronoiBubble lets you seed the algorithm with position hints so specific regions appear in predictable areas (left, right, quadrant, circle, etc.). Coordinates are normalized automatically, and the algorithm still handles exact cell boundaries based on data weights.

```javascript
treemap.render(data, {
  positions: [
    { key: 'Sales',     depth: 1, x: 1,   y: 0   },  // top-right
    { key: 'Marketing', depth: 1, x: 0.5, y: 0.5 },  // center
    { key: 'Support',   depth: 1, x: 0,   y: 1   }   // bottom-left
  ]
});
```

### 3. Label collision avoidance

When a subgroup label overlaps with its parent group label, the adjuster automatically moves it to whichever side has more free space — staying within the cell polygon boundary. Works with both SVG text and custom HTML renderers (`metaLabelRenderer`).

### 4. Pebble outline

Renders cell borders as smooth, rounded curves using Bézier interpolation — giving the chart its characteristic "pebble" look. Configurable per-level with `pebbleRound` (corner radius) and `pebbleWidth` (stroke weight).

```javascript
treemap.render(data, { pebble: true, pebbleRound: 20, pebbleWidth: 5 });
```

---

Beyond these four, VoronoiBubble also provides:

| Feature | Description |
|---|---|
| SVG rendering | Full SVG output with hierarchical cell layers |
| Hierarchical labels | 3-level label system (group → subgroup → item) auto-sized by cell area |
| Custom HTML labels | `metaLabelRenderer` / `labelRenderer` callbacks for full HTML/CSS control |
| Color system | Palette assigned by cell size; per-level lightness variation; `keyColors` overrides |
| Click / hover | Cell selection, highlight, `clickFunc` callback |
| Popup helpers | `showVoronoiPopup` (Observable) and `createDOMPopup` (standard DOM) |
| `getCellColors` | Retrieve applied colors after render — useful for building legends |
| Deterministic layout | `seedRandom` option for reproducible layouts |
| Percentage labels | `showPercent` option |
| Cell background image | `cellImage` callback — fill or fit mode, original or tint color |

## CDN Usage (jsdelivr)

### Which file to use?

| Scenario | File | How |
|---|---|---|
| `import()` or `import` statement | `voronoi-bubble.standalone.js` | ESM dynamic import |
| `<script>` tag (local/offline) | `voronoi-bubble.standalone.umd.js` | `window.VoronoiTreemapModule` global |
| Observable notebook | `voronoi-bubble.standalone.js` | ESM import |
| Build tool (webpack/vite) | `voronoi-bubble.esm.js` | peer deps required |

> **⚠️ Do not use the `.umd.js` file with `import()`.**  
> UMD bundles expose a global variable, not ES module named exports.  
> Use `.standalone.js` (ESM) for any `import`-based loading.

### Dynamic import (ESM)

```javascript
const { VoronoiTreemap, showVoronoiPopup } = await import(
  'https://cdn.jsdelivr.net/gh/pxd-uxtech/voronoi-bubble-dist@{hash}/dist/voronoi-bubble.standalone.js'
);

const treemap = new VoronoiTreemap();
const svg = treemap.render(data, options);
```

### `<script>` tag (UMD standalone)

```html
<script src="https://cdn.jsdelivr.net/gh/pxd-uxtech/voronoi-bubble-dist@{hash}/dist/voronoi-bubble.standalone.umd.js"></script>
<script>
  const { VoronoiTreemap, showVoronoiPopup } = VoronoiTreemapModule;
  const treemap = new VoronoiTreemap();
  const svg = treemap.render(data, options);
</script>
```

### With peer dependencies (UMD)

```html
<script src="https://cdn.jsdelivr.net/npm/d3@7"></script>
<script src="https://cdn.jsdelivr.net/npm/d3-weighted-voronoi@1"></script>
<script src="https://cdn.jsdelivr.net/npm/d3-voronoi-map@2"></script>
<script src="https://cdn.jsdelivr.net/npm/d3-voronoi-treemap@1"></script>
<script src="https://cdn.jsdelivr.net/npm/seedrandom@3"></script>
<script src="https://cdn.jsdelivr.net/gh/pxd-uxtech/voronoi-bubble-dist@{hash}/dist/voronoi-bubble.umd.js"></script>
<script>
  const treemap = new VoronoiTreemap.VoronoiTreemap();
  const svg = treemap.render(data, options);
</script>
```

## Observable Usage

### Recommended: Standalone Bundle

For Observable notebooks, use the standalone bundle that includes all dependencies.

```javascript
// Cell 1: Import library with popup helpers
{
  const module = await import("https://cdn.jsdelivr.net/gh/pxd-uxtech/voronoi-bubble-dist@{hash}/dist/voronoi-bubble.standalone.js");
  VoronoiTreemap = module.VoronoiTreemap;
  showVoronoiPopup = module.showVoronoiPopup;
  return module;
}
```

```javascript
// Cell 2: Create visualization with popup
chart = {
  const data = [
    { group: "A", subgroup: "Item 1", value: 100 },
    { group: "A", subgroup: "Item 2", value:  80 },
    { group: "B", subgroup: "Item 3", value: 120 }
  ];

  const treemap = new VoronoiTreemap();

  return treemap.render(data, {
    width: 900,
    height: 600,
    maptitle: 'My Treemap',
    levels: ['group', 'subgroup'],
    value: 'value',
    positions: 'auto',
    showMetaLabel: true,
    showLabel: true,
    showPercent: true,
    pebble: true,
    pebbleRound: 5,
    pebbleWidth: 2,
    clickFunc: showVoronoiPopup
  });
}
```

### Local HTML File Usage (UMD Standalone)

For local HTML files (using `file://` protocol), use the UMD standalone bundle:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>VoronoiBubble - Local Example</title>
</head>
<body>
  <div id="chart"></div>

  <script src="https://cdn.jsdelivr.net/gh/pxd-uxtech/voronoi-bubble-dist@{hash}/dist/voronoi-bubble.standalone.umd.js"></script>

  <script>
    const { VoronoiTreemap, showVoronoiPopup } = VoronoiTreemapModule;

    const data = [
      { group: "A", subgroup: "Item 1", value: 100 },
      { group: "A", subgroup: "Item 2", value:  80 },
      { group: "B", subgroup: "Item 3", value: 120 }
    ];

    const treemap = new VoronoiTreemap();
    const svg = treemap.render(data, {
      width: 900,
      height: 600,
      maptitle: 'My Treemap',
      levels: ['group', 'subgroup'],
      value: 'value',
      clickFunc: showVoronoiPopup
    });

    document.getElementById('chart').appendChild(svg);
  </script>
</body>
</html>
```

## Data Format

d3-voronoi-treemap takes a `d3.hierarchy()` object — you have to build the nested tree yourself. VoronoiBubble takes a **flat array** and converts it to a 3-level hierarchy internally:

```
root
 └─ depth 1 — group
     └─ depth 2 — subgroup
         └─ depth 3 — item (leaf)
```

```javascript
// VoronoiBubble input — flat array, no nesting required
const data = [
  { group: "Sales",     subgroup: "Domestic",      item: "Seoul",   value: 120 },
  { group: "Sales",     subgroup: "Domestic",      item: "Busan",   value:  80 },
  { group: "Marketing", subgroup: "International", item: "Tokyo",   value:  60 }
];

treemap.render(data, {
  levels: ['group', 'subgroup', 'item'],  // field names per depth
  value: 'value'                           // size field
});
```

`levels` and `value` map your field names — use whatever names fit your domain (`department/team/person`, `region/category/product`, etc.).

| Option | Default | Description |
|---|---|---|
| `levels` | `['metaLabel', 'label', 'text']` | Field names per depth (1, 2, 3). Provide 2 entries for a 2-level hierarchy. |
| `value` | `'bubbleSize'` | Field name for the cell size weight |

If you omit `levels`/`value`, the data must use the default field names. The third depth is optional — provide 2 entries in `levels` (or omit the third field in your data) for a 2-level hierarchy.

## Configuration Options

```javascript
{
  width: 900,                   // Canvas width
  height: 600,                  // Canvas height
  maptitle: 'Title',            // Main title
  mapcaption: 'Caption',        // Subtitle
  positions: 'auto',   // Cell position control: 'auto' or array of {key, depth, x, y}
  showMetaLabel: true,          // Show depth-1 (group) labels
  showLabel: true,              // Show depth-2 (subgroup) labels
  showPercent: true,            // Show percentage labels
  pebble: true,                 // Enable pebble rendering
  pebbleRound: 5,               // Corner rounding
  pebbleWidth: 2,               // Pebble stroke width
  clickFunc: function(d) {      // Click handler (receives {data, event})
    console.log('Clicked:', d);
  },
  getCellColors: function(cellColors) { // Callback to receive actual cell colors
    console.log('Cell colors:', cellColors);
  },
  colors: [                     // Custom color palette (optional)
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1"
  ],
  keyColors: [            // Override colors for specific keys (optional)
    { key: "Sales",     color: "#4CAF50" },
    { key: "Marketing", color: "#F44336" }
  ],
  cellImage: (d) => ({          // Per-cell background image (optional)
    url: d.imageUrl,            //   Image URL
    mode: 'fill',               //   'fill': covers the cell | 'fit': proportional to cell size
    opacity: 0.8,               //   0–1
    colorMode: 'original'       //   'original': true color | 'tint': grayscale + cell color blend
  }),
  labelMode: 'show'             // 'show' | 'faded' | 'hidden' — leaf label + cell border visibility
}
```

## Label Display Mode

Use `labelMode` to control the visibility of leaf-level labels (depth-3 text) and their cell borders.

| Value | Label opacity | Cell border opacity |
|---|---|---|
| `'show'` | 1 | 1 |
| `'faded'` | 0.6 | 0.6 |
| `'hidden'` | 0 | 0 |

```javascript
treemap.render(data, { labelMode: 'hidden' });
```

When zoomed in, labels and cell borders fade in regardless of `labelMode` — at 2× zoom they are fully visible. Zooming back out restores the original mode.

## Cell Background Images

Use `cellImage` to render images inside individual cells. Each cell can have its own image with independent display settings.

```javascript
treemap.render(data, {
  cellImage: (d) => {
    if (!d.imageUrl) return null;
    return {
      url: d.imageUrl,        // Image URL (required)
      mode: 'fill',           // 'fill' | 'fit'
      opacity: 0.8,           // 0–1 (default: 1)
      colorMode: 'original'   // 'original' | 'tint'
    };
  }
});
```

### `mode`

| Value | Behavior |
|---|---|
| `fill` | Image covers the entire cell polygon (like `background-size: cover`) |
| `fit` | Image is sized proportionally to the cell, centered (like `background-size: contain`) |

### `colorMode`

| Value | Behavior |
|---|---|
| `original` | Image renders in its original colors |
| `tint` | Image is converted to grayscale then blended with the cell color via SVG multiply filter |

### Example: Profile photos per bubble

```javascript
const data = [
  { group: "Team A", subgroup: "Kim",  value: 120, imageUrl: "photos/kim.jpg" },
  { group: "Team A", subgroup: "Lee",  value:  80, imageUrl: "photos/lee.jpg" },
  { group: "Team B", subgroup: "Park", value: 100, imageUrl: "photos/park.jpg" }
];

treemap.render(data, {
  cellImage: (d) => d.imageUrl ? {
    url: d.imageUrl,
    mode: 'fill',
    opacity: 0.9,
    colorMode: 'original'
  } : null
});
```

### Example: Tint mode — cell color applied to image

```javascript
treemap.render(data, {
  cellImage: (d) => ({
    url: d.imageUrl,
    mode: 'fill',
    opacity: 0.7,
    colorMode: 'tint'   // grayscale image tinted with the cell's assigned color
  })
});
```

## Custom Label Renderers

Use `renderLabel` to fully customize label appearance by returning an HTML string. The same callback handles both depths — branch on `ctx.depth`.

### `renderLabel`

```javascript
renderLabel: (d, defaultHtml, ctx) => {
  // d           - data node
  // defaultHtml - default HTML string
  // ctx         - context object:
  //   ctx.depth       - 1 (group) or 2 (subgroup)
  //   ctx.key         - label text at this depth
  //   ctx.fontSize    - computed font size (em base value)
  //   ctx.color       - cell color
  //   ctx.darkerColor - a darker shade of the cell color
  //   ctx.percentText - percentage string (e.g. "34.5%")

  if (ctx.depth === 1) return `<div>...</div>`;  // group label
  if (ctx.depth === 2) return `<div>...</div>`;  // subgroup label
  // return "" to hide a label
}
```

### Example: Outlined percent display for groups

```javascript
treemap.render(data, {
  showMetaLabel: true,
  showPercent: true,
  renderLabel: (d, defaultHtml, ctx) => {
    if (ctx.depth !== 1) return defaultHtml;

    const keyStr = String(ctx.key ?? "");
    if (/^\d+$/.test(keyStr) || /^cluster\s*\d+$/i.test(keyStr)) return "";

    return `
      <div style="text-align:center; color:#fff;">
        <div style="
          font-weight: 600;
          font-size: ${ctx.fontSize * 0.95}em;
          line-height: 1.1;
          color: #fff;
          white-space: nowrap;
          -webkit-text-stroke: 3px ${ctx.darkerColor};
          paint-order: stroke fill;
        ">
          ${ctx.key}<br>
          <small style="
            font-size: 80%;
            -webkit-text-stroke: 1px ${ctx.darkerColor};
          ">${ctx.percentText}</small>
        </div>
      </div>`;
  }
});
```

### Per-depth shortcuts (legacy — still supported)

If you only want to customize one depth, the per-depth options stay available and take precedence over `renderLabel`:

```javascript
treemap.render(data, {
  metaLabelRenderer: (d, defaultHtml, ctx) => `<div>...</div>`,  // depth 1 only
  labelRenderer:     (d, defaultHtml, ctx) => `<div>...</div>`   // depth 2 only
});
```

## Cell Position Control

Use `positions` to control where cells appear in the chart. Each entry can target any depth via the `depth` field.

### Manual positioning

```javascript
treemap.render(data, {
  positions: [
    { key: '긍정', depth: 1, x: 700, y: 200 },
    { key: '중립', depth: 1, x: 400, y: 300 },
    { key: '부정', depth: 1, x: 100, y: 400 }
  ]
});
```

**Field reference:**
- `key` — the field value at the targeted depth from your data (e.g. `'Sales'` for `levels[0]`)
- `depth` — hierarchy level: `1` = top group, `2` = subgroup, `3` = item
- `x`, `y` — position hint (any scale; normalized to 0.15–0.85 range automatically)

### Quadrant layout

```javascript
treemap.render(data, {
  positions: [
    { key: 'A', depth: 1, x: 0, y: 0 },
    { key: 'B', depth: 1, x: 1, y: 0 },
    { key: 'C', depth: 1, x: 0, y: 1 },
    { key: 'D', depth: 1, x: 1, y: 1 }
  ]
});
```

### Circular layout

```javascript
const cx = 400, cy = 300, r = 200;
const n = 5;

treemap.render(data, {
  positions: Array.from({ length: n }, (_, i) => ({
    key: categories[i],
    depth: 1,
    x: cx + Math.cos((2 * Math.PI * i) / n) * r,
    y: cy + Math.sin((2 * Math.PI * i) / n) * r
  }))
});
```

## Color Assignment

Colors are automatically assigned based on total size value, from largest to smallest.

### Custom color palette

```javascript
treemap.render(data, {
  colors: [
    "#FF6B6B",  // Largest region
    "#4ECDC4",  // 2nd largest
    "#45B7D1"   // 3rd largest
  ]
});
```

### Per-key colors

```javascript
treemap.render(data, {
  keyColors: [
    { key: "Sales",     color: "#4CAF50" },
    { key: "Marketing", color: "#F44336" },
    { key: "Support",   color: "#FFC107" }
  ]
});
```

### Getting applied colors

```javascript
treemap.render(data, {
  getCellColors: (cellColors) => {
    console.log(cellColors);
    // [{metaLabel: "Sales", metaColor: "#FF6B6B", label: "Domestic", color: "#ff8989"}, ...]
  }
});
```

## Popup Helper Functions

### `showVoronoiPopup(clickedData)`

Observable notebook popup.

```javascript
import { VoronoiTreemap, showVoronoiPopup } from "..."

treemap.render(data, { clickFunc: showVoronoiPopup });
```

### `createDOMPopup(clickedData)`

DOM-based popup for standard web pages.

```javascript
import { VoronoiTreemap, createDOMPopup } from "..."

treemap.render(data, { clickFunc: createDOMPopup });
```

### `getPopupStyles()` / `getBubbleStyles()`

```javascript
// Observable
html`<style>${getBubbleStyles()}</style>`

// Standard HTML
const style = document.createElement('style');
style.textContent = getBubbleStyles();
document.head.appendChild(style);
```

`getBubbleStyles()` includes KoddiUD OnGothic font faces, `.region`, `.metaLabelArea`, `.labelArea`, `.textArea`, label styles, highlight/click states, and popup styles.

## getCellColors — Legend Example

### Observable

```javascript
// Cell 1
mutable cellColors = []

// Cell 2
{
  const treemap = new VoronoiTreemap();
  const svg = treemap.render(data, {
    getCellColors: (colors) => { mutable cellColors = colors; }
  });
  return svg;
}

// Cell 3 — legend
{
  const seen = new Set();
  const legend = cellColors
    .filter(c => { if (seen.has(c.metaLabel)) return false; seen.add(c.metaLabel); return true; })
    .map(c => html`
      <div style="display:flex;align-items:center;gap:8px;margin:5px 0">
        <div style="width:30px;height:20px;background:${c.metaColor};border:1px solid #ccc"></div>
        <span>${c.metaLabel}</span>
      </div>`);
  return html`<div>${legend}</div>`;
}
```

### Standard JavaScript

```javascript
let cellColors = [];

treemap.render(data, {
  getCellColors: (colors) => { cellColors = colors; }
});

const seen = new Set();
document.getElementById('legend').innerHTML = cellColors
  .filter(c => { if (seen.has(c.metaLabel)) return false; seen.add(c.metaLabel); return true; })
  .map(c => `
    <div style="display:flex;align-items:center;margin:8px 0">
      <div style="width:40px;height:25px;background:${c.metaColor};border:2px solid #ddd"></div>
      <span style="margin-left:10px">${c.metaLabel}</span>
    </div>`)
  .join('');
```

### Returned data format

```javascript
{
  metaLabel: string,  // Top-level group name
  metaColor: string,  // Top-level group color (hex)
  label: string,      // Item label
  color: string       // Applied color for this item (hex)
}
```

## Recommended CSS

```css
@font-face {
  font-family: 'KoddiUD OnGothic';
  src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2105_2@1.0/KoddiUDOnGothic-Regular.woff') format('woff');
  font-weight: normal;
  font-style: normal;
}

.region {
  font-family: "KoddiUD OnGothic", sans-serif;
  fill: #fff;
  fill-opacity: 1;
  font-weight: 700;
}

.textArea.highlite {
  filter: hue-rotate(-5deg) brightness(0.95);
}

.textArea.clicked {
  stroke: #000;
  stroke-width: 3px;
  filter: brightness(0.9);
}
```

## Files

| File | Description |
|------|-------------|
| `voronoi-bubble.standalone.umd.js` | All deps bundled, UMD (browser `<script>`) |
| `voronoi-bubble.standalone.js` | All deps bundled, ESM (Observable) |
| `voronoi-bubble.umd.js` | UMD, peer deps required |
| `voronoi-bubble.esm.js` | ESM, peer deps required |
| `voronoi-bubble.min.js` | Minified UMD, peer deps required |

## Dependencies

The ESM/UMD bundles require peer dependencies:
- d3 (^7.0.0)
- d3-weighted-voronoi (^1.0.0)
- d3-voronoi-map (^2.0.0)
- d3-voronoi-treemap (^1.0.0)
- seedrandom (^3.0.0)

The standalone bundle includes all dependencies pre-bundled.

## Version History

### 1.3.0
- Rebranded as VoronoiBubble under UXtechLab
- License changed to BUSL-1.1 (non-commercial use free; converts to MIT on 2029-01-01)
- Fixed label overlap detection: use actual rendered content size via `getBoundingClientRect` instead of foreignObject declared dimensions
- Fixed direction preference: prefer direction with more available cell space
- Fixed cell boundary enforcement: fall back to original position if both directions exceed cell bounds

### 1.2.0
- Fixed SVG sizing: `width` and `height` now define actual SVG output size
- Renamed CSS classes (breaking): `regionArea1` → `metaLabelArea`, `regionArea2` → `labelArea`, `regionArea3` → `textArea`, `.field` → `.label-item`, `.sector` → `.text-item`, `.budget` → `.percent-label`
- Added `metaLabelRenderer` and `labelRenderer` documentation

### 1.1.0
- Renamed hierarchy fields: `region` → `metaLabel`, `bigClusterLabel` → `label`, `clusterLabel` → `text`
- Renamed options: `showRegion` → `showMetaLabel`, `regionPositions` → `metaLabelPositions`, `regionColors` → `metaLabelColors`
- Full backward compatibility with old field/option names

### 1.0.x
- Initial releases: standalone bundle, popup helpers, `getCellColors`, `getBubbleStyles`, Observable compatibility

## License

[BUSL-1.1](https://mariadb.com/bsl11/) — Free for non-commercial and personal use. Commercial use requires a license from UXtechLab. Converts to MIT on 2029-01-01.
