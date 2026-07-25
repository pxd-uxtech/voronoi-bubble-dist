> ⚠️ **이 저장소는 빌드 산출물 배포용입니다.** `dist/` 파일을 직접 수정하지 마세요 — 소스 저장소에서 빌드되어 자동 반영됩니다.

# 기여 가이드

VoronoiBubble에 기여해 주셔서 감사합니다.

## 이슈를 먼저 열어주세요

버그 수정이든 기능 추가든 **PR 전에 이슈를 먼저 열어** 무엇을 어떻게 바꿀지 합의해 주세요. 특히 아래는 반드시 사전 논의가 필요합니다.

- 공개 API 변경 (옵션 이름, 콜백 시그니처, 페이로드 키)
- [Public CSS API](docs/API.md#public-css-api)에 있는 클래스·`data-*` 속성 변경
- 런타임 의존성 추가 (기본적으로 받지 않습니다 — d3 계열 peer dependency 외 추가 금지)
- 렌더 파이프라인 구조 변경

오타 수정, 문서 개선, 명백한 버그 수정은 이슈 없이 바로 PR을 보내도 좋습니다.

## 개발 환경

개발(테스트 실행)에는 **Node.js 20 이상**이 필요합니다 — Vitest가 요구하는 하한이고 CI도 20을 씁니다. 라이브러리를 **소비**하는 쪽 런타임 요구사항은 `package.json`의 `engines`(`>=16`)가 그대로 유효합니다.

```bash
git clone https://github.com/pxd-uxtech/voronoi-treemap-class.git
cd voronoi-treemap-class
npm install
npm test            # vitest run — 반드시 통과해야 합니다
npm run build       # rollup -c → dist/ 5개 번들
npm run dev         # serve . -l 3000
```

브라우저에서 확인하려면 `npm run build` 후 `npm run dev`를 실행하고 `http://localhost:3000/examples/`를 여세요. 예제는 `../dist/voronoi-bubble.standalone.js`를 import하므로 **빌드가 먼저** 필요합니다.

| 스크립트 | 내용 |
|---|---|
| `npm test` | Vitest 1회 실행 |
| `npm run test:watch` | Vitest watch 모드 |
| `npm run build` | Rollup 빌드 (`prebuild`가 `dist/`를 먼저 지웁니다) |
| `npm run build:watch` | Rollup watch 모드 |
| `npm run clean` | `dist/` 삭제 |
| `npm run dev` | 정적 서버 (포트 3000) |

## PR 전 체크리스트

1. [ ] **`npm test` 통과** — 실패한 채로 올린 PR은 리뷰하지 않습니다.
2. [ ] `npm run build` 성공 (5개 번들이 모두 생성되는지)
3. [ ] 동작이 바뀌었다면 `tests/`에 테스트를 추가하거나 갱신
4. [ ] 공개 API가 바뀌었다면 `docs/API.md`와 `CHANGELOG.md`(`## [Unreleased]`)를 함께 수정
5. [ ] 새 파일에 저작권 헤더 2줄 포함

```javascript
// Copyright (c) 2025 UXtechLab. All Rights Reserved.
// Originally created by @taekie. Licensed under BUSL-1.1 by UXtechLab. See LICENSE for details.
```

CI(GitHub Actions)가 push·PR마다 `npm ci && npm test && npm run build`를 실행합니다.

## 테스트 작성

Vitest + jsdom을 씁니다. jsdom에는 SVG 측정 API(`getBBox`, `getScreenCTM`, `getComputedTextLength`)가 없어 `tests/setup.js`에서 스텁을 넣고 있습니다. 렌더 중 다른 누락 API로 실패하면 **소스를 고치지 말고** 같은 패턴으로 스텁을 추가하세요.

```javascript
import { describe, it, expect } from 'vitest';
import { VoronoiBubble } from '../src/index.js';
import { ROWS } from './fixtures.js';

describe('...', () => {
  it('...', () => {
    const svg = new VoronoiBubble().render(ROWS, { seedRandom: 'test' });
    expect(svg.querySelectorAll('path.vb-cell[data-depth="3"]').length).toBe(6);
  });
});
```

- 공용 픽스처는 `tests/fixtures.js`의 `ROWS`(2 group × 4 subgroup × 6 item)를 쓰세요.
- 레이아웃을 검증할 때는 `seedRandom`을 고정하세요.
- **`foreignObject` 같은 타입 셀렉터는 jsdom에서 매치되지 않습니다.** 클래스 셀렉터로 작성하세요.

## 코드 스타일

- 기존 코드 구조와 패턴을 유지하세요. 대규모 리포맷·리팩터링을 다른 변경과 섞지 마세요.
- 애니메이션·트랜지션·그라디언트 같은 시각 효과는 요청 없이 추가하지 않습니다.
- 어휘는 `group`(depth 1) / `subgroup`(depth 2) / `item`(depth 3) / `size`로 통일합니다. CSS 클래스는 전부 `vb-` 접두사.
- v1 이름에 대한 동작 폴백을 추가하지 마세요 (v2는 클린 브레이킹). 감지가 필요하면 `VoronoiBubble.V1_RENAMES`에 항목을 추가해 콘솔 안내만 합니다.

## 커밋 컨벤션

[Conventional Commits](https://www.conventionalcommits.org/ko/v1.0.0/)를 따릅니다.

```
<type>(<scope>): <제목>
```

| type | 용도 |
|---|---|
| `feat` | 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서만 변경 |
| `test` | 테스트 추가·수정 |
| `refactor` | 동작 변화 없는 구조 변경 |
| `perf` | 성능 개선 |
| `chore` | 빌드·설정·잡무 |
| `ci` | CI 설정 |

브레이킹 체인지는 `feat!:` / `fix!:`처럼 `!`를 붙이고, 본문에 `BREAKING CHANGE:` 문단으로 무엇이 깨지는지 적으세요.

```
feat!: CSS 클래스 vb- 네임스페이스 통일

BREAKING CHANGE: .textArea → .vb-cell[data-depth="3"] 등 전체 클래스 리네임.
호스트 페이지 CSS 셀렉터를 함께 수정해야 합니다.
```

## 배포

메인테이너용 절차입니다.

1. `CHANGELOG.md`의 `## [Unreleased]`를 새 버전 항목으로 확정하고 `package.json`의 `version`을 올립니다.
2. `npm test && npm run build`로 5개 번들을 만듭니다.
3. `dist/*`와 `README.md`를 공개 dist 저장소 [`pxd-uxtech/voronoi-bubble-dist`](https://github.com/pxd-uxtech/voronoi-bubble-dist)에 복사합니다.
4. dist 저장소에서 커밋 후 `vX.Y.Z` 태그를 만들고 태그까지 push합니다.
5. jsdelivr가 자동으로 서빙합니다. 캐시가 남아 있으면 `https://purge.jsdelivr.net/gh/pxd-uxtech/voronoi-bubble-dist@vX.Y.Z/dist/voronoi-bubble.standalone.js`로 퍼지합니다.

기존에 배포된 태그·커밋 핀 URL은 영구히 유효하므로, 새 버전을 올려도 기존 사용처는 깨지지 않습니다.

## 라이선스

기여하신 코드는 저장소와 동일한 [BUSL-1.1](LICENSE) 조건으로 배포됩니다 (Change Date 2029-01-01에 MIT로 전환). PR을 보내는 것은 이 조건에 동의하는 것으로 간주합니다.
