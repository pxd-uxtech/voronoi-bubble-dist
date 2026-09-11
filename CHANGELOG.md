# Changelog

이 프로젝트의 주요 변경사항을 기록합니다.
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따르고, 버전은 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

## [2.3.0] - 2026-09-12

### Fixed

- **item 값 라벨이 항목 라벨에서 떨어져 나가거나 겹치던 문제**: 값(`text.vb-item-value`)이 셀 중심에서 고정 오프셋(`+20px`)으로 그려져, 라벨이 2줄 이상으로 접히거나 캔버스가 작아지면 라벨 글자 위에 얹히거나 멀찍이 떨어졌다. 이제 값은 **항목 라벨과 하나의 블록**으로 배치된다 — 실제 렌더 줄바꿈을 그대로 써서 마지막 줄 바로 아래에 붙고, 오프셋도 캔버스 폰트 배율을 따라간다.
- **라벨 충돌 회피가 반복 실행될 때마다 조금씩 밀리던 문제**: 이제 모든 라벨이 렌더 시점 앵커(`data-anchor-x/y`)를 갖고, 보정은 매번 그 앵커에서 다시 계산된다. `adjust()`를 여러 번 불러도 결과가 같다.
- item 라벨 보정이 부모 subgroup 라벨만 보던 것을, 라벨+값 블록 단위로 **주변 라벨 전체**(group·subgroup 라벨, 이미 배치된 다른 블록)와 비교하도록 확장. 블록은 기본적으로 원래 앵커에 머물고, 겹칠 때만 자기 셀(polygon) 안에서 최소 거리로 이동한다. 어느 위치에도 들어가지 않는 아주 작은 셀은 겹침이 가장 적은 위치에 최선 배치한다.
- 줌 중에도 값이 라벨에 붙어 함께 축소/이동한다(줌 재줄바꿈으로 줄 수가 바뀌면 오프셋도 다시 계산).
- 화면에 그려지지 않는 라벨(`showGroupLabel: false`일 때 `fill-opacity: 0`으로 숨긴 group 라벨, `ratioLimit`/`sizeLimit`로 감춘 라벨)은 더 이상 다른 라벨을 밀어내지 않는다.
- **영문 subgroup 라벨이 셀 왼쪽 밖으로 밀려 나가던 문제**: 줄바꿈 예산은 라틴 글자를 0.55em으로 잡고 폭 측정은 0.65em으로 잡아, 줄이 셀 유효 폭보다 최대 49% 넓어지고 블록이 (측정 폭의 절반만큼 왼쪽에 앵커되므로) 폭의 1/6만큼 왼쪽으로 치우쳤다. 이제 줄바꿈 예산과 폭 측정이 모두 **em 단위 하나**로 통일되어(라틴 0.5em·공백 0.25em·CJK 1em, 줄 폭 상한 5~13em 공통) 영문도 셀 안에 들어오고 중앙에 놓인다. 한글 렌더 결과는 변하지 않는다.
- subgroup 라벨이 줄 수 제한으로 잘렸을 때 말줄임(`…`)이 빠지는 경우가 있었다(마지막 줄이 폭 제한 안에 들어가면 표시를 건너뜀). 이제 잘린 경우 항상 `…`가 붙는다.
- **조약돌 외곽선의 모서리가 각져 보이던 문제**: 보로노이 클립의 둥근 모서리는 13°씩 꺾이는 직선 6개로 근사돼 있는데, `smoothPath()`가 잘라내는 길이가 `반지름 / tan(각/2)`이라 167~172° 이음매에서는 1px도 다듬지 못했다. 이제 150°보다 완만한 이음매는 "곡선을 흉내내는 직선 조각"으로 보고 변 길이의 절반을 잘라 인접 곡선끼리 접선으로 만나게 한다. 날카로운 코너는 기존 규칙 그대로. 스무딩된 경로의 최대 꺾임각이 88° → 29.7°로 줄어 모서리가 곡선으로 보인다. 셀 배치는 그대로다.
- **셀이 만나는 교차점(4덩어리 차트의 가운데 십자 등)이 직각으로 남던 문제**: 보로노이가 공유 모서리를 점 하나가 아니라 몇 px 떨어진 점 두 개로 남기는데, 그 짧은 변이 라운딩 상한(`짧은 변 / 2.1`)을 잡아먹어 `pebbleRound`를 아무리 키워도 1px도 둥글어지지 않았다. 이제 그런 stub 변은 다듬기 전에 합친다. 기준값은 해당 폴리곤의 중앙값 변 길이의 35%라 차트 크기를 따라간다(작은 차트에서 멀쩡한 모서리 점이 지워지지 않음).

