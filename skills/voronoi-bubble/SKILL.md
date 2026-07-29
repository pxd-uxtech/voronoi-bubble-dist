---
name: voronoi-bubble
description: Use when creating VoronoiBubble visualizations, mapping tabular data to group/subgroup/item/size, generating browser-openable HTML examples, adding showVoronoiPopup click popups, or advising on CDN versus local dist usage for VoronoiBubble.
---

# VoronoiBubble

Use this skill to create executable VoronoiBubble examples from user-provided data. Prefer a working HTML artifact over abstract explanation when the user asks to make a chart, popup, or image workflow. The data may be qualitative topic data or any prepared hierarchy with numeric weights, such as government budgets, book maps, document classifications, organization sizes, or project portfolios.

## Defaults

- Generate a single browser-openable HTML file by default.
- Use the pinned CDN UMD bundle unless the user asks for offline/local execution:
  `https://cdn.jsdelivr.net/gh/pxd-uxtech/voronoi-bubble-dist@v2.0.0/dist/voronoi-bubble.standalone.umd.js`
- Use local UMD only for offline or repository-bound output:
  `./dist/voronoi-bubble.standalone.umd.js`
- Do not use `@main`, `latest`, or an unpinned CDN URL.
- Use UMD for single-file browser examples because it is more tolerant of `file://` than ESM.
- Use ESM only when the user is working in a module/bundler/dev-server context.

## Data Mapping

VoronoiBubble expects flat rows:

```js
{ group: "긍정", subgroup: "배송", item: "배송이 빨라요", size: 30 }
```

If the user has different field names, keep the original data and pass:

```js
levels: ["category", "topic", "label"],
value: "count"
```

Rules:

- `group` is depth 1.
- `subgroup` is depth 2.
- `item` is the leaf label.
- `size` is the numeric weight.
- Preserve useful extra columns such as `review`, `url`, `score`, or `summary`; popup templates can reference them with `{field}`.
- For budget, book-map, or other prepared hierarchy data, map domain fields directly to `group`, `subgroup`, `item`, and `size`; do not force qualitative labels if the source already has a good hierarchy.
- If data has only two levels, either set `levels` to two fields and use popup `format: "{subgroup}"`, or duplicate the second-level value into `item` for simpler labels/popups.

## HTML Workflow

1. Normalize or map the user's rows.
2. Choose CDN UMD unless offline/local is requested.
3. Generate an HTML file with:
   - a `#chart` container,
   - `VoronoiBubbleModule` destructuring,
   - inline data,
   - `new VoronoiBubble().render(data, options)`,
   - `document.getElementById("chart").appendChild(svg)`.
4. Add `onClick: (cell) => showVoronoiPopup(cell, { format })` when popups are requested.
5. Include a concise note about how to open the file. If using CDN, say internet access is required.

Use `assets/cdn-popup-template.html` when the user wants the common "click a cell to show details" example. Use `assets/local-popup-template.html` when the user asks for offline/local dist usage.

## Popup Patterns

Import or destructure both exports:

```js
const { VoronoiBubble, showVoronoiPopup } = VoronoiBubbleModule;
```

Popup content uses `{field}` replacement from the clicked row:

```js
onClick: (cell) => showVoronoiPopup(cell, {
  format: "<b>{item}</b><br>{group} / {subgroup}<br>건수: {size}<br>{review}"
})
```

For 2-level data, prefer:

```js
format: "<b>{subgroup}</b><br>{group}<br>건수: {size}"
```

## Static Image Guidance

If the user wants a PNG/SVG image rather than an HTML page:

- First generate the HTML/SVG-producing code.
- In Codex or another local environment, render it with a browser automation tool such as Playwright and export a screenshot or serialized SVG.
- Avoid CDN for automated rendering when reproducibility, offline execution, or privacy matters; use the local `dist` bundle in those cases.

## Common Pitfalls

- Do not call `.umd.js` with `import()`; UMD exposes `VoronoiBubbleModule`.
- Do not overwrite the returned SVG `viewBox`; title and caption space may be included.
- Do not assume npm installation exists for users of the dist repository.
- If the chart renders blank, check that `size` values are numeric and that the selected script URL/path loads successfully.
