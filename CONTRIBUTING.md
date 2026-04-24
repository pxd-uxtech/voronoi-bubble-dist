# Contributing

## ⚠️ Do NOT edit dist files directly

This repository contains compiled output only. All JavaScript files under `dist/` are generated automatically from the source repository.

**Source repo:** [pxd-uxtech/voronoi-treemap-class](https://github.com/pxd-uxtech/voronoi-treemap-class)

## Correct workflow

1. Make changes in the source repo (`voronoi-treemap-class`)
2. Run `npm run build` in the source repo
3. Copy `dist/*` to this repo
4. Commit and push

```
voronoi-treemap-class  →  npm run build  →  voronoi-bubble-dist
     (source)                                    (dist only)
```

## What belongs here

| File | OK to edit directly? |
|---|---|
| `dist/*.js` | ❌ Generated — edit source repo instead |
| `dist/*.map` | ❌ Generated |
| `README.md` | ✅ |
| `CONTRIBUTING.md` | ✅ |
| `files/` | ✅ |