- **subgroup 라벨이 셀 밖으로 나가던 문제**: 서브그룹 site가 셀 가장자리에 가까우면 긴 헤딩의 첫/마지막 줄이 셀 밖으로 잘려 보였다. 이제 셀 안에서 라벨 사각형이 온전히 들어가는 가장 가까운 위치를 찾고(중심·site·무게중심·격자 순), 그래도 안 되면 라벨 폰트만 92%→50%로 줄여 맞춘다. 텍스트를 잘라내지는 않는다. 어떤 크기로도 안 맞으면 원래 폰트 크기로 되돌린다. (v2.2.0 이후 배포 번들에만 들어가 있던 수정을 소스로 정식 편입)

### Added

- `itemLabelFit` 옵션 (기본 `true`). depth-3 라벨이 **자기 셀에 맞춰 커진다**. 지금까지는 값 비중만으로 크기가 정해져, 셀이 아무리 넓어도 짧은 키워드가 셀 폭의 9~25%만 채우는 작은 글씨로 남았다. 이제 위로는 자기 subgroup 라벨의 0.75배, 아래로는 기존 값 기준 크기를 한계로 커진다(위계 유지). 긴 문장은 셀 폭에 먼저 걸려 거의 커지지 않는다. `false`로 주면 예전 동작 그대로.

### Changed

- `LabelAdjuster.adjust()`에 `maxItemMove`(기본 `'auto'` — 셀 크기에 비례), `valueGapRatio`, `adjustGroupLabels` 옵션 추가. 기존 옵션·기본 동작은 그대로.
- item 라벨 보정 패스가 `showGroupLabel` 여부와 관계없이 항상 실행된다(값-라벨 블록 배치가 group 라벨 표시와 무관하므로).

## [2.2.0] - 2026-08-06

### Added

- `subgroupLabelMaxLines` 옵션 (기본 `'auto'`). depth-2 라벨이 2줄로 고정되지 않고 셀 높이가 허용하는 만큼(최대 6줄) 펼쳐져 긴 라벨도 가능한 한 온전히 표시된다. 숫자를 주면 그 값으로 고정(예전 동작은 `2`).

### Fixed

- **빈 그룹명(`''`)이 데이터를 통째로 삭제하던 문제**: `group` 값이 빈 문자열이거나 숫자 `0`이면 해당 그룹의 셀 전체가 차트에서 사라졌다. 이제 빈 라벨은 "이름 없음"으로만 처리되어 셀은 그대로 그려지고 라벨 텍스트만 비워진다. `group` 값이 `null`/`undefined`인 행이 있으면 필드명 확인을 안내하는 경고를 한 번 출력한다.
- 라벨 `0`(숫자)이 빈 문자열로 렌더되던 문제 — 이제 `0`이 그대로 표시된다.
- depth-2 라벨의 세로 위치 계산이 실제 렌더 줄바꿈(셀 폭 기준)이 아니라 기본 줄바꿈을 쓰던 불일치 수정.

## [2.1.3] - 2026-07-29

### Changed

- 색 위계 미세 튜닝: depth-2 명도 대비 상향(spread 0.10→0.12, strong 0.14→0.16), depth-3 감쇠 하향(0.45→0.35). 서브그룹 단계는 더 또렷하게, 항목 변주는 질감 수준으로.
- hero 이미지 생성 페이지를 `docs/hero.html`로 저장 (재렌더 재현용).


## [2.1.2] - 2026-07-29

### Changed

- **depth-3 음영 변주를 depth-2의 45%로 감쇠**: 서브그룹당 항목이 적은 차트에서 항목(depth-3) 명도 차이가 서브그룹(depth-2) 경계만큼 커져 위계가 안 읽히던 문제. 이제 서브그룹 구분이 항목 변주보다 항상 먼저 읽히며, 테스트로 계약을 고정(d3 spread < d2 spread). 참고로 depth-3 동일 강도 변주는 v1부터 있던 동작이다.


## [2.1.1] - 2026-07-29

### Added

- **예제 2종**: `examples/feedback-topics.html`(고객 피드백 토픽 맵 — 간판 정성 데이터 유스케이스), `examples/book-taxonomy.html`(`levels`/`value` 커스텀 컬럼 시연).

### Changed

