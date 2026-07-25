# v1 → v2 마이그레이션 가이드

VoronoiBubble v2.0은 **클린 브레이킹** 릴리스입니다. 여러 벌로 갈라져 있던 어휘를 `group / subgroup / item / size` 한 벌로 통일하고, CSS는 전부 `vb-` 접두사로 옮겼습니다. **v1 이름에 대한 동작 폴백은 없습니다.**

- [먼저 알아둘 것](#먼저-알아둘-것)
- [1. 클래스·전역 이름](#1-클래스전역-이름)
- [2. 데이터 필드](#2-데이터-필드)
- [3. 옵션](#3-옵션)
- [4. getCellColors 페이로드 (무성 브레이킹)](#4-getcellcolors-페이로드-무성-브레이킹)
- [5. CSS 클래스·data 속성 (무성 브레이킹)](#5-css-클래스data-속성-무성-브레이킹)
- [6. 마이그레이션 전후 전체 예제](#6-마이그레이션-전후-전체-예제)
- [마이그레이션 체크리스트](#마이그레이션-체크리스트)

---

## 먼저 알아둘 것

### 기존에 배포한 차트는 그대로 동작합니다

기존 페이지들이 참조하는 **커밋/태그로 핀된 CDN URL은 계속 유효**합니다. jsdelivr는 각 태그·커밋의 파일을 영구히 서빙하므로, v1 URL을 그대로 두면 아무것도 깨지지 않습니다.

```
# 그대로 두면 계속 v1으로 동작 — 손댈 필요 없음
https://cdn.jsdelivr.net/gh/pxd-uxtech/voronoi-treemap-dist@v1.1.0/dist/voronoi-treemap.standalone.js
```

마이그레이션은 **URL을 v2로 올릴 때** 하면 됩니다. URL과 코드는 반드시 함께 바꾸세요 — URL만 v2로 올리고 코드를 그대로 두면 차트가 그려지지 않습니다.

### v1 이름을 쓰면 콘솔이 알려줍니다 (일부만)

`render()`는 옵션 객체와 데이터 첫 행을 검사해 v1 이름을 발견하면 **콘솔 에러를 한 번** 출력합니다.

```
[VoronoiBubble] v1 이름이 감지되었습니다. v2에서는 동작하지 않습니다.
  옵션 maptitle → title
  옵션 clickFunc → onClick
  필드 metaLabel → group
마이그레이션 가이드: docs/MIGRATION.md
```

감지 대상은 **아래 2·3절 표의 옵션명과 데이터 필드명 중 일부**입니다. 데이터 필드는 `levels`를 기본값으로 두고 v2 필드(`group`/`subgroup`/`item`)가 하나도 없을 때만 검사합니다. 아래는 표에 있어도 **감지되지 않으니** 직접 확인하세요.

- 데이터 필드 `label` / `text` — 여분 컬럼으로 흔해 오탐 위험이 커서 목록에서 제외했습니다.
- 옵션 `pebble` — v1.5부터 이미 무시되던 옵션이라 감지 목록에 없습니다. 남아 있어도 조용히 무시됩니다.

> **감지되지 않는 브레이킹이 두 종류 있습니다.**
> - **[`getCellColors` 페이로드](#4-getcellcolors-페이로드-무성-브레이킹)** — 콜백이 받는 객체의 키가 바뀌었습니다. 경고 없이 `undefined`가 나옵니다.
> - **[CSS 클래스·data 속성](#5-css-클래스data-속성-무성-브레이킹)** — 호스트 페이지의 CSS 셀렉터가 조용히 아무것도 매치하지 않게 됩니다.
>
> 이 둘은 반드시 직접 확인하세요.

---

## 1. 클래스·전역 이름

| v1 | v2 |
|---|---|
| `new VoronoiTreemap()` | `new VoronoiBubble()` |
| UMD 전역 `VoronoiTreemapModule` (standalone) | `VoronoiBubbleModule` |
| UMD 전역 `VoronoiTreemap` (peer deps 번들) | `VoronoiBubble` |
| `VoronoiTreemapHelpers` | `VoronoiBubbleHelpers` |
| 파일 `voronoi-treemap.*.js` | `voronoi-bubble.*.js` |
| dist 레포 `pxd-uxtech/voronoi-treemap-dist` | `pxd-uxtech/voronoi-bubble-dist` |

`showVoronoiPopup`, `createDOMPopup`, `getBubbleStyles`, `getPopupStyles`, `nestingForVoronoi`, `LabelAdjuster`, `PebbleRenderer` 이름은 그대로입니다.

---

## 2. 데이터 필드

| depth | v1 canonical | v1 legacy (제거됨) | v2 |
|---|---|---|---|
| 1 | `metaLabel` | `region` | `group` |
| 2 | `label` | `bigClusterLabel` | `subgroup` |
| 3 | `text` | `clusterLabel` | `item` |
| 크기 | `bubbleSize` | `budget` | `size` |

`levels` 기본값이 `['group', 'subgroup', 'item']`, `value` 기본값이 `'size'`로 바뀌었습니다. 컬럼 이름을 바꾸기 어렵다면 데이터를 그대로 두고 매핑만 해도 됩니다.

```javascript
// 데이터를 못 바꾸는 경우 — 컬럼 매핑으로 해결
bubble.render(v1Rows, {
  levels: ['metaLabel', 'label', 'text'],
  value: 'bubbleSize'
});
```

> 단, 이렇게 매핑하면 `onHover` 페이로드와 팝업 `{field}`에는 **원본 컬럼명과 v2 표준 컬럼명이 함께** 들어갑니다(내부에서 `group`/`subgroup`/`item`/`size`로 정규화한 뒤 원본 필드를 유지하기 때문). 새 코드는 v2 이름을 쓰세요.

팝업 `format`의 기본값도 `"{text}"` → `"{item}"`으로 바뀌었습니다.

---

## 3. 옵션

| v1 | v2 | 비고 |
|---|---|---|
| `maptitle` | `title` | v1.5부터 이미 `title`이 canonical |
| `mapcaption` | `caption` | |
| `showMetaLabel` / `showRegion` | `showGroupLabel` | |
| `showLabel` (boolean) | `labelMode` (문자열) | 값 대응은 아래 표 |
| `keyColors` / `regionColors` / `metaLabelColors` | `groupColors` | |
| `regionPositions` / `metaLabelPositions` | `positions` | v1.5부터 이미 `positions`가 canonical |
| `clickFunc` | `onClick` | |
| `hoverFunc` | `onHover` | |
| `labelHoverFunc` | `onSubgroupLabelHover` | 페이로드 키 `label` → `subgroup` |
| `renderLabel` (단일, `ctx.depth` 분기) | `renderGroupLabel` + `renderSubgroupLabel` | 두 개로 분리 |
| `regionLabelRenderer` / `metaLabelRenderer` | `renderGroupLabel` | |
| `labelRenderer` / `bigClusterLabelRenderer` | `renderSubgroupLabel` | |
| `pebble` (boolean) | — | v1.5부터 이미 동작하지 않던 옵션. 삭제하세요. 외곽선은 `pebbleRound` / `pebbleWidth`로만 제어합니다 |

### `showLabel` → `labelMode` 값 대응

| v1 | v2 | 결과 |
|---|---|---|
| `showLabel: true` | `labelMode: 'show'` | depth-3 라벨·셀 테두리 불투명도 1 |
| `showLabel: false` | `labelMode: 'hidden'` | 불투명도 0 |
| (해당 없음) | `labelMode: 'faded'` — **v2 기본값** | 불투명도 0.6 |

`labelMode`를 지정하지 않으면 `'faded'`입니다. v1의 `showLabel: true`와 똑같이 보이게 하려면 `labelMode: 'show'`를 명시해야 합니다.

### 이름이 그대로인 옵션

`width`, `height`, `colors`, `colorFunc`, `sentiment`, `getCellColors`, `cellImage`, `seedRandom`, `positions`, `showPercent`, `underLabel`, `sizeLimit`, `ratioLimit`, `pieSize`, `pebbleRound`, `pebbleWidth`, `adaptiveIterations`, `hoverVisualLimit`, `labelMode`, `debug`, `forceNodeFunc`, `levels`, `value`.

### 콜백 페이로드 변경

| 콜백 | v1 | v2 |
|---|---|---|
| `onSubgroupLabelHover` (구 `labelHoverFunc`) | `{ ...row, label, key, depth, event, target }` | `{ subgroup, key, depth, event, target }` — **원본 행 필드 없음** |
| `onHover` (구 `hoverFunc`) | `{ ...row, depth, event, target }` | 동일 (행의 필드명만 v2 어휘) |
| `colorFunc` `ctx` | `{ parentColor, siblings, value, depth, metaLabel }` | `{ parentColor, siblings, value, depth, group }` — `group`은 **d3 노드 객체**. 키 문자열은 `ctx.group.data.key` |

---

## 4. `getCellColors` 페이로드 (무성 브레이킹)

> ⚠️ **콘솔 경고로 감지되지 않습니다.** 옵션 이름(`getCellColors`)은 그대로고 콜백도 정상 호출되지만, **넘어오는 객체의 키가 전부 바뀌었습니다.** v1 키로 접근하던 코드는 에러 없이 `undefined`만 받게 되고, 범례가 조용히 빈 상자로 렌더됩니다.

```javascript
// v1 페이로드
{ metaLabel, metaColor, bigLabel, bigColor, label, color }

// v2 페이로드
{ group, groupColor, subgroup, color }
```

| v1 키 | v2 키 | 설명 |
|---|---|---|
| `metaLabel` | `group` | depth-1 키 |
| `bigLabel` | `group` | v1에서 `metaLabel`과 **같은 값**을 담던 legacy 중복 키. v2에서 `group` 하나로 통합 |
| `metaColor` | `groupColor` | depth-1 색 |
| `bigColor` | `groupColor` | 위와 같은 이유로 통합 |
| `label` | `subgroup` | depth-2 키 |
| `color` | `color` | depth-2 색 (이름 유지) |

항목은 v1.5와 마찬가지로 **depth-2 노드 하나당 하나**이며 group 크기 내림차순으로 정렬됩니다. (`depth` 키는 v1.0.x에만 있던 것으로, v1.5에는 이미 없습니다.)

```javascript
// Before (v1.5)
const seenV1 = new Set();
const legend = cellColors
  .filter(c => !seenV1.has(c.metaLabel) && seenV1.add(c.metaLabel))
  .map(c => `<div>${c.metaColor} ${c.metaLabel}</div>`);

// After (v2)
const seen = new Set();
const legend = cellColors
  .filter(c => !seen.has(c.group) && seen.add(c.group))
  .map(c => `<div>${c.groupColor} ${c.group}</div>`);
```

---

## 5. CSS 클래스·data 속성 (무성 브레이킹)

> ⚠️ **이것도 콘솔 경고로 감지되지 않습니다.** 호스트 페이지에 `.textArea:hover { ... }` 같은 CSS를 두고 있었다면, v2에서는 그 셀렉터가 아무것도 매치하지 않고 조용히 스타일만 사라집니다. **v1 클래스를 쓰는 CSS를 전부 찾아 바꾸세요.**

v2에서는 모든 클래스에 `vb-` 접두사가 붙습니다. 접두사 없는 범용 이름(`.title`, `.cell`, `.zoom`, `.percent`, `.clicked`)이 호스트 페이지 CSS와 충돌하던 문제도 함께 해결됩니다.

### 셀

| v1 | v2 |
|---|---|
| `.metaLabelArea` | `.vb-cell[data-depth="1"]` |
| `.labelArea` | `.vb-cell[data-depth="2"]` |
| `.textArea` | `.vb-cell[data-depth="3"]` |
| `.rootArea` | `.vb-cell[data-depth="0"]` |
| `.area-{id}` | `.vb-cell[data-id="{id}"]` |

### 라벨

| v1 | v2 |
|---|---|
| `.region` (텍스트) | `.vb-group-label` |
| `.region-label-foreign` | `.vb-group-label-html` |
| `.label-item` | `.vb-subgroup-label` |
| `.bigcluster-label-foreign` | `.vb-subgroup-label-html` |
| `.text-item` | `.vb-item-label` |
| `.percent-label` / `.label-{id}` | `.vb-item-value` / `[data-id="{id}"]` |

### 레이어 `<g>` · 루트

| v1 | v2 |
|---|---|
| (없음) | `.vb-chart` (루트 `<svg>`, 신규) |
| `.zoom` | `.vb-zoom-layer` |
| `.cell` | `.vb-cells` |
| `.labels` | `.vb-item-labels` |
| `.label1` | `.vb-subgroup-labels` |
| `.pop` | `.vb-item-values` |
| `.percent` | (제거 — v1.5부터 빈 레이어였고, 퍼센트는 그룹 라벨에 통합됨) |
| `.region` (레이어) | `.vb-group-labels` |
| `.title` / `.caption` | `.vb-title` / `.vb-caption` |

### 상태 클래스

| v1 | v2 |
|---|---|
| `.clicked` | `.vb-clicked` |
| `.hover-visual-enabled` | `.vb-hover-enabled` |
| `.highlite` | (없음) — v1에서도 JS가 부여하지 않던 클래스입니다. 호버 강조는 `svg.vb-hover-enabled .vb-cell[data-depth="3"]:hover` 규칙이 담당합니다 |

### 팝업

| v1 | v2 |
|---|---|
| `#voronoi-popup` | `#vb-popup` |
| `.voronoi-popup-container` | `.vb-popup` |
| `.voronoi-popup-content` | `.vb-popup-content` |
| `.voronoi-popup-message` | `.vb-popup-message` |
| `.popup-above` / `.popup-below` | `.vb-popup-above` / `.vb-popup-below` |

### 외곽선 (PebbleRenderer)

| v1 | v2 |
|---|---|
| `.cell-outline` / `.cell-outline2` | `.vb-cell-outline` / `.vb-cell-outline2` |
| `.pebble-outline` | `.vb-pebble-outline` |
| id `outline2` | id `vb-cell-outline2` |
| defs id `cell-img-{id}` | `vb-cell-img-{id}` |

### data 속성

| v1 | v2 |
|---|---|
| `data-bigCluster` | `data-subgroup` |
| `data-cluster` | `data-item` |
| `data-region` | `data-group` |
| `data-pop` | `data-item` |
| `area-{id}` / `label-{id}` 클래스 | `data-id="{id}"` 속성 |

### 삭제된 죽은 규칙

`.area1`, `.area2`, `.area2.highlite`, `.area2.clicked`, `.bubblepopup` — v1에서도 JS가 부여하지 않던 클래스라 이미 아무 효과가 없었습니다. 참조하는 CSS가 있으면 그냥 지우세요.

### 특이도가 올라갔습니다

`.textArea`(0,1,0) → `.vb-cell[data-depth="3"]`(0,2,0). 호스트 CSS로 셀 스타일을 덮어쓰고 있었다면 **셀렉터 특이도를 같이 올려야** 합니다.

```css
/* Before */
.textArea.clicked { stroke: #000; stroke-width: 3px; }

/* After — 특이도 (0,3,0) */
.vb-cell[data-depth="3"].vb-clicked { stroke: #000; stroke-width: 3px; }
```

어떤 클래스가 안정 계약이고 어떤 것이 내부 구현인지는 [API.md의 Public CSS API](API.md#public-css-api)를 보세요.

---

## 6. 마이그레이션 전후 전체 예제

### Before (v1)

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>Voronoi Treemap</title>
  <style>
    .textArea:hover { filter: brightness(0.95); cursor: pointer; }
    .textArea.clicked { stroke: #000; stroke-width: 2px; }
    .voronoi-popup-content { border-radius: 8px; }
  </style>
</head>
<body>
  <div id="chart"></div>

  <script src="https://cdn.jsdelivr.net/gh/pxd-uxtech/voronoi-treemap-dist@v1.1.0/dist/voronoi-treemap.standalone.js"></script>
  <script>
    const { VoronoiTreemap, showVoronoiPopup } = VoronoiTreemapModule;

    const data = [
      { metaLabel: '긍정', label: '배송', text: '배송이 빨라요',   bubbleSize: 30, like_count: 45 },
      { metaLabel: '긍정', label: '배송', text: '포장이 꼼꼼해요', bubbleSize: 20, like_count: 31 },
      { metaLabel: '긍정', label: '품질', text: '재질이 좋아요',   bubbleSize: 25, like_count: 28 },
      { metaLabel: '부정', label: '가격', text: '비싸요',          bubbleSize: 15, like_count: 12 },
      { metaLabel: '부정', label: '가격', text: '배송비 부담',     bubbleSize: 10, like_count:  9 },
      { metaLabel: '부정', label: 'AS',   text: '응답이 느려요',   bubbleSize:  5, like_count:  4 },
    ];

    let cellColors = [];

    const treemap = new VoronoiTreemap();
    const svg = treemap.render(data, {
      width: 1200, height: 900,
      maptitle: '고객 피드백',
      mapcaption: '2026년 상반기 리뷰 분석',
      showMetaLabel: true,
      showLabel: true,
      showPercent: true,
      pebble: true,
      keyColors: [
        { key: '긍정', color: '#4CAF50' },
        { key: '부정', color: '#F44336' },
      ],
      clickFunc: (clicked) => showVoronoiPopup(clicked, {
        format: '{text}\n영역: {metaLabel}\n👍 {like_count}'
      }),
      hoverFunc: (cell) => console.log('hover:', cell && cell.text),
      labelHoverFunc: (lbl) => console.log('label:', lbl && lbl.label),
      getCellColors: (colors) => {
        cellColors = colors;
        const seen = new Set();
        document.getElementById('legend').innerHTML = colors
          .filter(c => !seen.has(c.metaLabel) && seen.add(c.metaLabel))
          .map(c => `<span style="background:${c.metaColor}">${c.metaLabel}</span>`)
          .join('');
      },
    });

    document.getElementById('chart').appendChild(svg);
  </script>
</body>
</html>
```

### After (v2)

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>VoronoiBubble</title>
  <style>
    /* .textArea → .vb-cell[data-depth="3"], .clicked → .vb-clicked */
    .vb-cell[data-depth="3"]:hover { filter: brightness(0.95); cursor: pointer; }
    .vb-cell[data-depth="3"].vb-clicked { stroke: #000; stroke-width: 2px; }
    /* .voronoi-popup-content → .vb-popup-content */
    .vb-popup-content { border-radius: 8px; }
  </style>
</head>
<body>
  <div id="chart"></div>
  <div id="legend"></div>

  <script src="https://cdn.jsdelivr.net/gh/pxd-uxtech/voronoi-bubble-dist@v2.0.0/dist/voronoi-bubble.standalone.umd.js"></script>
  <script>
    // VoronoiTreemapModule → VoronoiBubbleModule
    const { VoronoiBubble, showVoronoiPopup } = VoronoiBubbleModule;

    // metaLabel/label/text/bubbleSize → group/subgroup/item/size
    const data = [
      { group: '긍정', subgroup: '배송', item: '배송이 빨라요',   size: 30, like_count: 45 },
      { group: '긍정', subgroup: '배송', item: '포장이 꼼꼼해요', size: 20, like_count: 31 },
      { group: '긍정', subgroup: '품질', item: '재질이 좋아요',   size: 25, like_count: 28 },
      { group: '부정', subgroup: '가격', item: '비싸요',          size: 15, like_count: 12 },
      { group: '부정', subgroup: '가격', item: '배송비 부담',     size: 10, like_count:  9 },
      { group: '부정', subgroup: 'AS',   item: '응답이 느려요',   size:  5, like_count:  4 },
    ];

    let cellColors = [];

    const bubble = new VoronoiBubble();
    const svg = bubble.render(data, {
      width: 1200, height: 900,
      title: '고객 피드백',                  // maptitle →
      caption: '2026년 상반기 리뷰 분석',    // mapcaption →
      showGroupLabel: true,                  // showMetaLabel →
      labelMode: 'show',                     // showLabel: true →
      showPercent: true,
      // pebble: true 는 삭제 — 외곽선은 pebbleRound / pebbleWidth로 제어
      groupColors: [                         // keyColors →
        { key: '긍정', color: '#4CAF50' },
        { key: '부정', color: '#F44336' },
      ],
      onClick: (cell) => showVoronoiPopup(cell, {   // clickFunc →
        format: '{item}\n영역: {group}\n👍 {like_count}'   // {text}/{metaLabel} →
      }),
      onHover: (cell) => console.log('hover:', cell && cell.item),          // hoverFunc →
      onSubgroupLabelHover: (lbl) => console.log('label:', lbl && lbl.subgroup), // labelHoverFunc →
      getCellColors: (colors) => {
        cellColors = colors;
        // metaColor/metaLabel → groupColor/group (중복 제거 방식은 그대로)
        const seen = new Set();
        document.getElementById('legend').innerHTML = colors
          .filter(c => !seen.has(c.group) && seen.add(c.group))
          .map(c => `<span style="background:${c.groupColor}">${c.group}</span>`)
          .join('');
      },
    });

    document.getElementById('chart').appendChild(svg);
  </script>
</body>
</html>
```

---

## 마이그레이션 체크리스트

1. [ ] CDN URL을 `voronoi-bubble-dist@v2.0.0` / `voronoi-bubble.*.js`로 교체
2. [ ] `new VoronoiTreemap()` → `new VoronoiBubble()`, UMD 전역 `VoronoiTreemapModule` → `VoronoiBubbleModule`
3. [ ] 데이터 컬럼명을 `group` / `subgroup` / `item` / `size`로 (또는 `levels` / `value`로 매핑)
4. [ ] 옵션명 교체 — 특히 `maptitle`, `showMetaLabel`, `keyColors`, `clickFunc`, `hoverFunc`, `labelHoverFunc`
5. [ ] `showLabel: true` → `labelMode: 'show'` (기본값은 `'faded'`)
6. [ ] `pebble` 옵션 삭제
7. [ ] 팝업 `format`의 `{text}` / `{metaLabel}` / `{label}` / `{bubbleSize}` → `{item}` / `{group}` / `{subgroup}` / `{size}`
8. [ ] **`getCellColors` 콜백 본문**의 `metaLabel`/`metaColor`/`bigLabel`/`bigColor`/`label` → `group`/`groupColor`/`subgroup`/`color` (경고 없음)
9. [ ] **호스트 페이지 CSS**의 v1 클래스를 `vb-` 클래스로, 특이도 조정 (경고 없음)
10. [ ] `onSubgroupLabelHover` 콜백에서 원본 행 필드를 쓰고 있었다면 `subgroup` 키로 직접 조회하도록 수정
11. [ ] `colorFunc`의 `ctx.metaLabel` → `ctx.group.data.key`
12. [ ] 브라우저 콘솔을 열고 `[VoronoiBubble] v1 이름이 감지되었습니다` 에러가 없는지 확인
