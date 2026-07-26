# VoronoiBubble

계층 데이터를 조약돌 모양 보로노이 트리맵으로 그리는 시각화 엔진입니다. 평평한 행 배열(flat rows)을 그대로 넣으면 `group → subgroup → item` 3계층으로 묶어 SVG 하나를 돌려줍니다. `d3.hierarchy()`를 직접 만들 필요도, 리사이즈 계산 코드를 붙일 필요도 없습니다. AffinityBubble의 렌더링 엔진이기도 합니다.

![VoronoiBubble 예시 — 고객 리뷰 270건 토픽 맵 (group → subgroup → item 3계층)](docs/images/hero.png)

## 특징

- **3계층 보로노이 트리맵** — `group`(depth 1) → `subgroup`(depth 2) → `item`(depth 3). 계층마다 라벨이 따로 붙고, depth 1·2에는 둥근 조약돌 외곽선이 그려집니다.
- **flat rows 입력** — `{ group, subgroup, item, size }` 배열 하나면 끝. 컬럼 이름이 다르면 `levels` / `value`로 매핑합니다.
- **감성 컬러맵** — `sentiment: '점수필드'` 한 줄로 1~5점 같은 수치 필드를 빨강→노랑→초록 다이버징 팔레트에 연결합니다.
- **팝업·호버 콜백** — `onClick` + `showVoronoiPopup`은 추가 CSS 없이 동작하고, `onHover` / `onSubgroupLabelHover`로 툴팁·설명을 직접 붙일 수 있습니다.
- **시드 재현성** — `seedRandom`이 같으면 레이아웃이 항상 같습니다. `positions`로 특정 그룹을 원하는 방향에 고정할 수도 있습니다.
- **반응형 SVG** — `viewBox` 기반이라 컨테이너 폭에 맞춰 CSS만으로 확대·축소됩니다. JS 리사이즈 계산이 없습니다.
- **커스텀 HTML 라벨** — `renderGroupLabel` / `renderSubgroupLabel`이 HTML 문자열을 받아 `foreignObject`로 그립니다.

## Quick Start

```html
<div id="chart"></div>

<script type="module">
  import { VoronoiBubble } from 'https://cdn.jsdelivr.net/gh/pxd-uxtech/voronoi-bubble-dist@v2.0.1/dist/voronoi-bubble.standalone.js';

  const data = [
    { group: '긍정', subgroup: '배송', item: '배송이 빨라요',   size: 30 },
    { group: '긍정', subgroup: '배송', item: '포장이 꼼꼼해요', size: 20 },
    { group: '긍정', subgroup: '품질', item: '재질이 좋아요',   size: 25 },
    { group: '부정', subgroup: '가격', item: '비싸요',          size: 15 },
    { group: '부정', subgroup: '가격', item: '배송비 부담',     size: 10 },
    { group: '부정', subgroup: 'AS',   item: '응답이 느려요',   size: 5 },
  ];

  const svg = new VoronoiBubble().render(data, {
    width: 1200, height: 900,
    title: '고객 피드백', caption: '2026년 상반기 리뷰 분석',
    showGroupLabel: true, showPercent: true,
  });

  // 반응형 처리는 라이브러리가 담당한다 — render()가 돌려주는 <svg>에는 이미
  // viewBox와 width:100% / height:auto 스타일이 붙어 있다. 그대로 붙이기만 하면 된다.
  document.getElementById('chart').appendChild(svg);
</script>
```

전체 예제는 [`examples/`](examples/)에 있습니다 (`examples/index.html`이 갤러리).

## CDN

```
https://cdn.jsdelivr.net/gh/pxd-uxtech/voronoi-bubble-dist@v2.0.1/dist/voronoi-bubble.standalone.js
```


| 상황 | 파일 | 로드 방법 |
|---|---|---|
| `import` / `import()` (권장) | `voronoi-bubble.standalone.js` | ESM, 의존성 전부 포함 |
| `<script>` 태그 · 로컬 `file://` | `voronoi-bubble.standalone.umd.js` | 전역 `VoronoiBubbleModule` |
| 번들러(vite/webpack) | `voronoi-bubble.esm.js` | peer deps 직접 설치 필요 |
| peer deps를 CDN으로 따로 로드 | `voronoi-bubble.umd.js` / `voronoi-bubble.min.js` | 전역 `VoronoiBubble` |

