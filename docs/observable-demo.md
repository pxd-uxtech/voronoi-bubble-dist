# Observable 데모 노트북 — 붙여넣기용 셀

[observablehq.com](https://observablehq.com)에서 새 노트북을 만들고 아래 셀을 순서대로 붙여넣으면
VoronoiBubble 데모 노트북이 완성됩니다. 셀 하나가 Observable 셀 하나입니다.

---

**셀 1 — Markdown 셀**

```
# VoronoiBubble — customer feedback topic map

Flat rows in, a pebble-shaped Voronoi treemap out. `group → subgroup → item`,
cell area = number of mentions. Click a cell for the quoted opinion.
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
  { group: "Shipping", subgroup: "Delivery speed", item: "Arrived next day", size: 18 },
  { group: "Shipping", subgroup: "Delivery speed", item: "Faster than expected", size: 11 },
  { group: "Shipping", subgroup: "Delivery delays", item: "Took over a week", size: 8 },
  { group: "Shipping", subgroup: "Delivery delays", item: "No tracking updates", size: 5 },
  { group: "Shipping", subgroup: "Packaging", item: "Well protected box", size: 9 },
  { group: "Product Quality", subgroup: "Build quality", item: "Feels premium", size: 14 },
  { group: "Product Quality", subgroup: "Build quality", item: "Solid materials", size: 9 },
  { group: "Product Quality", subgroup: "Durability issues", item: "Broke within a month", size: 7 },
  { group: "Product Quality", subgroup: "Consistency", item: "Color differs from photos", size: 6 },
  { group: "Pricing", subgroup: "Value for money", item: "Great value", size: 13 },
  { group: "Pricing", subgroup: "Value for money", item: "Would buy again", size: 8 },
  { group: "Pricing", subgroup: "Price increases", item: "Got more expensive", size: 6 },
  { group: "Support", subgroup: "Helpful agents", item: "Solved it right away", size: 10 },
  { group: "Support", subgroup: "Slow responses", item: "Waited days for a reply", size: 8 },
  { group: "Support", subgroup: "Refund friction", item: "Refund was complicated", size: 6 },
  { group: "App Experience", subgroup: "Easy ordering", item: "Checkout is quick", size: 11 },
  { group: "App Experience", subgroup: "App crashes", item: "App keeps crashing", size: 7 },
  { group: "App Experience", subgroup: "Search gaps", item: "Search misses items", size: 5 }
]
```

**셀 4 — JavaScript 셀 (차트)**

```javascript
chart = {
  const svg = new VB.VoronoiBubble().render(data, {
    width: 1200,
    height: 900,
    title: `What ${data.reduce((s, d) => s + d.size, 0)} customer reviews talk about`,
    caption: "cell area = number of mentions · click a cell",
    showGroupLabel: true,
    showPercent: true,
    onClick: (cell) =>
      VB.showVoronoiPopup(cell, {
        format: "<b>“{item}”</b><br>{subgroup} · {group}<br>{size} mentions"
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
    title: "Same map, colored by rating (sentiment: 'rating')",
    sentiment: "rating",
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
