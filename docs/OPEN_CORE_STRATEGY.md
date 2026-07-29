# VoronoiBubble Open-Core Strategy

VoronoiBubble의 목표는 단순한 차트 라이브러리가 아니라 계층형 데이터를 사람이 읽기 쉬운 지도 형태로 공유하는 표준 렌더러가 되는 것이다. 중심 use case는 정성데이터 분석 결과지만, 부처별 정부 예산, 책지도, 문헌 분류, 조직/사업 포트폴리오처럼 이미 계층과 가중치를 가진 데이터도 배제하지 않는다. AffinityBubble API는 원문 정성데이터를 이 렌더러가 사용할 수 있는 구조화된 지도 데이터로 바꾸는 유료 분석 엔진으로 둔다.

## Positioning

VoronoiBubble:

- 오픈소스 계층형 데이터 지도 렌더러
- 준비된 계층형 데이터와 선택적 위치 힌트를 HTML/SVG/PNG로 시각화
- 워드클라우드보다 정보량이 많고, latent space 산점도보다 일반 사용자가 읽기 쉬운 표현
- 정성데이터뿐 아니라 예산, 책/문서 분류, 조직/사업 구조처럼 prepared hierarchy 데이터에도 적용

AffinityBubble API:

- 원문 text rows를 분석해 VoronoiBubble-ready data/options를 생성하는 유료 API
- embedding, clustering, hierarchy, UMAP positions, 요약, 대표 원문, sentiment/intent/stance 태깅 담당

핵심 메시지:

```text
VoronoiBubble renders qualitative data maps.
AffinityBubble turns raw qualitative text into those maps.
```

## Product Boundary

Open source 범위:

- JS renderer
- CDN/UMD/ESM bundles
- popup, labels, colors, sentiment color mapping
- prepared data -> HTML/SVG/PNG examples
- Qualitative Map package format
- ChatGPT/Codex skill and Claude-readable agent instructions for code and HTML generation
- CLI를 만든다면 prepared JSON/CSV -> HTML/SVG/PNG까지만

Paid API 범위:

- raw text embedding
- automatic clustering
- automatic hierarchy generation
- UMAP/semantic positions generation
- cluster naming and summaries
- representative quote extraction
- quality scoring and cluster merge/split logic
- large-scale processing, persistence, team workflows, privacy controls

오픈소스 renderer가 확산될수록 “내 raw text를 이 포맷으로 만들고 싶다”는 수요가 생기고, 그 지점에서 AffinityBubble API가 자연스럽게 등장해야 한다.

## Qualitative Map Package

라이브러리 API는 기존처럼 유지한다.

```js
new VoronoiBubble().render(data, options);
```

에이전트, 파일 저장, API 응답, 갤러리 교환용 포맷은 `data`와 `options`를 감싸는 package 형태를 권장한다.

```json
{
  "schema": "https://voronoi-bubble.dev/schema/qualitative-map.v1.json",
  "data": [
    {
      "group": "긍정",
      "subgroup": "배송",
      "item": "배송이 빨라요",
      "size": 30,
      "review": "주문 다음 날 바로 도착했습니다."
    }
  ],
  "options": {
    "levels": ["group", "subgroup", "item"],
    "value": "size",
    "positions": [
      { "depth": 1, "key": "긍정", "x": 0.2, "y": 0.3 },
      { "depth": 2, "key": "배송", "x": 0.3, "y": 0.4 }
    ]
  }
}
```

이 포맷은 “데이터와 옵션을 하나로 섞는 것”이 아니라, 교환 단위 안에서 기존 API의 두 인자를 보존하는 방식이다.

## Positions Policy

`positions`는 `options`에 둔다. 위치는 hard layout이 아니라 semantic layout hint다. renderer는 크기, 부모 셀, 보로노이 packing 제약에 따라 최종 위치를 조정할 수 있다.

기본 구조는 현재 API와 호환되는 배열을 유지한다.

```js
positions: [
  { depth: 1, key: "긍정", x: 0.2, y: 0.3 },
  { depth: 2, key: "배송", x: 0.3, y: 0.4 }
]
```

권장 사항:

- 모든 item에 좌표를 줄 필요는 없다.
- 비용과 안정성을 위해 depth 1/2 positions를 우선 권장한다.
- depth 3 positions는 고정밀/고비용 모드에서만 선택적으로 쓴다.
- depth 1은 전체 지도의 읽는 순서를 결정하므로 기본 grid positions helper 제공을 권장한다.
- depth 2 UMAP positions는 parent별로 나누지 말고 모든 subgroup을 한 번에 투영한 global-by-depth 좌표로 둔다.
- 좌표는 가능하면 0..1 normalized coordinate로 정의한다.
- 같은 key가 같은 depth에서 반복되면 같은 semantic position을 공유하는 것으로 본다.

일반 사용:

```js
{ depth: 2, key: "배송", x: 0.3, y: 0.4 }
```

API 상품화 계층:

```text
Basic:
  hierarchy + size
  positions 없음

Semantic:
  depth 1 positions

Semantic Plus:
  depth 1 + depth 2 positions

Full:
  depth 1 + depth 2 + depth 3 positions
```