`.umd.js`를 `import()`로 부르지 마세요 — UMD는 전역 변수를 노출할 뿐 ES 모듈 named export가 없습니다.

## 문서

- [docs/API.md](docs/API.md) — 데이터 형식, 전체 옵션 표, 콜백 시그니처, Public CSS API, 팝업, 감성 컬러맵, 포지셔너 패치
- [docs/MIGRATION.md](docs/MIGRATION.md) — v1 → v2 전체 리네임 표와 before/after 예제
- [CHANGELOG.md](CHANGELOG.md) — 버전별 변경 이력
- [CONTRIBUTING.md](CONTRIBUTING.md) — 개발 환경, PR 절차
- [examples/](examples/) — 실행 가능한 예제

## ChatGPT / Codex 스킬

이 저장소는 `skills/voronoi-bubble/`에 VoronoiBubble용 스킬도 함께 제공합니다. 스킬은 ChatGPT/Codex가 사용자 데이터를 `group → subgroup → item → size` 형식으로 매핑하고, 클릭 팝업이 포함된 브라우저용 HTML 예제를 만들 때 쓰는 지침과 템플릿입니다.

- 기본 출력: CDN UMD 번들을 쓰는 단일 HTML (`skills/voronoi-bubble/assets/cdn-popup-template.html`)
- 오프라인 출력: 로컬 `./dist/voronoi-bubble.standalone.umd.js`를 쓰는 HTML (`skills/voronoi-bubble/assets/local-popup-template.html`)
- 플러그인 패키징: `.codex-plugin/plugin.json`이 포함되어 있어 skills-only 플러그인으로 확장할 수 있습니다.

ChatGPT/Codex에서 이 스킬을 사용할 때는 “VoronoiBubble 팝업 HTML을 만들어줘”처럼 요청하면 됩니다. 자동 렌더링 UI나 외부 데이터 연동이 필요하면 이후 MCP/UI 플러그인으로 확장하세요.

## 개발

```bash
npm install
npm test        # vitest run
npm run build   # rollup -c → dist/ 5개 번들
npm run dev     # serve . -l 3000 → http://localhost:3000/examples/
```

예제는 `../dist/voronoi-bubble.standalone.js`를 import하므로 **`npm run build`를 먼저** 실행해야 열립니다.

### 저장소 구조

| 경로 | 내용 |
|---|---|
| `src/VoronoiBubble.js` | 메인 클래스 — 렌더 파이프라인, 옵션, 이벤트 |
| `src/VoronoiBubbleHelpers.js` | 색상·폰트 스케일·포지셔너·감성 팔레트 등 정적 헬퍼 |
| `src/LabelAdjuster.js` | 라벨 충돌 회피 (셀 경계 안에서 밀어내기) |
| `src/PebbleRenderer.js` | 조약돌 외곽선 (베지어 라운딩) |
| `src/PopupHelpers.js` | `createDOMPopup`, `getBubbleStyles`, `getPopupStyles` |
| `src/nestingForVoronoi.js` | flat rows → 3계층 중첩 구조 변환 |
| `src/utils/showVoronoiPopup.js` | 기본 팝업 (`{field}` 템플릿 + 자동 위치) |
| `src/index.js` | 공개 export 진입점 |
| `examples/` | 실행 가능한 예제 + 갤러리 |
| `tests/` | Vitest + jsdom 테스트 |
| `dist/` | 빌드 산출물 (gitignored) |

### 배포

빌드 결과를 공개 dist 저장소 [`pxd-uxtech/voronoi-bubble-dist`](https://github.com/pxd-uxtech/voronoi-bubble-dist)에 태그와 함께 push하면 jsdelivr가 자동으로 서빙합니다. 절차는 [CONTRIBUTING.md](CONTRIBUTING.md#배포)를 참고하세요.

## 라이선스

[BUSL-1.1](LICENSE) — Licensor: UXtechLab. 원저작자 [@taekie](https://github.com/taekie).

- 비상업적·개인적 용도는 제한 없이 무료입니다.
- 상업적 이용은 UXtechLab의 별도 라이선스가 필요합니다.
- **2029-01-01(Change Date)에 MIT로 자동 전환**됩니다. 그 이후 버전과 이전 버전 모두 MIT 조건으로 사용할 수 있습니다.

전문은 [LICENSE](LICENSE)를 확인하세요.
