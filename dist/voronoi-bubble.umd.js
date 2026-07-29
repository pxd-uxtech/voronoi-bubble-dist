/*!
 * VoronoiBubble (@pxd-uxtech/voronoi-bubble)
 * Originally created by @taekie
 * Copyright (c) 2025 UXtechLab.
 * Released under the MIT License. See LICENSE for details.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3'), require('d3-weighted-voronoi'), require('d3-voronoi-map'), require('d3-voronoi-treemap'), require('seedrandom')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3', 'd3-weighted-voronoi', 'd3-voronoi-map', 'd3-voronoi-treemap', 'seedrandom'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.VoronoiBubble = {}, global.d3, global.d3, global.d3, global.d3, global.seedrandom));
})(this, (function (exports, d3Core, d3WeightedVoronoi, d3VoronoiMap, d3VoronoiTreemap, seedrandomModule) { 'use strict';

  function _interopNamespaceDefault(e) {
    var n = Object.create(null);
    if (e) {
      Object.keys(e).forEach(function (k) {
        if (k !== 'default') {
          var d = Object.getOwnPropertyDescriptor(e, k);
          Object.defineProperty(n, k, d.get ? d : {
            enumerable: true,
            get: function () { return e[k]; }
          });
        }
      });
    }
    n.default = e;
    return Object.freeze(n);
  }

  var d3Core__namespace = /*#__PURE__*/_interopNamespaceDefault(d3Core);
  var d3WeightedVoronoi__namespace = /*#__PURE__*/_interopNamespaceDefault(d3WeightedVoronoi);
  var d3VoronoiMap__namespace = /*#__PURE__*/_interopNamespaceDefault(d3VoronoiMap);
  var d3VoronoiTreemap__namespace = /*#__PURE__*/_interopNamespaceDefault(d3VoronoiTreemap);
  var seedrandomModule__namespace = /*#__PURE__*/_interopNamespaceDefault(seedrandomModule);

  // Copyright (c) 2025 UXtechLab.
  // Originally created by @taekie. Released under the MIT License. See LICENSE for details.
  /**
   * D3 Bundle Utility
   *
   * This module aggregates D3 core with voronoi extension libraries:
   * - d3 (core D3 library)
   * - d3-weighted-voronoi
   * - d3-voronoi-map
   * - d3-voronoi-treemap
   * - seedrandom
   *
   * The bundled d3 object is used throughout the library to ensure
   * all voronoi treemap methods are available on a single namespace.
   *
   * Original Observable require pattern:
   *   require("d3", "d3-weighted-voronoi", "d3-voronoi-map", "d3-voronoi-treemap", "seedrandom@2.4.3/seedrandom.min.js")
   */


  /**
   * Merged D3 namespace with all voronoi treemap extensions
   * This replicates the Observable require behavior:
   *   require("d3", "d3-weighted-voronoi", "d3-voronoi-map", "d3-voronoi-treemap", "seedrandom")
   * which merges all modules into a single namespace.
   */
  const d3 = Object.assign(
    {},
    d3Core__namespace,
    d3WeightedVoronoi__namespace,
    d3VoronoiMap__namespace,
    d3VoronoiTreemap__namespace
  );

  // Attach seedrandom for reproducible random number generation
  // This allows usage like: d3.seedrandom('myseed')
  d3.seedrandom = seedrandomModule__namespace.default || seedrandomModule__namespace;

  // Copyright (c) 2025 UXtechLab.
  // Originally created by @taekie. Released under the MIT License. See LICENSE for details.
  /**
   * PebbleRenderer
   *
   * Renders smooth "pebble-like" outlines around voronoi treemap cells.
   * Creates rounded corner effects for depth-1 (region) and depth-2
   * (cluster) boundaries to give the treemap a polished, organic appearance.
   *
   * Features:
   * - Smooth path generation with configurable corner radius
   * - Color variation for depth-2 outlines
   * - Point simplification for cleaner paths
   */


  /**
   * PebbleRenderer - Smooth outline renderer for voronoi treemaps
   *
   * This class provides methods to render smooth, rounded outlines
   * around voronoi treemap cells at different depth levels.
   */
  class PebbleRenderer {
    /**
     * Create a PebbleRenderer instance
     * @param {Object} [d3Instance] - Optional D3 instance (defaults to global d3)
     */
    constructor(d3Instance) {
      this.d3 = d3Instance || d3;
    }

    /**
     * Render pebble-style outlines for a treemap SVG
     * @param {SVGElement} treemap - The SVG element containing the treemap
     * @param {number} [round=10] - Corner radius for smoothing
     * @param {number} [width=3] - Stroke width for depth-1 outlines
     * @param {Function} [colorVarFunc] - Optional color variation function
     */
    render(treemap, round = 10, width = 3, colorVarFunc) {
      const container = this.d3.select(treemap);
      const cell = container.select('g.vb-cells');

      if (cell.empty()) {
        return;
      }

      const chartGroup = this.d3.select(cell.node().parentNode);

      chartGroup.select('.vb-cell-outline').remove();
      chartGroup.select('.vb-cell-outline2').remove();

      const outlineGroup = chartGroup
        .insert('g', 'g.vb-cells + *')
        .attr('class', 'vb-cell-outline')
        .attr('pointer-events', 'none');

      const outlineGroup2 = chartGroup
        .insert('g', 'g.vb-cells + *')
        .attr('class', 'vb-cell-outline')
        .attr('id', 'vb-cell-outline2')
        .attr('pointer-events', 'none');

      this._renderDepth2Outlines(cell, outlineGroup2, colorVarFunc);
      this._renderDepth1Outlines(cell, outlineGroup, round, width);
    }

    /**
     * Render outlines for depth-2 cells (cluster level)
     * @param {Object} cell - D3 selection of cell group
     * @param {Object} outlineGroup - D3 selection of outline group
     * @param {Function} [colorVarFunc] - Optional color variation function
     * @private
     */
    _renderDepth2Outlines(cell, outlineGroup, colorVarFunc) {
      const self = this;

      cell.selectAll('.vb-cell[data-depth="2"]').each(function (datum) {
        const path = self.d3.select(this);
        const polygon = datum.polygon;

        const cellColor = colorVarFunc
          ? colorVarFunc(datum.parent.color, 0, -0.2, -0.15)
          : self._defaultColorVar(datum.parent.color, 0, -0.2, -0.15);

        path.style('stroke', cellColor);

        if (polygon && polygon.length > 0) {
          const originalPath =
            'M' + polygon.map((p) => `${p[0]},${p[1]}`).join('L') + 'Z';
          const smoothedPath = self.smoothPath(originalPath, 8, 2);

          outlineGroup
            .append('path')
            .attr('d', `${originalPath} ${smoothedPath}`)
            .attr('fill', cellColor)
            .attr('stroke', cellColor)
            .attr('stroke-width', 0)
            .style('fill-rule', 'evenodd');
        }
      });
    }

    /**
     * Render outlines for depth-1 cells (region level)
     * @param {Object} cell - D3 selection of cell group
     * @param {Object} outlineGroup - D3 selection of outline group
     * @param {number} round - Corner radius for smoothing
     * @param {number} width - Stroke width
     * @private
     */
    _renderDepth1Outlines(cell, outlineGroup, round, width) {
      const self = this;

      cell.selectAll('.vb-cell[data-depth="1"]').each(function (datum) {
        const polygon = datum.polygon;

        if (polygon && polygon.length > 0) {
          const originalPath =
            'M' + polygon.map((p) => `${p[0]},${p[1]}`).join('L') + 'Z';
          const smoothedPath = self.smoothPath(originalPath, round);

          outlineGroup
            .append('path')
            .attr('class', 'vb-pebble-outline')
            .attr('d', `${originalPath} ${smoothedPath}`)
            .attr('fill', '#555')
            .attr('stroke', '#555')
            .attr('stroke-width', width)
            .style('fill-rule', 'evenodd');
        }
      });
    }

    /**
     * Generate a smoothed SVG path with rounded corners
     * @param {string} pathData - Original SVG path data (M...L...Z format)
     * @param {number} [cornerRadius=10] - Radius for corner rounding
     * @param {number} [minDistanceThreshold=0] - Minimum distance between points
     * @returns {string} Smoothed SVG path data
     */
    smoothPath(pathData, cornerRadius = 10, minDistanceThreshold = 0) {
      const rawPoints = pathData
        .replace(/[MZ]/gi, '')
        .split('L')
        .map((d) => d.trim().split(',').map(Number))
        .filter(([x, y]) => !isNaN(x) && !isNaN(y));

      if (rawPoints.length < 3) return pathData;

      let simplifiedPoints = this._simplifyPoints(rawPoints, minDistanceThreshold);

      if (simplifiedPoints.length < 3) return pathData;

      const n = simplifiedPoints.length;
      let newPath = '';

      for (let i = 0; i < n; i++) {
        const p0 = simplifiedPoints[(i - 1 + n) % n];
        const p1 = simplifiedPoints[i];
        const p2 = simplifiedPoints[(i + 1) % n];

        const vIn = { x: p0[0] - p1[0], y: p0[1] - p1[1] };
        const vOut = { x: p2[0] - p1[0], y: p2[1] - p1[1] };
        const lenIn = Math.hypot(vIn.x, vIn.y);
        const lenOut = Math.hypot(vOut.x, vOut.y);

        if (lenIn < 1e-7 || lenOut < 1e-7) continue;

        const inNorm = { x: vIn.x / lenIn, y: vIn.y / lenIn };
        const outNorm = { x: vOut.x / lenOut, y: vOut.y / lenOut };

        const dot = inNorm.x * outNorm.x + inNorm.y * outNorm.y;
        let angle = Math.acos(Math.max(-1, Math.min(1, dot)));

        const adjustedRadius =
          angle < Math.PI / 4.5 ? cornerRadius / 2 : cornerRadius;
        const halfAngle = angle / 2;
        const maxRadiusByLength = Math.min(lenIn, lenOut) / 2.1;
        const d = Math.min(
          lenIn,
          lenOut,
          adjustedRadius / Math.tan(halfAngle),
          maxRadiusByLength / Math.tan(halfAngle)
        );

        const pStart = [p1[0] + inNorm.x * d, p1[1] + inNorm.y * d];
        const pEnd = [p1[0] + outNorm.x * d, p1[1] + outNorm.y * d];

        newPath +=
          i === 0
            ? `M${pStart[0]},${pStart[1]}`
            : ` L${pStart[0]},${pStart[1]}`;
        newPath += ` Q${p1[0]},${p1[1]} ${pEnd[0]},${pEnd[1]}`;
      }

      newPath += 'Z';
      return newPath;
    }

    /**
     * Simplify polygon points by removing those too close together
     * @param {Array} rawPoints - Array of [x, y] coordinate pairs
     * @param {number} minDistanceThreshold - Minimum distance between points
     * @returns {Array} Simplified array of points
     * @private
     */
    _simplifyPoints(rawPoints, minDistanceThreshold) {
      if (minDistanceThreshold <= 0 || rawPoints.length <= 3) {
        return rawPoints;
      }

      const tempPoints = [rawPoints[0]];
      let lastPoint = rawPoints[0];

      for (let i = 1; i < rawPoints.length; i++) {
        const currentPoint = rawPoints[i];
        const dist = Math.hypot(
          currentPoint[0] - lastPoint[0],
          currentPoint[1] - lastPoint[1]
        );

        if (dist >= minDistanceThreshold) {
          tempPoints.push(currentPoint);
          lastPoint = currentPoint;
        }
      }

      const firstPoint = tempPoints[0];
      const lastAddedPoint = tempPoints[tempPoints.length - 1];
      if (lastAddedPoint !== firstPoint) {
        const dist = Math.hypot(
          firstPoint[0] - lastAddedPoint[0],
          firstPoint[1] - lastAddedPoint[1]
        );
        if (dist < minDistanceThreshold) {
          tempPoints.pop();
        }
      }

      return tempPoints.length >= 3 ? tempPoints : rawPoints;
    }

    /**
     * Generate a color variation using HSL adjustments
     * @param {string} color - Base color (any CSS color format)
     * @param {number} [h=0] - Hue adjustment
     * @param {number} [l=0] - Lightness adjustment
     * @param {number} [s=0] - Saturation adjustment
     * @returns {string} Adjusted color in hex format
     * @private
     */
    _defaultColorVar(color, h = 0, l = 0, s = 0) {
      let c = this.d3.hsl(color);
      c.h += h;
      c.l += l;
      c.s += s;
      if (c.l > 0.95) c.l = 0.95;
      return c.formatHex();
    }
  }

  // Copyright (c) 2025 UXtechLab.
  // Originally created by @taekie. Released under the MIT License. See LICENSE for details.
  /**
   * LabelAdjuster
   *
   * Handles automatic label collision detection and position adjustment
   * for voronoi treemap visualizations. Adjusts label positions to prevent
   * overlapping between:
   * - Field labels and region labels
   * - Sector labels and field labels
   *
   * Uses setTimeout-based deferred processing to ensure DOM elements
   * are fully rendered before measuring and adjusting positions.
   */


  /**
   * LabelAdjuster - Label collision detection and adjustment
   *
   * This class provides methods to automatically adjust label positions
   * in voronoi treemaps to prevent overlapping text elements.
   */
  class LabelAdjuster {
    /**
     * Create a LabelAdjuster instance
     * @param {Object} [d3Instance] - Optional D3 instance (defaults to global d3)
     */
    constructor(d3Instance) {
      this.d3 = d3Instance || d3;
    }

    /**
     * Adjust label positions in a treemap SVG to prevent overlapping
     * @param {SVGElement} treemap - The SVG element containing the treemap
     * @param {Object} [options={}] - Adjustment options
     * @param {number} [options.verticalSpacing=0] - Additional vertical spacing between labels
     * @param {number} [options.delay=100] - Delay in ms before adjustment (for DOM rendering)
     * @param {number} [options.maxParentMove=18] - Maximum group-label movement in pixels
     * @param {number} [options.cellPadding=2] - Minimum label padding from polygon edges
     */
    adjust(treemap, options = {}) {
      const {
        verticalSpacing = 0,
        delay = 100,
        maxParentMove = 18,
        cellPadding = 2
      } = options;
      const d3 = this.d3;

      setTimeout(() => {
        const svg = d3.select(treemap);

        svg.selectAll(".vb-subgroup-label, .vb-subgroup-label-html").each(function () {
          adjustFieldLabel(d3.select(this));
        });

        svg.selectAll(".vb-item-label").each(function () {
          adjustSectorLabel(d3.select(this));
        });
      }, delay);

      /**
       * Parse SVG transform attribute to extract x, y translation
       * @param {string} transform - Transform attribute string
       * @returns {Object} { x, y } translation values
       */
      function parseTransform(transform) {
        if (!transform) return { x: 0, y: 0 };
        const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
        if (!match) return { x: 0, y: 0 };
        return { x: parseFloat(match[1]), y: parseFloat(match[2]) };
      }

      /**
       * Check if two bounding boxes overlap
       * @param {Object} box1 - First bounding box
       * @param {Object} box2 - Second bounding box
       * @returns {boolean} True if boxes overlap
       */
      function checkOverlap(box1, box2) {
        const margin = verticalSpacing / 2;
        const marginx = -3;
        return !(
          box1.x + box1.width / 2 + marginx < box2.x - box2.width / 2 ||
          box1.x - box1.width / 2 - marginx > box2.x + box2.width / 2 ||
          box1.y + box1.height / 2 + margin < box2.y - box2.height / 2 ||
          box1.y - box1.height / 2 - margin > box2.y + box2.height / 2
        );
      }

      /**
       * Calculate required vertical move distance to resolve overlap
       * @param {Object} box1 - First bounding box
       * @param {Object} box2 - Second bounding box
       * @returns {number} Required move distance
       */
      function getRequiredMoveDistance(box1, box2) {
        const margin = verticalSpacing / 2;
        const box1Top = box1.y - box1.height / 2 - margin;
        const box1Bottom = box1.y + box1.height / 2 + margin;
        const box2Top = box2.y - box2.height / 2 - margin;
        const box2Bottom = box2.y + box2.height / 2 + margin;

        if (box1Bottom <= box2Top || box1Top >= box2Bottom) return 0;
        if (box1.y < box2.y) return box1Bottom - box2Top;
        return box2Bottom - box1Top;
      }

      /**
       * Get bounding box information for a label element
       * @param {Object} element - D3 selection of label element
       * @returns {Object|null} Bounding box info or null if element invalid
       */
      function getLabelBox(element) {
        const node = element.node();
        if (!node) return null;

        const bbox = node.getBBox();
        const { width, height } = bbox;
        const tspanCount = element.selectAll("tspan tspan").size() || 1;
        const transform = parseTransform(element.attr("transform"));

        return {
          originalX: transform.x,
          originalY: transform.y,
          x: transform.x + bbox.x + width / 2,
          y: transform.y + bbox.y + height / 2,
          width,
          height,
          tspanCount
        };
      }

      /**
       * Get bounding box from a foreignObject element (renderGroupLabel case)
       * foreignObject uses x/y/width/height attributes instead of transform+getBBox
       * @param {Object} element - D3 selection of foreignObject element
       * @returns {Object|null} Bounding box info or null if element invalid
       */
      function getForeignObjectBox(element) {
        const node = element.node();
        if (!node) return null;

        const foX = parseFloat(element.attr("x") || 0);
        const foY = parseFloat(element.attr("y") || 0);
        const foW = parseFloat(element.attr("width") || 0);
        const foH = parseFloat(element.attr("height") || 0);
        if (foW === 0 || foH === 0) return null;

        // Use actual rendered content size — querySelector('div') is the flex wrapper (100%x100%),
        // so use its firstElementChild which is the actual rendered content from renderGroupLabel
        let width = foW;
        let height = foH;
        const flexWrapper = node.querySelector("div");
        const contentEl = flexWrapper ? flexWrapper.firstElementChild : null;
        const target = contentEl || flexWrapper;
        if (target) {
          const rect = target.getBoundingClientRect();
          const matrix = node.getScreenCTM();
          if (rect.width > 0 && rect.height > 0 && matrix) {
            const svg = node.ownerSVGElement;
            const topLeft = svg.createSVGPoint();
            const bottomRight = svg.createSVGPoint();
            topLeft.x = rect.left;
            topLeft.y = rect.top;
            bottomRight.x = rect.right;
            bottomRight.y = rect.bottom;
            const inverse = matrix.inverse();
            const localTopLeft = topLeft.matrixTransform(inverse);
            const localBottomRight = bottomRight.matrixTransform(inverse);
            width = Math.abs(localBottomRight.x - localTopLeft.x);
            height = Math.abs(localBottomRight.y - localTopLeft.y);
          }
        }

        // Content is flex-centered within the foreignObject
        const centerX = foX + foW / 2;
        const centerY = foY + foH / 2;
        const contentTop = centerY - height / 2;

        return {
          originalX: centerX,
          originalY: contentTop,
          x: centerX,
          y: centerY,
          width,
          height,
          tspanCount: 1
        };
      }

      /**
       * Get cell polygon bounds from node data
       * @param {Object} data - Node data with polygon
       * @returns {Object|null} { minX, maxX, minY, maxY } or null
       */
      function getCellBounds(data) {
        if (!data || !data.polygon) return null;
        const xs = data.polygon.map((p) => p[0]);
        const ys = data.polygon.map((p) => p[1]);
        return {
          minX: Math.min(...xs),
          maxX: Math.max(...xs),
          minY: Math.min(...ys),
          maxY: Math.max(...ys)
        };
      }

      function moveBox(box, dx, dy) {
        return {
          ...box,
          originalX: box.originalX + dx,
          originalY: box.originalY + dy,
          x: box.x + dx,
          y: box.y + dy
        };
      }

      function boxFitsPolygon(box, polygon) {
        if (!polygon?.length) return false;
        const halfWidth = box.width / 2 + cellPadding;
        const halfHeight = box.height / 2 + cellPadding;
        const points = [
          [box.x - halfWidth, box.y - halfHeight],
          [box.x, box.y - halfHeight],
          [box.x + halfWidth, box.y - halfHeight],
          [box.x + halfWidth, box.y],
          [box.x + halfWidth, box.y + halfHeight],
          [box.x, box.y + halfHeight],
          [box.x - halfWidth, box.y + halfHeight],
          [box.x - halfWidth, box.y]
        ];
        return points.every((point) => d3.polygonContains(polygon, point));
      }

      function setLabelPosition(label, box, x, y) {
        if (label.node()?.tagName === "foreignObject") {
          const dx = x - box.originalX;
          const dy = y - box.originalY;
          label
            .attr("x", parseFloat(label.attr("x") || 0) + dx)
            .attr("y", parseFloat(label.attr("y") || 0) + dy);
        } else {
          label.attr("transform", `translate(${x},${y})`);
        }
      }

      function movementCandidates(labelBox, blockerBox) {
        const gap = 2 + verticalSpacing / 2;
        const left = blockerBox.x - blockerBox.width / 2 - labelBox.width / 2 - gap;
        const right = blockerBox.x + blockerBox.width / 2 + labelBox.width / 2 + gap;
        const above = blockerBox.y - blockerBox.height / 2 - labelBox.height / 2 - gap;
        const below = blockerBox.y + blockerBox.height / 2 + labelBox.height / 2 + gap;

        return [
          { dx: 0, dy: above - labelBox.y },
          { dx: 0, dy: below - labelBox.y },
          { dx: left - labelBox.x, dy: 0 },
          { dx: right - labelBox.x, dy: 0 },
          { dx: left - labelBox.x, dy: above - labelBox.y },
          { dx: right - labelBox.x, dy: above - labelBox.y },
          { dx: left - labelBox.x, dy: below - labelBox.y },
          { dx: right - labelBox.x, dy: below - labelBox.y }
        ].sort((a, b) => Math.hypot(a.dx, a.dy) - Math.hypot(b.dx, b.dy));
      }

      function findPolygonMove(labelBox, blockerBox, polygon) {
        if (!checkOverlap(labelBox, blockerBox)) return { dx: 0, dy: 0 };
        return movementCandidates(labelBox, blockerBox).find(({ dx, dy }) => {
          const moved = moveBox(labelBox, dx, dy);
          return boxFitsPolygon(moved, polygon) && !checkOverlap(moved, blockerBox);
        }) || null;
      }

      function parentMovementCandidates(parentBox, polygon) {
        const candidates = [{ dx: 0, dy: 0 }];
        const step = 3;
        for (let radius = step; radius <= maxParentMove; radius += step) {
          for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
            const dx = Math.cos(angle) * radius;
            const dy = Math.sin(angle) * radius;
            if (boxFitsPolygon(moveBox(parentBox, dx, dy), polygon)) {
              candidates.push({ dx, dy });
            }
          }
        }
        return candidates;
      }

      /**
       * Calculate minimum move position to avoid overlap
       * @param {Object} labelBox - Label bounding box
       * @param {Object} parentBox - Parent label bounding box
       * @param {Object} cellBounds - Cell polygon bounds
       * @returns {Object} { x, y } new position
       */
      function findMinimumMove(labelBox, parentBox, cellBounds) {
        if (
          labelBox.x + labelBox.width / 2 < parentBox.x - parentBox.width / 2 ||
          labelBox.x - labelBox.width / 2 > parentBox.x + parentBox.width / 2
        ) {
          return { x: labelBox.originalX, y: labelBox.originalY };
        }

        const moveDistance = getRequiredMoveDistance(labelBox, parentBox);
        if (moveDistance === 0) {
          return { x: labelBox.originalX, y: labelBox.originalY };
        }

        const tspanOffset =
          labelBox.tspanCount > 1
            ? labelBox.height / (labelBox.tspanCount - 1) / 4
            : 0;

        // Prefer the direction with more available space
        const spaceAbove = parentBox.originalY - cellBounds.minY;
        const spaceBelow = cellBounds.maxY - (parentBox.originalY + parentBox.height);
        const preferBelow = spaceBelow > spaceAbove;

        // Primary direction: whichever side has more room (+2px gap)
        const proposedPrimary = preferBelow
          ? parentBox.originalY + parentBox.height + 2 + tspanOffset
          : parentBox.originalY - labelBox.height - 2 + tspanOffset;

        const primaryFits = preferBelow
          ? proposedPrimary + labelBox.height <= cellBounds.maxY
          : proposedPrimary >= cellBounds.minY;

        if (primaryFits) {
          return { x: labelBox.originalX, y: proposedPrimary };
        }

        // Secondary direction: the other side (+2px gap)
        const proposedSecondary = preferBelow
          ? parentBox.originalY - labelBox.height - 2 + tspanOffset
          : parentBox.originalY + parentBox.height + 2 + tspanOffset;

        const secondaryFits = preferBelow
          ? proposedSecondary >= cellBounds.minY
          : proposedSecondary + labelBox.height <= cellBounds.maxY;

        if (secondaryFits) {
          return { x: labelBox.originalX, y: proposedSecondary };
        }

        // Neither direction fits within cell — leave in original position
        return { x: labelBox.originalX, y: labelBox.originalY };
      }

      /**
       * Adjust sector label position if overlapping with parent field label
       * @param {Object} sectorLabel - D3 selection of sector label
       */
      function adjustSectorLabel(sectorLabel) {
        const data = sectorLabel.datum();
        if (!data || !data.parent) return;

        const parentFieldElement = d3
          .select(treemap)
          .selectAll(".vb-subgroup-label")
          .filter((d) => d?.data?.key === data.parent?.data?.key)
          .nodes()[0];

        if (!parentFieldElement) return;

        const fieldLabel = d3.select(parentFieldElement);
        const sectorBox = getLabelBox(sectorLabel);
        const fieldBox = getLabelBox(fieldLabel);
        const cellBounds = getCellBounds(data);

        if (
          !cellBounds ||
          !sectorBox ||
          !fieldBox ||
          sectorBox.width === 0 ||
          sectorBox.height === 0 ||
          fieldBox.width === 0 ||
          fieldBox.height === 0
        ) {
          return;
        }

        if (checkOverlap(sectorBox, fieldBox)) {
          const move = findPolygonMove(sectorBox, fieldBox, data.polygon);
          const newPos = move
            ? { x: sectorBox.originalX + move.dx, y: sectorBox.originalY + move.dy }
            : findMinimumMove(sectorBox, fieldBox, cellBounds);
          setLabelPosition(sectorLabel, sectorBox, newPos.x, newPos.y);
        }
      }

      /**
       * Adjust field label position if overlapping with parent region label
       * @param {Object} fieldLabel - D3 selection of field label
       */
      function adjustFieldLabel(fieldLabel) {
        const data = fieldLabel.datum();
        if (!data || !data.parent) return;

        const parentKey = data.parent?.data?.key;

        // Default renderer: SVG text.vb-group-label
        let parentRegionElement = d3
          .select(treemap)
          .selectAll(".vb-group-label")
          .filter((d) => d?.data?.key === parentKey)
          .nodes()[0];

        // Custom renderer (renderGroupLabel): foreignObject.vb-group-label-html
        if (!parentRegionElement) {
          parentRegionElement = d3
            .select(treemap)
            .selectAll(".vb-group-label-html")
            .filter((d) => d?.data?.key === parentKey)
            .nodes()[0];
        }

        if (!parentRegionElement) return;

        const regionLabel = d3.select(parentRegionElement);
        const isFieldForeignObject = fieldLabel.node()?.tagName === "foreignObject";
        const fieldBox = isFieldForeignObject
          ? getForeignObjectBox(fieldLabel)
          : getLabelBox(fieldLabel);
        const isForeignObject = parentRegionElement.tagName === "foreignObject";
        const regionBox = isForeignObject
          ? getForeignObjectBox(regionLabel)
          : getLabelBox(regionLabel);
        const cellBounds = getCellBounds(data);
        const regionData = regionLabel.datum();
        const siblingBoxes = d3
          .select(treemap)
          .selectAll(".vb-subgroup-label, .vb-subgroup-label-html")
          .filter((d) => d !== data && d?.parent === data.parent)
          .nodes()
          .map((node) => {
            const selection = d3.select(node);
            return node.tagName === "foreignObject"
              ? getForeignObjectBox(selection)
              : getLabelBox(selection);
          })
          .filter(Boolean);

        if (
          !cellBounds ||
          !fieldBox ||
          !regionBox ||
          fieldBox.width === 0 ||
          fieldBox.height === 0 ||
          regionBox.width === 0 ||
          regionBox.height === 0
        ) {
          return;
        }

        const regionKey = regionLabel.datum()?.data?.key;
        if (
          regionKey &&
          String(regionKey).match(/[^ ]/) &&
          checkOverlap(fieldBox, regionBox)
        ) {
          let best = null;
          parentMovementCandidates(regionBox, regionData?.polygon).forEach((parentMove) => {
            const movedRegion = moveBox(regionBox, parentMove.dx, parentMove.dy);
            if (siblingBoxes.some((box) => checkOverlap(movedRegion, box))) return;
            const fieldMove = findPolygonMove(fieldBox, movedRegion, data.polygon);
            if (!fieldMove) return;

            // Moving a group label is visually more expensive than moving its child.
            const score = Math.hypot(fieldMove.dx, fieldMove.dy) +
              Math.hypot(parentMove.dx, parentMove.dy) * 2.5;
            if (!best || score < best.score) best = { parentMove, fieldMove, score };
          });

          if (best) {
            setLabelPosition(
              regionLabel,
              regionBox,
              regionBox.originalX + best.parentMove.dx,
              regionBox.originalY + best.parentMove.dy
            );
            setLabelPosition(
              fieldLabel,
              fieldBox,
              fieldBox.originalX + best.fieldMove.dx,
              fieldBox.originalY + best.fieldMove.dy
            );
          } else {
            const newPos = findMinimumMove(fieldBox, regionBox, cellBounds);
            setLabelPosition(fieldLabel, fieldBox, newPos.x, newPos.y);
          }
        }
      }
    }
  }

  // Copyright (c) 2025 UXtechLab.
  // Originally created by @taekie. Released under the MIT License. See LICENSE for details.
  /**
   * Nesting For Voronoi Utility
   *
   * Transforms flat data into a nested hierarchical structure suitable
   * for d3.hierarchy() and voronoi treemap visualization.
   *
   * Creates a 3-level hierarchy: root -> group -> subgroup -> item
   * Each leaf node contains size values for sizing and references to original data.
   */


  /**
   * Convert flat data array into nested hierarchy structure for voronoi treemap
   *
   * @param {Object[]} data - Array of data objects with group, subgroup, item, and size fields
   * @param {string} [key1='subgroup'] - Field name for first level grouping (subgroup)
   * @param {string} [key2='item'] - Field name for second level grouping (item)
   * @returns {Object} Nested hierarchy object with key/values structure for d3.hierarchy
   *
   * @example
   * const data = [
   *   { group: 'A', subgroup: 'Group1', item: 'Item1', size: 10 },
   *   { group: 'A', subgroup: 'Group1', item: 'Item2', size: 20 }
   * ];
   * const nested = nestingForVoronoi(data);
   * const hierarchy = d3.hierarchy(nested, d => d.values).sum(d => d.size);
   */
  function nestingForVoronoi(
    data,
    key1 = "subgroup",
    key2 = "item"
  ) {
    // 1. Extract only necessary fields
    const simpleData = data.map((d) => ({
      [key1]: d[key1],
      [key2]: d[key2],
      group: d.group,
      size: d.size ?? 1
    }));

    // 2. 3-level grouping with d3.rollups: group -> key1 -> key2
    const nested = d3.rollups(
      simpleData,
      (d) => d3.sum(d.map((v) => v.size)),
      (d) => d.group,
      (d) => d[key1],
      (d) => d[key2]
    );

    // 3. Helper to convert to dictionary format
    const makeDictionary = (bc, bcData, group) => {
      return bcData.map((k) => {
        const grouping = {
          [key1]: bc,
          [key2]: k[0],
          size: k[1] ? k[1] : 1
        };

        const originalData = data.filter(
          (c) =>
            c.group === group &&
            c[key1] === grouping[key1] &&
            c[key2] === grouping[key2]
        );

        // Keep all original fields on the leaf item (grouping keys + size win),
        // so popups can reference any data field via {field} with no extra wiring.
        const item = { ...(originalData[0] || {}), ...grouping };

        return {
          key: k[0],
          values: [item],
          data: originalData[0],
          raw: originalData
        };
      });
    };

    // 4. Generate final hierarchical structure
    const kv = nested.map(([group, groupData]) => ({
      key: group,
      values: groupData.map(([bc, bcData]) => ({
        key: bc,
        values: makeDictionary(bc, bcData, group)
      }))
    }));

    return {
      key: "root_nest",
      values: kv.filter((d) => d.key)
    };
  }

  // Copyright (c) 2025 UXtechLab.
  // Originally created by @taekie. Released under the MIT License. See LICENSE for details.
  /**
   * VoronoiBubble Helpers
   *
   * Static utility methods for voronoi treemap visualization including:
   * - Font scaling functions for label sizing
   * - Color manipulation and hierarchy coloring
   * - Text layout and multiline label rendering
   * - Polygon bounds and position calculations
   * - Number formatting utilities
   * - Custom voronoi algorithm creation
   */


  /**
   * VoronoiBubbleHelpers - Collection of static helper methods
   *
   * These methods support the main VoronoiBubble class with calculations
   * for sizing, positioning, coloring, and layout of treemap cells and labels.
   */
  const VoronoiBubbleHelpers = {
    // === Font Scale Functions ===

    /**
     * Calculate font scale based on node value ratio in hierarchy
     * @param {Object} hierarchy - D3 hierarchy root node
     * @param {Object} d - Current node
     * @returns {number} Font scale value (0.3 to 1.5)
     */
    fontScale: function (hierarchy, d) {
      let ratio = (d.value / hierarchy.value) * 100;
      if (ratio > 30) ratio = 30;
      if (ratio < 0.2) ratio = 0.2;
      return d3.scaleLog().domain([0.1, 20]).range([0.3, 1.5])(ratio) * (hierarchy.fontK ?? 1);
    },

    /**
     * Calculate font scale for a specific value (not node-based)
     * @param {Object} hierarchy - D3 hierarchy root node
     * @param {string} string - Text string (unused but kept for API compatibility)
     * @param {number} value - Value to calculate scale for
     * @returns {number} Font scale value (0.3 to 1.5)
     */
    fontScale1: function (hierarchy, string, value) {
      let ratio = (value / hierarchy.value) * 100;
      if (ratio > 30) ratio = 30;
      if (ratio < 0.2) ratio = 0.2;
      return d3.scaleLog().domain([0.1, 20]).range([0.3, 1.5])(ratio) * (hierarchy.fontK ?? 1);
    },

    /**
     * Calculate secondary font scale (smaller range for sub-labels)
     * @param {Object} hierarchy - D3 hierarchy root node
     * @param {Object} d - Current node
     * @returns {number} Font scale value (0.5 to 0.8)
     */
    fontScale2: function (hierarchy, d) {
      let ratio = (d.value / hierarchy.value) * 100;
      if (ratio > 5) ratio = 5;
      if (ratio < 0.1) ratio = 0.1;
      return d3.scaleLog().domain([0.1, 8]).range([0.5, 0.8])(ratio) * (hierarchy.fontK ?? 1);
    },

    /**
     * Calculate variable font scale for label positioning
     * @param {Object} self - VoronoiBubble instance
     * @param {Object} d - Current node
     * @returns {number} Calculated offset value
     */
    varFontScale: function (self, d) {
      const text = d.data.data.item ?? d.data.data.subgroup;
      const [cols, rows] = this.multiline(text, true);
      return d.data.data.item
        ? (this.fontScale2(self.hierarchy, d) * 6 * rows) / 2 + 20
        : (this.fontScale(self.hierarchy, d) * 30 * rows) / 2 + 8;
    },

    // === Color Functions ===

    /**
     * Get HSL color with adjustments
     * @param {string} color - Base color
     * @param {number} [h=0] - Hue adjustment
     * @param {number} [s=0] - Saturation adjustment
     * @param {number} [l=0] - Lightness adjustment
     * @returns {string} Hex color string
     */
    getHSLColor: function (color, h, s, l) {
      h = h || 0;
      s = s || 0;
      l = l || 0;
      const hslColor = d3.hsl(color);
      const lighterColor = hslColor.copy({
        h: hslColor.h + h,
        s: hslColor.s + s,
        l: hslColor.l + l
      });
      return lighterColor.formatHex();
    },

    /**
     * Color variation with HSL adjustments (alternate parameter order)
     * @param {string} color - Base color
     * @param {number} [h=0] - Hue adjustment
     * @param {number} [l=0] - Lightness adjustment
     * @param {number} [s=0] - Saturation adjustment
     * @returns {string} Hex color string
     */
    colorVar: function (color, h, l, s) {
      h = h || 0;
      l = l || 0;
      s = s || 0;
      let c = d3.hsl(color);
      c.h += h;
      c.l += l;
      c.s += s;
      if (c.l > 0.95) c.l = 0.95;
      return c.formatHex();
    },

    /**
     * Color variation for secondary elements (darker, less saturated)
     * @param {string} color - Base color
     * @returns {string} Hex color string
     */
    colorVar2: function (color) {
      let c = d3.hsl(color);
      c.l = c.l * 0.3;
      c.s = 0.25;
      if (c.l > 0.95) c.l = 0.95;
      if (c.l < 0.1) c.l = 0.1;
      return c.formatHex();
    },

    /**
     * Color variation based on value within domain
     * @param {string} color - Base color
     * @param {number[]} vdomain - Value domain array for extent calculation
     * @param {number} value - Current value
     * @param {string} desc - Description (unused but kept for API compatibility)
     * @returns {string} Hex color string
     */
    // mode: 'standard'(기본 — 형제간 명도 대비를 살린 v1 룩) | 'subtle'(채도 캡 +
    // 낮은 대비의 차분한 룩) | 'strong'(발표용 강한 대비)
    // depthScale: 변주 강도 배율. depth-3은 감쇠(<1)해 상위(depth-2) 구분이
    // 하위 변주에 묻히지 않게 한다 — 위계가 먼저 읽혀야 한다.
    colorvariation: function (color, vdomain, value, mode = "standard", depthScale = 1) {
      const domain = d3.extent(vdomain);
      if (domain[0] === domain[1]) return d3.hsl(color).formatHex();
      let c = d3.hsl(color);
      if (mode === "subtle") {
        const vScale = d3.scaleLinear().domain(domain).range([0.35, 0.85]);
        if (c.l > 0.76) c.l = 0.76;
        c.s = Math.min(c.s, 0.65);
        c.l += (0.55 - vScale(value)) * 0.06 * depthScale;
        if (c.l > 0.8) c.l = 0.8;
        if (c.l < 0.28) c.l = 0.28;
        return c.formatHex();
      }
      // standard/strong: 채도와 형제간 대비는 v1대로 살리되, 밝아지는 방향만
      // 감쇠해 최소값 셀이 하얗게 뜨는 문제를 막는다.
      const spread = (mode === "strong" ? 0.16 : 0.12) * depthScale;
      const vScale = d3.scaleLinear().domain(domain).range([0.3, 1]);
      if (c.l > 0.78) c.l = 0.78;
      const delta = (0.5 - vScale(value)) * spread;
      c.l += delta > 0 ? delta * 0.6 : delta;
      if (c.l > 0.82) c.l = 0.82;
      return c.formatHex();
    },

    /**
     * Recursively assign colors to hierarchy nodes based on depth
     * @param {Object} self - VoronoiBubble instance
     * @param {Object} hierarchy - D3 hierarchy node to color
     */
    colorHierarchy: function (self, hierarchy) {
      if (hierarchy.depth === 0) {
        hierarchy.color = "#ddd";
        self._colorVariationDomains = {
          2: hierarchy.descendants().filter((d) => d.depth === 2).map((d) => d.value),
          3: hierarchy.descendants().filter((d) => d.depth === 3).map((d) => d.value)
        };
      } else if (hierarchy.depth === 1) {
        hierarchy.color = self.regionColor(hierarchy.data.key);
      } else if (hierarchy.depth === 2) {
        hierarchy.color = this.colorvariation(
          hierarchy.parent.color,
          this._variationDomain(self, hierarchy, 2),
          hierarchy.value,
          self.params?.colorVariation ?? "standard"
        );
      } else if (hierarchy.depth === 3) {
        hierarchy.color = this.colorvariation(
          hierarchy.parent.color,
          this._variationDomain(self, hierarchy, 3),
          hierarchy.value,
          self.params?.colorVariation ?? "standard",
          0.35 // depth-3 감쇠 — 서브그룹 경계가 항목 변주보다 먼저 읽히게
        );
        if (self.params.colorFunc) {
          const originalData = self.data.filter(
            (d) =>
              d.item === hierarchy.data.key &&
              d.subgroup === hierarchy.parent.data.key
          );
          hierarchy.color = self.params.colorFunc(
            originalData,
            hierarchy.data.data,
            hierarchy.color,
            {
              parentColor: hierarchy.parent.color,
              siblings: hierarchy.parent.parent.children.map((d) => d.value),
              value: hierarchy.value,
              depth: hierarchy.depth,
              group: hierarchy.parent.parent
            }
          );
        }
      }
      if (hierarchy.children) {
        hierarchy.children.forEach((child) => this.colorHierarchy(self, child));
      }
    },

    // 'subtle'은 차트 전역 값 분포(그룹 간 음영 일관성), 그 외 모드는 형제간
    // 분포(그룹 내 대비 극대화 — v1 룩)를 변주 도메인으로 쓴다.
    _variationDomain: function (self, hierarchy, depth) {
      const mode = self.params?.colorVariation ?? "standard";
      if (mode === "subtle" && self._colorVariationDomains?.[depth]) {
        return self._colorVariationDomains[depth];
      }
      return hierarchy.parent.children.map((d) => d.value);
    },

    // === Sentiment / diverging color scale ===

    // 5-stop pastel red→yellow→green palette for rating/sentiment scales.
    sentimentStops: [
      [246, 159, 143], // low  — red
      [250, 196, 156],
      [255, 233, 169], // mid  — yellow
      [196, 219, 154],
      [136, 205, 139], // high — green
    ],

    /**
     * Map a numeric score to the 5-stop diverging sentiment palette.
     * @param {number} score - value to map
     * @param {number} [lo=1] - low end of the domain
     * @param {number} [hi=5] - high end of the domain
     * @returns {string} hex color
     */
    sentimentColor: function (score, lo = 1, hi = 5) {
      const stops = this.sentimentStops;
      let s = Number(score);
      if (Number.isNaN(s) || s < lo) s = lo;
      if (s > hi) s = hi;
      const t = hi === lo ? 0 : (s - lo) / (hi - lo); // 0..1
      const seg = t * (stops.length - 1);
      const i = Math.min(stops.length - 2, Math.floor(seg));
      const f = seg - i;
      const c = stops[i].map((v, k) => Math.round(v + (stops[i + 1][k] - v) * f));
      return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
    },

    /**
     * Build colorFunc + groupColors from a numeric sentiment field on the data.
     * Leaf cells are colored by their own rows' average score; depth-1 regions by
     * their group average. Used by the `sentiment` render option.
     * @param {Array} data - normalized data (rows carry group + the score field)
     * @param {string|Object} opt - field name, or { field, domain: [lo, hi] }
     * @returns {{ colorFunc: Function, groupColors: Array }}
     */
    buildSentimentColoring: function (data, opt) {
      const field = typeof opt === "string" ? opt : opt.field;
      const domain = (typeof opt === "object" && opt.domain) || [1, 5];
      const [lo, hi] = domain;
      const self = this;
      const avg = (a) => a.reduce((s, v) => s + v, 0) / a.length;
      const nums = (arr) =>
        (arr || []).map((r) => Number(r[field])).filter((v) => !Number.isNaN(v));

      // depth-1 (group) averages → groupColors (region tint)
      const groups = {};
      data.forEach((d) => {
        const v = Number(d[field]);
        if (!Number.isNaN(v)) (groups[d.group] = groups[d.group] || []).push(v);
      });
      const groupColors = Object.entries(groups).map(([key, vs]) => ({
        key,
        color: self.sentimentColor(avg(vs), lo, hi),
      }));

      // leaf colored by its own rows' average score
      const colorFunc = (rows, _nodeData, def) => {
        const vs = nums(rows);
        return vs.length ? self.sentimentColor(avg(vs), lo, hi) : def;
      };

      return { colorFunc, groupColors };
    },

    /**
     * Create row-major grid position hints for stable high-level layouts.
     * Useful for depth-1 groups where a predictable reading order matters more
     * than semantic coordinates.
     * @param {Array<string|Object>} items - Keys or objects containing the key field
     * @param {Object} [options]
     * @param {number} [options.depth=1] - Hierarchy depth for generated positions
     * @param {number|string} [options.columns="auto"] - Column count, or "auto"
     * @param {string} [options.keyField="key"] - Field to read when items are objects
     * @param {number} [options.padding=0.15] - Outer padding in normalized space
     * @returns {Object[]} Position hints: { depth, key, x, y }
     */
    createGridPositions: function (items, options = {}) {
      const {
        depth = 1,
        columns = "auto",
        keyField = "key",
        padding = 0.15
      } = options;

      const keys = (items || [])
        .map((item) => (typeof item === "object" ? item?.[keyField] : item))
        .filter((key) => key !== undefined && key !== null);
      const count = keys.length;
      if (!count) return [];

      const colCount = columns === "auto"
        ? Math.ceil(Math.sqrt(count))
        : Math.max(1, Math.floor(Number(columns) || 1));
      const rowCount = Math.ceil(count / colCount);
      const min = Math.max(0, Math.min(0.49, Number(padding)));
      const max = 1 - min;
      const xAt = (col) => colCount === 1 ? 0.5 : min + (max - min) * (col / (colCount - 1));
      const yAt = (row) => rowCount === 1 ? 0.5 : min + (max - min) * (row / (rowCount - 1));

      return keys.map((key, index) => ({
        depth,
        key,
        x: xAt(index % colCount),
        y: yAt(Math.floor(index / colCount))
      }));
    },

    // === Text & Label Functions ===

    /**
     * Convert text to multiline SVG tspan format
     * @param {string} text - Input text
     * @param {boolean} [getBoxInfo=false] - If true, return [maxWidth, lineCount] instead of HTML
     * @returns {string|number[]} HTML string for tspans, or [maxWidth, lineCount] if getBoxInfo is true
     */
    multiline: function (text, getBoxInfo, charsPerLine, lineHeight = 1) {
      const inputText = text ? String(text) : "";
      const isLatinText = !/[^A-Za-z0-9\s\-.,!?:;@]/.test(inputText);
      const lineLimit = charsPerLine ?? (isLatinText ? 9 : 7);
      const forcedLineBreaks = inputText.split("\n");
      let allLines = [];

      forcedLineBreaks.forEach((line) => {
        const words = line.split(/[ ,]/);
        let currentLines = [];
        let count = 0;
        let lineCount = 0;
        currentLines[0] = "";

        words.forEach((word) => {
          if (word.length + count > lineLimit) {
            lineCount += 1;
            count = 0;
            currentLines[lineCount] = "";
          }
          currentLines[lineCount] = currentLines[lineCount] + word.trim() + " ";
          count += word.length;
        });
        const filteredLines = currentLines.filter((d) => d.trim());
        allLines = allLines.concat(filteredLines);
      });

      const charWidths = {
        i: 0.4,
        j: 0.4,
        l: 0.4,
        t: 0.5,
        f: 0.5,
        r: 0.6,
        I: 0.3,
        1: 0.6,
        "!": 0.3,
        "|": 0.3,
        ".": 0.3,
        ",": 0.3,
        ":": 0.3,
        ";": 0.4,
        w: 1.4,
        W: 1.6,
        m: 1.3,
        M: 1.5,
        "@": 1.4,
        a: 0.9,
        e: 0.9,
        o: 0.9,
        u: 0.9,
        n: 0.9,
        s: 0.8,
        A: 1.1,
        E: 1.0,
        O: 1.2,
        U: 1.1,
        N: 1.1,
        S: 1.0
      };

      function calculateTextWidth(text) {
        return Array.from(text).reduce(
          (width, char) => width + (charWidths[char] || 1.0),
          0
        );
      }

      const lineWidths = allLines.map((line) => {
        const trimmedLine = line.trim();
        const isLatinText = !/[^A-Za-z0-9\s\-.,!?:;@]/.test(trimmedLine);
        return isLatinText
          ? calculateTextWidth(trimmedLine)
          : trimmedLine.length;
      });
      let maxLength = Math.max(...lineWidths);

      if (getBoxInfo) return [maxLength, allLines.length];

      const html = allLines
        .map(
          (d, i) => `<tspan x=${-maxLength / 3}em dy=${lineHeight}em>${d.trim()}</tspan>`
        )
        .join("");
      return `<tspan x=${0}em y=${-allLines.length / 2}em>${html}</tspan>`;
    },

    /**
     * Convert heading-like labels to at most two balanced SVG tspan lines.
     * Intended for depth-2 subgroup labels, which should be short headings
     * rather than full sentences.
     */
    phraseMultiline: function (text, getBoxInfo, charsPerLine, lineHeight = 1.1, maxLines = 2) {
      const inputText = text ? String(text).trim() : "";
      const isLatinText = !/[^A-Za-z0-9\s\-.,!?:;@]/.test(inputText);
      const lineLimit = charsPerLine ?? (isLatinText ? 22 : 13);
      const forcedLineBreaks = inputText.split("\n");
      let allLines = [];

      const measure = (value) => {
        const chars = Array.from(String(value));
        return chars.reduce((width, char) => {
          if (/[A-Za-z0-9]/.test(char)) return width + 0.65;
          if (/\s/.test(char)) return width + 0.45;
          if (/[.,!?:;|]/.test(char)) return width + 0.3;
          return width + 1;
        }, 0);
      };

      const clampLine = (line) => {
        let out = String(line).trim();
        if (measure(out) <= lineLimit) return out;
        while (out.length > 1 && measure(`${out}…`) > lineLimit) {
          out = out.slice(0, -1).trim();
        }
        return `${out}…`;
      };

      forcedLineBreaks.forEach((line) => {
        const trimmed = line.trim();
        if (!trimmed) return;

        const words = trimmed.split(/\s+/);
        if (words.length === 1 && measure(trimmed) > lineLimit) {
          let current = "";
          Array.from(trimmed).forEach((char) => {
            if (current && measure(current + char) > lineLimit) {
              allLines.push(current);
              current = "";
            }
            current += char;
          });
          if (current) allLines.push(current);
          return;
        }

        let current = "";
        words.forEach((word) => {
          const next = current ? `${current} ${word}` : word;
          if (current && measure(next) > lineLimit) {
            allLines.push(current);
            current = word;
          } else {
            current = next;
          }
        });
        if (current) allLines.push(current);
      });

      const overLimit = allLines.length > maxLines;
      allLines = allLines.slice(0, maxLines);
      if (overLimit && allLines.length) {
        allLines[allLines.length - 1] = clampLine(allLines[allLines.length - 1]);
      }

      const lineWidths = allLines.map(measure);
      const maxLength = Math.max(...lineWidths, 0);
      if (getBoxInfo) return [maxLength, allLines.length];

      const html = allLines
        .map(
          (d) => `<tspan x=${-maxLength / 2}em dy=${lineHeight}em>${d.trim()}</tspan>`
        )
        .join("");
      return `<tspan x=${0}em y=${-allLines.length / 2}em>${html}</tspan>`;
    },

    phraseByCell: function (text, hierarchy, d, fontEm, baseFontPx = 16, maxLines = 2) {
      if (!text || !d?.polygon) {
        return this.phraseMultiline(text, false, undefined, 1.1, maxLines);
      }
      const bounds = this.getPolygonBounds(d.polygon);
      const cellW = bounds.maxX - bounds.minX;
      const fontPx = fontEm * baseFontPx;
      const isLatin = !/[^\x00-\x7F]/.test(text);
      const charPx = isLatin ? fontPx * 0.55 : fontPx;
      const effectiveW = cellW * 0.58;
      const rawChars = Math.floor(effectiveW / charPx);
      const minChars = isLatin ? 8 : 5;
      const maxChars = isLatin ? 22 : 13;
      const charsPerLine = Math.max(minChars, Math.min(maxChars, rawChars));
      return this.phraseMultiline(text, false, charsPerLine, 1.1, maxLines);
    },

    /**
     * Calculate label height offset based on font size and line count
     * @param {Object} self - VoronoiBubble instance
     * @param {Object} d - Current node
     * @returns {number} Height offset value
     */
    getLabelHeightOffset: function (self, d) {
      const fontSize = this.fontScale(self.hierarchy, d);
      const getLines = d.depth === 2 ? this.phraseMultiline : this.multiline;
      const [width, lineRows] = getLines.call(this, d.data.key, true);
      const boxHeight = fontSize * 8 * (lineRows - 2);
      return boxHeight;
    },

    /**
     * Calculate optimal label position within parent polygon
     * @param {Object} self - VoronoiBubble instance
     * @param {Object} d - Current node
     * @returns {number[]|undefined} [x, y] position or undefined for depth 1 nodes
     */
    getLabelPos: function (self, d) {
      if (d.depth === 1) return [0, 0];
      if (!d.parent?.polygon?.site || !d.polygon?.site) return [0, 0];
      const parentCenter = d.parent.polygon.site;
      const currentCenter = d.polygon.site;
      if (d.parent.children.length > 1)
        return [currentCenter.x, currentCenter.y];

      const diffX = currentCenter.x - parentCenter.x;
      const diffY = currentCenter.y - parentCenter.y;
      let offY = 0,
        offX = 0;

      const fontSize = this.fontScale2(self.hierarchy, d);
      const [meanWidth, lineRows] = this.multiline(d.data.key, true);
      const boxHeight = fontSize * 6 * lineRows;
      const boxWidth = fontSize * 6 * meanWidth;
      const minOffset = Math.max(18, boxHeight / 2);

      if (Math.abs(diffY) < minOffset) {
        offY = diffY >= 0 ? minOffset : -minOffset;
        if (Math.abs(diffX) < boxWidth) {
          offX = diffX >= 0 ? boxWidth / 2 : -boxWidth / 2;
        }
      }

      const parentBounds = this.getPolygonBounds(d.parent.polygon);
      const proposedX = currentCenter.x + offX;
      const proposedY = currentCenter.y + offY;

      if (proposedX < parentBounds.minX + boxWidth / 2) {
        offX = parentBounds.minX + boxWidth / 2 - currentCenter.x;
      } else if (proposedX > parentBounds.maxX - boxWidth / 2) {
        offX = parentBounds.maxX - boxWidth / 2 - currentCenter.x;
      }
      if (proposedY < parentBounds.minY + boxHeight / 2) {
        offY = parentBounds.minY + boxHeight / 2 - currentCenter.y;
      } else if (proposedY > parentBounds.maxY - boxHeight / 2) {
        offY = parentBounds.maxY - boxHeight / 2 - currentCenter.y;
      }

      return [currentCenter.x + offX, currentCenter.y + offY];
    },

    /**
     * Get bounding box of a polygon
     * @param {number[][]} polygon - Array of [x, y] coordinate pairs
     * @returns {Object} { minX, maxX, minY, maxY }
     */
    getPolygonBounds: function (polygon) {
      const xs = polygon.map((point) => point[0]);
      const ys = polygon.map((point) => point[1]);
      return {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys)
      };
    },

    /**
     * Estimate polygon radius from area
     * @param {Object} d - Node with polygon data
     * @returns {number} Estimated radius
     */
    estimatePolygonRadius: function (d) {
      if (!d.polygon?.site?.originalObject?.polygon) return 0;
      const area = d.polygon.site.originalObject.polygon.area();
      return Math.sqrt(area / Math.PI);
    },

    /**
     * Estimate label width based on font size and text length
     * @param {Object} self - VoronoiBubble instance
     * @param {Object} d - Current node
     * @param {number} [fontMultiplier=1] - Font size multiplier
     * @returns {number} Estimated width (minimum 60)
     */
    estimateLabelWidth: function (self, d, fontMultiplier) {
      fontMultiplier = fontMultiplier || 1;
      const fontSize = this.fontScale(self.hierarchy, d) * fontMultiplier;
      const [maxWidth, lineCount] = this.multiline(d.data.key, true);
      return Math.max(fontSize * 16 * maxWidth * 0.8, 60);
    },

    /**
     * Estimate label height based on font size and line count
     * @param {Object} self - VoronoiBubble instance
     * @param {Object} d - Current node
     * @param {number} [fontMultiplier=1] - Font size multiplier
     * @returns {number} Estimated height (minimum 40)
     */
    estimateLabelHeight: function (self, d, fontMultiplier) {
      fontMultiplier = fontMultiplier || 1;
      const fontSize = this.fontScale(self.hierarchy, d) * fontMultiplier;
      const getLines = d.depth === 2 ? this.phraseMultiline : this.multiline;
      const [maxWidth, lineCount] = getLines.call(this, d.data.key, true);
      return Math.max(fontSize * 16 * lineCount * 1.5, 40);
    },

    /**
     * Create context object for custom label renderers
     * @param {Object} self - VoronoiBubble instance
     * @param {Object} d - Current node
     * @param {number} depth - Depth level (1 or 2)
     * @returns {Object} Context object with label rendering information
     */
    createLabelContext: function (self, d, depth) {
      return {
        key: d.data.key,
        value: d.value,
        depth: d.depth,
        data: d.data.values[0]?.data,
        ratio: d.value / self.totalValue,
        percentText: d3.format(".0%")(d.value / self.totalValue),
        color: d.color,
        parentColor: d.parent?.color,
        darkerColor: this.getHSLColor(d.color, 0, -0.1, -0.2),
        lighterColor: this.getHSLColor(d.color, 0, 0.1, 0.1),
        fontSize:
          depth === 1
            ? this.fontScale(self.hierarchy, d) * (self.params.groupLabelScale ?? 1.1)
            : this.fontScale(self.hierarchy, d) * (self.params.subgroupLabelScale ?? 1.05),
        centerX: d.polygon?.site?.x ?? 0,
        centerY: d.polygon?.site?.y ?? 0,
        polygon: d.polygon,
        parent: d.parent
          ? {
              key: d.parent.data.key,
              value: d.parent.value,
              color: d.parent.color
            }
          : null,
        children: d.children
          ? d.children.map((c) => ({
              key: c.data.key,
              value: c.value,
              color: c.color
            }))
          : null,
        totalValue: self.totalValue,
        formatNumber: (n) => this.bigFormat(n),
        formatPercent: (n) => d3.format(".1%")(n)
      };
    },

    // === Number Format Functions ===

    /**
     * Format large numbers with Korean units (조, 억, 만)
     * @param {number} n - Number to format
     * @returns {string} Formatted string with Korean number units
     */
    truncateByCell: function (text, hierarchy, d, baseFontPx = 16, maxLines = 2) {
      if (!text) return { text, charsPerLine: 7 };
      const polygon = d.polygon;
      if (!polygon) return { text, charsPerLine: 7 };
      const xs = polygon.map((p) => p[0]);
      const ys = polygon.map((p) => p[1]);
      const cellW = Math.max(...xs) - Math.min(...xs);
      const cellH = Math.max(...ys) - Math.min(...ys);
      const fontEm = this.fontScale2(hierarchy, d);
      const fontPx = fontEm * baseFontPx;
      const isLatin = !/[^\x00-\x7F]/.test(text);
      // CJK chars are ~1em wide; latin ~0.55em; voronoi bbox is irregular so use 60%
      const charPx = isLatin ? fontPx * 0.55 : fontPx;
      const effectiveW = cellW * 0.6;
      const charsPerLine = Math.max(1, Math.floor(effectiveW / charPx));
      const linesFit = Math.max(1, Math.floor(cellH / (fontPx * 1.4)));
      const limit = Math.max(5, Math.min(30, charsPerLine * linesFit));
      const truncated = text.length <= limit ? text : text.slice(0, limit) + '…';
      return { text: truncated, charsPerLine };
    },

    bigFormat: function (n) {
      const 조 = n > 10 ** 12 ? Math.floor(n / 10 ** 12) % 10 ** 4 : 0;
      const 억 = n > 10 ** 8 ? Math.round(n / 10 ** 8) % 10 ** 4 : 0;
      const 만 = parseInt(n / 10 ** 4) % 10 ** 4;

      return (
        (조 >= 1 ? d3.format(",.0f")(조) + "조 " : " ") +
        (억 >= 1 ? d3.format(",.0f")(억) + "억 " : " ") +
        (n < 10 ** 10 && 만 >= 1 ? d3.format(",.0f")(만) + "만 " : " ") +
        (n < 10 ** 4 ? d3.format(",.0f")(Math.round(n)) : " ")
      );
    },

    // === Custom Voronoi Algorithm ===

    /**
     * Create a custom voronoi treemap algorithm with initial position support
     * @param {Object} self - VoronoiBubble instance
     * @param {boolean} [debug=false] - Enable debug mode
     * @returns {Function} Voronoi treemap algorithm function
     */
    createCustomVoronoiAlgorithm: function (self, debug) {
      debug = debug || false;
      const DEFAULT_CONVERGENCE_RATIO = 0.01;
      const DEFAULT_MAX_ITERATION_COUNT = 50;
      const DEFAULT_MIN_WEIGHT_RATIO = 0.01;
      const DEFAULT_PRNG = Math.random;

      var clip = [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 0]
      ];
      var extent = [
        [0, 0],
        [1, 1]
      ];
      var size = [1, 1];
      var convergenceRatio = DEFAULT_CONVERGENCE_RATIO;
      var maxIterationCount = DEFAULT_MAX_ITERATION_COUNT;
      var minWeightRatio = DEFAULT_MIN_WEIGHT_RATIO;
      var prng = DEFAULT_PRNG;
      var initialPositions = [];
      var adaptiveIterations = false;

      var unrelevantButNeedeData = [{ weight: 1 }, { weight: 1 }];
      var _convenientReusableVoronoiMapSimulation = d3
        .voronoiMapSimulation(unrelevantButNeedeData)
        .stop();

      const helpers = this;

      const _voronoiTreemap = function (rootNode) {
        recurse(clip, rootNode);
      };

      _voronoiTreemap.convergenceRatio = function (_) {
        return arguments.length
          ? ((convergenceRatio = _), _voronoiTreemap)
          : convergenceRatio;
      };
      _voronoiTreemap.maxIterationCount = function (_) {
        return arguments.length
          ? ((maxIterationCount = _), _voronoiTreemap)
          : maxIterationCount;
      };
      _voronoiTreemap.minWeightRatio = function (_) {
        return arguments.length
          ? ((minWeightRatio = _), _voronoiTreemap)
          : minWeightRatio;
      };
      _voronoiTreemap.clip = function (_) {
        if (!arguments.length) return clip;
        _convenientReusableVoronoiMapSimulation.clip(_);
        clip = _convenientReusableVoronoiMapSimulation.clip();
        extent = _convenientReusableVoronoiMapSimulation.extent();
        size = _convenientReusableVoronoiMapSimulation.size();
        return _voronoiTreemap;
      };
      _voronoiTreemap.extent = function (_) {
        if (!arguments.length) return extent;
        _convenientReusableVoronoiMapSimulation.extent(_);
        clip = _convenientReusableVoronoiMapSimulation.clip();
        extent = _convenientReusableVoronoiMapSimulation.extent();
        size = _convenientReusableVoronoiMapSimulation.size();
        return _voronoiTreemap;
      };
      _voronoiTreemap.size = function (_) {
        if (!arguments.length) return size;
        _convenientReusableVoronoiMapSimulation.size(_);
        clip = _convenientReusableVoronoiMapSimulation.clip();
        extent = _convenientReusableVoronoiMapSimulation.extent();
        size = _convenientReusableVoronoiMapSimulation.size();
        return _voronoiTreemap;
      };
      _voronoiTreemap.prng = function (_) {
        return arguments.length ? ((prng = _), _voronoiTreemap) : prng;
      };
      _voronoiTreemap.initialPositions = function (_) {
        return arguments.length
          ? ((initialPositions = _), _voronoiTreemap)
          : initialPositions;
      };
      _voronoiTreemap.adaptiveIterations = function (_) {
        return arguments.length
          ? ((adaptiveIterations = _), _voronoiTreemap)
          : adaptiveIterations;
      };

      const recurse = function (clippingPolygon, node) {
        var simulation;
        node.polygon = clippingPolygon;

        if (node.height != 0) {
          // Only the leaf-most partition (node.height === 1) may trade accuracy
          // for speed — container partitions (root/group/subgroup) define the
          // areas users actually read, so they always get the full budget.
          const iterCount = adaptiveIterations && node.height === 1
            ? Math.max(10, Math.round(maxIterationCount / Math.sqrt(node.children.length / 3)))
            : maxIterationCount;
          simulation = d3
            .voronoiMapSimulation(node.children)
            .clip(clippingPolygon)
            .weight((d) => d.value)
            .convergenceRatio(convergenceRatio)
            .maxIterationCount(iterCount)
            .minWeightRatio(minWeightRatio)
            .prng(prng)
            .initialPosition(
              helpers.createInitialPositioner(self, initialPositions, debug)
            )
            .stop();

          var state = simulation.state();
          while (!state.ended) {
            simulation.tick();
            state = simulation.state();
          }

          state.polygons.forEach(function (cp) {
            if (cp.site?.originalObject?.data?.originalData) {
              recurse(cp, cp.site.originalObject.data.originalData);
            }
          });
        }
      };

      return _voronoiTreemap;
    },

    /**
     * Create initial position function for voronoi simulation
     * @param {Object} self - VoronoiBubble instance
     * @param {Object[]} initialPositions - Array of initial position objects
     * @param {boolean} [debug=false] - Enable debug mode
     * @returns {Function} Position function for voronoi simulation
     */
    createInitialPositioner: function (self, initialPositions, debug) {
      var clippingPolygon, extent, minX, maxX, minY, maxY, dx, dy;

      function updateInternals() {
        minX = extent[0][0];
        maxX = extent[1][0];
        minY = extent[0][1];
        maxY = extent[1][1];
        dx = maxX - minX;
        dy = maxY - minY;
      }

      function findNodeInitialPosition(node, initialPositions) {
        return initialPositions.find((pos) => {
          return pos.depth === node.depth && pos.key === node.data.key;
        });
      }

      function getSiblingInitialPositions(siblings, initialPositions) {
        return siblings
          .map((sibling) => findNodeInitialPosition(sibling, initialPositions))
          .filter((pos) => pos !== undefined);
      }

      function getPolygonAngles(clippingPolygon) {
        const polygonXExtent = d3.extent(clippingPolygon, (d) => d[0]);
        const polygonYExtent = d3.extent(clippingPolygon, (d) => d[1]);

        return clippingPolygon
          .map((point) => {
            const x = d3.scaleLinear().domain(polygonXExtent).range([-1, 1])(
              point[0]
            );
            const y = d3.scaleLinear().domain(polygonYExtent).range([-1, 1])(
              point[1]
            );
            const angle = Math.atan2(y, x);
            return {
              angle: angle < 0 ? angle + 2 * Math.PI : angle,
              point: point,
              x: x,
              y: y
            };
          })
          .sort((a, b) => a.angle - b.angle);
      }

      function mapPointToPolygon(x, y, polygonAngles, clippingPolygon) {
        const angle = Math.atan2(y, x);
        const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;

        let startAngle, endAngle, startPoint, endPoint;
        for (let i = 0; i < polygonAngles.length; i++) {
          if (normalizedAngle <= polygonAngles[i].angle) {
            startAngle =
              i === 0
                ? polygonAngles[polygonAngles.length - 1].angle
                : polygonAngles[i - 1].angle;
            endAngle = polygonAngles[i].angle;
            startPoint =
              i === 0
                ? polygonAngles[polygonAngles.length - 1]
                : polygonAngles[i - 1];
            endPoint = polygonAngles[i];
            break;
          }
        }

        if (startAngle === undefined) {
          startAngle = polygonAngles[polygonAngles.length - 1].angle;
          endAngle = polygonAngles[0].angle + 2 * Math.PI;
          startPoint = polygonAngles[polygonAngles.length - 1];
          endPoint = polygonAngles[0];
        }

        const t = (normalizedAngle - startAngle) / (endAngle - startAngle);
        const edgeX = startPoint.x + t * (endPoint.x - startPoint.x);
        const edgeY = startPoint.y + t * (endPoint.y - startPoint.y);

        const distanceToPoint = Math.sqrt(x * x + y * y);
        const maxDistance = Math.sqrt(2);
        const ratio = (distanceToPoint / maxDistance) * 0.9;

        const mappedX = ratio * edgeX;
        const mappedY = ratio * edgeY;

        const polygonXExtent = d3.extent(clippingPolygon, (d) => d[0]);
        const polygonYExtent = d3.extent(clippingPolygon, (d) => d[1]);

        const finalX = d3.scaleLinear().domain([-1, 1]).range(polygonXExtent)(
          mappedX
        );
        const finalY = d3.scaleLinear().domain([-1, 1]).range(polygonYExtent)(
          mappedY
        );

        return [finalX, finalY, normalizedAngle, ratio, [x, y]];
      }

      const _random = function (d, i, arr, voronoiMapSimulation) {
        var shouldUpdateInternals = false;
        if (clippingPolygon !== voronoiMapSimulation.clip()) {
          clippingPolygon = voronoiMapSimulation.clip();
          extent = voronoiMapSimulation.extent();
          shouldUpdateInternals = true;
        }
        if (shouldUpdateInternals) {
          updateInternals();
        }

        if (d.depth === 0) {
          return [(minX + maxX) / 2, (minY + maxY) / 2];
        }

        const parent = d.parent || arr[0].parent;
        const siblings = parent ? parent.children : arr;
        const siblingInitialPositions = getSiblingInitialPositions(
          siblings,
          initialPositions
        );

        if (siblingInitialPositions.length > 0) {
          const nodeInitialPosition = findNodeInitialPosition(
            d,
            initialPositions
          );

          if (nodeInitialPosition) {
            const x = nodeInitialPosition.x * self.width;
            const y = nodeInitialPosition.y * self.height;

            if (d3.polygonContains(clippingPolygon, [x, y])) {
              return [x, y];
            }

            const [mappedX, mappedY] = mapPointToPolygon(
              d3.scaleLinear().domain([0, 1]).range([-1, 1])(nodeInitialPosition.x),
              d3.scaleLinear().domain([0, 1]).range([-1, 1])(nodeInitialPosition.y),
              getPolygonAngles(clippingPolygon),
              clippingPolygon
            );

            return [mappedX, mappedY];
          }
        }

        // Fallback: random position
        let x, y;
        do {
          x = minX + dx * voronoiMapSimulation.prng()();
          y = minY + dy * voronoiMapSimulation.prng()();
        } while (!d3.polygonContains(clippingPolygon, [x, y]));

        return [x, y];
      };

      return _random;
    }
  };

  // Copyright (c) 2025 UXtechLab.
  // Originally created by @taekie. Released under the MIT License. See LICENSE for details.
  /**
   * PopupHelpers
   *
   * Helper functions for creating popup displays when cells are clicked.
   * These are optional utilities that can be used with the onClick option.
   */

  /**
   * Default popup function for Observable notebooks
   * Returns an HTML element that displays information about the clicked cell
   *
   * @param {Object} clickedData - The data object passed from the click event
   * @param {Object} clickedData.data - The data associated with the clicked cell
   * @param {Event} clickedData.event - The original click event
   * @returns {HTMLElement|null} HTML element for Observable to display, or null if no data
   *
   * @example
   * // In Observable notebook
   * import { VoronoiBubble, showVoronoiPopup } from "..."
   *
   * chart = {
   *   const bubble = new VoronoiBubble();
   *   return bubble.render(data, {
   *     onClick: showVoronoiPopup
   *   });
   * }
   */
  function showVoronoiPopup$1(clickedData) {
    if (!clickedData) return null;

    const data = clickedData.data || {};

    // This uses Observable's html template literal
    // For non-Observable environments, use createDOMPopup instead
    if (typeof html !== 'undefined') {
      return html`<div style="
      background: #fffe;
      border: 2px solid #555;
      border-radius: 15px;
      padding: 15px;
      max-width: 350px;
      min-width: 200px;
    ">
      <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 0.5em;">
        ${data.subgroup || 'N/A'}
      </div>
      <div style="margin-bottom: 0.3em;">
        <strong>Region:</strong> ${data.group || 'N/A'}
      </div>
      <div>
        <strong>Size:</strong> ${data.size || 'N/A'}
      </div>
    </div>`;
    }

    // Fallback for non-Observable environments
    return createDOMPopup(clickedData);
  }

  /**
   * Create a DOM-based popup for standard web pages (non-Observable)
   * This creates an absolutely positioned popup at the click location
   *
   * @param {Object} clickedData - The data object passed from the click event
   * @param {Object} clickedData.data - The data associated with the clicked cell
   * @param {Event} clickedData.event - The original click event
   * @returns {HTMLElement|null} DOM element to be appended to the page
   *
   * @example
   * // In standard HTML/JavaScript
   * const bubble = new VoronoiBubble();
   * const svg = bubble.render(data, {
   *   onClick: createDOMPopup
   * });
   */
  function createDOMPopup(clickedData) {
    // Remove existing popup
    const existingPopup = document.querySelector('.vb-popup-content');
    if (existingPopup) existingPopup.remove();

    if (!clickedData) {
      return null;
    }

    const event = clickedData.event;
    const data = clickedData.data || {};

    // Create popup
    const popup = document.createElement('div');
    popup.className = 'vb-popup-content';

    // Position at click location
    const x = event.pageX;
    const y = event.pageY;
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';

    // Create popup content
    const content = document.createElement('div');
    content.className = 'vb-popup-message';
    content.innerHTML = `
    <div style="font-size: 1.2em; font-weight: bold; margin-bottom: 0.5em;">
      ${data.subgroup || 'N/A'}
    </div>
    ${data.item ? `<div style="margin-bottom: 0.5em; color: #555;">${data.item}</div>` : ''}
    <div style="margin-bottom: 0.3em;">
      <strong>Region:</strong> ${data.group || 'N/A'}
    </div>
    <div>
      <strong>Size:</strong> ${data.size || 'N/A'}
    </div>
  `;

    popup.appendChild(content);
    document.body.appendChild(popup);

    // Close on click outside
    setTimeout(() => {
      const closeHandler = (e) => {
        if (!popup.contains(e.target)) {
          popup.remove();
          document.removeEventListener('click', closeHandler);
        }
      };
      document.addEventListener('click', closeHandler);
    }, 0);

    return popup;
  }

  /**
   * Get the recommended CSS styles for popups
   * Returns a string of CSS that can be added to your page
   *
   * @returns {string} CSS string for popup styles
   *
   * @example
   * // In Observable
   * html`<style>${getPopupStyles()}</style>`
   *
   * @example
   * // In standard HTML
   * const style = document.createElement('style');
   * style.textContent = getPopupStyles();
   * document.head.appendChild(style);
   */
  function getPopupStyles() {
    return `
.vb-popup-content {
  position: absolute;
  background: #fffe;
  border: 2px solid #555;
  border-radius: 30px;
  padding: 10px;
  z-index: 1000000;
  transform: translateX(-50%) translateY(-100%);
  min-width: 100px;
}

.vb-popup-content::before {
  content: " ";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -10px;
  border-width: 10px;
  border-style: solid;
  border-color: #555 transparent transparent transparent;
}

.vb-popup-content::after {
  content: " ";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -8px;
  border-width: 8px;
  border-style: solid;
  border-color: #fff transparent transparent transparent;
}

/* Primary popup (showVoronoiPopup from utils): the JS already positions the
   .vb-popup at the final top-left, so the inner content must NOT
   re-apply the legacy centering transform — otherwise it double-offsets up-left.
   Scoped to .vb-popup so the legacy popup keeps its transform. */
.vb-popup .vb-popup-content {
  position: relative;
  transform: none;
}
/* When placed below the cell, flip the arrow to point up from the top edge. */
.vb-popup.vb-popup-below .vb-popup-content::before {
  top: auto;
  bottom: 100%;
  border-color: transparent transparent #555 transparent;
}
.vb-popup.vb-popup-below .vb-popup-content::after {
  top: auto;
  bottom: 100%;
  border-color: transparent transparent #fff transparent;
}

.vb-popup-message {
  max-width: 350px;
  min-width: 200px;
  padding: 1em;
  line-height: 1.5;
  color: #444;
  text-align: left;
  max-height: 400px;
  overflow-y: scroll;
  overflow-x: clip;
}
`;
  }

  /**
   * Get comprehensive CSS styles for bubble/voronoi visualizations
   * Returns a string of CSS including fonts, regions, areas, labels, and popups
   *
   * @returns {string} CSS string for all bubble styles
   *
   * @example
   * // In Observable
   * html`<style>${getBubbleStyles()}</style>`
   *
   * @example
   * // In standard HTML
   * const style = document.createElement('style');
   * style.textContent = getBubbleStyles();
   * document.head.appendChild(style);
   */
  function getBubbleStyles() {
    return `
@font-face {
    font-family: 'KoddiUD OnGothic';
    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2105_2@1.0/KoddiUDOnGothic-Regular.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}

@font-face {
    font-family: 'KoddiUDOnGothic-Bold';
    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2105_2@1.0/KoddiUDOnGothic-Bold.woff') format('woff');
    font-weight: normal;
    font-style: normal;
}

.vb-chart, .vb-popup {
    font-family: "KoddiUD OnGothic", sans-serif;
}

.vb-caption {
    color: #888;
}

.vb-group-label {
    font-family: "KoddiUDOnGothic-Bold", "KoddiUD OnGothic", sans-serif;
    fill: #fff;
    fill-opacity: 1;
    font-weight: 700;
    stroke-width: 3px;
    pointer-events: none;
}

.vb-cell[data-depth="1"] {
    stroke: #464749aa;
    stroke-width: 1.5;
}

.vb-cell[data-depth="2"] {
    stroke: #46474955;
    stroke-width: 0.7;
}

.vb-cell[data-depth="3"] {
    stroke: #ffffffb0;
    stroke-width: 0.5;
    cursor: pointer;
}

svg.vb-hover-enabled .vb-cell[data-depth="3"]:hover {
    fill: var(--hl, #00000099) !important;
}

.vb-cell[data-depth="3"].vb-clicked {
    stroke-width: 1px;
    filter: hue-rotate(-5deg) brightness(0.9);
}

.vb-subgroup-label {
    font-size: 1.2em;
    font-weight: 600;
    fill: #000d;
    pointer-events: none;
}

.vb-item-label {
    font-size: 0.8em;
    font-weight: 400;
    fill: #a95b5bdd;
    cursor: default;
    pointer-events: none;
}

.vb-item-value {
    fill: #c25a50;
    font-size: 12px;
    cursor: default;
    pointer-events: none;
}

.vb-popup-content {
    position: absolute;
    background: #fffe;
    border: 2px solid #555;
    border-radius: 30px;
    padding: 10px;
    z-index: 1000000;
    transform: translateX(-50%) translateY(-100%);
    min-width: 100px;
}

.vb-popup-content::before {
    content: " ";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -10px;
    border-width: 10px;
    border-style: solid;
    border-color: #555 transparent transparent transparent;
}

.vb-popup-content::after {
    content: " ";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -8px;
    border-width: 8px;
    border-style: solid;
    border-color: #fff transparent transparent transparent;
}

/* Primary popup (showVoronoiPopup from utils): the JS already positions the
   .vb-popup at the final top-left, so the inner content must NOT
   re-apply the legacy centering transform — otherwise it double-offsets up-left.
   Scoped to .vb-popup so the legacy popup keeps its transform. */
.vb-popup .vb-popup-content {
    position: relative;
    transform: none;
}
/* When placed below the cell, flip the arrow to point up from the top edge. */
.vb-popup.vb-popup-below .vb-popup-content::before {
    top: auto;
    bottom: 100%;
    border-color: transparent transparent #555 transparent;
}
.vb-popup.vb-popup-below .vb-popup-content::after {
    top: auto;
    bottom: 100%;
    border-color: transparent transparent #fff transparent;
}

.vb-popup-message {
    max-width: 350px;
    min-width: 200px;
    padding: 1em;
    line-height: 1.5;
    color: #444;
    text-align: left;
    max-height: 400px;
    overflow-y: scroll;
    overflow-x: clip;
}
`;
  }

  // Copyright (c) 2025 UXtechLab.
  // Originally created by @taekie. Released under the MIT License. See LICENSE for details.
  /**
   * VoronoiBubble
   *
   * Main class for creating voronoi treemap visualizations.
   * Renders hierarchical data as organic, pebble-like cells using
   * D3.js and voronoi treemap algorithms.
   *
   * Features:
   * - Hierarchical voronoi treemap layout
   * - Customizable colors, labels, and sizing
   * - Interactive click and hover events
   * - Pebble-style rounded outlines
   * - Label collision detection and adjustment
   * - Region position control for deterministic layouts
   */


  /**
   * VoronoiBubble - Main visualization class
   *
   * @example
   * const bubble = new VoronoiBubble();
   * const svg = bubble.render(data, {
   *   width: 1200,
   *   height: 900,
   *   title: 'My VoronoiBubble',
   *   caption: 'Optional subtitle'
   * });
   * document.body.appendChild(svg);
   */
  class VoronoiBubble {
    constructor() {
      this.margin = { top: 50, right: 50, bottom: 50, left: 50 };
      this.svg = null;
      this.data = null;
      this.hierarchy = null;
      this.allNodes = null;
      this._pebbleRenderer = null;
      this._labelAdjuster = null;
    }

    // === Default Color Palette ===
    static get DEFAULT_COLORS() {
      return "#afc7dd,#ffe9a9,#f69f8f,#b4c8af,#e9e4d6,#bed1d8,#f8dba1,#fcbc8b,#d7e0c4,#c5b5a6,#b5ccc1,#e9bfb4,#e9f0f6,#fffefb,#fce0db,#e1e9df,#f1f5f7,#fef8ed,#feeada,#fbfcf9,#e5ded7,#e5edea,#fbf5f3,#96b6d3,#ffdf85,#f3836e,#a0b99a,#ddd4be,#a7c1cb,#f5cf80,#fba868,#c7d4ac,#b7a490,#a0bdb0,#e1a799,#d7e3ee,#fff7e1,#facbc3,#d3dfd0,#fdfcfa,#e1eaed,#fcefd5,#fddcc2,#f0f3e9,#dbd2c8,#d6e3dd,#f6e4df,#dee8f1,#fffaeb,#fbd4cc,#d9e3d6,#e7eef1,#fcf3df,#fee1cc,#f4f7ef,#dfd7ce,#dce7e2,#f8ebe7,#e5edf4,#fffdf5,#fcdcd6,#dfe7dc,#eef3f5,#fdf6e8,#fee7d6,#f9faf6,#e3dcd4,#e2ebe7,#faf1ef,#d0b7ba,#b8cec4,#d2b6b6,#b6bdd6,#d9b8b7,#ded5b6,#bac2d7,#c8d5be,#e3bfb7,#f9dfb3,#eac2b8,#c1d3da,#ddc7c1,#d9e2c7,#cfdad5,#eecdc1,#ccdddf,#c7d7e6,#ded6cf,#e7d1cb,#ced9e5,#eedbc8,#d7e3e2,#e3ead2,#ecdcd2,#d9e0e5,#efe1d2,#ebdad7,#eed6da,#e1e6de,#dde4e8,#eee1d8,#f5e8d7,#f1e6dd,#f5e8de,#f3e7e1,#f5eee1,#f5f2ec".split(
        ","
      );
    }

    // === Built-in Palettes ===
    // 명화의 대표색에서 hue와 상대적 명암·채도 관계를 가져오되, OKLCH에서
    // L 0.76~0.90 / C 0.05~0.12 밴드로 압축해 이 렌더러의 밝기 파생과
    // 맞춘 팔레트들. 지배색 가족과 악센트를 교차 배열해 큰 그룹(크기
    // 내림차순 배정)이 지배색을 받는다.
    static get PALETTES() {
      return {
        // 기본: 107색 파스텔 그라데이션 풀
        pastel: VoronoiBubble.DEFAULT_COLORS,
        // 반 고흐, 별이 빛나는 밤 — 파랑 가족 + 금색 악센트
        starryNight: "#99c3ff,#f1e084,#97b9fb,#fbcf75,#9fcfff,#aacaa0,#b6d7fd,#e0c483,#c4e1fe,#98b2dc".split(","),
        // 모네, 수련 — 초록 가족 + 분홍·보라 악센트
        waterLilies: "#94cfa2,#f3b4e2,#8ec1ff,#c3dfbc,#cab2ff,#9bbba1,#fec1d4,#bcd8f5,#afd7aa,#f0dbb7".split(","),
        // 호쿠사이, 가나가와의 큰 파도 — 쪽빛 + 크림·주황
        wave: "#82c8ff,#f2dbaf,#8abded,#f5d596,#8cceff,#fabe81,#a4d6ff,#deb58d,#b9dff5,#93b5da".split(","),
        // 클림트, 키스 — 금색·황토 지배 + 자두·분홍 대비
        kiss: "#f5d274,#d9c7f0,#bac991,#f8dd7e,#e4b699,#f2cae6,#d8c97b,#d6afd2,#f5c772,#c4ad8e".split(","),
        // 모네, 인상·해돋이 — 슬레이트 블루 + 주황
        sunrise: "#99b3d9,#ffad8d,#aac4ea,#ffc097,#86c0ca,#ffd2a2,#bad4f6,#d6b1d2,#9dd4e0,#f3d6ba".split(","),
      };
    }

    // === Default Options ===
    static get DEFAULT_OPTIONS() {
      return {
        width: 1200,
        height: 900,
        title: "",
        caption: "",
        onClick: () => {},
        onHover: null, // (cell|null) => void — cell = { ...row, depth, event, target }; null on leave
        hoverVisualLimit: 0, // Enable cell hover highlight / label reveal up to this leaf-cell count
        onSubgroupLabelHover: null, // (label|null) => void — hover on depth-2 (subgroup) labels; label = { subgroup, key, depth, event, target } (no original row fields); null on leave. Enables pointer-events on labels (clicks are forwarded to the cell behind).
        colorFunc: null,
        sentiment: null, // 'fieldName' | { field, domain:[lo,hi] } — built-in diverging sentiment colormap
        getCellColors: null, // (cellColors) => void - Callback to receive actual cell colors
        sizeLimit: 1000,
        ratioLimit: 0,
        pieSize: 1,
        fontScale: 1, // extra multiplier on top of the automatic canvas-relative font normalization
        groupLabelScale: 1.1, // depth-1 (group) label multiplier
        subgroupLabelScale: 1.05, // depth-2 (subgroup) label multiplier

        colors: VoronoiBubble.DEFAULT_COLORS,
        colorVariation: "standard", // 'standard'(그룹 내 명도 대비, v1 룩) | 'subtle'(차분·전역 일관) | 'strong'(강한 대비)
        seedRandom: 10,
        showGroupLabel: false,
        showPercent: false,
        underLabel: false,
        positions: null,
        forceNodeFunc: null,
        debug: false,
        pebbleRound: 25,
        pebbleWidth: 5,
        groupColors: [],
        // Custom HTML label renderers — one per depth.
        // (datum, defaultHtml, ctx) => HTML string. ctx.depth is 1 (group) or 2 (subgroup).
        renderGroupLabel: null,    // depth 1 (group)
        renderSubgroupLabel: null, // depth 2 (subgroup)
        adaptiveIterations: true,
        cellImage: null, // (datum) => { url, mode: 'fill'|'fit', opacity: 0~1, colorMode: 'original'|'tint' } | null
        labelMode: 'faded', // 'show' | 'faded' | 'hidden'
        levels: ['group', 'subgroup', 'item'], // field names per depth (0, 1, 2)
        value: 'size' // field name for size weight
      };
    }

    // === v1 → v2 rename table (detection only, no behavioral fallback) ===
    static get V1_RENAMES() {
      return {
        options: {
          maptitle: 'title', mapcaption: 'caption',
          showRegion: 'showGroupLabel', showMetaLabel: 'showGroupLabel',
          showLabel: 'labelMode', // v1 boolean → v2 'show' | 'faded' | 'hidden'
          regionPositions: 'positions', metaLabelPositions: 'positions',
          keyColors: 'groupColors', regionColors: 'groupColors', metaLabelColors: 'groupColors',
          clickFunc: 'onClick', hoverFunc: 'onHover', labelHoverFunc: 'onSubgroupLabelHover',
          renderLabel: 'renderGroupLabel / renderSubgroupLabel',
          regionLabelRenderer: 'renderGroupLabel', metaLabelRenderer: 'renderGroupLabel',
          labelRenderer: 'renderSubgroupLabel', bigClusterLabelRenderer: 'renderSubgroupLabel',
        },
        // label/text는 여분 필드로 흔해 오탐 위험 → 목록에서 제외.
        fields: {
          region: 'group', metaLabel: 'group', bigClusterLabel: 'subgroup',
          clusterLabel: 'item', bubbleSize: 'size', budget: 'size',
        },
      };
    }

    /**
     * Detect v1 option/field names and print a single migration notice per render.
     * Detection only — v1 names are NOT mapped to v2 behavior.
     * @param {Object} options - Raw user options
     * @param {Object} [firstRow] - First data row (field-name probe)
     */
    _warnV1Names(options, firstRow) {
      const { options: optMap, fields: fieldMap } = VoronoiBubble.V1_RENAMES;
      const hits = Object.keys(options)
        .filter((k) => k in optMap)
        .map((k) => `옵션 ${k} → ${optMap[k]}`);
      const defaults = VoronoiBubble.DEFAULT_OPTIONS;
      const usingDefaultLevels = !options.levels ||
        options.levels.every((f, i) => f === defaults.levels[i]);
      const hasV2Field = firstRow &&
        ['group', 'subgroup', 'item'].some((f) => f in firstRow);
      if (firstRow && usingDefaultLevels && !hasV2Field) {
        hits.push(...Object.keys(fieldMap)
          .filter((k) => k in firstRow)
          .map((k) => `필드 ${k} → ${fieldMap[k]}`));
      }
      if (hits.length) {
        console.error(
          `[VoronoiBubble] v1 이름이 감지되었습니다. v2에서는 동작하지 않습니다.\n  ` +
          hits.join('\n  ') +
          `\n마이그레이션 가이드: docs/MIGRATION.md`,
        );
      }
    }

    // === Getter for post-processing modules ===
    get pebbleRenderer() {
      if (!this._pebbleRenderer) {
        this._pebbleRenderer = new PebbleRenderer(d3);
      }
      return this._pebbleRenderer;
    }

    get labelAdjuster() {
      if (!this._labelAdjuster) {
        this._labelAdjuster = new LabelAdjuster(d3);
      }
      return this._labelAdjuster;
    }

    // === Public Methods ===

    /**
     * Render chart - returns SVG element
     * @param {Object[]} data - Data array to visualize
     * @param {Object} [options] - Rendering options
     * @returns {SVGSVGElement} - Generated SVG element
     */
    render(data, options = {}) {
      // `options = {}` only covers undefined — an explicit `null` must not throw.
      options = options || {};
      this._warnV1Names(options, data?.[0]);
      const normalizedOptions = { ...options };

      this._hasExplicitOnClick = typeof normalizedOptions.onClick === "function";
      this._hasExplicitOnHover = typeof normalizedOptions.onHover === "function";
      this.params = { ...VoronoiBubble.DEFAULT_OPTIONS, ...normalizedOptions };

      // colors 옵션은 배열 또는 내장 팔레트 이름(문자열)을 받는다.
      if (typeof this.params.colors === "string") {
        const preset = VoronoiBubble.PALETTES[this.params.colors];
        if (!preset) {
          console.error(
            `[VoronoiBubble] 알 수 없는 팔레트 '${this.params.colors}' — 기본 팔레트를 사용합니다. ` +
            `사용 가능: ${Object.keys(VoronoiBubble.PALETTES).join(", ")}`,
          );
        }
        this.params.colors = preset || VoronoiBubble.DEFAULT_COLORS;
      }

      // Normalize field names: custom levels/value -> standard group/subgroup/item/size
      const levels = this.params.levels;
      const valueField = this.params.value;
      const stdLevels = ['group', 'subgroup', 'item'];
      const customLevels = !levels.every((f, i) => f === stdLevels[i]);
      const customValue = valueField !== 'size';

      this.data = data.map(d => {
        const normalized = { ...d };
        // Custom levels mapping
        if (customLevels) {
          if (levels[0] !== undefined) normalized.group = d[levels[0]];
          if (levels[1] !== undefined) normalized.subgroup = d[levels[1]];
          if (levels[2] !== undefined) normalized.item = d[levels[2]];
        }
        if (customValue) normalized.size = d[valueField];
        return normalized;
      });

      // Built-in sentiment colormap: `sentiment: 'fieldName'` or { field, domain: [lo, hi] }.
      // Auto-wires colorFunc (leaf cells) + groupColors (regions) from the diverging
      // pastel palette so a rating/sentiment field looks good with no extra code.
      // Explicit colorFunc / groupColors always take precedence.
      if (this.params.sentiment) {
        const sc = VoronoiBubbleHelpers.buildSentimentColoring(
          this.data,
          this.params.sentiment
        );
        if (!this.params.colorFunc) this.params.colorFunc = sc.colorFunc;
        if (!this.params.groupColors || this.params.groupColors.length === 0)
          this.params.groupColors = sc.groupColors;
      }

      // When colorFunc drives leaf colors but the user gave no palette/groupColors,
      // default the depth-1 (group) palette to a single neutral color so region
      // outlines and labels don't show clashing rainbow colors. Override with
      // `colors` / `groupColors` to restore per-region coloring.
      if (
        this.params.colorFunc &&
        !("colors" in normalizedOptions) &&
        (!this.params.groupColors || this.params.groupColors.length === 0)
      ) {
        this.params.colors = ["#444"];
      }

      this._setupSVG();
      this._prepareData();
      this._setupGroups();
      this._drawTitleAndCaption();
      this._createRegionColorScale();
      this._computeLayout();
      this._drawCells();
      this._drawCellImages();
      this._drawLabels();
      this._buildLabelCache();
      this._setupCellInteraction();
      this._applyHoverVisualMode();
      this._applyPostEffects();
      this._applyLabelMode();
      this._setupZoom();

      return this.svg.node();
    }

    /**
     * Update chart (data only)
     * @param {Object[]} newData - New data
     * @returns {SVGSVGElement}
     */
    update(newData) {
      return this.render(newData, this.params);
    }

    // === 1. Initial Setup Methods ===

    _setupSVG() {
      // Drawing coordinate space = params.width × viewBox height (the viewBox).
      // Display size is left to CSS: fills the container width, scales down on
      // mobile, and never grows past the native drawing size on large screens.
      // No JS scale math — the browser scales fonts/strokes/cells via the viewBox.

      // When there's a title, add ~1 line of breathing room above it: grow both
      // margin.top and the viewBox height by the same amount. The chart body and
      // the bottom margin stay the same size — everything just shifts down, so
      // the title gets headroom and nothing is clipped at the bottom.
      const hasTitle = !!(this.params.title && String(this.params.title).trim());
      const titleSpace = hasTitle ? 48 : 0;
      this.margin.top = 50 + titleSpace;
      const vbHeight = this.params.height + titleSpace;

      this.svg = d3
        .create("svg")
        .attr("class", "vb-chart")
        .attr("viewBox", `0 0 ${this.params.width} ${vbHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width", "100%")
        .style("height", "auto")
        .style("max-width", `${this.params.width}px`);

      // Inject bubble styles (includes :hover rules)
      this.svg.append("style").text(getBubbleStyles());

      this.svg
        .append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .style("fill", "transparent");

      const innerWidth = this.params.width - this.margin.left - this.margin.right;
      const innerHeight = vbHeight - this.margin.top - this.margin.bottom;
      this.width = innerWidth * Math.sqrt(this.params.pieSize);
      this.height = this.width * (innerHeight / innerWidth);
    }

    _prepareData() {
      // Use external nestingForVoronoi function
      const nested = nestingForVoronoi(
        this.data,
        "subgroup",
        "item"
      );

      this.hierarchy = d3.hierarchy(nested, (d) => d.values).sum((d) => d.size);

      // Font scales are tuned for the 1200x900 reference canvas. Carry a
      // canvas-relative factor on the hierarchy so every font helper shrinks
      // text together with the cells on smaller/larger canvases.
      this.hierarchy.fontK =
        Math.sqrt((this.params.width * this.params.height) / (1200 * 900)) *
        (this.params.fontScale ?? 1);

      this.totalValue = this.hierarchy.value;
    }

    _setupGroups() {
      // outer wrapper: applies static margin offset (never touched by zoom)
      this.chartGroup = this.svg
        .append("g")
        .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

      // inner wrapper: applies dynamic zoom transform
      this.zoomGroup = this.chartGroup.append("g").attr("class", "vb-zoom-layer");

      this.voronoiGroup = this.zoomGroup.append("g").attr("class", "vb-cells");
      this.labelsGroup = this.zoomGroup.append("g").attr("class", "vb-item-labels");
      this.popLabelsGroup = this.zoomGroup.append("g").attr("class", "vb-item-values");
      this.bigLabelsGroup = this.zoomGroup.append("g").attr("class", "vb-subgroup-labels");
      this.regionLabelsGroup = this.zoomGroup
        .append("g")
        .attr("class", "vb-group-labels");
    }

    _drawTitleAndCaption() {
      const title = this.svg
        .append("g")
        .append("text")
        .attr("class", "vb-title")
        .attr("text-anchor", "middle")
        .attr("font-size", "28")
        .attr("font-weight", "600")
        .attr(
          "transform",
          `translate(${this.margin.left + this.width / 2},${
          this.margin.top - 40
        })`
        )
        .html(this.params.title);

      // 제목이 버블 영역 폭의 90%를 넘으면 말줄임(…) 처리.
      // render() 시점의 SVG는 아직 DOM 밖이라(getComputedTextLength=0),
      // 측정하는 동안만 숨김 상태로 body에 임시 부착한다.
      const titleNode = title.node();
      if (titleNode?.getComputedTextLength && typeof document !== "undefined") {
        const svgNode = this.svg.node();
        const detached = !svgNode.isConnected;
        if (detached && document.body) {
          svgNode.style.position = "absolute";
          svgNode.style.visibility = "hidden";
          document.body.appendChild(svgNode);
        }
        const maxW = this.width * 0.9;
        if (titleNode.getComputedTextLength() > maxW) {
          let text = titleNode.textContent;
          while (text.length > 1 && titleNode.getComputedTextLength() > maxW) {
            text = text.slice(0, -1);
            titleNode.textContent = text + "…";
          }
        }
        if (detached && svgNode.isConnected) {
          svgNode.remove();
          svgNode.style.position = "";
          svgNode.style.visibility = "";
        }
      }

      this.svg
        .append("g")
        .append("text")
        .attr("class", "vb-caption")
        .attr("text-anchor", "middle")
        .attr("font-size", "15")
        .attr("font-weight", "400")
        .attr("fill", "#888")
        .attr(
          "transform",
          `translate(${this.margin.left + this.width / 2},${
          this.margin.top + this.height + 30
        })`
        )
        .html(this.params.caption);
    }

    _createRegionColorScale() {
      // Calculate total size per group
      const regionSizes = d3.rollup(
        this.data,
        (v) => d3.sum(v, (d) => parseFloat(d.size) || 1),
        (d) => d.group
      );

      // Sort groups by size (descending - largest first)
      const sortedRegions = Array.from(regionSizes.entries())
        .sort((a, b) => b[1] - a[1]) // b[1] - a[1]: descending order
        .map((d) => d[0]); // Extract group names

      const { groupColors, colors: paletteColors } = this.params;
      const customColorMap = new Map(groupColors.map((d) => [d.key, d.color]));

      let colorMapping = {};

      // Assign colors to sorted regions (largest region gets first color)
      sortedRegions.forEach((key, i) => {
        colorMapping[key] = paletteColors[i % paletteColors.length];
      });

      // Override with custom region colors if specified
      customColorMap.forEach((color, key) => {
        colorMapping[key] = color;
      });

      this.regionColor = d3
        .scaleOrdinal()
        .domain(Object.keys(colorMapping))
        .range(Object.values(colorMapping));
    }

    // === 2. Layout Calculation Methods ===

    _computeLayout() {
      const ellipse = d3.range(100).map((i) => {
        let x = Math.cos((i / 50) * Math.PI);
        const max = 0.92;
        if (x > max) x = max + (x - max) * 0.5;
        if (x < -max) x = -max + (x + max) * 0.5;
        x = x / 0.94;
        const y = Math.sin((i / 25) * Math.PI);
        return [
          (this.width * (1 + 0.99 * x)) / 2,
          (this.height * (1 + 0.99 * y)) / 2
        ];
      });

      const hasCustomPositions =
        Array.isArray(this.params.positions) &&
        this.params.positions.length > 0;

      if (hasCustomPositions || this.params.adaptiveIterations) {
        const mergedPositions = hasCustomPositions
          ? this._normalizePositions(this.params.positions)
          : [];
        const seed = d3.seedrandom(this.params.seedRandom);
        VoronoiBubbleHelpers.createCustomVoronoiAlgorithm(
          this,
          this.params.debug
        )
          .size([this.width, this.height])
          .clip(ellipse)
          .prng(seed)
          .adaptiveIterations(!!this.params.adaptiveIterations)
          .initialPositions(mergedPositions)(this.hierarchy);
      } else {
        // Default: single voronoi run with fixed seed
        const seed = d3.seedrandom(this.params.seedRandom);
        d3.voronoiTreemap().prng(seed).clip(ellipse)(this.hierarchy);
      }

      VoronoiBubbleHelpers.colorHierarchy(this, this.hierarchy);

      this.allNodes = this.hierarchy
        .descendants()
        .sort((a, b) => b.depth - a.depth)
        .map((d, i) => Object.assign({}, d, { id: i }));

      // Extract and provide cell colors if callback is provided
      if (this.params.getCellColors) {
        const cellColors = this._extractCellColors();
        this.params.getCellColors(cellColors);
      }
    }

    /**
     * Extract cell colors from hierarchy nodes
     * @returns {Array} Array of {group, groupColor, subgroup, color} objects sorted by group size
     * @private
     */
    _extractCellColors() {
      const cellColors = [];

      // Get depth 1 nodes sorted by value (size) descending for ordering
      const depth1Nodes = this.hierarchy.descendants()
        .filter(n => n.depth === 1)
        .sort((a, b) => b.value - a.value);

      // Create order map for sorting
      const regionOrder = new Map();
      depth1Nodes.forEach((node, index) => {
        regionOrder.set(node.data.key, index);
      });

      this.hierarchy.descendants().forEach(node => {
        // Process depth 2 nodes (subgroup level)
        if (node.depth === 2) {
          // depth 1 = group (parent), depth 2 = subgroup (current node)
          const depth1Node = node.parent; // depth 1 ancestor

          cellColors.push({
            group: depth1Node?.data?.key,
            groupColor: depth1Node?.color,
            subgroup: node.data.key,
            color: node.color
          });
        }
      });

      // Sort by group size (largest first, following colormap order)
      cellColors.sort((a, b) => {
        const orderA = regionOrder.get(a.group) ?? Infinity;
        const orderB = regionOrder.get(b.group) ?? Infinity;
        return orderA - orderB;
      });

      return cellColors;
    }

    _normalizePositions(positions) {
      const result = [];
      this.hierarchy.descendants();

      // Helper: Add jitter to duplicate positions to prevent voronoi algorithm failure
      const addJitterForDuplicates = (positions, jitterAmount = 0.02) => {
        const positionMap = new Map(); // key: "x,y" -> count

        positions.forEach((pos) => {
          const key = `${pos.x.toFixed(6)},${pos.y.toFixed(6)}`;
          const count = positionMap.get(key) || 0;

          if (count > 0) {
            // Add jitter for duplicate positions (spread in a circle)
            const angle = (count * 2.4) % (2 * Math.PI); // Golden angle for even distribution
            const jitter = jitterAmount * Math.sqrt(count);
            pos.x = Math.max(0.05, Math.min(0.95, pos.x + jitter * Math.cos(angle)));
            pos.y = Math.max(0.05, Math.min(0.95, pos.y + jitter * Math.sin(angle)));
          }

          positionMap.set(key, count + 1);
        });

        return positions;
      };

      // depth 1: Normalize based on overall extent
      const depth1 = positions.filter((p) => p.depth === 1);
      if (depth1.length > 0) {
        const xExtent = d3.extent(depth1, (p) => p.x);
        const yExtent = d3.extent(depth1, (p) => p.y);

        const xScale =
          xExtent[0] === xExtent[1]
            ? () => 0.5
            : d3.scaleLinear().domain(xExtent).range([0.15, 0.85]);
        const yScale =
          yExtent[0] === yExtent[1]
            ? () => 0.5
            : d3.scaleLinear().domain(yExtent).range([0.15, 0.85]);

        const depth1Normalized = depth1.map((pos) => ({
          ...pos,
          x: xScale(pos.x),
          y: yScale(pos.y)
        }));

        // Add jitter for any duplicate positions
        addJitterForDuplicates(depth1Normalized);
        result.push(...depth1Normalized);
      }

      // depth 2, 3: normalize per depth, not per parent. Affinity/UMAP style
      // coordinates are usually computed over the whole depth set, so splitting
      // by parent would destroy the global semantic layout.
      [2, 3].forEach((depth) => {
        const depthPositions = positions.filter((p) => p.depth === depth);
        if (depthPositions.length === 0) return;

        const xExtent = d3.extent(depthPositions, (p) => p.x);
        const yExtent = d3.extent(depthPositions, (p) => p.y);

        const xScale =
          xExtent[0] === xExtent[1]
            ? () => 0.5
            : d3.scaleLinear().domain(xExtent).range([0.15, 0.85]);
        const yScale =
          yExtent[0] === yExtent[1]
            ? () => 0.5
            : d3.scaleLinear().domain(yExtent).range([0.15, 0.85]);

        const depthNormalized = depthPositions.map((pos) => ({
          ...pos,
          x: xScale(pos.x),
          y: yScale(pos.y)
        }));

        addJitterForDuplicates(depthNormalized);
        result.push(...depthNormalized);
      });

      return result;
    }

    // === 3. Visualization Element Drawing Methods ===

    _drawCells() {
      this.voronoiGroup
        .selectAll("path")
        .data(this.allNodes)
        .enter()
        .append("path")
        .attr("d", (d) => "M" + d.polygon.join("L") + "Z")
        .style("fill", (d) => d.color ?? d.parent.color)
        .style("--hl", (d) => {
          const base = d.color ?? d.parent?.color;
          const c = base ? d3.color(base) : null;
          return c ? c.darker(0.35).formatHex() : "#00000099";
        })
        .attr("class", "vb-cell")
        .attr("data-depth", (d) => d.depth)
        .attr("data-id", (d) => d.id)
        .style("fill-opacity", (d) => (d.depth === 3 ? 1 : 0))
        .attr("pointer-events", (d) => (d.depth === 3 ? "all" : "none"))
        .each(function (d) {
          if (d.depth === 3) d.cellNode = this;
        });
    }

    _setupCellInteraction() {
      const leaves = this.allNodes.filter((d) => d.depth === 3 && d.polygon?.length);
      if (!leaves.length) return;
      const visualHoverEnabled = leaves.length <= this.params.hoverVisualLimit;

      const restoreLabels = (d) => {
        if (!visualHoverEnabled || !d) return;
        const ratioLimit = this.params.ratioLimit;
        const groupLabel = this._subgroupLabelCache?.get(d.data.data.subgroup);
        const leafLabel = this._itemLabelCache?.get(d.data.data.item);
        if (groupLabel) {
          groupLabel.node().style.opacity = groupLabel._cachedRatio >= ratioLimit ? 1 : 0;
        }
        if (leafLabel) {
          leafLabel.node().style.opacity = leafLabel._cachedRatio >= ratioLimit ? 1 : 0;
        }
      };

      const revealLabels = (d) => {
        if (!visualHoverEnabled) return;
        const groupLabel = this._subgroupLabelCache?.get(d.data.data.subgroup);
        const leafLabel = this._itemLabelCache?.get(d.data.data.item);
        if (groupLabel) groupLabel.node().style.opacity = 1;
        if (leafLabel) leafLabel.node().style.opacity = 1;
      };

      const setHoveredCell = (next, event) => {
        if (next === this._hoveredCell) return;
        restoreLabels(this._hoveredCell);
        this._hoveredCell = next;

        if (!next) {
          this.params.onHover?.(null);
          return;
        }

        revealLabels(next);
        this.params.onHover?.({
          ...next.data.data,
          depth: next.depth,
          event,
          target: next.cellNode
        });
      };

      const cellSelection = this.voronoiGroup.selectAll('path.vb-cell[data-depth="3"]');
      if (this._hasExplicitOnHover) {
        cellSelection
          .on("mouseenter", (event, d) => setHoveredCell(d, event))
          .on("mouseleave", (event, d) => {
            if (this._hoveredCell === d) setHoveredCell(null, event);
          });
      }

      if (this._hasExplicitOnClick) {
        cellSelection.on("click", (event, d) => {
          const area = d3.select(event.currentTarget);
          const clicked = area.classed("vb-clicked");
          this.voronoiGroup.select(".vb-clicked").classed("vb-clicked", false);
          area.classed("vb-clicked", !clicked);
          this.params.onClick(clicked ? "" : { ...d.data, event, d, clickArea: area });
        });
      }

      cellSelection.style("cursor", this._hasExplicitOnClick || this._hasExplicitOnHover ? "pointer" : null);
    }

    _applyHoverVisualMode() {
      const leafCount = this.allNodes.filter((d) => d.depth === 3).length;
      this.svg.classed("vb-hover-enabled", leafCount <= this.params.hoverVisualLimit);
    }

    _drawCellImages() {
      const { cellImage } = this.params;
      if (!cellImage) return;

      const depth3 = this.allNodes.filter((d) => d.depth === 3);
      if (!depth3.length) return;

      let defs = this.svg.select("defs");
      if (defs.empty()) defs = this.svg.insert("defs", ":first-child");

      depth3.forEach((d) => {
        const imgOpts = cellImage(d.data.data ?? d.data);
        if (!imgOpts || !imgOpts.url) return;

        const { url, mode = "fill", opacity = 1, colorMode = "original" } = imgOpts;
        const id = `vb-cell-img-${d.id}`.replace(/[^a-zA-Z0-9-_]/g, "_");
        const polygon = d.polygon;
        const xs = polygon.map((p) => p[0]);
        const ys = polygon.map((p) => p[1]);
        const bx = Math.min(...xs), by = Math.min(...ys);
        const bw = Math.max(...xs) - bx, bh = Math.max(...ys) - by;

        const clipId = `${id}-clip`;
        const clip = defs.append("clipPath").attr("id", clipId);
        clip.append("path").attr("d", "M" + polygon.join("L") + "Z");

        let filterAttr = null;
        if (colorMode === "tint") {
          const filterId = `${id}-tint`;
          const filter = defs.append("filter")
            .attr("id", filterId)
            .attr("x", "0%").attr("y", "0%")
            .attr("width", "100%").attr("height", "100%")
            .attr("color-interpolation-filters", "sRGB");
          filter.append("feColorMatrix").attr("type", "saturate").attr("values", "0").attr("result", "gray");
          filter.append("feFlood").attr("flood-color", d.color).attr("flood-opacity", "1").attr("result", "color");
          filter.append("feBlend").attr("in", "color").attr("in2", "gray").attr("mode", "multiply").attr("result", "tinted");
          filter.append("feComposite").attr("in", "tinted").attr("in2", "SourceGraphic").attr("operator", "in");
          filterAttr = `url(#${filterId})`;
        }

        let imgX = bx, imgY = by, imgW = bw, imgH = bh;
        if (mode === "fit") {
          const side = Math.min(bw, bh) * 0.8;
          imgX = bx + (bw - side) / 2;
          imgY = by + (bh - side) / 2;
          imgW = side; imgH = side;
        }

        const imgEl = this.voronoiGroup.append("image")
          .attr("href", url)
          .attr("x", imgX).attr("y", imgY)
          .attr("width", imgW).attr("height", imgH)
          .attr("preserveAspectRatio", mode === "fit" ? "xMidYMid meet" : "xMidYMid slice")
          .attr("clip-path", `url(#${clipId})`)
          .attr("opacity", opacity)
          .attr("pointer-events", "none");

        if (filterAttr) imgEl.attr("filter", filterAttr);
      });
    }

    _drawLabels() {
      this._drawRegionLabels();
      this._drawBigClusterLabels();
      this._drawSectorLabels();
      this._drawPopLabels();
    }

    _buildLabelCache() {
      // Build lookup maps for fast label access during hover events
      this._subgroupLabelCache = new Map();
      this._itemLabelCache = new Map();

      // Cache subgroup labels with their ratio values
      this.bigLabelsGroup.selectAll("[data-subgroup]").nodes().forEach((node) => {
        const key = node.getAttribute("data-subgroup");
        if (key) {
          const selection = d3.select(node);
          selection._cachedRatio = parseFloat(node.getAttribute("data-ratio")) || 0;
          this._subgroupLabelCache.set(key, selection);
        }
      });

      // Cache item labels with their ratio values
      this.labelsGroup.selectAll("[data-item]").nodes().forEach((node) => {
        const key = node.getAttribute("data-item");
        if (key) {
          const selection = d3.select(node);
          selection._cachedRatio = parseFloat(node.getAttribute("data-ratio")) || 0;
          this._itemLabelCache.set(key, selection);
        }
      });
    }

    _drawRegionLabels() {
      const { showGroupLabel, renderGroupLabel } = this.params;

      const regionNodes = this.allNodes.filter((d) => d.depth === 1);

      // If custom renderer exists, use foreignObject
      if (renderGroupLabel) {
        this.regionLabelsGroup
          .selectAll("foreignObject")
          .data(regionNodes)
          .enter()
          .append("foreignObject")
          .attr("class", "vb-group-label-html")
          .attr("data-group", (d) => d.data.key)
          .attr("width", (d) => {
            const bounds = VoronoiBubbleHelpers.getPolygonBounds(d.polygon);
            const width = bounds.maxX - bounds.minX;
            return width * 0.6;
          })
          .attr("height", (d) =>
            VoronoiBubbleHelpers.estimateLabelHeight(this, d, 1.3)
          )
          .attr("x", (d) => {
            if (!d.polygon?.site) return 0;
            const bounds = VoronoiBubbleHelpers.getPolygonBounds(d.polygon);
            const width = bounds.maxX - bounds.minX;
            return d.polygon.site.x - (width * 0.6) / 2;
          })
          .attr(
            "y",
            (d) => {
              if (!d.polygon?.site) return 0;
              return d.polygon.site.y -
                VoronoiBubbleHelpers.estimateLabelHeight(this, d, 1.3) * 0.4 +
                VoronoiBubbleHelpers.getLabelHeightOffset(this, d);
            }
          )
          .style("opacity", showGroupLabel || this.params.showPercent ? 1 : 0)
          .style("pointer-events", "none")
          .style("overflow", "visible")
          .append("xhtml:div")
          .style("width", "100%")
          .style("height", "100%")
          .style("display", "flex")
          .style("align-items", "center")
          .style("justify-content", "center")
          .html((d) => {
            const defaultHtml = VoronoiBubbleHelpers.multiline(d.data.key);
            const context = VoronoiBubbleHelpers.createLabelContext(this, d, 1);
            return renderGroupLabel(d, defaultHtml, context);
          });
      } else {
        // Default text rendering
        this.regionLabelsGroup
          .selectAll("text")
          .data(regionNodes)
          .enter()
          .append("text")
          .attr("class", "vb-group-label")
          .attr("text-anchor", "start")
          .attr("ratio", (d) => d.value / d.parent.value)
          .style(
            "font-size",
            (d) =>
              VoronoiBubbleHelpers.fontScale(this.hierarchy, d) * this.params.groupLabelScale + "em"
          )
          .style("fill-opacity", showGroupLabel || this.params.showPercent ? 1 : 0)
          .style("stroke-opacity", showGroupLabel || this.params.showPercent ? 0.85 : 0)
          .style(
            "stroke",
            (d) => `${VoronoiBubbleHelpers.getHSLColor(d.color, 0, -0.05, -0.2)}`
          )
          .attr("paint-order", "stroke")
          .attr(
            "transform",
            (d) => {
              if (!d.polygon?.site) return `translate(0,0)`;
              return `translate(${[
              d.polygon.site.x,
              d.polygon.site.y +
                VoronoiBubbleHelpers.getLabelHeightOffset(this, d)
            ]})`;
            }
          )
          .html((d) => {
            const label = VoronoiBubbleHelpers.multiline(d.data.key);
            if (!this.params.showPercent) return label;
            // Percent goes on an extra line inside the same <text>, so it always
            // shares the label's font. Positioned one line below the last row.
            const [, lines] = VoronoiBubbleHelpers.multiline(d.data.key, true);
            const pct = d3.format(".0%")(d.value / this.totalValue);
            return label +
              `<tspan x="0" y="${-lines / 2 + lines + 1.1}em" text-anchor="middle">` +
              `<tspan font-size="76%">${pct}</tspan></tspan>`;
          });
      }
    }

    _drawBigClusterLabels() {
      const { ratioLimit, renderSubgroupLabel } = this.params;

      const bigClusterNodes = this.allNodes.filter((d) => d.depth === 2);

      // If custom renderer exists, use foreignObject
      if (renderSubgroupLabel) {
        this.bigLabelsGroup
          .selectAll("foreignObject")
          .data(bigClusterNodes)
          .enter()
          .append("foreignObject")
          .attr("class", "vb-subgroup-label-html")
          .attr("data-subgroup", (d) => d.data.key)
          .attr("data-value", (d) => d.value)
          .attr("data-ratio", (d) => d.value / this.totalValue)

          .attr("width", (d) => {
            const bounds = VoronoiBubbleHelpers.getPolygonBounds(d.polygon);
            const width = bounds.maxX - bounds.minX;
            return width * 0.6;
          })
          .attr("height", (d) =>
            VoronoiBubbleHelpers.estimateLabelHeight(this, d, 1.2)
          )
          .attr("x", (d) => {
            if (!d.polygon?.site) return 0;
            const bounds = VoronoiBubbleHelpers.getPolygonBounds(d.polygon);
            const width = bounds.maxX - bounds.minX;
            return d.polygon.site.x - (width * 0.6) / 2;
          })
          .attr(
            "y",
            (d) => {
              if (!d.polygon?.site) return 0;
              return d.polygon.site.y -
                VoronoiBubbleHelpers.estimateLabelHeight(this, d, 1.2) * 0.45 +
                VoronoiBubbleHelpers.getLabelHeightOffset(this, d);
            }
          )
          .attr("opacity", (d) =>
            d.value / this.totalValue >= ratioLimit ? 1 : 0
          )
          .style("pointer-events", "none")
          .style("overflow", "visible")
          .append("xhtml:div")
          .style("width", "100%")
          .style("height", "100%")
          .style("display", "flex")
          .style("align-items", "center")
          .style("justify-content", "center")
          .html((d) => {
            const fontEm = VoronoiBubbleHelpers.fontScale(this.hierarchy, d) * this.params.subgroupLabelScale;
            const defaultHtml = VoronoiBubbleHelpers.phraseByCell(d.data.key, this.hierarchy, d, fontEm);
            const context = VoronoiBubbleHelpers.createLabelContext(this, d, 2);
            return renderSubgroupLabel(d, defaultHtml, context);
          });
      } else {
        // Default text rendering
        this.bigLabelsGroup
          .selectAll("text")
          .data(bigClusterNodes)
          .enter()
          .append("text")
          .attr("class", "vb-subgroup-label")
          .attr("data-subgroup", (d) => d.data.key)
          .attr("text-anchor", "start")
          .attr("data-value", (d) => d.value)
          .attr("data-ratio", (d) => d.value / this.totalValue)
          .style(
            "font-size",
            (d) => VoronoiBubbleHelpers.fontScale(this.hierarchy, d) * this.params.subgroupLabelScale + "em"
          )
          .attr("paint-order", "stroke")
          .style("fill", (d) =>
            VoronoiBubbleHelpers.colorVar2(d.parent.color, 0, 0.2, -0.2)
          )
          .attr(
            "transform",
            (d) => {
              if (!d.polygon?.site) return `translate(0,0)`;
              return `translate(${[
              d.polygon.site.x,
              d.polygon.site.y +
                VoronoiBubbleHelpers.getLabelHeightOffset(this, d)
            ]})`;
            }
          )
          .html((d) => {
            const fontEm = VoronoiBubbleHelpers.fontScale(this.hierarchy, d) * this.params.subgroupLabelScale;
            return VoronoiBubbleHelpers.phraseByCell(d.data.key, this.hierarchy, d, fontEm);
          })
          .attr("opacity", (d) =>
            d.value / this.totalValue >= ratioLimit ? 1 : 0
          );
      }

      // onSubgroupLabelHover: when set, depth-2 (subgroup) labels receive hover
      // events so a consumer can show a description. Labels are normally
      // pointer-events:none so clicks fall through to the cell behind them; we
      // preserve that by forwarding label clicks to the underlying cell (the
      // label itself only reacts to hover).
      const { onSubgroupLabelHover } = this.params;
      if (onSubgroupLabelHover) {
        const payloadOf = (d, e, node) => ({
          ...(d.data?.data || {}),
          subgroup: d.data.key,
          key: d.data.key,
          depth: d.depth,
          event: e,
          target: node,
        });
        this.bigLabelsGroup
          .selectAll("foreignObject.vb-subgroup-label-html, text.vb-subgroup-label")
          .style("pointer-events", "all")
          .style("cursor", "default")
          .on("mouseenter", function (e, d) { onSubgroupLabelHover(payloadOf(d, e, this)); })
          .on("mouseleave", function () { onSubgroupLabelHover(null); })
          .on("click", function (e) {
            // Hover-only label: forward the click to the cell behind it.
            this.style.pointerEvents = "none";
            const under = document.elementFromPoint(e.clientX, e.clientY);
            this.style.pointerEvents = "all";
            if (under && under !== this) {
              under.dispatchEvent(new MouseEvent("click", {
                bubbles: true, cancelable: true, view: window,
                clientX: e.clientX, clientY: e.clientY,
              }));
            }
          });
      }
    }

    _drawSectorLabels() {
      const { underLabel, ratioLimit } = this.params;

      this.labelsGroup
        .selectAll("text")
        .data(this.allNodes.filter((d) => d.depth === 3))
        .enter()
        .append("text")
        .attr("class", "vb-item-label")
        .attr("data-id", (d) => d.id)
        .attr("data-item", (d) => d.data.key)
        .attr("data-full-text", (d) => d.data.key)
        .attr("data-font-em", (d) => VoronoiBubbleHelpers.fontScale2(this.hierarchy, d))
        .attr("data-cell-w", (d) => {
          const xs = d.polygon.map(p => p[0]);
          return Math.max(...xs) - Math.min(...xs);
        })
        .attr("data-cell-h", (d) => {
          const ys = d.polygon.map(p => p[1]);
          return Math.max(...ys) - Math.min(...ys);
        })
        .attr("data-value", (d) => d.value)
        .attr("data-ratio", (d) => d.value / this.totalValue)
        .attr("text-anchor", "start")
        .style(
          "font-size",
          (d) => VoronoiBubbleHelpers.fontScale2(this.hierarchy, d) + "em"
        )
        .style("fill", (d) =>
          VoronoiBubbleHelpers.getHSLColor(d.color, 0, -0.1, -0.3)
        )
        .attr("transform", (d) => {
          if (!d.polygon?.site) return `translate(0,0)`;
          return underLabel
            ? `translate(${[
              d.polygon.site.x,
              d.polygon.site.y +
                VoronoiBubbleHelpers.fontScale1(
                  this.hierarchy,
                  d.data.data.subgroup,
                  d.parent.value
                ) *
                  8 *
                  (VoronoiBubbleHelpers.multiline(
                    d.data.data.subgroup,
                    true
                  )[1] +
                    0.5)
            ]})`
            : `translate(${VoronoiBubbleHelpers.getLabelPos(this, d)})`;
        })
        .html((d) => {
          const { text, charsPerLine } = VoronoiBubbleHelpers.truncateByCell(d.data.key, this.hierarchy, d);
          return VoronoiBubbleHelpers.multiline(text, false, charsPerLine, 1.4);
        })
        .attr("opacity", (d) => (d.value / this.totalValue > ratioLimit ? 1 : 0));
    }

    _drawPopLabels() {
      const { sizeLimit } = this.params;

      this.popLabelsGroup
        .selectAll("text")
        .data(this.allNodes.filter((d) => d.depth === 3))
        .enter()
        .append("text")
        .attr("class", "vb-item-value")
        .attr("data-id", (d) => d.id)
        .attr("text-anchor", "middle")
        .style(
          "font-size",
          (d) => VoronoiBubbleHelpers.fontScale2(this.hierarchy, d) * 0.8 + "em"
        )
        .attr(
          "data-item",
          (d) => d.data.data.item ?? d.data.data.subgroup
        )
        .attr(
          "transform",
          (d) => {
            if (!d.polygon?.site) return `translate(0,0)`;
            return `translate(${[
            d.polygon.site.x,
            d.polygon.site.y + VoronoiBubbleHelpers.varFontScale(this, d)
          ]})`;
          }
        )
        .text((d) => VoronoiBubbleHelpers.bigFormat(d.data.values[0].size))
        .attr("opacity", (d) => (d.value > sizeLimit ? 1 : 0));
    }

    // === 4. Post-processing and Effects Methods ===

    _applyPostEffects() {
      const { showGroupLabel, pebbleRound, pebbleWidth } = this.params;

      if (showGroupLabel) {
        this.labelAdjuster.adjust(this.svg.node(), { verticalSpacing: 0 });
      }

      this.pebbleRenderer.render(
        this.svg.node(),
        pebbleRound,
        pebbleWidth,
        VoronoiBubbleHelpers.colorVar.bind(VoronoiBubbleHelpers)
      );
    }

    _applyLabelMode(opacity) {
      const { labelMode } = this.params;
      const op = opacity !== undefined ? opacity
        : labelMode === 'show' ? 1
        : labelMode === 'faded' ? 0.6
        : 0;
      this.svg.selectAll('.vb-item-labels tspan').style('opacity', op);
      this.svg.selectAll('.vb-cell[data-depth="3"]').style('stroke-opacity', op);
    }

    _setupZoom() {
      const svg = this.svg;
      const zoomGroup = this.zoomGroup;
      const baseFontPx = 16;
      let lastK = 1;

      const zoom = d3.zoom()
        .scaleExtent([1, 12])
        // Zoom/pan only while the Option/Alt key is held. Touch events (mobile)
        // carry no altKey, so they never pass — this also disables zoom on mobile.
        // dblclick-to-reset is a separate custom listener below, unaffected by this.
        .filter((event) => event.altKey && !event.button)
        .constrain((transform) => {
          const { k } = transform;
          if (k <= 1) return d3.zoomIdentity;
          // Allow panning so chart edges can reach viewport edges
          // (margin offsets are absorbed by chartGroup's static transform)
          const xMin = Math.min(0, this.params.width - this.margin.left - k * this.width);
          const yMin = Math.min(0, this.params.height - this.margin.top - k * this.height);
          const x = Math.max(xMin, Math.min(0, transform.x));
          const y = Math.max(yMin, Math.min(0, transform.y));
          return new transform.constructor(k, x, y);
        })
        .on('zoom', (event) => {
          const { x, y, k } = event.transform;
          zoomGroup.attr('transform', `translate(${x},${y}) scale(${k})`);

          // phase 1 (k≤growMax): text grows with zoom
          // phase 2 (k>growMax): text held at growMax screen size, char count grows instead
          const growMax = 2;
          const textScale = k <= growMax ? 1 : growMax / k;

          // labelMode: fade in labels/borders as zoom increases
          const modeOpacity = this.params.labelMode === 'show' ? 1
            : this.params.labelMode === 'faded' ? 0.6
            : 0;
          const zoomOpacity = modeOpacity + (1 - modeOpacity) * Math.min(1, k - 1);
          svg.selectAll('.vb-item-labels tspan').style('opacity', zoomOpacity);
          svg.selectAll('.vb-cell[data-depth="3"]').style('stroke-opacity', zoomOpacity);

          // keep stroke visually thin as zoom increases
          svg.selectAll('.vb-cell[data-depth="3"]').style('stroke-width', `${0.5 / k}px`);
          svg.selectAll('.vb-cell[data-depth="2"]').style('stroke-width', `${0.7 / k}px`);
          svg.selectAll('.vb-cell[data-depth="1"]').style('stroke-width', `${1.5 / k}px`);
          svg.selectAll('text.vb-item-label, text.vb-subgroup-label, .vb-group-labels text, .vb-subgroup-labels text')
            .attr('transform', function() {
              const el = d3.select(this);
              const orig = el.attr('data-orig-transform') || el.attr('transform') || 'translate(0,0)';
              if (!el.attr('data-orig-transform')) el.attr('data-orig-transform', orig);
              return `${orig} scale(${textScale})`;
            });

          svg.selectAll('foreignObject.vb-group-label-html, foreignObject.vb-subgroup-label-html')
            .each(function() {
              const fo = d3.select(this);
              if (!fo.attr('data-orig-x')) {
                fo.attr('data-orig-x', fo.attr('x') || '0')
                  .attr('data-orig-y', fo.attr('y') || '0')
                  .attr('data-orig-w', fo.attr('width') || '0')
                  .attr('data-orig-h', fo.attr('height') || '0');
              }
              const cx = parseFloat(fo.attr('data-orig-x')) + parseFloat(fo.attr('data-orig-w')) / 2;
              const cy = parseFloat(fo.attr('data-orig-y')) + parseFloat(fo.attr('data-orig-h')) / 2;
              fo.attr('transform', `translate(${cx * (1 - textScale)},${cy * (1 - textScale)}) scale(${textScale})`);
            });

          // re-truncate text elements when zoom level changes by >20%
          if (Math.abs(k - lastK) / lastK > 0.2) {
            lastK = k;
            svg.selectAll('text.vb-item-label[data-full-text]').each(function() {
              const el = d3.select(this);
              const fullText = el.attr('data-full-text');
              const cellW = parseFloat(el.attr('data-cell-w') || 0);
              const cellH = parseFloat(el.attr('data-cell-h') || 0);
              const fontEm = parseFloat(el.attr('data-font-em') || 0.7);
              const fontPx = fontEm * baseFontPx;
              const isLatin = !/[^\x00-\x7F]/.test(fullText);
              const charPx = isLatin ? fontPx * 0.55 : fontPx;
              // text-to-cell ratio scales by 1/textScale; identical to base in phase 1
              const charsPerLine = Math.max(1, Math.floor((cellW * 0.6) / (charPx * textScale)));
              const linesFit = Math.max(1, Math.floor(cellH / (fontPx * 1.4 * textScale)));
              const limit = Math.max(5, Math.min(fullText.length, charsPerLine * linesFit));
              const truncated = fullText.length <= limit ? fullText : fullText.slice(0, limit) + '…';
              el.html(VoronoiBubbleHelpers.multiline(truncated, false, charsPerLine, 1.4));
            });
          }
        });

      svg.call(zoom);

      // snap to origin when zoomed out to minimum
      zoom.on('end', (event) => {
        if (event.transform.k <= 1) {
          svg.transition().duration(120).call(zoom.transform, d3.zoomIdentity);
        }
      });

      // double-click to reset
      svg.on('dblclick.zoom', () => {
        svg.transition().duration(200).call(zoom.transform, d3.zoomIdentity);
      });
    }
  }

  // Copyright (c) 2025 UXtechLab.
  // Originally created by @taekie. Released under the MIT License. See LICENSE for details.
  /**
   * Voronoi Popup Utility
   *
   * Displays a popup/tooltip for clicked voronoi cells.
   * Handles positioning, template formatting, and cleanup.
   */

  /**
   * Show a popup for a clicked voronoi cell
   *
   * @param {Object} clicked - The clicked cell data object
   * @param {Object} clicked.clickArea - D3 selection of the clicked path
   * @param {string} clicked.key - The key/label of the clicked cell
   * @param {Object} [clicked.data] - Additional data associated with the cell
   * @param {Object} [options] - Popup configuration options
   * @param {string} [options.format="{item}"] - Template string for popup content (e.g., "{key}: {value}")
   * @param {string} [options.popupId="vb-popup"] - DOM ID for the popup element
   * @param {string} [options.className="vb-popup"] - CSS class for the popup
   * @param {Function} [options.onClose] - Callback function when popup is closed
   * @returns {HTMLElement|undefined} The created popup element, or undefined if no popup was created
   */
  function showVoronoiPopup(clicked, options = {}) {
    const {
      format = "{item}",
      popupId = "vb-popup",
      className = "vb-popup",
      onClose = null
    } = options;

    // Remove existing popup
    const existingPopup = document.getElementById(popupId);
    if (existingPopup) existingPopup.remove();

    // Exit if no clicked data
    if (!clicked || !clicked.clickArea) {
      if (onClose) onClose();
      return;
    }

    const clickedPath = clicked.clickArea.node();
    const svgElement = clickedPath.ownerSVGElement;
    if (!svgElement) return;

    // === Calculate position in page coordinates (unaffected by container zoom) ===
    // Get the path's bounding box in SVG coordinate space
    const pathBBox = clickedPath.getBBox();

    // Calculate cell center in SVG coordinates
    const svgCenterX = pathBBox.x + pathBBox.width / 2;
    const svgCenterY = pathBBox.y + pathBBox.height / 2;

    // Convert SVG coordinates to screen (page) coordinates
    // This handles all transformations including zoom, scale, translate
    // getBBox() is in the path's OWN user space, so the CTM must be the path's —
    // svgElement.getScreenCTM() misses every ancestor transform (margin translate, zoom).
    const svgPoint = svgElement.createSVGPoint();
    svgPoint.x = svgCenterX;
    svgPoint.y = svgCenterY;
    const screenPoint = svgPoint.matrixTransform(clickedPath.getScreenCTM());

    // Use screen coordinates directly (relative to viewport)
    const x = screenPoint.x + window.scrollX;
    const y = screenPoint.y + window.scrollY;

    // Space above the cell (popup placement is decided after measuring its height)
    const spaceAbove = screenPoint.y;

    // === Template substitution ===
    // Gather fields from every place the row may live: clicked's own top-level
    // (the library spreads the leaf's d.data here), clicked.data, and the d3 node's
    // depth-3 .data/.raw. Later spreads win, so the original row takes precedence.
    const node = clicked.d;
    const data = {
      ...clicked,
      key: clicked.key,
      ...(clicked.data || {}),
      ...(clicked.data?.data || {}),
      ...(node?.data?.data || {}),
      ...(node?.data?.raw?.[0] || {}),
      ...(node?.parent?.data?.data || {}),
      ...(node?.parent?.data?.raw?.[0] || {})
    };

    let content = format
      .replace(/\{(\w+)\}/g, (match, field) => {
        const val = data[field];
        return val !== undefined && val !== null ? String(val) : match;
      })
      .replace(/\\n/g, "<br>")
      .replace(/\n/g, "<br>");

    // === Create popup ===
    const popup = document.createElement("div");
    popup.id = popupId;
    popup.className = className;

    Object.assign(popup.style, {
      position: "absolute",
      left: "-9999px", // Render off-screen for size measurement
      top: "0px",
      zIndex: "1000"
    });

    popup.innerHTML = `<div class="vb-popup-content">
    <div class="vb-popup-message">${content}</div>
  </div>`;

    // Append to body (not container) to avoid zoom/transform effects
    document.body.appendChild(popup);

    // Measure size using offsetWidth/offsetHeight (synchronous)
    const popupWidth = popup.offsetWidth;
    const popupHeight = popup.offsetHeight;

    // Prefer placing the popup ABOVE the cell (conventional tooltip position).
    // Only drop below when it wouldn't fit above (would be clipped at the top).
    const gap = 10;
    const placeBelow = spaceAbove < popupHeight + gap;
    popup.classList.add(placeBelow ? "vb-popup-below" : "vb-popup-above");

    // Calculate horizontal position with boundary check
    let finalX = x - popupWidth / 2;
    const padding = 10; // Minimum padding from edges

    // Keep popup within viewport bounds (horizontal)
    if (finalX < padding) {
      finalX = padding;
    } else if (finalX + popupWidth > window.innerWidth - padding) {
      finalX = window.innerWidth - popupWidth - padding;
    }

    // Calculate vertical position
    const finalY = placeBelow ? y + 5 : y - 5 - popupHeight;

    // Set final position (fixed to page, not container)
    popup.style.left = `${finalX}px`;
    popup.style.top = `${finalY}px`;

    // === Outside click/touch handler (mobile-friendly) ===
    const handler = (e) => {
      if (!popup.contains(e.target) && !svgElement.contains(e.target)) {
        popup.remove();
        document.removeEventListener("click", handler);
        document.removeEventListener("touchstart", handler);
        const clickedCell = svgElement.querySelector("path.vb-clicked");
        if (clickedCell) clickedCell.classList.remove("vb-clicked");
        if (onClose) onClose();
      }
    };
    setTimeout(() => {
      document.addEventListener("click", handler);
      document.addEventListener("touchstart", handler); // Mobile support
    }, 10);

    return popup;
  }

  // Copyright (c) 2025 UXtechLab.
  // Originally created by @taekie. Released under the MIT License. See LICENSE for details.
  /**
   * VoronoiBubble Library
   * Main entry point - exports VoronoiBubble as default and helpers as named exports
   *
   * This module will be the public API surface for the library.
   * Consumers can import like:
   *   import VoronoiBubble from '@pxd-uxtech/voronoi-bubble';
   *   import { VoronoiBubble, nestingForVoronoi, VoronoiBubbleHelpers } from '@pxd-uxtech/voronoi-bubble';
   *   import { showVoronoiPopup, createDOMPopup } from '@pxd-uxtech/voronoi-bubble';
   */

  exports.LabelAdjuster = LabelAdjuster;
  exports.PebbleRenderer = PebbleRenderer;
  exports.VoronoiBubble = VoronoiBubble;
  exports.VoronoiBubbleHelpers = VoronoiBubbleHelpers;
  exports.createDOMPopup = createDOMPopup;
  exports.default = VoronoiBubble;
  exports.getBubbleStyles = getBubbleStyles;
  exports.getPopupStyles = getPopupStyles;
  exports.nestingForVoronoi = nestingForVoronoi;
  exports.showVoronoiPopup = showVoronoiPopup;
  exports.showVoronoiPopupLegacy = showVoronoiPopup$1;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=voronoi-bubble.umd.js.map