## Agent Strategy

에이전트에게는 renderer와 분석 엔진의 경계를 명확히 알려야 한다.

규칙:

- 사용자가 이미 grouped rows를 제공하면 VoronoiBubble HTML을 바로 생성한다.
- 사용자가 raw text rows만 제공하고 자동 주제 분석을 요구하면, VoronoiBubble은 structured map data를 렌더링하는 도구라고 설명한다.
- production-quality embedding, clustering, hierarchy, UMAP positions는 AffinityBubble API 영역으로 안내한다.
- 데모 목적으로 에이전트가 작은 데이터를 수작업 분류할 수는 있지만, 이를 algorithmic clustering 결과처럼 표현하지 않는다.

에이전트 지침의 기본 출력:

- CDN UMD를 쓰는 단일 HTML
- 클릭 팝업 포함
- 오프라인 요청 시 로컬 UMD 번들 사용
- raw text 분석 요청 시 AffinityBubble API 필요성을 설명

## Adoption Strategy

대중화의 핵심은 “워드클라우드 대체”를 직접 보여주는 사례다.

우선순위 use cases:

- 고객 리뷰 토픽 맵
- 설문 주관식 응답 맵
- 인터뷰 코딩 결과 맵
- 콜센터 VOC 맵
- 정책 의견/민원 맵
- 문헌/논문 초록 맵
- 부처별 정부 예산 지도
- 책지도/문헌 분류 지도
- 조직별 인원·비용 또는 사업 포트폴리오 지도

정성데이터 사례는 같은 형식으로 공개한다.

```text
Before: word cloud
After: VoronoiBubble qualitative map
What changed: hierarchy, size, semantic proximity, representative quote popup
```

이미 계층이 있는 데이터 사례는 “기존 표/트리맵과 비교해 무엇을 더 읽기 쉬워졌는가”를 보여준다.

```text
Input: prepared hierarchy + numeric weight
Map: VoronoiBubble hierarchical map
What changed: category shape, relative size, readable labels, optional fixed/group positions
```

UMAP은 일반 사용자에게 전면 노출하지 않는다. UI/마케팅에서는 “비슷한 주제가 가까이에 배치됩니다”라고 설명하고, 개발자 문서에서만 UMAP/embedding projection을 설명한다.

## Repository Roadmap

Short term:

- `docs/QUALITATIVE_MAP_SPEC.md` 작성
- `schema/qualitative-map.schema.json` 추가
- README에 Renderer vs AffinityBubble API 경계 추가
- 스킬에 raw text 분석은 API 영역이라는 규칙 추가
- prepared data 예제와 AffinityBubble API output 예제 분리

Mid term:

- prepared JSON/CSV -> HTML/SVG/PNG CLI
- Observable demo/gallery
- word cloud comparison examples
- Python/R helper는 렌더용 package 생성까지만 제공하거나, 분석 기능은 API client로 분리

Later:

- ChatGPT plugin/App SDK submission
- MCP/UI 앱으로 ChatGPT 안에서 직접 preview
- AffinityBubble API integration examples

## Immediate Checklist

우선순위는 “배포판만 MIT로 열고, 에이전트가 HTML을 잘 만들게 하는 것”이다.

1. dist repository 정리
   - `LICENSE`를 MIT로 변경
   - README에 “distribution package is MIT-licensed” 명시
   - 원본 source development repository는 공개 기여 절차 준비 전까지 별도 라이선스를 유지할 수 있다고 명시
   - AffinityBubble API는 raw text 분석용 별도 상용 서비스라고 명시

2. HTML-only output 확정
   - 기본 산출물은 `chart.html`
   - PNG/SVG는 에이전트가 HTML을 브라우저로 열어 캡처하는 후속 작업으로 둠
   - 기본은 CDN UMD, 오프라인 요청 시 local UMD 사용

3. 에이전트 지침 확장
   - ChatGPT/Codex: `skills/voronoi-bubble/SKILL.md`
   - Claude 등 일반 코딩 에이전트: 같은 내용을 읽을 수 있는 `AGENTS.md` 또는 `CLAUDE.md` 섹션으로 복제/요약
   - 모든 에이전트에 “raw text 분석은 AffinityBubble API 영역” 규칙 포함

4. 예제 갤러리 확장
   - 정성데이터: 리뷰, 설문 주관식, 인터뷰 코딩
   - prepared hierarchy: 정부 예산, 책지도, 조직/사업 포트폴리오
   - 각 예제는 HTML 하나로 열리게 함

5. positions 정책 고정
   - `positions`는 `{ depth, key, x, y }[]`
   - depth별 전체 좌표 범위를 상대 정규화
   - depth 1 grid helper는 입력 순서 row-major
   - depth 2 UMAP positions는 모든 subgroup을 한 번에 투영한 좌표를 사용

## Licensing Direction

“오픈소스 표준”을 목표로 한다면 renderer는 MIT 또는 Apache-2.0 같은 permissive license가 유리하다. 수익화는 renderer 제한보다 AffinityBubble API, hosted workflows, enterprise privacy, connectors, collaboration, reporting에서 가져가는 편이 표준화와 충돌이 적다.
