---
layout: post.njk
title: "Interactive Demo: Circle Packing with D3.js"
date: 2025-01-20
summary: "An interactive visualization of circle packing using D3.js, embedded directly in a Markdown post."
tags: [posts, visualizations, d3]
---

This post demonstrates how to embed a JavaScript-based interactive visualization directly in a blog post. The demo below uses [D3.js](https://d3js.org/) to animate a circle packing layout.

The mathematics behind circle packing connects to the **Apollonian gasket** and the Descartes Circle Theorem. For four mutually tangent circles with curvatures $k_1, k_2, k_3, k_4$, Descartes showed:

$$\left(k_1 + k_2 + k_3 + k_4\right)^2 = 2\left(k_1^2 + k_2^2 + k_3^2 + k_4^2\right)$$

## Live Demo

Click **Regenerate** to produce a new random packing.

<div class="demo-container">
  <svg id="circle-pack-svg" width="100%" viewBox="0 0 500 400"></svg>
  <div style="text-align:center; margin-top:0.75rem;">
    <button class="btn" onclick="generatePacking()">Regenerate</button>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"></script>
<script>
const svg = d3.select("#circle-pack-svg");
const W = 500, H = 400;

function generatePacking() {
  svg.selectAll("*").remove();

  const n = Math.floor(Math.random() * 30) + 20;
  const data = { name: "root", children: Array.from({ length: n }, (_, i) => ({
    name: String(i),
    value: Math.random() * 80 + 10
  }))};

  const pack = d3.pack().size([W - 4, H - 4]).padding(3);
  const root = d3.hierarchy(data).sum(d => d.value);
  pack(root);

  const color = d3.scaleOrdinal(d3.schemeTableau10);

  svg.selectAll("circle")
    .data(root.leaves())
    .join("circle")
    .attr("cx", d => d.x + 2)
    .attr("cy", d => d.y + 2)
    .attr("r", 0)
    .attr("fill", (_, i) => color(i % 10))
    .attr("fill-opacity", 0.7)
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5)
    .transition().duration(600)
    .attr("r", d => d.r);
}

generatePacking();
</script>

## How to Embed Your Own Visualization

To add an interactive demo to any post, follow this pattern:

```html
<!-- 1. An HTML container -->
<div class="demo-container">
  <canvas id="my-canvas" width="500" height="400"></canvas>
</div>

<!-- 2. Load your library from CDN -->
<script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"></script>

<!-- 3. Your visualization code -->
<script>
  // Write vanilla JS here. The DOM is ready.
  const canvas = document.getElementById("my-canvas");
  // ...
</script>
```

The `.demo-container` CSS class adds a subtle border and handles overflow for you. No build step or bundler is needed — just drop the script tags into your Markdown.
