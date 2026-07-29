# Observable 데모 노트북 — 붙여넣기용 셀

[observablehq.com](https://observablehq.com)에서 새 노트북을 만들고 아래 셀을 순서대로 붙여넣으면
VoronoiBubble 데모 노트북이 완성됩니다. 셀 하나가 Observable 셀 하나입니다.

---

**셀 1 — Markdown 셀**

```
# VoronoiBubble — customer feedback topic map

Flat rows in, a pebble-shaped Voronoi treemap out. Your own column names work
as-is via `levels`/`value` — here `topic → aspect → opinion`, sized by `mentions`.
Click a cell for the quoted opinion.
Library: [pxd-uxtech/voronoi-bubble-dist](https://github.com/pxd-uxtech/voronoi-bubble-dist) (MIT)
```

**셀 2 — JavaScript 셀 (라이브러리 로드)**

```javascript
VB = {
  const m = await import(
    "https://cdn.jsdelivr.net/gh/pxd-uxtech/voronoi-bubble-dist@v2.1.3/dist/voronoi-bubble.standalone.js"
  );
  return m;
}
```

**셀 3 — JavaScript 셀 (데이터)**

```javascript
data = [
  { topic: "🚚 Shipping", aspect: "Delivery speed", opinion: "Arrived next day", mentions: 18 },
  { topic: "🚚 Shipping", aspect: "Delivery speed", opinion: "Faster than expected", mentions: 11 },
  { topic: "🚚 Shipping", aspect: "Delivery delays", opinion: "Took over a week", mentions: 8 },
  { topic: "🚚 Shipping", aspect: "Delivery delays", opinion: "No tracking updates", mentions: 5 },
  { topic: "🚚 Shipping", aspect: "Packaging", opinion: "Well protected box", mentions: 9 },
  { topic: "✨ Product Quality", aspect: "Build quality", opinion: "Feels premium", mentions: 14 },
  { topic: "✨ Product Quality", aspect: "Build quality", opinion: "Solid materials", mentions: 9 },
  { topic: "✨ Product Quality", aspect: "Durability issues", opinion: "Broke within a month", mentions: 7 },
  { topic: "✨ Product Quality", aspect: "Consistency", opinion: "Color differs from photos", mentions: 6 },
  { topic: "💰 Pricing", aspect: "Value for money", opinion: "Great value", mentions: 13 },
  { topic: "💰 Pricing", aspect: "Value for money", opinion: "Would buy again", mentions: 8 },
  { topic: "💰 Pricing", aspect: "Price increases", opinion: "Got more expensive", mentions: 6 },
  { topic: "🎧 Support", aspect: "Helpful agents", opinion: "Solved it right away", mentions: 10 },
  { topic: "🎧 Support", aspect: "Slow responses", opinion: "Waited days for a reply", mentions: 8 },
  { topic: "🎧 Support", aspect: "Refund friction", opinion: "Refund was complicated", mentions: 6 },
  { topic: "📱 App Experience", aspect: "Easy ordering", opinion: "Checkout is quick", mentions: 11 },
  { topic: "📱 App Experience", aspect: "App crashes", opinion: "App keeps crashing", mentions: 7 },
  { topic: "📱 App Experience", aspect: "Search gaps", opinion: "Search misses items", mentions: 5 }
]
```

**셀 4 — JavaScript 셀 (차트)**

```javascript
chart = {
  const svg = new VB.VoronoiBubble().render(data, {
    width: 1200,
    height: 900,
    levels: ["topic", "aspect", "opinion"],   // 원본 컬럼명 그대로
    value: "mentions",
    title: `What ${data.reduce((s, d) => s + d.mentions, 0)} customer reviews talk about`,
    caption: "cell area = number of mentions · click a cell",
    showGroupLabel: true,
    showPercent: true,
    onClick: (cell) =>
      VB.showVoronoiPopup(cell, {
        format: "<b>“{opinion}”</b><br>{aspect} · {topic}<br>{mentions} mentions"
      })
  });
  return svg;
}
```

**셀 5 — JavaScript 셀 (감성 컬러맵 변형, 선택)**

```javascript
sentimentChart = {
  // 평점 필드(1~5)만 있으면 옵션 한 줄로 부정→긍정 다이버징 컬러맵
  const rated = data.map((d, i) => ({ ...d, rating: (i % 5) + 1 }));
  const svg = new VB.VoronoiBubble().render(rated, {
    width: 1200,
    height: 900,
    levels: ["topic", "aspect", "opinion"],
    value: "mentions",
    title: "Same map, colored by rating (sentiment: 'rating')",
    sentiment: "rating",
    showGroupLabel: true
  });
  return svg;
}
```

**셀 6 — JavaScript 셀 (positions로 그룹 위치 고정, 선택)**

```javascript
positionedChart = {
  // {key, depth, x, y} — 0~1 상대 좌표. 지정하지 않은 그룹은 시드 기반 자동 배치.
  // 임베딩+UMAP 좌표를 그대로 넣으면 의미상 가까운 주제가 화면에서도 가까워진다
  // (docs/API.md '위치 제어와 재현성' 참조).
  const positions = [
    { key: "🚚 Shipping", depth: 1, x: 0.15, y: 0.5 },
    { key: "✨ Product Quality", depth: 1, x: 0.5, y: 0.2 },
    { key: "📱 App Experience", depth: 1, x: 0.85, y: 0.5 }
  ];
  const svg = new VB.VoronoiBubble().render(data, {
    width: 1200,
    height: 900,
    levels: ["topic", "aspect", "opinion"],
    value: "mentions",
    title: "Same data, groups pinned with `positions`",
    caption: "🚚 left · ✨ top · 📱 right — layout stays put across re-renders",
    positions,
    seedRandom: "demo",
    showGroupLabel: true
  });
  return svg;
}
```

---

메모

- CDN 핀(`@v2.1.3`)은 릴리스에 맞춰 올리면 됩니다 — 태그 핀이라 기존 노트북은 깨지지 않습니다.
- 팝업(`showVoronoiPopup`)은 추가 CSS 없이 동작합니다. Observable 페이지의 `document.body`에 절대 위치로 붙습니다.
- 반응형: 반환된 SVG에 `width:100%; height:auto; max-width:1200px`가 이미 걸려 있어 셀 폭에 맞춰 줄어듭니다.
