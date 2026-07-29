# VoronoiBubble

VoronoiBubble은 계층 데이터를 조약돌 모양 보로노이 트리맵으로 쉽게 그려주는 시각화 엔진입니다. `group → subgroup → item → size` 컬럼을 가진 tidy-style flat rows를 그대로 넣으면 3계층 SVG를 바로 그려줍니다. 정성데이터 토픽 맵뿐 아니라 부처별 정부 예산, 책·문서 분류 지도처럼 이미 계층과 가중치를 가진 데이터에도 잘 맞습니다. `d3.hierarchy()`를 직접 만들 필요도, 리사이즈 계산 코드를 붙일 필요도 없습니다. AffinityBubble의 렌더링 엔진이기도 합니다.

![VoronoiBubble 예시 — 고객 리뷰 270건 토픽 맵 (group → subgroup → item 3계층)](docs/images/hero.png)

## 특징

- **3계층 보로노이 트리맵** — `group`(depth 1) → `subgroup`(depth 2) → `item`(depth 3). 계층마다 라벨이 따로 붙고, depth 1·2에는 둥근 조약돌 외곽선이 그려집니다.
- **tidy-style flat rows 입력** — `{ group, subgroup, item, size }` 배열 하나면 바로 그립니다. 컬럼 이름이 다르면 `levels` / `value`로 매핑합니다.
- **쉬운 컬러 지정·긍부정 컬러맵** — `groupColors`로 그룹별 색을 바로 지정하고, `sentiment: '점수필드'` 한 줄로 1~5점 같은 수치 필드를 빨강→노랑→초록 다이버징 팔레트에 연결합니다.
- **팝업·호버 콜백** — `onClick` + `showVoronoiPopup`은 추가 CSS 없이 동작하고, `onHover` / `onSubgroupLabelHover`로 툴팁·설명을 직접 붙일 수 있습니다.
- **위치 지정·라벨 겹침 완화** — `positions`로 depth별 상대 위치 힌트를 줄 수 있고, `VoronoiBubbleHelpers.createGridPositions()`로 depth 1 그룹을 읽기 좋은 그리드 순서에 놓을 수 있습니다. 기본 라벨 배치는 셀 경계 안에서 겹침을 줄이도록 보정됩니다.
- **시드 재현성** — `seedRandom`이 같으면 레이아웃이 항상 같습니다.
- **반응형 SVG** — `viewBox` 기반이라 컨테이너 폭에 맞춰 CSS만으로 확대·축소됩니다. JS 리사이즈 계산이 없습니다.
- **커스텀 HTML 라벨** — `renderGroupLabel` / `renderSubgroupLabel`이 HTML 문자열을 받아 `foreignObject`로 그립니다.

## Quick Start

```html
<div id="chart"></div>

<script type="module">
  import { VoronoiBubble, VoronoiBubbleHelpers } from 'https://cdn.jsdelivr.net/gh/pxd-uxtech/voronoi-bubble-dist@v2.0.1/dist/voronoi-bubble.standalone.js';

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
    positions: VoronoiBubbleHelpers.createGridPositions(['긍정', '부정'], { depth: 1 }),
  });

  // 반응형 처리는 라이브러리가 담당한다 — render()가 돌려주는 <svg>에는 이미
  // viewBox와 width:100% / height:auto 스타일이 붙어 있다. 그대로 붙이기만 하면 된다.
  document.getElementById('chart').appendChild(svg);
</script>
```

전체 예제는 [`examples/`](examples/)에 있습니다 (`examples/index.html`이 갤러리).

### 활용 예

- 고객 리뷰·설문 주관식·인터뷰 코딩 결과 같은 정성데이터 토픽 맵
- 부처별 정부 예산, 조직별 인원·비용, 사업 포트폴리오처럼 계층과 금액/규모가 있는 데이터
- 책지도, 문헌 리뷰, 콘텐츠 분류, 지식 체계처럼 분류 구조를 탐색해야 하는 데이터
- embedding/UMAP으로 만든 의미 좌표를 `positions`로 반영한 semantic map

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