- 저작권 표기에서 MIT와 뉘앙스가 충돌하던 "All Rights Reserved" 문구 제거 (번들 배너·소스 헤더).
- 문서·스킬·예제의 CDN 핀을 v2.1.1로 정합 (SKILL.md와 API.md의 핀 불일치 해소 — 에이전트 클린룸 관찰에서 발견).
- `positions` 부분 지정 시 폴백 동작(미지정 항목은 시드 기반 무작위 배치) 문서화.


## [2.1.0] - 2026-07-29

### Added

- **`colorVariation` 옵션** (`'standard'` | `'subtle'` | `'strong'`): 서브그룹·말단 셀 음영 변주 강도. 기본 `standard`는 그룹 내 형제간 대비와 팔레트 채도를 유지하되, 밝아지는 쪽만 감쇠해 최소값 셀이 하얗게 뜨는 문제를 개선. `subtle`은 차트 전역 분포 기준의 차분한 음영(채도 캡), `strong`은 발표용 강한 대비.
- **서브그룹 라벨 phrase 줄바꿈**: 서브그룹 라벨을 짧은 헤딩으로 취급해 최대 2줄로 균형 배치.

### Changed

- **배포 라이선스 MIT 전환**: 배포 번들과 문서가 MIT로 제공됩니다 (Copyright UXtechLab, 원저작자 @taekie). 소스 헤더·빌드 배너·package.json의 BUSL-1.1 표기를 MIT로 갱신. (소스 저장소는 당분간 비공개 유지)


## [2.0.1] - 2026-07-26

### Fixed

- **`adaptiveIterations`가 그룹·서브그룹 면적 정확도를 훼손하던 문제**: 적응형 반복 축소가 모든 분할 단계에 적용되어, 자식 수가 많은 컨테이너 분할(그룹·서브그룹 면적)이 미수렴 상태로 끊겼습니다 (예: 573개 셀에서 10회 반복 — 면적이 가중치를 반영하지 못함). 이제 축소는 **말단(depth 3) 분할에만** 적용되고 상위 분할은 항상 전체 반복 예산으로 수렴합니다. depth 1·2 폴리곤이 `adaptiveIterations: false`와 동일함을 테스트로 고정.

## [2.0.0] - 2026-07-25

어휘를 `group / subgroup / item / size` 한 벌로 통일한 **클린 브레이킹** 릴리스입니다.
업그레이드 절차는 [docs/MIGRATION.md](docs/MIGRATION.md)를 보세요.

### Breaking

