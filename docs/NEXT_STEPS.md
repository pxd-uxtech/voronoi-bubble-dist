# VoronoiBubble Next Steps

This document records follow-up work discussed during the open renderer and agent-skill preparation.

## Near-Term

- Commit and publish the current renderer update:
  - calmer color variation with lower lightness contrast,
  - depth-global color variation domains,
  - phrase-style subgroup label wrapping,
  - subgroup heading guidance in README, API docs, and agent skills.
- Sync the MIT dist repository after source changes are committed.
- Keep local visual test pages out of the public examples until they are cleaned up:
  - `examples/font-comparison.html`
  - `examples/font-scale-comparison.html`
  - `examples/font-keyword-density-comparison.html`
  - `examples/label-wrap-comparison.html`
  - `examples/label-wrap-korean-comparison.html`
  - `examples/label-wrap-default-colors.html`

## Label Defaults

- Treat `subgroup` as a short heading, not a full sentence.
- Recommended source data rule:
  - Korean subgroup labels: five eojeol or fewer.
  - English subgroup labels: five words or fewer.
  - Long explanations go into `description`, `summary`, `review`, or another popup field.
- Continue testing the default phrase wrapping with:
  - short keyword labels,
  - 3-5 word headings,
  - Korean sentence-like fallback cases,
  - dense maps with 300+ items.
- Consider an explicit option later if defaults need more control:
  - `subgroupLabelMode: "phrase" | "legacy" | "custom"`
  - `subgroupMaxLines`
  - `subgroupLabelWrapWidth`

## Font Defaults

- Current visual direction:
  - Geist works well for English chart examples.
  - `fontScale: 1.2` is a better demo default than `1.0`.
  - Item labels can use a keyword boost around `1.25` for moderate-density maps.
- Avoid applying a fixed item boost globally.
  - Short keyword-heavy maps can tolerate larger item labels.
  - Sentence-like item labels should stay smaller and truncate earlier.
  - Dense 300+ item maps still need compact item labels.
- Possible future option:
  - `itemLabelScale: "auto" | number`
  - Auto heuristic should consider item count, average label length, cell area, and subgroup density.

## Color Defaults

- RESOLVED (2026-07-29): 차분한 변주를 기본으로 쓰니 채도·그룹 내 대비가 너무 죽는다는 실물 피드백이 있어,
  계획대로 `colorVariation` 옵션(`'standard' | 'subtle' | 'strong'`)으로 분리했다.
  기본값은 이전 룩을 복원한 `standard`(형제 도메인 + 채도 보존)이고,
  이번에 시도한 차분한 룩은 `subtle`로 존치한다.
- The latest color variation change intentionally reduces the jewel-like effect.
- Keep checking default palette and named presets separately:
  - default pastel,
  - `waterLilies`,
  - `starryNight`,
  - sentiment colormap.
- If users want stronger hierarchy contrast later, prefer an explicit option rather than increasing the default:
  - `colorVariation: "subtle" | "standard" | "strong"`
  - default should remain `subtle`.

## Examples And Promotion

- Public examples should be in English by default.
- Keep Korean examples available where they demonstrate Korean-specific readability or local use cases.
- Add examples that show VoronoiBubble as an easy Voronoi treemap renderer, not only a qualitative-data tool:
  - customer feedback topic map,
  - government budget map,
  - book or document taxonomy map,
  - semantic positions with UMAP-like coordinates,
  - palette and sentiment examples,
  - popup-enabled single HTML example.
- Messaging order:
  1. Easy Voronoi treemap renderer.
  2. Optional semantic position hints.
  3. Strong use case: qualitative data maps.
  4. AffinityBubble API turns raw text into renderer-ready map data.

## Agent And Skill Distribution

- Keep the skill bundled with the dist repository so agents can install it from the public package.
- Agent instructions should:
  - generate browser-openable HTML first,
  - use pinned CDN UMD for simple examples,
  - use local dist for offline/privacy-sensitive rendering,
  - preserve extra fields for popups,
  - keep subgroup labels short and move explanations into popup fields.
- RESOLVED (2026-07-29): 클린룸 관찰 결과 — SKILL.md + docs/API.md만 허용한 에이전트가
  `sentiment`(평점 컬러맵), `positions`(그룹 좌측 고정), `onClick` 팝업을 전부 스스로 찾아
  콘솔 에러 0건으로 구현했다. SKILL.md 예제 보강은 불필요.
  발견된 마찰 2건(문서 간 CDN 핀 불일치, positions 부분 지정 폴백 미문서화)은 v2.1.1에서 해소.
- Watch how agents use the skill from only `SKILL.md` plus `docs/API.md`.
  If they miss important options such as `positions`, `colors`, or `sentiment`, add short examples directly to `SKILL.md`.

## AffinityBubble Boundary

- VoronoiBubble stays the open renderer.
- AffinityBubble API should own paid analysis:
  - text rows -> embedding,
  - clustering,
  - hierarchy,
  - UMAP positions,
  - cluster naming,
  - summaries and representative quotes.
- The open renderer should make people want map-ready data; the API should provide that map-ready data from raw qualitative text.
