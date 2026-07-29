# Observable 데모 노트북 — 붙여넣기용 셀

[observablehq.com](https://observablehq.com)에서 새 노트북을 만들고 아래 셀을 순서대로 붙여넣으면
VoronoiBubble 데모 노트북이 완성됩니다. 셀 하나가 Observable 셀 하나입니다.

구성: ① 고객 피드백 토픽 맵(기본·팝업·sentiment) → ② 세계 인구 맵(실데이터 + **positions·컬러맵 토글**) → ③ Flare 클래스 계층(colorFunc 심화).

---

**셀 1 — Markdown 셀**

```
# VoronoiBubble — flat rows in, pebble treemaps out

Your own column names work as-is via `levels`/`value`. Click cells for popups.
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

**셀 3 — JavaScript 셀 (고객 피드백 데이터 — 의미 있는 컬럼명)**

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

**셀 4 — JavaScript 셀 (피드백 차트 + 클릭 팝업)**

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

---

## 세계 인구 맵 — 실데이터 + positions·컬러맵 토글

**셀 6 — JavaScript 셀 (viridis 스케일 로드)**

```javascript
d3sc = import("https://cdn.jsdelivr.net/npm/d3-scale-chromatic@3/+esm")
```

**셀 7 — JavaScript 셀 (실데이터 3종 조인: 지역 계층·인구·일인당 GDP)**

```javascript
worldRows = {
  // world-countries(지역 계층·좌표) + country-json(인구) + World Bank API(일인당 GDP 최신연도)
  const [countries, popList, gdpRes] = await Promise.all([
    fetch("https://cdn.jsdelivr.net/npm/world-countries@5/countries.json").then((r) => r.json()),
    fetch("https://cdn.jsdelivr.net/npm/country-json@1/src/country-by-population.json").then((r) => r.json()),
    fetch("https://api.worldbank.org/v2/country/all/indicator/NY.GDP.PCAP.CD?format=json&per_page=400&mrv=1").then((r) => r.json())
  ]);
  const ALIAS = {
    "DR Congo": "The Democratic Republic of Congo",
    "Türkiye": "Turkey",
    "Libya": "Libyan Arab Jamahiriya",
    "Fiji": "Fiji Islands"
  };
  const popMap = new Map(popList.filter((p) => p.population).map((p) => [p.country, p.population]));
  const gdpMap = new Map(gdpRes[1].filter((r) => r.value != null).map((r) => [r.countryiso3code, r.value]));
  return countries.flatMap((c) => {
    const name = c.name.common;
    const population = popMap.get(name) ?? popMap.get(ALIAS[name]) ?? popMap.get(c.name.official);
    const gdpPerCapita = gdpMap.get(c.cca3);
    if (!population || !gdpPerCapita || c.region === "Antarctic") return [];
    return [{
      continent: c.region, subregion: c.subregion, country: name,
      population, gdpPerCapita, latlng: c.latlng
    }];
  });
}
```

**셀 8 — JavaScript 셀 (대륙 지리 좌표 → positions)**

```javascript
geoPositions = {
  // 대륙별 평균 lat/lng를 0~1 상대 좌표로 — 위치를 데이터에서 계산한다
  const byContinent = {};
  worldRows.forEach((r) => (byContinent[r.continent] ??= []).push(r));
  return Object.entries(byContinent).map(([key, rs]) => ({
    key, depth: 1,
    x: (rs.reduce((s, r) => s + r.latlng[1], 0) / rs.length + 180) / 360,
    y: (90 - rs.reduce((s, r) => s + r.latlng[0], 0) / rs.length) / 180
  }));
}
```

**셀 9 — JavaScript 셀 (토글 UI)**

```javascript
viewof controls = Inputs.form({
  geo: Inputs.toggle({ label: "Pin continents geographically (positions)", value: true }),
  gdp: Inputs.toggle({ label: "Color by GDP per capita (colorFunc + viridis)", value: true })
})
```

**셀 10 — JavaScript 셀 (반응형 세계 인구 차트)**

```javascript
worldChart = {
  const logs = worldRows.map((d) => Math.log10(d.gdpPerCapita));
  const [lo, hi] = [Math.min(...logs), Math.max(...logs)];
  return new VB.VoronoiBubble().render(worldRows, {
    width: 1200,
    height: 900,
    levels: ["continent", "subregion", "country"],
    value: "population",
    title: `World population — ${worldRows.length} countries`,
    caption: "area = population"
      + (controls.gdp ? " · color = GDP per capita (viridis, log)" : "")
      + (controls.geo ? " · continents pinned by mean lat/lng" : ""),
    positions: controls.geo ? geoPositions : null,
    colorFunc: controls.gdp
      ? (rows) => d3sc.interpolateViridis(0.1 + 0.85 * ((Math.log10(rows[0].gdpPerCapita) - lo) / (hi - lo)))
      : null,
    seedRandom: "world",
    showGroupLabel: true,
    showPercent: true,
    sizeLimit: 1e12 // 값 라벨 숨김
  });
}
```

---

## Flare 클래스 계층 — colorFunc 심화

**셀 11 — JavaScript 셀 (공개 계층 데이터: flare)**

```javascript
flareRows = {
  // vega-datasets의 flare.json — d3 트리맵 데모의 고전 (Flare 툴킷 클래스 계층).
  // parent 포인터를 경로로 풀어 package / subpackage / class 3계층 rows로 평탄화.
  const flare = await (
    await fetch("https://cdn.jsdelivr.net/npm/vega-datasets@2/data/flare.json")
  ).json();
  const byId = new Map(flare.map((n) => [n.id, n]));
  const path = (n) => (n.parent == null ? [n.name] : [...path(byId.get(n.parent)), n.name]);
  return flare
    .filter((n) => n.size != null)
    .map((n) => {
      const p = path(n);
      return {
        package: p[1],
        subpackage: p.length > 3 ? p[2] : p[1] + " core",
        class: p[p.length - 1],
        size: n.size
      };
    });
}
```

**셀 12 — JavaScript 셀 (log 크기 viridis)**

```javascript
flareChart = {
  const logs = flareRows.map((d) => Math.log10(d.size));
  const [lo, hi] = [Math.min(...logs), Math.max(...logs)];
  return new VB.VoronoiBubble().render(flareRows, {
    width: 1200,
    height: 900,
    levels: ["package", "subpackage", "class"],
    value: "size",
    title: `Flare toolkit — ${flareRows.length} classes by source size`,
    caption: "real public hierarchy (vega-datasets flare.json) · color = log₁₀ size (viridis)",
    colorFunc: (rows, node, defaultColor, ctx) =>
      d3sc.interpolateViridis(0.12 + 0.83 * ((Math.log10(ctx.value) - lo) / (hi - lo))),
    showGroupLabel: true,
    showPercent: true,
    sizeLimit: 1e9
  });
}
```

---

메모

- CDN 핀(`@v2.1.3`)은 릴리스에 맞춰 올리면 됩니다 — 태그 핀이라 기존 노트북은 깨지지 않습니다.
- 팝업(`showVoronoiPopup`)은 추가 CSS 없이 동작합니다. Observable 페이지의 `document.body`에 절대 위치로 붙습니다.
- 반응형: 반환된 SVG에 `width:100%; height:auto; max-width:1200px`가 이미 걸려 있어 셀 폭에 맞춰 줄어듭니다.
- 세계 인구 셀의 데이터 출처: [world-countries](https://www.npmjs.com/package/world-countries)(지역 계층·좌표), [country-json](https://www.npmjs.com/package/country-json)(인구), [World Bank API](https://api.worldbank.org)(일인당 GDP). Taiwan·Kosovo는 인구/GDP 소스에 없어 제외됩니다.
