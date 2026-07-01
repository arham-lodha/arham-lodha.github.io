(() => {
  const TAU = Math.PI * 2;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  const colors = {
    ink: "#171512",
    muted: "#676052",
    faint: "#8a806f",
    paper: "#fbf6e8",
    surface: "#f3ead8",
    border: "#d7cab2",
    accent: "#9f2f20",
    blue: "#2f6f9f",
    green: "#6f8068",
    red: "#b44134",
    purple: "#7d5698",
    fillBlue: "rgba(47, 111, 159, 0.18)",
    edge: "rgba(23, 21, 18, 0.17)",
    edgeStrong: "rgba(23, 21, 18, 0.36)",
    node: "#fffdf2",
  };

  function cssVar(name, fallback) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
  }

  function canvasTheme() {
    const dark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return {
      dark,
      ink: cssVar("--color-text", colors.ink),
      muted: cssVar("--color-muted", colors.muted),
      faint: cssVar("--color-faint", colors.faint),
      paper: cssVar("--color-paper", colors.paper),
      bg: cssVar("--color-bg", "#fffdf2"),
      surface: cssVar("--color-surface", colors.surface),
      border: cssVar("--color-border", colors.border),
      edge: dark ? "rgba(232, 225, 210, 0.16)" : colors.edge,
      edgeStrong: dark ? "rgba(232, 225, 210, 0.32)" : colors.edgeStrong,
      node: dark ? cssVar("--color-bg", "#161412") : colors.node,
      nodeHalo: dark ? "#29241d" : colors.node,
      palette: dark
        ? ["#76abd1", "#e07a63", "#9cad87", "#c7a4d8"]
        : [colors.blue, colors.accent, colors.green, colors.purple],
      heatLow: dark ? [41, 36, 29] : [246, 239, 222],
      heatMid: dark ? [66, 106, 130] : [93, 139, 163],
      heatHigh: dark ? [184, 93, 76] : [143, 47, 32],
    };
  }

  const presets = {
    constant: {
      label: "Constant",
      fn: () => 0.32,
    },
    twoBlock: {
      label: "Two blocks",
      fn: (x, y) => (Math.floor(x * 2) === Math.floor(y * 2) ? 0.78 : 0.08),
    },
    threeBlock: {
      label: "Three blocks",
      fn: (x, y) => {
        const a = Math.min(2, Math.floor(x * 3));
        const b = Math.min(2, Math.floor(y * 3));
        if (a === b) return 0.78;
        return 0.06 + 0.04 * ((a + b) % 2);
      },
    },
    smooth: {
      label: "Smooth",
      fn: (x, y) => clamp(0.08 + 0.68 * Math.exp(-4.2 * Math.abs(x - y)) + 0.12 * Math.sin(Math.PI * x) * Math.sin(Math.PI * y), 0, 1),
    },
  };

  function clamp(value, lo, hi) {
    return Math.max(lo, Math.min(hi, value));
  }

  function makeCanvas(className, label) {
    const canvas = document.createElement("canvas");
    canvas.className = className || "";
    if (label) canvas.setAttribute("aria-label", label);
    return canvas;
  }

  function fitCanvas(canvas, cssWidth, cssHeight) {
    canvas.style.width = cssWidth + "px";
    canvas.style.height = cssHeight + "px";
    canvas.width = Math.round(cssWidth * DPR);
    canvas.height = Math.round(cssHeight * DPR);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    return ctx;
  }

  function ensureCanvas(canvas, cssWidth, cssHeight) {
    const targetWidth = Math.round(cssWidth * DPR);
    const targetHeight = Math.round(cssHeight * DPR);
    canvas.style.width = cssWidth + "px";
    canvas.style.height = cssHeight + "px";
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    return ctx;
  }

  function canvasWidth(container, fallback) {
    return Math.max(260, Math.round(container.getBoundingClientRect().width || fallback || 520));
  }

  function heatColor(t, theme = canvasTheme()) {
    const v = clamp(t, 0, 1);
    const low = theme.heatLow;
    const mid = theme.heatMid;
    const high = theme.heatHigh;
    const a = v < 0.55 ? low : mid;
    const b = v < 0.55 ? mid : high;
    const p = v < 0.55 ? v / 0.55 : (v - 0.55) / 0.45;
    const r = Math.round(a[0] + (b[0] - a[0]) * p);
    const g = Math.round(a[1] + (b[1] - a[1]) * p);
    const bl = Math.round(a[2] + (b[2] - a[2]) * p);
    return `rgb(${r}, ${g}, ${bl})`;
  }

  function drawHeatmap(canvas, fn, options = {}) {
    const size = options.size || 240;
    const theme = canvasTheme();
    const ctx = fitCanvas(canvas, size, size);
    const cells = options.cells || 80;
    const cell = size / cells;
    ctx.clearRect(0, 0, size, size);
    for (let i = 0; i < cells; i++) {
      for (let j = 0; j < cells; j++) {
        const x = (i + 0.5) / cells;
        const y = (j + 0.5) / cells;
        ctx.fillStyle = heatColor(fn(x, y), theme);
        ctx.fillRect(i * cell, (cells - 1 - j) * cell, Math.ceil(cell) + 0.5, Math.ceil(cell) + 0.5);
      }
    }
    if (options.guides) {
      ctx.strokeStyle = theme.dark ? "rgba(232,225,210,0.22)" : "rgba(23,21,18,0.24)";
      ctx.lineWidth = 1;
      options.guides.forEach((g) => {
        const p = g * size;
        ctx.beginPath();
        ctx.moveTo(p, 0);
        ctx.lineTo(p, size);
        ctx.moveTo(0, size - p);
        ctx.lineTo(size, size - p);
        ctx.stroke();
      });
    }
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, size - 1, size - 1);
  }

  function graphEdges(labels, fn) {
    const edges = [];
    for (let i = 0; i < labels.length; i++) {
      for (let j = 0; j < i; j++) {
        if (Math.random() < fn(labels[i], labels[j])) edges.push([i, j]);
      }
    }
    return edges;
  }

  function seededRandom(seed) {
    let x = seed >>> 0;
    return () => {
      x = (1664525 * x + 1013904223) >>> 0;
      return x / 4294967296;
    };
  }

  function groupForPreset(label, preset) {
    if (preset === "twoBlock") return Math.min(1, Math.floor(label * 2));
    if (preset === "threeBlock") return Math.min(2, Math.floor(label * 3));
    if (preset === "smooth") return Math.min(2, Math.floor(label * 3));
    return 0;
  }

  function nodeColor(group, theme = canvasTheme()) {
    return theme.palette[group % 4];
  }

  function graphonGuidesForPreset(preset) {
    if (preset === "twoBlock") return [0.5];
    if (preset === "threeBlock") return [1 / 3, 2 / 3];
    return [];
  }

  function forceLayout(labels, edges, width, height, options = {}) {
    const n = labels.length;
    const groups = options.groups || labels.map((x) => Math.floor(x * 3));
    const nodes = labels.map((label, i) => {
      const group = groups[i];
      const angle = TAU * ((i * 0.61803398875) % 1);
      const cx = width * (0.22 + 0.28 * (group % 3));
      const cy = height * (group > 2 ? 0.68 : 0.42 + 0.22 * Math.floor(group / 3));
      return {
        label,
        group,
        x: clamp(cx + Math.cos(angle) * 34, 18, width - 18),
        y: clamp(cy + Math.sin(angle) * 34, 18, height - 18),
        vx: 0,
        vy: 0,
      };
    });

    const edgeMap = Array.from({ length: n }, () => []);
    edges.forEach(([a, b]) => {
      edgeMap[a].push(b);
      edgeMap[b].push(a);
    });

    for (let step = 0; step < (options.steps || 120); step++) {
      for (let i = 0; i < n; i++) {
        const ni = nodes[i];
        for (let j = i + 1; j < n; j++) {
          const nj = nodes[j];
          let dx = ni.x - nj.x;
          let dy = ni.y - nj.y;
          let d2 = dx * dx + dy * dy + 0.01;
          const f = 42 / d2;
          dx /= Math.sqrt(d2);
          dy /= Math.sqrt(d2);
          ni.vx += dx * f;
          ni.vy += dy * f;
          nj.vx -= dx * f;
          nj.vy -= dy * f;
        }
      }
      edges.forEach(([a, b]) => {
        const na = nodes[a];
        const nb = nodes[b];
        const dx = nb.x - na.x;
        const dy = nb.y - na.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const pull = (dist - 52) * 0.0025;
        na.vx += dx * pull;
        na.vy += dy * pull;
        nb.vx -= dx * pull;
        nb.vy -= dy * pull;
      });
      nodes.forEach((node) => {
        const targetX = width * (0.18 + 0.64 * node.label);
        const targetY = height * (0.5 + 0.28 * Math.sin(TAU * node.label));
        node.vx += (targetX - node.x) * (options.labelGravity || 0.002);
        node.vy += (targetY - node.y) * 0.0015;
        node.vx *= 0.82;
        node.vy *= 0.82;
        node.x = clamp(node.x + node.vx, 12, width - 12);
        node.y = clamp(node.y + node.vy, 12, height - 12);
      });
    }
    return nodes;
  }

  function drawGraph(canvas, labels, edges, options = {}) {
    const width = options.width || 340;
    const height = options.height || 260;
    const theme = canvasTheme();
    const ctx = fitCanvas(canvas, width, height);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = theme.paper;
    ctx.fillRect(0, 0, width, height);
    const groups = options.groups || labels.map((x) => Math.floor(x * 3));
    const nodes = options.positions || (options.layout === "bands"
      ? bandLayout(labels, width, height, groups)
      : forceLayout(labels, edges, width, height, { groups, steps: options.steps || 100, labelGravity: options.labelGravity }));
    ctx.strokeStyle = options.edgeColor || theme.edge;
    ctx.lineWidth = options.edgeWidth || 1;
    edges.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y);
      ctx.lineTo(nodes[b].x, nodes[b].y);
      ctx.stroke();
    });
    nodes.forEach((node, i) => {
      const hue = nodeColor(groups[i], theme);
      ctx.beginPath();
      ctx.fillStyle = options.nodeFill || theme.node;
      ctx.strokeStyle = hue;
      ctx.lineWidth = 1.5;
      ctx.arc(node.x, node.y, options.radius || 4.4, 0, TAU);
      ctx.fill();
      ctx.stroke();
    });
    ctx.strokeStyle = theme.border;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
    return nodes;
  }

  function bandLayout(labels, width, height, groups) {
    const bandCount = Math.max(1, Math.max(...groups) + 1);
    const bandHeight = (height - 38) / bandCount;
    return labels.map((label, i) => {
      const group = groups[i];
      const jitter = ((Math.sin((i + 1) * 12.9898) * 43758.5453) % 1) - 0.5;
      return {
        label,
        group,
        x: 18 + label * (width - 36),
        y: 19 + bandHeight * (group + 0.5) + jitter * Math.min(18, bandHeight * 0.38),
        vx: 0,
        vy: 0,
      };
    });
  }

  function select(options, value) {
    const el = document.createElement("select");
    options.forEach(([val, label]) => {
      const opt = document.createElement("option");
      opt.value = val;
      opt.textContent = label;
      el.appendChild(opt);
    });
    el.value = value;
    return el;
  }

  function button(label, className = "btn") {
    const el = document.createElement("button");
    el.type = "button";
    el.className = className;
    el.textContent = label;
    return el;
  }

  function metric(label, value) {
    const item = document.createElement("span");
    item.className = "graphon-metric";
    item.innerHTML = `<span>${label}</span><strong>${value}</strong>`;
    return item;
  }

  function caption(text) {
    const p = document.createElement("p");
    p.className = "graphon-caption";
    p.textContent = text;
    return p;
  }

  function initNetworkComparison(root) {
    root.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "graphon-panel-grid two";
    [
      { title: "Patchwork structure", mode: "clustered" },
      { title: "Uniform structure", mode: "uniform" },
    ].forEach((spec) => {
      const panel = document.createElement("figure");
      panel.className = "graphon-figure-panel";
      const canvas = makeCanvas("graphon-network-canvas", spec.title);
      const label = document.createElement("figcaption");
      label.textContent = spec.title;
      panel.append(canvas, label);
      grid.appendChild(panel);
      drawIntroNetwork(canvas, spec.mode);
    });
    root.append(grid, caption("Two networks can have comparable numbers of edges while making very different large-scale promises about community structure."));
  }

  function drawIntroNetwork(canvas, mode) {
    const width = Math.min(360, canvasWidth(canvas.parentElement, 320));
    const height = 250;
    const rand = seededRandom(mode === "clustered" ? 44 : 91);
    const n = 39;
    const ctx = fitCanvas(canvas, width, height);
    const nodes = [];
    const edges = [];

    if (mode === "clustered") {
      const centers = [
        { x: width * 0.28, y: height * 0.36 },
        { x: width * 0.66, y: height * 0.34 },
        { x: width * 0.48, y: height * 0.68 },
      ];
      centers.forEach((center, group) => {
        for (let i = 0; i < 13; i++) {
          const a = TAU * i / 13 + group * 0.35;
          const r = 28 + 16 * rand();
          nodes.push({ x: center.x + Math.cos(a) * r, y: center.y + Math.sin(a) * r, group });
        }
      });
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (nodes[i].group === nodes[j].group) {
            if (rand() < 0.36) edges.push([i, j]);
          } else if (rand() < 0.025) {
            edges.push([i, j]);
          }
        }
      }
      edges.push([2, 18], [10, 30], [17, 27], [4, 32]);
    } else {
      for (let i = 0; i < n; i++) {
        const a = TAU * i / n - Math.PI / 2;
        const ring = i % 3 === 0 ? 76 : 54;
        nodes.push({
          x: width / 2 + Math.cos(a) * ring + (rand() - 0.5) * 12,
          y: height / 2 + Math.sin(a) * ring * 0.82 + (rand() - 0.5) * 12,
          group: i % 3,
        });
      }
      for (let i = 0; i < n; i++) {
        edges.push([i, (i + 1) % n]);
        if (i % 2 === 0) edges.push([i, (i + 5) % n]);
        if (i % 5 === 0) edges.push([i, (i + 11) % n]);
      }
    }

    drawNetworkFromPositions(ctx, width, height, nodes, edges, 4.8);
  }

  function drawNetworkFromPositions(ctx, width, height, nodes, edges, radius) {
    const theme = canvasTheme();
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = theme.paper;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = theme.dark ? "rgba(232, 225, 210, 0.18)" : "rgba(23, 21, 18, 0.18)";
    ctx.lineWidth = 1.1;
    edges.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y);
      ctx.lineTo(nodes[b].x, nodes[b].y);
      ctx.stroke();
    });
    nodes.forEach((node) => {
      ctx.beginPath();
      ctx.fillStyle = theme.node;
      ctx.strokeStyle = nodeColor(node.group, theme);
      ctx.lineWidth = 1.6;
      ctx.arc(node.x, node.y, radius, 0, TAU);
      ctx.fill();
      ctx.stroke();
    });
    ctx.strokeStyle = theme.border;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
  }

  function initSampling(root) {
    root.innerHTML = "";
    const state = {
      preset: "twoBlock",
      labels: [],
      edges: [],
      nodes: [],
      timer: null,
      frame: null,
      lastFrame: 0,
      latestIndex: -1,
      graphSize: { width: 340, height: 270 },
    };
    const controls = document.createElement("div");
    controls.className = "graphon-controls";
    const presetSelect = select(Object.entries(presets).map(([id, p]) => [id, p.label]), state.preset);
    const add = button("Add vertex");
    const play = button("Play");
    const reset = button("Reset", "btn btn-secondary");
    controls.append(labelWrap("Graphon", presetSelect), add, play, reset);

    const grid = document.createElement("div");
    grid.className = "graphon-panel-grid sampling";
    const heatPanel = figurePanel("Graphon W");
    const graphPanel = figurePanel("Growing sample graph");
    const heat = makeCanvas("graphon-heatmap", "Selected graphon heatmap");
    const graph = makeCanvas("graphon-sample-graph", "Sampled graph");
    heatPanel.prepend(heat);
    graphPanel.prepend(graph);
    grid.append(heatPanel, graphPanel);
    const metrics = document.createElement("div");
    metrics.className = "graphon-metrics";
    root.append(controls, grid, metrics, caption("Each step draws a fresh label in [0,1], marks its row and column in the graphon square, then adds the vertex to a live force simulation."));

    function currentFn() {
      return presets[state.preset].fn;
    }

    function anchorFor(label, group) {
      const width = state.graphSize.width;
      const height = state.graphSize.height;
      if (state.preset === "constant") {
        const a = TAU * label;
        return { x: width * 0.5 + Math.cos(a) * width * 0.18, y: height * 0.5 + Math.sin(a) * height * 0.18 };
      }
      if (state.preset === "twoBlock") {
        return [
          { x: width * 0.32, y: height * 0.5 },
          { x: width * 0.68, y: height * 0.5 },
        ][group];
      }
      if (state.preset === "threeBlock") {
        return [
          { x: width * 0.5, y: height * 0.28 },
          { x: width * 0.32, y: height * 0.68 },
          { x: width * 0.68, y: height * 0.68 },
        ][group];
      }
      return { x: width * (0.18 + 0.64 * label), y: height * (0.68 - 0.36 * label) };
    }

    function addVertex() {
      const u = Math.random();
      const idx = state.labels.length;
      const fn = currentFn();
      const group = groupForPreset(u, state.preset);
      const anchor = anchorFor(u, group);
      state.labels.push(u);
      state.nodes.push({
        label: u,
        group,
        x: clamp(anchor.x + (Math.random() - 0.5) * 28, 14, state.graphSize.width - 14),
        y: clamp(anchor.y + (Math.random() - 0.5) * 28, 14, state.graphSize.height - 14),
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
      });
      for (let j = 0; j < idx; j++) {
        if (Math.random() < fn(u, state.labels[j])) state.edges.push([idx, j]);
      }
      state.latestIndex = idx;
      renderStaticParts();
    }

    function stop() {
      if (state.timer) window.clearInterval(state.timer);
      state.timer = null;
      play.textContent = "Play";
    }

    function resetSample() {
      state.labels = [];
      state.edges = [];
      state.nodes = [];
      state.latestIndex = -1;
      stop();
      renderStaticParts();
    }

    function resizeGraph() {
      const width = Math.min(360, canvasWidth(graphPanel, 340));
      const height = 270;
      const oldWidth = state.graphSize.width;
      const oldHeight = state.graphSize.height;
      if (oldWidth !== width || oldHeight !== height) {
        state.nodes.forEach((node) => {
          node.x = clamp(node.x / oldWidth * width, 14, width - 14);
          node.y = clamp(node.y / oldHeight * height, 14, height - 14);
        });
      }
      state.graphSize = { width, height };
    }

    function renderStaticParts() {
      resizeGraph();
      drawSampledHeatmap(heat, currentFn(), state.labels, state.edges, state.latestIndex, state.preset, Math.min(260, canvasWidth(heatPanel, 260)));
      metrics.replaceChildren(
        metric("vertices", String(state.labels.length)),
        metric("edges", String(state.edges.length))
      );
      add.disabled = state.labels.length >= 120;
      if (state.labels.length >= 120) stop();
    }

    function tick(timestamp = 0) {
      const n = state.nodes.length;
      const frameMs = n < 28 ? 16 : n < 55 ? 33 : 50;
      if (timestamp - state.lastFrame >= frameMs) {
        state.lastFrame = timestamp;
        resizeGraph();
        stepSamplingPhysics(state);
        drawSamplingGraph(graph, state);
      }
      state.frame = window.requestAnimationFrame(tick);
    }

    presetSelect.addEventListener("change", () => {
      state.preset = presetSelect.value;
      resetSample();
    });
    add.addEventListener("click", addVertex);
    reset.addEventListener("click", resetSample);
    play.addEventListener("click", () => {
      if (state.timer) {
        stop();
        return;
      }
      play.textContent = "Pause";
      state.timer = window.setInterval(addVertex, 460);
    });

    renderStaticParts();
    tick();
  }

  function drawSampledHeatmap(canvas, fn, labels, edges, latestIndex, preset, size) {
    drawHeatmap(canvas, fn, { size, guides: graphonGuidesForPreset(preset) });
    const ctx = canvas.getContext("2d");
    const theme = canvasTheme();
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.save();
    labels.forEach((u, i) => {
      const x = u * size;
      const y = size - u * size;
      const latest = i === latestIndex;
      const group = groupForPreset(u, preset);
      ctx.strokeStyle = latest
        ? nodeColor(group, theme)
        : theme.dark ? "rgba(232,225,210,0.1)" : "rgba(23,21,18,0.1)";
      ctx.lineWidth = latest ? 1.2 : 0.6;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, size);
      ctx.moveTo(0, y);
      ctx.lineTo(size, y);
      ctx.stroke();
    });

    ctx.fillStyle = theme.dark ? "rgba(232,225,210,0.2)" : "rgba(23,21,18,0.24)";
    edges.forEach(([a, b]) => {
      const ax = labels[a] * size;
      const ay = size - labels[a] * size;
      const bx = labels[b] * size;
      const by = size - labels[b] * size;
      ctx.fillRect(ax - 1.2, by - 1.2, 2.4, 2.4);
      ctx.fillRect(bx - 1.2, ay - 1.2, 2.4, 2.4);
    });

    labels.forEach((u, i) => {
      const group = groupForPreset(u, preset);
      const latest = i === latestIndex;
      ctx.beginPath();
      ctx.fillStyle = nodeColor(group, theme);
      ctx.strokeStyle = latest ? theme.ink : theme.paper;
      ctx.lineWidth = 1;
      ctx.arc(u * size, size - u * size, latest ? 4.4 : 2.9, 0, TAU);
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  }

  function samplingZoom(count) {
    return clamp(1 - Math.max(0, count - 18) * 0.0052, 0.56, 1);
  }

  function stepSamplingPhysics(state) {
    const nodes = state.nodes;
    const n = nodes.length;
    const width = state.graphSize.width;
    const height = state.graphSize.height;
    if (n === 0) return;

    for (let i = 0; i < n; i++) {
      const ni = nodes[i];
      for (let j = i + 1; j < n; j++) {
        const nj = nodes[j];
        let dx = ni.x - nj.x;
        let dy = ni.y - nj.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 0.01) {
          dx = 0.5 - Math.random();
          dy = 0.5 - Math.random();
          d2 = dx * dx + dy * dy;
        }
        const dist = Math.sqrt(d2);
        const density = clamp((n - 12) / 72, 0, 1);
        const force = Math.min(1.15, (320 + density * 180) / (d2 + 60));
        const fx = dx / dist * force;
        const fy = dy / dist * force;
        ni.vx += fx;
        ni.vy += fy;
        nj.vx -= fx;
        nj.vy -= fy;
      }
    }

    const density = clamp((n - 12) / 72, 0, 1);
    const springLength = (state.preset === "constant" ? 64 : 46) + density * 76;
    const springStrength = 0.0085 * (1 - density * 0.78);
    state.edges.forEach(([a, b]) => {
      const na = nodes[a];
      const nb = nodes[b];
      const dx = nb.x - na.x;
      const dy = nb.y - na.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const pull = (dist - springLength) * springStrength;
      const fx = dx / dist * pull;
      const fy = dy / dist * pull;
      na.vx += fx;
      na.vy += fy;
      nb.vx -= fx;
      nb.vy -= fy;
    });

    nodes.forEach((node) => {
      const anchor = samplingAnchorForState(state, node.label, node.group);
      const anchorStrength = 0.0062 * (1 - density * 0.28);
      node.vx += (anchor.x - node.x) * anchorStrength;
      node.vy += (anchor.y - node.y) * anchorStrength;
      node.vx *= 0.89;
      node.vy *= 0.89;
      node.x = clamp(node.x + node.vx, -width * 0.18, width * 1.18);
      node.y = clamp(node.y + node.vy, -height * 0.18, height * 1.18);
    });
  }

  function samplingAnchorForState(state, label, group) {
    const width = state.graphSize.width;
    const height = state.graphSize.height;
    if (state.preset === "constant") return { x: width * 0.5, y: height * 0.5 };
    if (state.preset === "twoBlock") {
      return [
        { x: width * 0.32, y: height * 0.5 },
        { x: width * 0.68, y: height * 0.5 },
      ][group];
    }
    if (state.preset === "threeBlock") {
      return [
        { x: width * 0.5, y: height * 0.27 },
        { x: width * 0.31, y: height * 0.68 },
        { x: width * 0.69, y: height * 0.68 },
      ][group];
    }
    return { x: width * (0.18 + 0.64 * label), y: height * (0.72 - 0.44 * label) };
  }

  function drawSamplingGraph(canvas, state) {
    const { width, height } = state.graphSize;
    const theme = canvasTheme();
    const ctx = ensureCanvas(canvas, width, height);
    const zoom = samplingZoom(state.nodes.length);
    const cx = width / 2;
    const cy = height / 2;
    state.viewZoom = zoom;
    const project = (node) => ({
      x: cx + (node.x - cx) * zoom,
      y: cy + (node.y - cy) * zoom,
    });
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = theme.paper;
    ctx.fillRect(0, 0, width, height);

    const dense = state.nodes.length > 70;
    ctx.strokeStyle = dense
      ? theme.dark ? "rgba(232,225,210,0.08)" : "rgba(23,21,18,0.055)"
      : theme.dark ? "rgba(232,225,210,0.16)" : "rgba(23,21,18,0.12)";
    ctx.lineWidth = dense ? 0.7 : 1;
    state.edges.forEach(([a, b]) => {
      const na = project(state.nodes[a]);
      const nb = project(state.nodes[b]);
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.stroke();
    });

    state.nodes.forEach((node, i) => {
      const latest = i === state.latestIndex;
      const p = project(node);
      ctx.beginPath();
      ctx.fillStyle = theme.node;
      ctx.strokeStyle = nodeColor(node.group, theme);
      ctx.lineWidth = latest ? 2.1 : 1.45;
      ctx.arc(p.x, p.y, latest ? 5.8 : dense ? 3.2 : 4.5, 0, TAU);
      ctx.fill();
      ctx.stroke();
    });

    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
  }

  function labelWrap(text, control) {
    const label = document.createElement("label");
    label.className = "graphon-control";
    const span = document.createElement("span");
    span.textContent = text;
    label.append(span, control);
    return label;
  }

  function figurePanel(label) {
    const fig = document.createElement("figure");
    fig.className = "graphon-figure-panel";
    const cap = document.createElement("figcaption");
    cap.innerHTML = label;
    fig.appendChild(cap);
    return fig;
  }

  function initCheckerboard(root) {
    root.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "graphon-panel-grid three";
    const graph = makeCanvas("graphon-checker-canvas", "Small finite graph");
    const matrix = makeCanvas("graphon-checker-canvas", "Adjacency matrix");
    const blowup = makeCanvas("graphon-checker-canvas", "Checkerboard graphon blowup");
    [
      [graph, "Finite graph G"],
      [matrix, "Adjacency matrix"],
      [blowup, "Graphon blowup W<sub>G</sub>"],
    ].forEach(([canvas, title]) => {
      const panel = figurePanel(title);
      panel.prepend(canvas);
      grid.appendChild(panel);
    });
    root.append(grid, caption("A finite graph becomes a step-function graphon by turning each vertex into an interval and each edge into a rectangle."));
    const edges = [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4], [3, 4], [3, 5], [4, 5]];
    drawSmallGraph(graph, edges);
    drawAdjacency(matrix, 6, edges);
    drawBlowup(blowup, 6, edges);
  }

  function drawSmallGraph(canvas, edges) {
    const size = Math.min(220, canvasWidth(canvas.parentElement, 220));
    const theme = canvasTheme();
    const ctx = fitCanvas(canvas, size, size);
    const center = size / 2;
    const nodes = Array.from({ length: 6 }, (_, i) => ({
      x: center + Math.cos(TAU * i / 6 - Math.PI / 2) * size * 0.34,
      y: center + Math.sin(TAU * i / 6 - Math.PI / 2) * size * 0.34,
    }));
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = theme.paper;
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = theme.edgeStrong;
    ctx.lineWidth = 1.4;
    edges.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(nodes[a].x, nodes[a].y);
      ctx.lineTo(nodes[b].x, nodes[b].y);
      ctx.stroke();
    });
    nodes.forEach((node, i) => {
      ctx.beginPath();
      ctx.fillStyle = theme.node;
      ctx.strokeStyle = nodeColor(i % 3, theme);
      ctx.lineWidth = 1.6;
      ctx.arc(node.x, node.y, 8, 0, TAU);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = theme.ink;
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(i + 1), node.x, node.y);
    });
    ctx.strokeStyle = theme.border;
    ctx.strokeRect(0.5, 0.5, size - 1, size - 1);
  }

  function edgeSet(edges) {
    return new Set(edges.map(([a, b]) => `${Math.min(a, b)}:${Math.max(a, b)}`));
  }

  function drawAdjacency(canvas, n, edges) {
    const size = Math.min(220, canvasWidth(canvas.parentElement, 220));
    const theme = canvasTheme();
    const ctx = fitCanvas(canvas, size, size);
    const set = edgeSet(edges);
    const pad = 18;
    const cell = (size - pad * 2) / n;
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = theme.paper;
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const hit = i !== j && set.has(`${Math.min(i, j)}:${Math.max(i, j)}`);
        ctx.fillStyle = hit ? nodeColor(0, theme) : theme.surface;
        ctx.fillRect(pad + j * cell, pad + i * cell, cell - 1, cell - 1);
      }
    }
    ctx.strokeStyle = theme.border;
    ctx.strokeRect(pad, pad, cell * n, cell * n);
  }

  function drawBlowup(canvas, n, edges) {
    const set = edgeSet(edges);
    const fn = (x, y) => {
      const i = Math.min(n - 1, Math.floor(x * n));
      const j = Math.min(n - 1, Math.floor(y * n));
      return i !== j && set.has(`${Math.min(i, j)}:${Math.max(i, j)}`) ? 0.96 : 0.04;
    };
    drawHeatmap(canvas, fn, { size: Math.min(220, canvasWidth(canvas.parentElement, 220)), cells: n, guides: Array.from({ length: n - 1 }, (_, i) => (i + 1) / n) });
  }

  function intervalPermutation(parts = 6) {
    const order = Array.from({ length: parts }, (_, i) => i);
    for (let i = parts - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    const inverse = [];
    order.forEach((oldIndex, newIndex) => {
      inverse[oldIndex] = newIndex;
    });
    return {
      parts,
      order,
      inverse,
      sigma(x) {
        const bucket = Math.min(parts - 1, Math.floor(x * parts));
        const local = x * parts - bucket;
        return (order[bucket] + local) / parts;
      },
      forwardLabel(x) {
        const bucket = Math.min(parts - 1, Math.floor(x * parts));
        const local = x * parts - bucket;
        return (inverse[bucket] + local) / parts;
      },
    };
  }

  function initRelabeling(root) {
    root.innerHTML = "";
    const state = {
      sampleSize: 100,
      perm: intervalPermutation(6),
      labels: [],
      baseEdges: [],
      shuffledEdges: [],
    };
    const baseFn = presets.threeBlock.fn;
    const controls = document.createElement("div");
    controls.className = "graphon-controls";
    const sizeSelect = select([["50", "50 vertices"], ["100", "100 vertices"], ["200", "200 vertices"]], "100");
    const resample = button("Resample");
    const shuffle = button("Shuffle labels", "btn btn-secondary");
    controls.append(labelWrap("Sample", sizeSelect), resample, shuffle);

    const heatGrid = document.createElement("div");
    heatGrid.className = "graphon-panel-grid two";
    const heatA = figurePanel("Original graphon");
    const heatB = figurePanel("Relabeled graphon");
    const heatCanvasA = makeCanvas("graphon-heatmap", "Original graphon heatmap");
    const heatCanvasB = makeCanvas("graphon-heatmap", "Relabeled graphon heatmap");
    heatA.prepend(heatCanvasA);
    heatB.prepend(heatCanvasB);
    heatGrid.append(heatA, heatB);

    const graphGrid = document.createElement("div");
    graphGrid.className = "graphon-panel-grid two";
    const graphA = figurePanel("Sample from W");
    const graphB = figurePanel("Sample from W<sup>σ</sup>");
    const graphCanvasA = makeCanvas("graphon-relabel-graph", "Sample graph from original graphon");
    const graphCanvasB = makeCanvas("graphon-relabel-graph", "Sample graph from relabeled graphon");
    graphA.prepend(graphCanvasA);
    graphB.prepend(graphCanvasB);
    graphGrid.append(graphA, graphB);
    root.append(controls, heatGrid, graphGrid, caption("The heatmap can be scrambled by a measure-preserving relabeling, but samples of moderate size still show the same block structure."));

    function relabeledFn(x, y) {
      return baseFn(state.perm.sigma(x), state.perm.sigma(y));
    }

    function sampleGraphs() {
      state.labels = Array.from({ length: state.sampleSize }, () => Math.random()).sort((a, b) => a - b);
      state.baseEdges = graphEdges(state.labels, baseFn);
      const relabeledLabels = state.labels.map((x) => state.perm.forwardLabel(x));
      state.shuffledEdges = graphEdges(relabeledLabels, relabeledFn);
    }

    function render() {
      const theme = canvasTheme();
      const heatSize = Math.min(240, canvasWidth(heatA, 240));
      drawHeatmap(heatCanvasA, baseFn, { size: heatSize, guides: [1 / 3, 2 / 3] });
      drawHeatmap(heatCanvasB, relabeledFn, { size: heatSize, guides: Array.from({ length: state.perm.parts - 1 }, (_, i) => (i + 1) / state.perm.parts) });
      const width = Math.min(360, canvasWidth(graphA, 340));
      const relabelOptions = {
        width,
        height: 260,
        layout: "bands",
        radius: state.sampleSize > 100 ? 1.8 : 2.5,
        edgeColor: state.sampleSize > 100
          ? theme.dark ? "rgba(232,225,210,0.055)" : "rgba(23,21,18,0.035)"
          : theme.dark ? "rgba(232,225,210,0.085)" : "rgba(23,21,18,0.055)",
        edgeWidth: 0.7,
      };
      drawGraph(graphCanvasA, state.labels, state.baseEdges, relabelOptions);
      drawGraph(graphCanvasB, state.labels, state.shuffledEdges, relabelOptions);
    }

    sizeSelect.addEventListener("change", () => {
      state.sampleSize = Number(sizeSelect.value);
      sampleGraphs();
      render();
    });
    resample.addEventListener("click", () => {
      sampleGraphs();
      render();
    });
    shuffle.addEventListener("click", () => {
      state.perm = intervalPermutation(6);
      sampleGraphs();
      render();
    });
    sampleGraphs();
    render();
  }

  function razborovLower(e) {
    if (e <= 0.5) return 0;
    if (e >= 0.999999) return 1;
    const k = Math.floor(1 / (1 - e));
    const inner = Math.max(0, 1 - e * (k + 1) / k);
    const sq = Math.sqrt(inner);
    return (k * (k - 1)) / Math.pow(k + 1, 2) * Math.pow(1 + sq, 2) * (1 - 2 * sq);
  }

  function initRazborov(root) {
    root.innerHTML = "";
    const canvas = makeCanvas("graphon-razborov", "Razborov triangle plot");
    root.append(canvas, caption("The shaded region is bounded above by the clique-like graphon and below by Razborov's scalloped minimum-triangle curve."));
    drawRazborov(canvas);
  }

  function drawRazborov(canvas) {
    const width = Math.min(720, canvasWidth(canvas.parentElement, 620));
    const height = Math.round(width * 0.62);
    const theme = canvasTheme();
    const ctx = fitCanvas(canvas, width, height);
    const margin = { left: 54, right: 18, top: 22, bottom: 48 };
    const pw = width - margin.left - margin.right;
    const ph = height - margin.top - margin.bottom;
    const sx = (x) => margin.left + (x / 1.05) * pw;
    const sy = (y) => margin.top + ph - (y / 1.05) * ph;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = theme.paper;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = theme.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, margin.top + ph);
    ctx.lineTo(margin.left + pw, margin.top + ph);
    ctx.stroke();

    ctx.fillStyle = theme.faint;
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    const ticks = [[0, "0"], [0.5, "1/2"], [2 / 3, "2/3"], [0.75, "3/4"], [0.8, "4/5"], [1, "1"]];
    ticks.forEach(([x, label]) => {
      const px = sx(x);
      ctx.strokeStyle = theme.dark ? "rgba(232,225,210,0.16)" : "rgba(138,128,111,0.28)";
      if (x > 0 && x < 1) {
        ctx.beginPath();
        ctx.moveTo(px, margin.top);
        ctx.lineTo(px, margin.top + ph);
        ctx.stroke();
      }
      ctx.fillText(label, px, margin.top + ph + 20);
    });
    ctx.textAlign = "right";
    for (let y = 0; y <= 1.0001; y += 0.2) {
      ctx.fillText(y.toFixed(y === 0 || y === 1 ? 0 : 1), margin.left - 8, sy(y) + 4);
    }

    const samples = 500;
    ctx.beginPath();
    for (let i = 0; i <= samples; i++) {
      const e = i / samples;
      const y = Math.pow(e, 1.5);
      const xpix = sx(e);
      const ypix = sy(y);
      if (i === 0) ctx.moveTo(xpix, ypix);
      else ctx.lineTo(xpix, ypix);
    }
    for (let i = samples; i >= 0; i--) {
      const e = i / samples;
      ctx.lineTo(sx(e), sy(razborovLower(e)));
    }
    ctx.closePath();
    ctx.fillStyle = theme.dark ? "rgba(118, 171, 209, 0.16)" : colors.fillBlue;
    ctx.fill();

    drawCurve(ctx, sx, sy, (e) => Math.pow(e, 1.5), nodeColor(0, theme), 2);
    drawCurve(ctx, sx, sy, (e) => Math.pow(e, 3), nodeColor(3, theme), 1.8, [6, 5, 1.5, 5]);
    drawCurve(ctx, sx, sy, razborovLower, nodeColor(1, theme), 2);

    ctx.fillStyle = theme.ink;
    ctx.font = "13px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Edge density e", margin.left + pw / 2, height - 12);
    ctx.save();
    ctx.translate(16, margin.top + ph / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Triangle density t", 0, 0);
    ctx.restore();

    drawLegend(ctx, width, margin.top + 12, theme);
  }

  function drawCurve(ctx, sx, sy, fn, stroke, lineWidth, dash = []) {
    ctx.save();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.setLineDash(dash);
    ctx.beginPath();
    const samples = 500;
    for (let i = 0; i <= samples; i++) {
      const e = i / samples;
      const x = sx(e);
      const y = sy(fn(e));
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawLegend(ctx, width, top, theme = canvasTheme()) {
    const items = [
      [nodeColor(0, theme), [], "upper bound t = e³⁄²"],
      [nodeColor(3, theme), [6, 5, 1.5, 5], "Erdos-Renyi t = e³"],
      [nodeColor(1, theme), [], "lower bound with scallops"],
    ];
    const x = width < 520 ? 72 : 86;
    const y = top;
    ctx.fillStyle = theme.dark ? "rgba(31,28,24,0.94)" : "rgba(251,246,232,0.92)";
    ctx.strokeStyle = theme.border;
    ctx.fillRect(x - 12, y - 12, 226, 72);
    ctx.strokeRect(x - 12, y - 12, 226, 72);
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    items.forEach(([stroke, dash, label], i) => {
      const yy = y + i * 20;
      ctx.save();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.moveTo(x, yy);
      ctx.lineTo(x + 34, yy);
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = theme.ink;
      ctx.fillText(label, x + 43, yy + 4);
    });
  }

  const initializers = {
    "network-comparison": initNetworkComparison,
    sampling: initSampling,
    checkerboard: initCheckerboard,
    relabeling: initRelabeling,
    razborov: initRazborov,
  };

  function boot() {
    document.querySelectorAll("[data-graphon-demo]").forEach((root) => {
      const type = root.getAttribute("data-graphon-demo");
      if (root.dataset.graphonReady === "true" || !initializers[type]) return;
      root.dataset.graphonReady = "true";
      initializers[type](root);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
