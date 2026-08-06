# VoronoiBubble API

v2.0 기준 전체 API 레퍼런스입니다. v1에서 올라오는 경우 [MIGRATION.md](MIGRATION.md)를 먼저 읽으세요.

- [로드하기](#로드하기)
- [데이터 형식](#데이터-형식)
- [렌더 API](#렌더-api)
- [전체 옵션](#전체-옵션)
- [콜백](#콜백)
- [Public CSS API](#public-css-api)
- [팝업](#팝업)
- [색상](#색상)
- [위치 제어와 재현성](#위치-제어와-재현성)
- [라벨 표시 모드와 줌](#라벨-표시-모드와-줌)

---

## 로드하기

```
https://cdn.jsdelivr.net/gh/pxd-uxtech/voronoi-bubble-dist@v2.2.0/dist/voronoi-bubble.standalone.js
```


### ESM (`import`)

```javascript
import { VoronoiBubble, showVoronoiPopup }
  from 'https://cdn.jsdelivr.net/gh/pxd-uxtech/voronoi-bubble-dist@v2.2.0/dist/voronoi-bubble.standalone.js';
```

Observable에서는 동적 import를 씁니다.

```javascript
{
  const m = await import("https://cdn.jsdelivr.net/gh/pxd-uxtech/voronoi-bubble-dist@v2.2.0/dist/voronoi-bubble.standalone.js");
  VoronoiBubble = m.VoronoiBubble;
  showVoronoiPopup = m.showVoronoiPopup;
  return m;
}
```

### `<script>` 태그 (UMD, `file://`에서도 동작)

```html
<script src="https://cdn.jsdelivr.net/gh/pxd-uxtech/voronoi-bubble-dist@v2.2.0/dist/voronoi-bubble.standalone.umd.js"></script>
<script>
  const { VoronoiBubble, showVoronoiPopup } = VoronoiBubbleModule;
</script>
```

`.umd.js`는 전역 변수만 노출하므로 `import()`로 부르면 안 됩니다. ESM이 필요하면 `.standalone.js`를 쓰세요.

### export 목록

| export | 설명 |
|---|---|
| `VoronoiBubble` (default + named) | 메인 클래스 |
| `showVoronoiPopup` | `{field}` 템플릿 + 자동 위치 팝업 (권장) |
| `showVoronoiPopupLegacy` | Observable `html\`\`` 템플릿용 구 팝업 |
| `createDOMPopup` | 템플릿 없는 최소 DOM 팝업 |
| `getBubbleStyles` | 차트+팝업 CSS 문자열 (`render()`가 이미 주입함) |
| `getPopupStyles` | 팝업 CSS만 |
| `nestingForVoronoi` | flat rows → 3계층 중첩 구조 |
| `VoronoiBubbleHelpers` | 색상·폰트·포지셔너 정적 헬퍼 |
| `LabelAdjuster`, `PebbleRenderer` | 라벨 충돌 회피 / 조약돌 외곽선 모듈 |

---

## 데이터 형식

입력은 **평평한 객체 배열**입니다. `d3.hierarchy()`를 직접 만들 필요가 없습니다.

```
root
 └─ depth 1 — group
     └─ depth 2 — subgroup
         └─ depth 3 — item (말단 셀)
```

```javascript
const data = [
  { group: '긍정', subgroup: '배송', item: '배송이 빨라요',   size: 30 },
  { group: '긍정', subgroup: '배송', item: '포장이 꼼꼼해요', size: 20 },
  { group: '부정', subgroup: '가격', item: '비싸요',          size: 15 },
];
```

| 필드 | 역할 |
|---|---|
| `group` | depth 1 — 최상위 영역 |
| `subgroup` | depth 2 — 중간 그룹 |
| `item` | depth 3 — 말단 셀 |
| `size` | 셀 크기 가중치 (숫자, 문자열 숫자도 허용) |

같은 `group`+`subgroup`+`item` 조합의 행이 여러 개면 `size`가 합산되고, 첫 행의 나머지 컬럼이 그 셀에 붙습니다(팝업의 `{field}` 치환에 쓰입니다).

### 컬럼 이름 커스터마이즈 (`levels` / `value`)

도메인에 맞는 컬럼 이름을 그대로 쓸 수 있습니다.

```javascript
new VoronoiBubble().render(rows, {
  levels: ['부서', '팀', '이름'],   // depth 1, 2, 3 컬럼명
  value: '인원수'                    // 크기 컬럼명
});
```

| 옵션 | 기본값 | 설명 |
|---|---|---|
| `levels` | `['group', 'subgroup', 'item']` | depth별 컬럼명 배열 |
| `value` | `'size'` | 크기 가중치 컬럼명 |

`levels` / `value`를 생략하면 데이터가 기본 이름을 써야 합니다.

### 2계층 데이터 규칙

`levels`에 항목을 **2개만** 주면 depth 2(`subgroup`)가 의미상 말단이 됩니다. 개별 버블 하나 = `subgroup` 값 하나입니다.

```javascript
// 2계층: group → subgroup(말단)
new VoronoiBubble().render(rows, {
  levels: ['카테고리', '항목'],   // depth 3 없음
  value: '건수'
});
```

내부적으로는 `item`이 `undefined`인 depth-3 노드가 subgroup마다 하나씩 만들어져 3계층 파이프라인이 그대로 돌아갑니다. 그 결과:

- **DOM에는 depth-2 셀과 depth-3 셀이 같은 개수만큼, 사실상 같은 자리에 존재합니다.** 클릭·호버는 항상 `.vb-cell[data-depth="3"]`에 바인딩되므로 2계층에서도 정상 동작하지만, `event.target`은 depth-3 `<path>`입니다.
- `.vb-item-label`(depth-3 라벨)은 표시할 텍스트가 없어 빈 문자열이고 `data-item`도 `null`입니다. 눈에 보이는 라벨은 `.vb-subgroup-label`이 담당합니다.
- 팝업의 기본 `format`은 `"{item}"`이므로 2계층에서는 `format: '{subgroup}'`처럼 바꿔야 합니다. 바꾸지 않으면 `{item}`이 치환되지 않고 그대로 보입니다.
- `onHover` / `onClick` 페이로드의 `item`도 `undefined`입니다.

3계층이 필요 없더라도 라벨·팝업 기본값을 그대로 쓰고 싶다면, 데이터에 `item`을 `subgroup`과 같은 값으로 채워 넣는 편이 간단합니다.

---

## 렌더 API

```javascript
const bubble = new VoronoiBubble();
const svg = bubble.render(data, options);   // → SVGSVGElement
document.getElementById('chart').appendChild(svg);
```

| 메서드 | 반환 | 설명 |
|---|---|---|
| `render(data, options?)` | `SVGSVGElement` | 차트를 그려 SVG 엘리먼트를 반환. DOM에 붙이는 건 호출자 몫 |
| `update(newData)` | `SVGSVGElement` | 직전 `render()`의 옵션을 그대로 재사용해 데이터만 바꿔 다시 그림 |

### 반응형 처리 (viewBox)

`width` / `height`는 **그리기 좌표계**이며 SVG `viewBox`로 나갑니다. 화면 크기는 CSS가 정합니다 — 반환된 SVG에는 이미 `width:100%; height:auto; max-width:{width}px`가 붙어 있습니다.

- `title`이 있으면 제목 여백 48을 더해 `viewBox`가 `0 0 {width} {height+48}`이 됩니다. 제목이 버블 영역 폭의 90%를 넘으면 자동으로 말줄임(…) 처리됩니다.
- **`viewBox`를 직접 덮어쓰지 마세요.** `0 0 1200 900`으로 되돌리면 `y = 910`에 그려진 캡션이 잘립니다.
- `width`/`height`는 속성이 아니라 인라인 스타일로만 붙습니다. `removeAttribute('width')`는 아무 효과가 없습니다.

크게 그려 놓고(기본 1200×900) CSS로 줄이는 편이 라벨이 덜 답답합니다.

---

## 전체 옵션

`VoronoiBubble.DEFAULT_OPTIONS`의 전체 키입니다.

### 크기·텍스트

| 옵션 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `width` | `number` | `1200` | 그리기 좌표계 너비 (viewBox) |
| `height` | `number` | `900` | 그리기 좌표계 높이 (viewBox; 제목이 있으면 +48) |
| `title` | `string` | `''` | 차트 제목. HTML 문자열 허용 (`.vb-title`) |
| `caption` | `string` | `''` | 차트 하단 캡션. HTML 문자열 허용 (`.vb-caption`) |

### 데이터 매핑

| 옵션 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `levels` | `string[]` | `['group','subgroup','item']` | depth 1/2/3 컬럼명. 2개만 주면 depth 2가 말단 |
| `value` | `string` | `'size'` | 크기 가중치 컬럼명 |

### 라벨 표시

| 옵션 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `showGroupLabel` | `boolean` | `false` | depth-1 그룹 라벨 표시 |
| `showPercent` | `boolean` | `false` | 그룹 라벨 안에 비율(`34%`)을 함께 표시. 명시적 `renderGroupLabel`이 있으면 그쪽이 우선 |
| `labelMode` | `'show'\|'faded'\|'hidden'` | `'faded'` | depth-3 라벨과 셀 테두리의 불투명도 (1 / 0.6 / 0) |
| `underLabel` | `boolean` | `false` | depth-3 라벨을 셀 중심 아래쪽에 배치 |
| `ratioLimit` | `number` | `0` | 전체 대비 비율이 이 값 미만인 depth-2·3 라벨을 숨김 (0~1) |
| `fontScale` | `number` | `1` | 라벨 폰트 추가 배율. 폰트는 기본적으로 캔버스 면적에 맞춰 자동 정규화됩니다(기준 1200×900, 계수 `√(W×H/1,080,000)`) — 작은 캔버스로 렌더해도 글자가 셀과 함께 줄어듭니다. 이 옵션은 그 위에 곱해지는 수동 미세조정 값입니다 |
| `groupLabelScale` | `number` | `1.1` | depth-1(group) 라벨 폰트 배율. 커스텀 렌더러의 `ctx.fontSize`에도 반영됩니다 |
| `subgroupLabelScale` | `number` | `1.05` | depth-2(subgroup) 라벨 폰트 배율. 그룹-서브그룹 크기 위계를 조절합니다 |
| `subgroupLabelMaxLines` | `'auto'\|number` | `'auto'` | depth-2 라벨의 최대 줄 수. `'auto'`는 셀 높이에 맞춰 2~6줄까지 늘려 라벨을 가능한 한 온전히 보여줍니다. 숫자를 주면 그 값으로 고정됩니다(예: `2`) |
| `sizeLimit` | `number` | `1000` | depth-3 값 라벨(`.vb-item-value`)을 이 값보다 큰 셀에만 표시 |
| `renderGroupLabel` | `function\|null` | `null` | depth-1 라벨을 HTML로 직접 렌더 |
| `renderSubgroupLabel` | `function\|null` | `null` | depth-2 라벨을 HTML로 직접 렌더 |

`subgroup` 라벨은 문장이 아니라 짧은 heading으로 쓰는 것을 권장합니다. 한글은 5어절 이내, 영어는 5단어 이내가 가장 안정적입니다. 긴 설명은 `description`, `summary`, `review` 같은 별도 필드에 보존하고 popup/tooltip에서 보여주세요. 기본 depth-2 라벨은 셀 폭에 맞춰 줄바꿈되고, 줄 수는 셀 높이가 허용하는 만큼(최대 6줄) 늘어나 긴 라벨도 가능한 한 온전히 표시됩니다. 그래도 담기지 않으면 마지막 줄에 말줄임표가 붙습니다. 예전처럼 두 줄로 묶고 싶다면 `subgroupLabelMaxLines: 2`를 지정하세요.

### 색상

| 옵션 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `colors` | `string[]` \| `string` | `VoronoiBubble.DEFAULT_COLORS` (내장 파스텔 팔레트 107색) | 그룹 크기 내림차순으로 배정되는 팔레트. hex 배열 또는 내장 프리셋 이름: `'pastel'`(기본) · `'starryNight'`(반 고흐, 별이 빛나는 밤) · `'waterLilies'`(모네, 수련) · `'wave'`(호쿠사이, 큰 파도) · `'kiss'`(클림트, 키스) · `'sunrise'`(모네, 인상·해돋이). 명화 프리셋은 그림 원색의 hue·명암 관계를 보존한 채 파스텔 톤 대역으로 정규화한 것. 전체 목록은 `VoronoiBubble.PALETTES` |
| `groupColors` | `{key, color}[]` | `[]` | 특정 그룹의 색을 직접 지정 (팔레트보다 우선) |
| `colorVariation` | `'standard'\|'subtle'\|'strong'` | `'standard'` | 서브그룹·말단 셀의 음영 변주 강도. `standard`는 그룹 내 형제끼리 명도 대비를 살리고 팔레트 채도를 보존, `subtle`은 차트 전역 값 분포 기준의 차분한 음영(채도 캡 포함), `strong`은 발표용 강한 대비 |
| `colorFunc` | `function\|null` | `null` | 말단(depth-3) 셀 색을 직접 계산 |
| `sentiment` | `string\|{field, domain}\|null` | `null` | 수치 필드를 내장 다이버징 팔레트에 연결 |
| `getCellColors` | `function\|null` | `null` | 렌더 후 실제 적용된 색 목록을 돌려받는 콜백 |
| `cellImage` | `function\|null` | `null` | 셀 배경 이미지 |

### 상호작용

| 옵션 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `onClick` | `function` | `() => {}` | 말단 셀 클릭 |
| `onHover` | `function\|null` | `null` | 말단 셀 호버 (진입 시 cell, 이탈 시 `null`) |
| `onSubgroupLabelHover` | `function\|null` | `null` | depth-2 라벨 호버. 지정 시 라벨이 pointer-events를 받음 |
| `hoverVisualLimit` | `number` | `0` | 말단 셀 수가 이 값 이하일 때만 호버 하이라이트·라벨 노출을 켬 |

### 레이아웃

| 옵션 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `positions` | `{key, depth, x, y}[]\|null` | `null` | 셀 위치 힌트. 배열이 아니면 자동 배치 |
| `seedRandom` | `number\|string` | `10` | 난수 시드. 같은 시드 → 같은 레이아웃 |
| `pieSize` | `number` | `1` | 버블 덩어리 면적 비율 (선형 축소율 = `√pieSize`) |
| `adaptiveIterations` | `boolean` | `true` | 말단(depth 3) 분할에서만 셀 수가 많을 때 수렴 반복을 줄여 속도를 얻습니다. 그룹·서브그룹 면적을 정하는 상위 분할은 항상 전체 반복으로 수렴시키므로 읽는 면적의 정확도는 유지됩니다 |

### 외곽선·기타

| 옵션 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `pebbleRound` | `number` | `25` | 조약돌 모서리 라운딩 |
| `pebbleWidth` | `number` | `5` | 조약돌 외곽선 두께 |
| `debug` | `boolean` | `false` | 포지셔너 디버그 로그 |
| `forceNodeFunc` | `function\|null` | `null` | 예약 — 현재 렌더링에서 사용하지 않습니다 |

---

## 콜백

### `onClick(cell)`

말단(depth-3) 셀을 클릭할 때 호출됩니다. 클릭된 셀에는 `.vb-clicked`가 붙고, **같은 셀을 다시 클릭하면 선택이 해제되면서 `cell` 자리에 빈 문자열 `""`이 전달됩니다**(팝업을 닫으라는 신호).

```javascript
onClick: (cell) => {
  if (!cell) return;          // "" — 선택 해제
  cell.key;                   // item 값
  cell.data;                  // 원본 행 객체
  cell.raw;                   // 같은 셀로 합쳐진 원본 행 배열
  cell.event;                 // MouseEvent
  cell.d;                     // d3 계층 노드
  cell.clickArea;             // 클릭된 path의 d3 selection
}
```

페이로드는 계층 노드의 `data` 객체를 펼친 것이라 위 필드 외에 내부용 `values` 키도 함께 들어옵니다. 위 표의 필드만 사용하세요.

`showVoronoiPopup`은 이 페이로드를 그대로 소비합니다.

> `onHover`와 페이로드 모양이 다릅니다. `onClick`은 **계층 노드 래퍼**(`key`/`data`/`raw`)를, `onHover`는 **원본 행이 펼쳐진 평평한 객체**를 받습니다. 같은 코드로 둘 다 처리하려면 `cell.data ?? cell`처럼 정규화하세요.

### `onHover(cell | null)`

말단 셀에 진입하면 페이로드, 벗어나면 `null`입니다. `onClick`과 달리 **원본 행이 펼쳐진 평평한 객체**가 옵니다.

```javascript
onHover: (cell) => {
  if (!cell) return hideTip();
  // cell = { ...원본 행, depth: 3, event, target }
  showTip(cell.item, cell.event.clientX, cell.event.clientY);
}
```

| 필드 | 설명 |
|---|---|
| `...원본 행` | `group` / `subgroup` / `item` / `size` + 사용자 컬럼 전부 |
| `depth` | 항상 `3` |
| `event` | `MouseEvent` |
| `target` | 셀 `<path>` DOM 노드 |

### `onSubgroupLabelHover(label | null)`

depth-2(subgroup) 라벨에 호버하면 호출됩니다. 지정하면 라벨이 `pointer-events: all`이 되고, 라벨 클릭은 뒤에 있는 셀로 전달됩니다.

```javascript
onSubgroupLabelHover: (lbl) => {
  if (!lbl) return hideTip();
  showTip(설명표[lbl.subgroup], lbl.event.clientX, lbl.event.clientY);
}
```

| 필드 | 설명 |
|---|---|
| `subgroup` | 라벨 텍스트 (= subgroup 키) |
| `key` | `subgroup`과 같은 값 |
| `depth` | 항상 `2` |
| `event` | `MouseEvent` |
| `target` | 라벨 DOM 노드 (`text` 또는 `foreignObject`) |

> **원본 행 필드는 들어 있지 않습니다.** depth-2는 집계 노드라 단일 행이 없습니다. 행 데이터가 필요하면 `subgroup` 키로 직접 조회하세요.

### `renderGroupLabel(d, defaultHtml, ctx)` / `renderSubgroupLabel(d, defaultHtml, ctx)`

라벨을 HTML 문자열로 반환하면 `foreignObject`로 그립니다. `""`를 반환하면 그 라벨은 숨겨집니다.

```javascript
renderGroupLabel: (d, defaultHtml, ctx) => `
  <div style="text-align:center;color:#fff;">
    <div style="font-weight:700;font-size:${ctx.fontSize * 0.95}em;
                -webkit-text-stroke:3px ${ctx.darkerColor};paint-order:stroke fill;">
      ${ctx.key}<br>
      <small style="font-size:76%;">${ctx.percentText}</small>
    </div>
  </div>`
```

| 인자 | 설명 |
|---|---|
| `d` | d3 계층 노드 (`d.data.key`, `d.value`, `d.polygon` 등) |
| `defaultHtml` | 기본 라벨 HTML (줄바꿈 처리된 키 문자열) |
| `ctx` | 아래 컨텍스트 객체 |

`ctx` 필드:

| 필드 | 타입 | 설명 |
|---|---|---|
| `key` | `string` | 이 depth의 라벨 텍스트 |
| `depth` | `number` | `1`(group) 또는 `2`(subgroup) |
| `value` | `number` | 이 노드의 합계 값 |
| `ratio` | `number` | 전체 대비 비율 (0~1) |
| `percentText` | `string` | 비율 문자열 (`"34%"`) |
| `color` | `string` | 이 셀의 색 |
| `parentColor` | `string` | 부모 셀의 색 |
| `darkerColor` | `string` | `color`를 어둡게 (외곽선/헤일로용) |
| `lighterColor` | `string` | `color`를 밝게 |
| `fontSize` | `number` | 계산된 폰트 크기 (em 기준값). depth 1은 ×1.15 |
| `centerX`, `centerY` | `number` | 셀 중심 좌표 |
| `polygon` | `Array` | 셀 폴리곤 좌표 배열 |
| `parent` | `{key, value, color}\|null` | 부모 노드 요약 |
| `children` | `{key, value, color}[]\|null` | 자식 노드 요약 |
| `data` | `object\|undefined` | depth 2에서는 첫 원본 행, **depth 1에서는 `undefined`** |
| `totalValue` | `number` | 차트 전체 합계 |
| `formatNumber(n)` | `function` | 한국식 큰 수 포맷 (조/억/만) |
| `formatPercent(n)` | `function` | 소수 1자리 퍼센트 포맷 |

> `showPercent: true`이고 `renderGroupLabel`을 주지 않으면 라이브러리가 위와 같은 기본 렌더러를 자동으로 넣습니다. `renderGroupLabel`을 명시하면 퍼센트는 별도로 그려지지 않으므로 `ctx.percentText`를 직접 배치해야 합니다.

### `colorFunc(rows, nodeData, defaultColor, ctx)`

**말단(depth-3) 셀마다** 호출되며 반환값이 그 셀의 채우기 색이 됩니다.

```javascript
colorFunc: (rows, nodeData, defaultColor, ctx) => {
  const score = rows?.[0]?.score;
  return score != null ? myScale(score) : defaultColor;
}
```

| 인자 | 타입 | 설명 |
|---|---|---|
| `rows` | `object[]` | 이 셀에 해당하는 **원본 행 배열** (같은 subgroup+item으로 필터된 것) |
| `nodeData` | `object` | 말단 노드에 저장된 원본 행 (첫 행) |
| `defaultColor` | `string` | 팔레트가 배정했을 색. 그대로 반환하면 기본 동작 |
| `ctx` | `object` | 아래 참조 |

`ctx` 필드:

| 필드 | 타입 | 설명 |
|---|---|---|
| `parentColor` | `string` | 부모 subgroup 셀의 색 |
| `siblings` | `number[]` | 같은 group에 속한 **subgroup들의 value 배열** |
| `value` | `number` | 이 말단 셀의 값 |
| `depth` | `number` | 항상 `3` |
| `group` | **d3 노드 객체** | depth-1 노드 **그 자체** — 문자열이 아닙니다 |

> **`ctx.group`은 문자열이 아니라 d3 계층 노드입니다.** 그룹 키 문자열이 필요하면 `ctx.group.data.key`, 그룹 합계는 `ctx.group.value`, 그룹 색은 `ctx.group.color`로 접근하세요. `ctx.group`을 그대로 문자열처럼 비교하면 항상 실패합니다.

```javascript
colorFunc: (rows, nodeData, defaultColor, ctx) =>
  ctx.group.data.key === '부정' ? '#f69f8f' : defaultColor
```

### `getCellColors(cellColors)`

렌더 직후 실제 적용된 색 목록을 한 번 넘겨줍니다. 범례를 만들 때 씁니다.

```javascript
let cellColors = [];
new VoronoiBubble().render(data, {
  getCellColors: (colors) => { cellColors = colors; }
});

// cellColors = [
//   { group: '긍정', groupColor: '#afc7dd', subgroup: '배송', color: '#c5dbe9' },
//   { group: '긍정', groupColor: '#afc7dd', subgroup: '품질', color: '#b8d4e5' },
//   ...
// ]
```

- 항목은 **depth-2(subgroup) 노드마다 하나씩**이고, group 크기 내림차순으로 정렬됩니다.
- 페이로드 키는 `group` / `groupColor` / `subgroup` / `color` 네 개뿐입니다. v1의 `metaLabel` / `metaColor` / `bigLabel` / `bigColor` / `label`은 없습니다 → [MIGRATION.md](MIGRATION.md#4-getcellcolors-페이로드-무성-브레이킹)

범례 예시:

```javascript
const seen = new Set();
document.getElementById('legend').innerHTML = cellColors
  .filter(c => !seen.has(c.group) && seen.add(c.group))
  .map(c => `
    <div style="display:flex;align-items:center;gap:8px;margin:6px 0">
      <div style="width:32px;height:20px;background:${c.groupColor};border:1px solid #ddd"></div>
      <span>${c.group}</span>
    </div>`)
  .join('');
```

### `cellImage(row)`

말단 셀마다 호출되어 배경 이미지를 지정합니다. `null`을 반환하면 그 셀은 이미지 없이 그려집니다.

```javascript
cellImage: (row) => row.imageUrl ? {
  url: row.imageUrl,
  mode: 'fill',           // 'fill' = 셀 전체를 덮음 | 'fit' = 셀 안에 비례 축소
  opacity: 0.9,           // 0~1 (기본 1)
  colorMode: 'original'   // 'original' = 원본 색 | 'tint' = 흑백 후 셀 색으로 착색
} : null
```

이미지는 셀 폴리곤으로 clip되고 `pointer-events: none`이라 클릭·호버를 가리지 않습니다.

---

## Public CSS API

아래 클래스·속성은 **안정 계약**입니다. 호스트 페이지 CSS에서 안전하게 덮어쓸 수 있고, 마이너 버전에서 이름이 바뀌지 않습니다. **여기 없는 클래스·id·`data-*`는 전부 내부 구현**이며 예고 없이 바뀔 수 있습니다.

`render()`가 SVG 안에 `<style>`을 심고, 인라인 SVG의 `<style>`은 문서 전역에 캐스케이드되므로 팝업까지 별도 CSS 없이 스타일이 적용됩니다. 덮어쓰려면 같거나 더 높은 특이도로 쓰면 됩니다.

### 셀

| 셀렉터 | 대상 |
|---|---|
| `.vb-cell` | 모든 셀 `<path>` |
| `.vb-cell[data-depth="1"]` | group 셀 |
| `.vb-cell[data-depth="2"]` | subgroup 셀 |
| `.vb-cell[data-depth="3"]` | item 셀 (말단, 클릭·호버 대상) |
| `.vb-cell[data-id]` | 셀 고유 번호. 같은 `data-id`가 대응하는 라벨에도 붙습니다 |

### 라벨

| 셀렉터 | 대상 |
|---|---|
| `.vb-group-label` | depth-1 라벨 (SVG `text`) |
| `.vb-group-label-html` | depth-1 커스텀 HTML 라벨 (`foreignObject`) |
| `.vb-subgroup-label` | depth-2 라벨 (SVG `text`) |
| `.vb-subgroup-label-html` | depth-2 커스텀 HTML 라벨 (`foreignObject`) |
| `.vb-item-label` | depth-3 라벨 (SVG `text`) |
| `[data-subgroup]` | subgroup 라벨의 키 값 |
| `.vb-item-label[data-item]` | item 라벨의 키 값 |

### 제목·팝업·상태

| 셀렉터 | 대상 |
|---|---|
| `.vb-title` | 차트 제목 |
| `.vb-caption` | 차트 캡션 |
| `.vb-popup` | 팝업 위치 래퍼 — 배경·테두리·그림자를 주지 마세요 (박스가 이중으로 보입니다) |
| `.vb-popup-content` | 팝업 박스 외형 (배경·테두리·라운드·꼬리) |
| `.vb-popup-message` | 팝업 본문 (패딩·폭·스크롤) |
| `.vb-clicked` | 클릭된 말단 셀에 붙는 상태 클래스 |
| `.vb-hover-enabled` | `hoverVisualLimit` 조건을 만족할 때 루트 `<svg>`에 붙는 상태 클래스 |

```css
/* 팝업 외형만 바꾸기 */
.vb-popup-content { border-radius: 8px; border-color: #3b82f6; }
.vb-popup-message { min-width: 140px; padding: 0.8em; }

/* 클릭 강조 바꾸기 — 특이도를 라이브러리 규칙(0,2,0) 이상으로 */
.vb-cell[data-depth="3"].vb-clicked { stroke: #111; stroke-width: 2px; }
```

### 계약이 **아닌** 것 (내부 구현)

| 이름 | 이유 |
|---|---|
| `.vb-chart`, `.vb-zoom-layer`, `.vb-cells`, `.vb-item-labels`, `.vb-subgroup-labels`, `.vb-group-labels`, `.vb-item-values` | 레이어 `<g>` 구조. DOM 트리 재편 시 바뀔 수 있음 |
| `.vb-item-value` | depth-3 값 라벨 (`sizeLimit`보다 큰 셀에만 표시) |
| **`.vb-item-value`의 `data-item`** | 라벨의 `data-item`과 **의미가 다릅니다** — 값 라벨에서는 `item ?? subgroup`으로 채워지므로 2계층 데이터에서 subgroup 값이 들어옵니다. `[data-item]`으로 셀렉트할 때는 반드시 `.vb-item-label[data-item]`으로 스코프를 좁히세요 |
| `.vb-cell-outline`, `.vb-cell-outline2`, `.vb-pebble-outline` | 조약돌 렌더러 내부 |
| `.vb-popup-above` / `.vb-popup-below` | 팝업 배치 방향 표시용 내부 상태 |
| `[data-group]`, `[data-id]`, `[data-full-text]`, `[data-font-em]`, `[data-cell-w]`, `[data-cell-h]`, `[data-value]`, `[data-ratio]`, `[data-orig-*]` | 레이아웃·줌 계산용 내부 속성 (`data-id`는 위 셀 표의 페어링 용도로만 계약) |
| `#vb-popup`, `#vb-cell-img-*` | 생성된 엘리먼트 id |
| `--hl` CSS 변수 | 호버 하이라이트 색 (셀별로 인라인 설정) |

---

## 팝업

### `showVoronoiPopup(cell, options?)`

`onClick`에 연결하면 클릭한 셀 위에 말풍선이 뜹니다. **추가 CSS가 필요 없습니다.**

```javascript
import { VoronoiBubble, showVoronoiPopup } from '...';

new VoronoiBubble().render(data, {
  onClick: (cell) => showVoronoiPopup(cell, {
    format: '{item}\n그룹: {group}'
  })
});
```

| 옵션 | 기본값 | 설명 |
|---|---|---|
| `format` | `"{item}"` | 본문 템플릿. `{필드명}`이 치환됨 |
| `popupId` | `"vb-popup"` | 팝업 엘리먼트 id |
| `className` | `"vb-popup"` | 팝업 래퍼 클래스 |
| `onClose` | `null` | 팝업이 닫힐 때 호출 |

### `{field}` 치환

`{필드명}`은 클릭한 행의 값으로 치환됩니다. `group` / `subgroup` / `item` / `size` 같은 기본 필드뿐 아니라 **데이터에 넣은 모든 사용자 컬럼**이 그대로 쓰입니다. 매칭되는 값이 없으면 `{필드명}`이 그대로 남습니다. `\n`은 `<br>`이 됩니다.

```javascript
const data = [{ group: '긍정', subgroup: '배송', item: '배송이 빨라요',
                size: 30, like_count: 45, review: '정말 빨라요' }];

showVoronoiPopup(cell, {
  format: '<b>{item}</b><br>👍 {like_count}<br>{review}'
});
```

### 배치

기본은 셀 **위쪽**이고, 위쪽 공간이 부족할 때만 아래로 내려갑니다. 가로 방향은 뷰포트 안으로 클램프됩니다. 팝업 바깥을 클릭하거나 같은 셀을 다시 클릭하면 닫히고 `.vb-clicked`도 해제됩니다.

### 외형 커스터마이즈

`.vb-popup-content`(박스)와 `.vb-popup-message`(본문)를 덮어쓰세요.

```css
.vb-popup-content { background: #111; border-color: #111; border-radius: 10px; }
.vb-popup-message { color: #eee; max-width: 280px; }
```

- `.vb-popup`(위치 래퍼)에는 배경·테두리·그림자를 주지 마세요. 내장 박스 위에 박스가 하나 더 생겨 이중으로 보입니다.
- `.vb-popup` 안의 `.vb-popup-content`에 `transform`을 추가하지 마세요. JS가 이미 최종 좌표를 잡아둡니다.
- 컨테이너에 CSS `zoom`이 걸려 있으면 위치 계산이 어긋납니다. `transform: scale()`을 쓰세요.

### 다른 팝업 유틸

| 함수 | 용도 |
|---|---|
| `createDOMPopup(cell)` | 템플릿 없는 최소 DOM 팝업 |
| `showVoronoiPopupLegacy(cell)` | Observable `html\`\`` 템플릿 기반 구 팝업 |
| `getBubbleStyles()` / `getPopupStyles()` | CSS 문자열. `render()`가 이미 주입하므로 SVG 밖에 라벨/팝업을 직접 그릴 때만 필요 |

---

## 색상

색은 그룹 총합이 큰 순서대로 `colors` 팔레트에서 배정되고, 하위 depth는 부모 색의 명도를 변주해 만듭니다.

우선순위: **`colorFunc` > `sentiment` > `groupColors` > `colors` 팔레트**

### `colors` / `groupColors`

```javascript
new VoronoiBubble().render(data, {
  colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],       // 큰 그룹부터 순서대로
  groupColors: [                                    // 특정 그룹만 고정
    { key: '긍정', color: '#4CAF50' },
    { key: '부정', color: '#F44336' },
  ]
});
```

### `sentiment` — 내장 감성 컬러맵

수치 필드 이름 하나만 주면 5스톱 다이버징 파스텔 팔레트(빨강 → 노랑 → 초록)에 연결합니다. 말단 셀은 자기 행들의 평균 점수로, depth-1 그룹은 그룹 평균으로 칠해집니다.

```javascript
new VoronoiBubble().render(data, {
  sentiment: 's'                                   // 점수 컬럼명
  // 또는 도메인 지정:
  // sentiment: { field: 'rating', domain: [1, 5] } // 기본 도메인 [1, 5]
});
```

팔레트 스톱 (낮음 → 높음):

| 위치 | 색 |
|---|---|
| lo | `#f69f8f` (빨강) |
| | `#fac49c` |
| mid | `#ffe9a9` (노랑) |
| | `#c4db9a` |
| hi | `#88cd8b` (초록) |

범례용 그라디언트: `linear-gradient(to right, #f69f8f, #fac49c, #ffe9a9, #c4db9a, #88cd8b)`

도메인을 벗어난 값은 양끝으로 클램프되고, 숫자가 아니면 기본 팔레트 색이 유지됩니다. 명시적 `colorFunc` / `groupColors`가 있으면 그쪽이 이깁니다.

### `colorFunc` 사용 시 그룹 외곽선

`colorFunc`는 말단 셀만 다시 칠하고 depth-1 영역 외곽선·라벨은 팔레트를 씁니다. 그래서 `colorFunc`를 주면서 `colors`·`groupColors`를 **아무것도 주지 않으면** 그룹 팔레트가 중립색 `["#444"]` 하나로 자동 축소됩니다(무지개색 충돌 방지). 원래 색을 되살리려면 `colors` 또는 `groupColors`를 명시하세요.

---

## 위치 제어와 재현성

### `seedRandom`

보로노이 레이아웃은 난수 기반입니다. `seedRandom`이 같으면 결과가 항상 같습니다.

```javascript
new VoronoiBubble().render(data, { seedRandom: 'v2-report' });
```

### `positions`

`{key, depth, x, y}` 배열로 특정 셀이 놓일 방향을 지시합니다. 좌표는 **depth별 입력 범위를 자동으로 0.15~0.85로 정규화**하므로 절대 픽셀이 아니라 **상대 위치**만 의미가 있습니다. **일부 항목만 지정해도 됩니다** — `positions`에 없는 항목은 시드 기반 무작위 초기 위치로 배치됩니다. depth 2를 UMAP으로 만들었다면 모든 subgroup을 한 번에 투영한 좌표를 그대로 넣으면 됩니다.

```javascript
new VoronoiBubble().render(data, {
  positions: [
    { key: '긍정', depth: 1, x: 1,   y: 0   },   // 우상
    { key: '중립', depth: 1, x: 0.5, y: 0.5 },   // 중앙
    { key: '부정', depth: 1, x: 0,   y: 1   },   // 좌하
  ]
});
```

| 필드 | 설명 |
|---|---|
| `key` | 해당 depth의 컬럼 값 (`depth: 1`이면 `levels[0]` 값) |
| `depth` | `1` group / `2` subgroup / `3` item |
| `x`, `y` | 위치 힌트 (스케일 무관, 자동 정규화) |

배열이 아니면(`null`, `'auto'` 등) 자동 배치입니다. 그룹이 2~3개면 자동 배치로 충분하고, 4개 이상이거나 특정 레이아웃이 필요할 때 직접 지정하세요.

depth 1처럼 읽는 순서를 안정시키고 싶다면 grid helper로 기본 위치를 만들 수 있습니다.

```javascript
const groups = ['긍정', '중립', '부정', '기타'];

new VoronoiBubble().render(data, {
  positions: VoronoiBubbleHelpers.createGridPositions(groups, { depth: 1 })
});
```

### 의미 기반 배치 (임베딩 + UMAP)

라벨이 많은 데이터에서는 의미가 비슷한 셀을 가까이 두는 편이 정보량이 높습니다.

1. 각 셀의 라벨을 문장 임베딩 모델로 벡터화
2. UMAP(또는 t-SNE)으로 2D 축소
3. 그 좌표를 그대로 `positions`에 투입 (자동 정규화됨)

```javascript
new VoronoiBubble().render(data, {
  positions: embeddings.map(e => ({ key: e.key, depth: 1, x: e.x, y: e.y }))
});
```

depth 2·3 좌표도 depth별 전체 집합 기준으로 정규화됩니다. 하위 셀은 자기 부모 polygon 안에 있어야 하므로 최종 위치는 크기와 parent shape에 맞춰 조정되지만, 입력 좌표의 전역적인 방향성은 유지됩니다.

---

## 라벨 표시 모드와 줌

`labelMode`는 depth-3 라벨과 셀 테두리의 불투명도를 결정합니다.

| 값 | 라벨 불투명도 | 셀 테두리 불투명도 |
|---|---|---|
| `'show'` | 1 | 1 |
| `'faded'` (기본) | 0.6 | 0.6 |
| `'hidden'` | 0 | 0 |

**줌**: `Alt`(macOS `Option`) 키를 누른 채 휠·드래그하면 확대·이동합니다. Alt 없이는 페이지 스크롤이 그대로 동작하고, 터치 이벤트에는 `altKey`가 없어 모바일에서는 줌이 꺼집니다. 확대하면 `labelMode`와 무관하게 라벨·테두리가 서서히 나타나고(2배에서 완전 표시), 축소하면 원래 모드로 돌아옵니다. 2배를 넘으면 글자 크기는 화면상 고정되고 대신 잘려 있던 글자 수가 늘어납니다.

`hoverVisualLimit`은 말단 셀이 그 수 이하일 때만 호버 하이라이트와 라벨 노출을 켭니다(셀이 많을 때의 호버 비용 방지). 기본값 `0`이면 항상 꺼져 있습니다.

---

### depth 2·3 `positions` 만들기 — 원래 순서대로 Z 그리드

```javascript
const positions = [ /* depth 1: 최상위 그룹은 직접 배치 */ ];

const pushGrid = (keys, depth) => {
  const cols = Math.ceil(Math.sqrt(keys.length));
  const rows = Math.ceil(keys.length / cols);
  keys.forEach((key, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    positions.push({
      depth, key,
      x: cols > 1 ? col / (cols - 1) : 0.5,
      y: rows > 1 ? row / (rows - 1) : 0.5,
    });
  });
};

// orderD2[group] = [subgroup 키...], orderD3['group|subgroup'] = [item 키...] (데이터 원래 순서)
Object.values(orderD2).forEach((s) => pushGrid(s, 2));
Object.values(orderD3).forEach((t) => pushGrid(t, 3));
```

> 보로노이 시뮬레이션이 셀을 조금씩 움직이므로 **완벽한 격자가 아니라 "순서가 잘 드러나는" 수준**입니다. 정확한 격자가 필수라면 보로노이가 아닌 일반 그리드/트리맵을 쓰세요.