- **클래스·전역 이름**: `VoronoiTreemap` → `VoronoiBubble`, `VoronoiTreemapHelpers` → `VoronoiBubbleHelpers`, UMD 전역 `VoronoiTreemapModule` → `VoronoiBubbleModule`. 빌드 산출물 이름도 `voronoi-bubble.*.js`.
- **데이터 필드**: `metaLabel` → `group`, `label` → `subgroup`, `text` → `item`, `bubbleSize` → `size`. `levels` 기본값 `['group','subgroup','item']`, `value` 기본값 `'size'`.
- **옵션**: `maptitle`/`mapcaption` → `title`/`caption`, `showMetaLabel` → `showGroupLabel`, `showLabel`(boolean) → `labelMode`(`'show'`/`'faded'`/`'hidden'`, 기본값 `'faded'`), `keyColors` → `groupColors`, `clickFunc` → `onClick`, `hoverFunc` → `onHover`, `labelHoverFunc` → `onSubgroupLabelHover`.
- **`getCellColors` 페이로드** (콘솔 경고로 감지되지 않는 무성 브레이킹): `{metaLabel, metaColor, bigLabel, bigColor, label, color}` → `{group, groupColor, subgroup, color}`.
- **`onSubgroupLabelHover` 페이로드**: `{...row, label, key, depth, event, target}` → `{subgroup, key, depth, event, target}`. 원본 행 필드는 포함되지 않습니다.
- **`colorFunc`의 `ctx`**: `ctx.metaLabel` → `ctx.group` (d3 노드 객체 — 키 문자열은 `ctx.group.data.key`).
- **CSS 클래스·data 속성** (역시 무성 브레이킹): 모든 클래스에 `vb-` 접두사. `.metaLabelArea`/`.labelArea`/`.textArea`/`.rootArea` → `.vb-cell[data-depth]`, `.region` → `.vb-group-label`, `.label-item` → `.vb-subgroup-label`, `.text-item` → `.vb-item-label`, `.title`/`.caption` → `.vb-title`/`.vb-caption`, `.clicked` → `.vb-clicked`, `.voronoi-popup-*` → `.vb-popup-*`, `data-bigCluster`/`data-cluster` → `data-subgroup`/`data-item`, `area-{id}`/`label-{id}` 클래스 → `data-id` 속성. 전체 표는 [MIGRATION.md §5](docs/MIGRATION.md#5-css-클래스data-속성-무성-브레이킹).
- **팝업 기본 `format`**: `"{text}"` → `"{item}"`.
- 루트 `<svg>`에 `.vb-chart` 클래스 추가.

### Added

- **v1 이름 감지 경고**: `render()`가 옵션·데이터 첫 행에서 v1 이름을 발견하면 무엇이 무엇으로 바뀌었는지 콘솔 에러로 한 번 안내합니다. 동작 폴백은 없습니다.
- **테스트**: Vitest + jsdom 기반 6개 파일 14개 테스트 — 렌더 스모크, 계층 변환, 옵션 정규화, 색상 우선순위, 시드 재현성, CSS 계약(클래스·셀렉터 배선).
- **CI**: GitHub Actions에서 push/PR마다 `npm test` + `npm run build`.
- **`examples/`**: 실행 가능한 예제 4종(basic, sentiment, custom-labels, popup-hover)과 갤러리 `examples/index.html`.
- **문서**: `docs/API.md`(Public CSS API 섹션 포함), `docs/MIGRATION.md`, `CHANGELOG.md`, `CONTRIBUTING.md`.
- **캔버스 정규화 폰트 스케일 + `fontScale` 옵션**: 라벨·값 폰트가 캔버스 면적(기준 1200×900)에 맞춰 자동으로 정규화되어, 작은 `width`/`height`로 렌더해도 글자가 셀과 함께 줄어듭니다. `fontScale`(기본 1)로 추가 배율 조정 가능. 기준 크기 1200×900 렌더 결과는 기존과 동일합니다.
- **`groupLabelScale`(기본 1.1) / `subgroupLabelScale`(기본 1.05) 옵션**: v1에서 하드코딩돼 있던 그룹 ×1.15 / 서브그룹 ×1.0 라벨 배율을 옵션으로 조절 가능하게 함 (기본값은 실측 튜닝 결과).
- **`showPercent`가 라벨 폰트를 바꾸지 않음**: v1은 showPercent를 켜면 그룹 라벨이 HTML 렌더러로 전환되어 폰트가 미묘하게 달라졌으나, v2는 같은 SVG 텍스트에 퍼센트 줄만 덧붙여 폰트가 항상 일관됩니다.
- **내장 팔레트 프리셋 (명화 시리즈)**: `colors`가 프리셋 이름을 받습니다 — `'pastel'`(기본 107색), `'starryNight'`(반 고흐), `'waterLilies'`(모네), `'wave'`(호쿠사이), `'kiss'`(클림트), `'sunrise'`(모네). 그림 원색의 hue·명암 관계를 보존한 채 OKLCH 파스텔 대역(L 0.76~0.90, C 0.05~0.12)으로 정규화. `VoronoiBubble.PALETTES`로 export.

### Removed

- **legacy 별칭 전부**: 데이터 필드 `region`/`bigClusterLabel`/`clusterLabel`/`budget`, 옵션 `showRegion`/`regionColors`/`metaLabelColors`/`regionPositions`/`metaLabelPositions`, 라벨 렌더러 별칭 `renderLabel`/`regionLabelRenderer`/`metaLabelRenderer`/`labelRenderer`/`bigClusterLabelRenderer`.
- **죽은 CSS 규칙**: `.area1`, `.area2`, `.area2.highlite`, `.area2.clicked`, `.bubblepopup` — v1에서도 JS가 부여하지 않던 클래스라 효과가 없었습니다.
- **작업 잔재**: 루트 `test-*.html`, `example-local.html`, `demo/`, `archive/`, `files/`, `DIST_README.md`, `USAGE_GUIDE.md`. 문서는 `README.md` + `docs/`로 재편했습니다.

### Notes

- 기존에 배포된 차트가 참조하는 **커밋·태그 핀 CDN URL은 계속 동작합니다.** 마이그레이션은 URL을 v2로 올릴 때 하면 됩니다.
- 라이선스는 BUSL-1.1 유지 (Change Date 2029-01-01, Change License MIT).

---

## 1.5.x 이하

이전 이력은 git 히스토리를 참조하세요 (`git log --oneline`).