- [docs/API.md](docs/API.md) — 데이터 형식, 전체 옵션 표, 콜백 시그니처, Public CSS API, 팝업, 감성 컬러맵, 위치 힌트, 라벨 옵션
- [docs/MIGRATION.md](docs/MIGRATION.md) — v1 → v2 전체 리네임 표와 before/after 예제
- [docs/OPEN_CORE_STRATEGY.md](docs/OPEN_CORE_STRATEGY.md) — 오픈소스 배포판과 AffinityBubble API의 역할 분리, 에이전트 전략, positions 정책
- [CHANGELOG.md](CHANGELOG.md) — 버전별 변경 이력
- [CONTRIBUTING.md](CONTRIBUTING.md) — 개발 환경, PR 절차
- [examples/](examples/) — 실행 가능한 예제

### 위치 힌트

`positions`는 절대 픽셀이 아니라 depth별 상대 위치 힌트입니다. 예를 들어 depth 2 subgroup 전체를 UMAP으로 한 번에 투영한 좌표를 넣으면, 라이브러리가 depth 2 전체 좌표 범위를 기준으로 자동 정규화합니다. 의미 좌표가 없고 읽는 순서만 안정시키고 싶을 때는 grid helper를 씁니다.

```javascript
import { VoronoiBubble, VoronoiBubbleHelpers } from '...';

const groups = ['긍정', '중립', '부정', '기타']; // 이 순서대로 좌상→우하 배치

const svg = new VoronoiBubble().render(data, {
  positions: VoronoiBubbleHelpers.createGridPositions(groups, { depth: 1 })
});
```

## Agent Instructions

이 저장소는 `skills/voronoi-bubble/`에 보로노이 트리맵 HTML을 생성하는 에이전트 지침도 함께 제공합니다. ChatGPT/Codex는 스킬로 사용할 수 있고, Claude 같은 다른 코딩 에이전트도 같은 지침과 템플릿을 참고해 사용자 데이터를 `group → subgroup → item → size` 형식으로 매핑하고 클릭 팝업이 포함된 브라우저용 HTML 예제를 만들 수 있습니다.

- 기본 출력: CDN UMD 번들을 쓰는 단일 HTML (`skills/voronoi-bubble/assets/cdn-popup-template.html`)
- 오프라인 출력: 로컬 `./dist/voronoi-bubble.standalone.umd.js`를 쓰는 HTML (`skills/voronoi-bubble/assets/local-popup-template.html`)
- 플러그인 패키징: `.codex-plugin/plugin.json`이 포함되어 있어 skills-only 플러그인으로 확장할 수 있습니다.

에이전트에서 사용할 때는 “VoronoiBubble 팝업 HTML을 만들어줘”처럼 요청하면 됩니다. 자동 렌더링 UI나 외부 데이터 연동이 필요하면 이후 MCP/UI 플러그인으로 확장하세요.

## 배포판 사용

이 저장소는 사전 빌드된 배포판입니다. 브라우저에서 CDN으로 쓰거나 `dist/` 파일을 내려받아 사용하세요. 예제는 `examples/index.html`에서 확인할 수 있습니다.

### 저장소 구조

| 경로 | 내용 |
|---|---|
| `dist/` | 사전 빌드된 ESM/UMD/standalone 번들 |
| `examples/` | 실행 가능한 예제 + 갤러리 |
| `docs/` | API, 마이그레이션, 전략 문서 |
| `skills/` | ChatGPT/Codex/Claude 등 에이전트용 지침과 HTML 템플릿 |
| `.codex-plugin/` | skills-only 플러그인 패키징 메타데이터 |

### Source Development

이 배포 저장소는 MIT로 사용할 수 있습니다. 원본 개발 저장소와 공개 기여 절차는 별도로 준비 중이며, 전환 전까지 다른 라이선스를 유지할 수 있습니다.

원문 텍스트에서 embedding, clustering, hierarchy, UMAP positions, 요약, 대표 원문 같은 분석 결과를 생성하는 AffinityBubble API는 별도 상용 서비스입니다. VoronoiBubble 배포판은 준비된 계층형 데이터와 위치 힌트를 렌더링하는 오픈 배포판입니다.

## 라이선스

이 배포 저장소의 사전 빌드 번들, 예제, 문서, 에이전트 지침은 [MIT License](LICENSE)로 사용할 수 있습니다.

전문은 [LICENSE](LICENSE)를 확인하세요.
