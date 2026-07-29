# Changelog

이 프로젝트의 주요 변경사항을 기록합니다.
형식은 [Keep a Changelog](https://keepachangelog.com/ko/1.1.0/)를 따르고, 버전은 [Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

## [Unreleased]

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
