# Math PhD Personal Website — Build Specification

You are building a complete static personal website for a Mathematics PhD student. This is a greenfield project. Build everything from scratch. Do not ask clarifying questions — follow this spec exactly, make reasonable placeholder decisions where content is not yet provided, and leave clearly marked `TODO` comments where the owner must supply real content (name, photo, CV, papers).

---

## Stack

| Layer | Technology |
|---|---|
| Static site generator | [Eleventy (11ty)](https://www.11ty.dev/) v3 |
| Templating | Nunjucks (`.njk`) |
| Markdown processor | `markdown-it` + `markdown-it-katex` |
| Math rendering | KaTeX (CSS loaded from CDN in `<head>`; rendering at build time via plugin) |
| Search | Lunr.js (index built at build time, queried client-side) |
| Hosting | GitHub Pages (output: `_site/`, deploy via GitHub Actions) |
| Styling | Hand-written CSS (no framework) — minimalist, readable, mobile-first |
| Interactivity | Vanilla JS + optional CDN libraries (D3, p5.js, Pyodide) per post |

**Do not use React, Vue, Webpack, Vite, Tailwind, or any CSS framework.**

---

## Repository Layout

Create this exact directory structure:

```
/
├── .eleventy.js
├── .gitignore
├── .github/
│   └── workflows/
│       └── deploy.yml
├── package.json
├── src/
│   ├── _includes/
│   │   ├── base.njk
│   │   └── post.njk
│   ├── _data/
│   │   └── metadata.js
│   ├── posts/
│   │   ├── 01-latex-guide.md
│   │   ├── 02-interactive-demo.md
│   │   └── 03-pyodide-demo.md
│   ├── tags/
│   │   └── tag.njk
│   ├── search.njk
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── search.js
│   │   └── sketches/
│   │       └── circle-packing.js
│   ├── assets/
│   │   ├── papers/
│   │   │   └── .gitkeep
│   │   ├── cv/
│   │   │   └── .gitkeep
│   │   └── img/
│   │       └── .gitkeep
│   └── index.njk
└── _site/               ← gitignored; Eleventy writes here
```

---

## File Specifications

### `.gitignore`

```
_site/
node_modules/
.DS_Store
```

---

### `package.json`

```json
{
  "name": "math-phd-site",
  "version": "1.0.0",
  "scripts": {
    "start": "eleventy --serve",
    "build": "eleventy"
  },
  "dependencies": {
    "@11ty/eleventy": "^3.0.0",
    "markdown-it": "^14.0.0",
    "markdown-it-katex": "^2.0.3",
    "lunr": "^2.3.9"
  }
}
```

---

### `.eleventy.js`

```js
const markdownIt = require("markdown-it");
const markdownItKatex = require("markdown-it-katex");

module.exports = function (eleventyConfig) {
  // Markdown with KaTeX
  const md = markdownIt({ html: true, linkify: true, typographer: true })
    .use(markdownItKatex);
  eleventyConfig.setLibrary("md", md);

  // Pass through static assets
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/assets");

  // Date filter for templates
  eleventyConfig.addFilter("dateDisplay", (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // Tag list collection (used by tag index page)
  eleventyConfig.addCollection("tagList", (collectionApi) => {
    const tags = new Set();
    collectionApi.getAll().forEach((item) => {
      (item.data.tags || []).forEach((t) => {
        if (!["all", "posts"].includes(t)) tags.add(t);
      });
    });
    return [...tags].sort();
  });

  // Search index collection
  eleventyConfig.addCollection("searchIndex", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/posts/*.md")
      .map((post) => ({
        url: post.url,
        title: post.data.title,
        tags: (post.data.tags || []).join(" "),
        summary: post.data.summary || "",
        content: (post.templateContent || "")
          .replace(/<[^>]+>/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .substring(0, 3000),
      }));
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
```

---

### `src/_data/metadata.js`

```js
module.exports = {
  // TODO: Replace with real values
  name: "Your Name",
  title: "Mathematics PhD Student",
  institution: "University Name",
  email: "you@university.edu",
  github: "https://github.com/yourusername",
  description:
    "I am a PhD student in Mathematics at [University]. My research focuses on [area]. I am interested in [topic 1], [topic 2], and [topic 3].",
  baseUrl: "https://yourusername.github.io", // TODO: set to your GitHub Pages URL
  siteTitle: "Your Name — Mathematics",
};
```

---

### `src/_includes/base.njk`

This is the root HTML shell used by every page.

```njk
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{% if title %}{{ title }} — {% endif %}{{ metadata.siteTitle }}</title>
  <meta name="description" content="{{ description or metadata.description }}" />

  <!-- KaTeX CSS (math rendering) -->
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css"
    integrity="sha384-nB0miv6/jRmo5UMMR1wu3Gz6NLsoTkbqJghGIsx//Rlm+ZU03BU6SQNC66uf4l5"
    crossorigin="anonymous"
  />

  <link rel="stylesheet" href="/css/style.css" />
</head>
<body>
  <header class="site-header">
    <nav class="nav">
      <a href="/" class="nav-name">{{ metadata.name }}</a>
      <ul class="nav-links">
        <li><a href="/">Home</a></li>
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/tags/">Tags</a></li>
        <li><a href="/search/">Search</a></li>
      </ul>
    </nav>
  </header>

  <main class="main-content">
    {{ content | safe }}
  </main>

  <footer class="site-footer">
    <p>
      {{ metadata.name }} ·
      <a href="mailto:{{ metadata.email }}">{{ metadata.email }}</a> ·
      <a href="{{ metadata.github }}" target="_blank" rel="noopener">GitHub</a>
    </p>
  </footer>
</body>
</html>
```

---

### `src/_includes/post.njk`

Layout for individual blog posts.

```njk
---
layout: base.njk
---

<article class="post">
  <header class="post-header">
    <h1 class="post-title">{{ title }}</h1>
    <div class="post-meta">
      <time datetime="{{ date | date('YYYY-MM-DD') }}">{{ date | dateDisplay }}</time>
      {% if tags %}
      <span class="post-tags">
        {% for tag in tags %}
          {% if tag != "posts" %}
            <a href="/tags/{{ tag }}/" class="tag">{{ tag }}</a>
          {% endif %}
        {% endfor %}
      </span>
      {% endif %}
    </div>
  </header>

  <div class="post-content">
    {{ content | safe }}
  </div>

  <nav class="post-nav">
    <a href="/blog/">← All posts</a>
  </nav>
</article>
```

---

### `src/index.njk` — Home Page

```njk
---
layout: base.njk
title: Home
---

<!-- HERO / PROFILE SECTION -->
<section class="profile">
  <div class="profile-photo-wrap">
    <!--
      TODO: Add your photo at src/assets/img/profile.jpg
      Recommended: square crop, at least 400x400px
    -->
    <img
      src="/assets/img/profile.jpg"
      alt="{{ metadata.name }}"
      class="profile-photo"
      width="180"
      height="180"
      onerror="this.style.display='none'"
    />
  </div>

  <div class="profile-info">
    <h1 class="profile-name">{{ metadata.name }}</h1>
    <p class="profile-title">{{ metadata.title }}</p>
    <p class="profile-institution">{{ metadata.institution }}</p>

    <!--
      TODO: Replace placeholder text with your actual bio.
      Keep it to 3-5 sentences. Plain prose, no LaTeX here.
    -->
    <p class="profile-bio">{{ metadata.description }}</p>

    <div class="profile-links">
      <!--
        TODO: Add your CV at src/assets/cv/cv.pdf
        The link below will work automatically once the file is in place.
      -->
      <a href="/assets/cv/cv.pdf" class="btn" target="_blank" rel="noopener">
        CV (PDF)
      </a>
      <a href="{{ metadata.github }}" class="btn btn-secondary" target="_blank" rel="noopener">
        GitHub
      </a>
      <a href="mailto:{{ metadata.email }}" class="btn btn-secondary">
        Email
      </a>
    </div>
  </div>
</section>

<hr class="section-divider" />

<!-- PAPERS & PUBLICATIONS -->
<section class="papers" id="papers">
  <h2>Papers &amp; Publications</h2>

  <!--
    TODO: For each paper, copy the block below.
    PDF links can point to:
      - A local static file: /assets/papers/yourpaper.pdf
      - An arXiv abstract page: https://arxiv.org/abs/XXXX.XXXXX
      - An arXiv direct PDF: https://arxiv.org/pdf/XXXX.XXXXX
    Add the PDF to src/assets/papers/ for local hosting.
    The `abstract` field can contain LaTeX inline math using $...$
  -->

  {% set papers = [
    {
      title: "TODO: Paper Title One",
      authors: "Your Name, Collaborator Name",
      venue: "Journal of Mathematics, 2024",
      abstract: "TODO: Paste abstract here. You can use inline math like $f: M \\to N$ between manifolds.",
      arxiv: "https://arxiv.org/abs/0000.00000",
      pdf: ""
    },
    {
      title: "TODO: Paper Title Two",
      authors: "Your Name",
      venue: "Preprint, 2025",
      abstract: "TODO: Paste abstract here. Display math like $$\\int_M \\omega = 0$$ renders on its own line.",
      arxiv: "",
      pdf: "/assets/papers/paper2.pdf"
    }
  ] %}

  {% if papers.length == 0 %}
    <p class="muted">Publications will appear here.</p>
  {% else %}
    <ol class="paper-list">
      {% for paper in papers %}
      <li class="paper-item">
        <div class="paper-title">{{ paper.title }}</div>
        <div class="paper-authors">{{ paper.authors }}</div>
        <div class="paper-venue">{{ paper.venue }}</div>
        <details class="paper-abstract">
          <summary>Abstract</summary>
          <div class="abstract-body">{{ paper.abstract | md | safe }}</div>
        </details>
        <div class="paper-links">
          {% if paper.arxiv %}
            <a href="{{ paper.arxiv }}" target="_blank" rel="noopener" class="paper-link">arXiv</a>
          {% endif %}
          {% if paper.pdf %}
            <a href="{{ paper.pdf }}" target="_blank" rel="noopener" class="paper-link">PDF</a>
          {% endif %}
        </div>
      </li>
      {% endfor %}
    </ol>
  {% endif %}
</section>

<hr class="section-divider" />

<!-- RECENT BLOG POSTS -->
<section class="recent-posts">
  <h2>Recent Posts</h2>
  <ul class="post-list">
    {% set recentPosts = collections.posts | reverse | first(3) %}
    {% for post in recentPosts %}
    <li class="post-list-item">
      <a href="{{ post.url }}" class="post-list-title">{{ post.data.title }}</a>
      <time class="post-list-date">{{ post.date | dateDisplay }}</time>
      {% if post.data.summary %}
        <p class="post-list-summary">{{ post.data.summary }}</p>
      {% endif %}
      {% if post.data.tags %}
      <span class="post-tags">
        {% for tag in post.data.tags %}
          {% if tag != "posts" %}
            <a href="/tags/{{ tag }}/" class="tag">{{ tag }}</a>
          {% endif %}
        {% endfor %}
      </span>
      {% endif %}
    </li>
    {% endfor %}
  </ul>
  <a href="/blog/" class="more-link">All posts →</a>
</section>
```

**Implementation note for `index.njk`:** The `papers` section uses a Nunjucks array literal for zero-config content editing. When the owner has many papers, advise them to move papers to `src/_data/papers.json` instead.

Add this filter to `.eleventy.js` so abstract LaTeX renders:

```js
eleventyConfig.addFilter("md", (content) => md.render(content || ""));
```

And add a `first` filter:

```js
eleventyConfig.addFilter("first", (arr, n) => arr.slice(0, n));
```

---

### Blog Index — `src/blog.njk`

```njk
---
layout: base.njk
title: Blog
permalink: /blog/
---

<h1>Blog</h1>
<p class="muted">Notes on mathematics, research, and interactive experiments.</p>

<ul class="post-list">
  {% for post in collections.posts | reverse %}
  <li class="post-list-item">
    <a href="{{ post.url }}" class="post-list-title">{{ post.data.title }}</a>
    <time class="post-list-date">{{ post.date | dateDisplay }}</time>
    {% if post.data.summary %}
      <p class="post-list-summary">{{ post.data.summary }}</p>
    {% endif %}
    {% if post.data.tags %}
    <span class="post-tags">
      {% for tag in post.data.tags %}
        {% if tag != "posts" %}
          <a href="/tags/{{ tag }}/" class="tag">{{ tag }}</a>
        {% endif %}
      {% endfor %}
    </span>
    {% endif %}
  </li>
  {% endfor %}
</ul>
```

---

### Tag Pages — `src/tags/tag.njk`

```njk
---
pagination:
  data: collections
  size: 1
  alias: tag
  filter: ["all", "tagList", "postsByTag", "searchIndex", "posts"]
permalink: /tags/{{ tag }}/
---
---
layout: base.njk
title: "Tag: {{ tag }}"
---

<h1>Posts tagged <span class="tag tag-heading">{{ tag }}</span></h1>

<ul class="post-list">
  {% for post in collections[tag] | reverse %}
  <li class="post-list-item">
    <a href="{{ post.url }}" class="post-list-title">{{ post.data.title }}</a>
    <time class="post-list-date">{{ post.date | dateDisplay }}</time>
    {% if post.data.summary %}
      <p class="post-list-summary">{{ post.data.summary }}</p>
    {% endif %}
  </li>
  {% endfor %}
</ul>
```

### Tag Index — `src/tags.njk`

```njk
---
layout: base.njk
title: Tags
permalink: /tags/
---

<h1>Tags</h1>
<ul class="tag-index">
  {% for tag in collections.tagList %}
  <li><a href="/tags/{{ tag }}/" class="tag">{{ tag }}</a></li>
  {% endfor %}
</ul>
```

---

### Search — `src/search.njk`

```njk
---
layout: base.njk
title: Search
permalink: /search/
---

<h1>Search</h1>
<input
  type="search"
  id="search-input"
  placeholder="Search posts…"
  class="search-input"
  aria-label="Search posts"
  autofocus
/>
<div id="search-results" class="search-results" aria-live="polite"></div>

<!-- Search index injected at build time -->
<script>
  window.__searchIndex = {{ collections.searchIndex | dump | safe }};
</script>
<script src="https://cdn.jsdelivr.net/npm/lunr@2.3.9/lunr.min.js"></script>
<script src="/js/search.js"></script>
```

---

### `src/js/search.js`

```js
(function () {
  const data = window.__searchIndex || [];

  const idx = lunr(function () {
    this.ref("url");
    this.field("title", { boost: 10 });
    this.field("tags", { boost: 5 });
    this.field("summary", { boost: 3 });
    this.field("content");
    data.forEach((doc) => this.add(doc));
  });

  const byUrl = {};
  data.forEach((d) => (byUrl[d.url] = d));

  const input = document.getElementById("search-input");
  const results = document.getElementById("search-results");

  function render(query) {
    if (!query.trim()) {
      results.innerHTML = "";
      return;
    }
    let hits;
    try {
      hits = idx.search(query + "~1"); // fuzzy match
    } catch {
      hits = idx.search(query);
    }

    if (!hits.length) {
      results.innerHTML = "<p>No results found.</p>";
      return;
    }

    results.innerHTML = hits
      .map(({ ref }) => {
        const doc = byUrl[ref];
        return `
          <div class="search-result">
            <a href="${doc.url}" class="search-result-title">${doc.title}</a>
            ${doc.summary ? `<p class="search-result-summary">${doc.summary}</p>` : ""}
            ${
              doc.tags
                ? `<span class="post-tags">${doc.tags
                    .split(" ")
                    .map((t) => `<span class="tag">${t}</span>`)
                    .join(" ")}</span>`
                : ""
            }
          </div>
        `;
      })
      .join("");
  }

  input.addEventListener("input", (e) => render(e.target.value));

  // Run on load if there's a ?q= param
  const q = new URLSearchParams(window.location.search).get("q");
  if (q) {
    input.value = q;
    render(q);
  }
})();
```

---

### `src/css/style.css`

Design goals: minimalist, high-readability, math-friendly, mobile-first. No decorative elements.

```css
/* ===== RESET & BASE ===== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  --font-serif: Georgia, "Times New Roman", serif;
  --font-mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  --color-text:        #1a1a1a;
  --color-muted:       #6b7280;
  --color-link:        #1d4ed8;
  --color-link-hover:  #1e40af;
  --color-border:      #e5e7eb;
  --color-bg:          #ffffff;
  --color-bg-subtle:   #f9fafb;
  --color-tag-bg:      #eff6ff;
  --color-tag-text:    #1d4ed8;
  --max-width:         720px;
  --spacing-page:      1.5rem;
}

html { font-size: 17px; }

body {
  font-family: var(--font-sans);
  color: var(--color-text);
  background: var(--color-bg);
  line-height: 1.75;
  -webkit-font-smoothing: antialiased;
}

/* ===== TYPOGRAPHY ===== */
h1 { font-size: 1.9rem; font-weight: 700; line-height: 1.2; margin-bottom: 0.5rem; }
h2 { font-size: 1.4rem; font-weight: 600; margin: 2rem 0 0.75rem; }
h3 { font-size: 1.15rem; font-weight: 600; margin: 1.5rem 0 0.5rem; }
p  { margin-bottom: 1rem; }
a  { color: var(--color-link); text-decoration: none; }
a:hover { text-decoration: underline; color: var(--color-link-hover); }

strong { font-weight: 600; }
em { font-style: italic; }

code {
  font-family: var(--font-mono);
  font-size: 0.85em;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  border-radius: 3px;
  padding: 0.1em 0.35em;
}

pre {
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 1rem 1.25rem;
  overflow-x: auto;
  margin: 1.25rem 0;
}
pre code { background: none; border: none; padding: 0; font-size: 0.875em; }

blockquote {
  border-left: 3px solid var(--color-border);
  padding-left: 1rem;
  color: var(--color-muted);
  margin: 1.25rem 0;
}

ul, ol { padding-left: 1.5rem; margin-bottom: 1rem; }
li { margin-bottom: 0.25rem; }

hr, .section-divider {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 2.5rem 0;
}

.muted { color: var(--color-muted); }

/* ===== LAYOUT ===== */
.site-header {
  border-bottom: 1px solid var(--color-border);
  padding: 0 var(--spacing-page);
}

.nav {
  max-width: var(--max-width);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  height: 56px;
}

.nav-name {
  font-weight: 600;
  font-size: 1rem;
  color: var(--color-text);
  white-space: nowrap;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 1.5rem;
  padding: 0;
  margin: 0;
  flex-wrap: wrap;
}

.nav-links a {
  font-size: 0.9rem;
  color: var(--color-muted);
}
.nav-links a:hover { color: var(--color-text); text-decoration: none; }

.main-content {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2.5rem var(--spacing-page);
}

.site-footer {
  border-top: 1px solid var(--color-border);
  text-align: center;
  padding: 1.5rem var(--spacing-page);
  font-size: 0.85rem;
  color: var(--color-muted);
}
.site-footer a { color: var(--color-muted); }

/* ===== HOME: PROFILE ===== */
.profile {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  margin-bottom: 2.5rem;
}

.profile-photo {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid var(--color-border);
}

.profile-photo-wrap {
  flex-shrink: 0;
}

.profile-name { font-size: 2rem; margin-bottom: 0.2rem; }
.profile-title { color: var(--color-muted); margin-bottom: 0.1rem; font-size: 1rem; }
.profile-institution { color: var(--color-muted); font-size: 0.95rem; margin-bottom: 0.75rem; }
.profile-bio { margin-bottom: 1rem; }

.profile-links {
  display: flex;
  gap: 0.6rem;
  flex-wrap: wrap;
}

/* ===== BUTTONS ===== */
.btn {
  display: inline-block;
  padding: 0.45rem 1rem;
  border-radius: 5px;
  font-size: 0.88rem;
  font-weight: 500;
  background: var(--color-link);
  color: #fff;
  border: 1px solid var(--color-link);
  cursor: pointer;
  transition: background 0.15s;
}
.btn:hover { background: var(--color-link-hover); text-decoration: none; color: #fff; }

.btn-secondary {
  background: transparent;
  color: var(--color-link);
}
.btn-secondary:hover { background: var(--color-tag-bg); }

/* ===== PAPERS ===== */
.paper-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.paper-item {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.1rem 1.25rem;
}

.paper-title {
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.2rem;
}

.paper-authors {
  font-size: 0.88rem;
  color: var(--color-muted);
  margin-bottom: 0.1rem;
}

.paper-venue {
  font-size: 0.85rem;
  color: var(--color-muted);
  font-style: italic;
  margin-bottom: 0.5rem;
}

.paper-abstract {
  margin: 0.5rem 0;
}

.paper-abstract summary {
  cursor: pointer;
  font-size: 0.88rem;
  color: var(--color-link);
  user-select: none;
}

.abstract-body {
  margin-top: 0.5rem;
  font-size: 0.92rem;
  line-height: 1.65;
  color: #374151;
  padding-left: 0.5rem;
  border-left: 2px solid var(--color-border);
}

.paper-links {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.paper-link {
  font-size: 0.83rem;
  font-weight: 500;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 0.2rem 0.6rem;
  color: var(--color-link);
}
.paper-link:hover { background: var(--color-tag-bg); text-decoration: none; }

/* ===== POST LIST ===== */
.post-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.post-list-item { border-bottom: 1px solid var(--color-border); padding-bottom: 1.25rem; }
.post-list-item:last-child { border-bottom: none; }

.post-list-title {
  display: block;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 0.15rem;
}

.post-list-date {
  display: block;
  font-size: 0.83rem;
  color: var(--color-muted);
  margin-bottom: 0.25rem;
}

.post-list-summary {
  font-size: 0.92rem;
  color: #374151;
  margin-bottom: 0.3rem;
}

.more-link {
  display: inline-block;
  margin-top: 1rem;
  font-size: 0.9rem;
  font-weight: 500;
}

/* ===== TAGS ===== */
.post-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.25rem; }

.tag {
  display: inline-block;
  background: var(--color-tag-bg);
  color: var(--color-tag-text);
  border-radius: 4px;
  padding: 0.1rem 0.55rem;
  font-size: 0.78rem;
  font-weight: 500;
}
.tag:hover { text-decoration: none; background: #dbeafe; }

.tag-heading { font-size: 1rem; padding: 0.2rem 0.7rem; }

.tag-index { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 0.5rem; }

/* ===== BLOG POST ===== */
.post-header { margin-bottom: 2rem; }
.post-title { margin-bottom: 0.4rem; }

.post-meta {
  font-size: 0.85rem;
  color: var(--color-muted);
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.post-content { font-family: var(--font-sans); }
.post-content h2 { margin-top: 2.5rem; }
.post-content h3 { margin-top: 2rem; }

/* KaTeX display math: ensure horizontal scroll on overflow rather than page overflow */
.post-content .katex-display {
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.5rem 0;
}

.post-nav { margin-top: 3rem; padding-top: 1rem; border-top: 1px solid var(--color-border); }

/* ===== INTERACTIVE DEMO CONTAINERS ===== */
.demo-container {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.25rem;
  margin: 1.5rem 0;
  background: var(--color-bg-subtle);
}

.demo-container canvas,
.demo-container iframe,
.demo-container svg {
  display: block;
  max-width: 100%;
  margin: 0 auto;
}

/* ===== SEARCH ===== */
.search-input {
  width: 100%;
  padding: 0.65rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 1rem;
  font-family: var(--font-sans);
  margin-bottom: 1.5rem;
  outline: none;
}
.search-input:focus { border-color: var(--color-link); box-shadow: 0 0 0 3px rgba(29,78,216,0.1); }

.search-results { display: flex; flex-direction: column; gap: 1.25rem; }

.search-result { border-bottom: 1px solid var(--color-border); padding-bottom: 1rem; }

.search-result-title {
  font-weight: 600;
  font-size: 1rem;
  display: block;
  margin-bottom: 0.25rem;
}

.search-result-summary { font-size: 0.9rem; color: #374151; margin-bottom: 0.25rem; }

/* ===== RESPONSIVE ===== */
@media (max-width: 600px) {
  html { font-size: 16px; }

  .profile {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .profile-links { justify-content: center; }

  .nav { flex-wrap: wrap; height: auto; padding: 0.75rem 0; }
  .nav-links { gap: 1rem; }
}
```

---

## Demo Blog Posts

### `src/posts/01-latex-guide.md`

````markdown
---
layout: post.njk
title: "Writing Mathematics: A LaTeX Guide for This Blog"
date: 2025-01-15
summary: "A reference post showing how to write inline and display math, aligned equations, and common notation."
tags: [posts, meta, latex]
---

This post is a living reference for authoring mathematical content on this site. All math is written in standard LaTeX syntax and rendered at build time using [KaTeX](https://katex.org/).

## Inline Math

Wrap inline expressions in single dollar signs: `$...$`

The Cauchy–Schwarz inequality states that $\left|\langle u, v \rangle\right| \leq \|u\| \cdot \|v\|$ for all vectors $u, v$ in an inner product space.

The Euler identity is perhaps the most celebrated equation in mathematics: $e^{i\pi} + 1 = 0$.

## Display Math

Wrap block equations in double dollar signs: `$$...$$`

The Fourier transform of a function $f \in L^1(\mathbb{R})$ is defined as

$$\hat{f}(\xi) = \int_{-\infty}^{\infty} f(x)\, e^{-2\pi i x \xi}\, dx$$

The general form of Stokes' theorem unifies the classical theorems of vector calculus:

$$\int_M d\omega = \int_{\partial M} \omega$$

where $M$ is an oriented smooth manifold with boundary $\partial M$ and $\omega$ is a differential form.

## Aligned Equations

Use `\begin{aligned}...\end{aligned}` for multi-line derivations:

$$
\begin{aligned}
(x + y)^3 &= (x+y)(x+y)^2 \\
           &= (x+y)(x^2 + 2xy + y^2) \\
           &= x^3 + 3x^2y + 3xy^2 + y^3
\end{aligned}
$$

## Common Environments

**Matrices:**

$$
A = \begin{pmatrix} a & b \\ c & d \end{pmatrix}, \qquad \det(A) = ad - bc
$$

**Cases:**

$$
|x| = \begin{cases} x & \text{if } x \geq 0 \\ -x & \text{if } x < 0 \end{cases}
$$

**Sums and products:**

$$
\exp(x) = \sum_{n=0}^{\infty} \frac{x^n}{n!}, \qquad \Gamma(n) = (n-1)! = \prod_{k=1}^{n-1} k
$$

## Common Symbols Reference

| LaTeX | Renders as | Usage |
|---|---|---|
| `\mathbb{R}` | $\mathbb{R}$ | Real numbers |
| `\mathbb{C}` | $\mathbb{C}$ | Complex numbers |
| `\mathbb{Z}` | $\mathbb{Z}$ | Integers |
| `\partial` | $\partial$ | Partial derivative |
| `\nabla` | $\nabla$ | Gradient / del |
| `\otimes` | $\otimes$ | Tensor product |
| `\oplus` | $\oplus$ | Direct sum |
| `\hookrightarrow` | $\hookrightarrow$ | Injection |
| `\twoheadrightarrow` | $\twoheadrightarrow$ | Surjection |
| `\iff` | $\iff$ | If and only if |
| `\forall` | $\forall$ | For all |
| `\exists` | $\exists$ | There exists |

## Writing Tips

- For long display equations that may overflow on mobile, KaTeX will render them with horizontal scroll automatically.
- Avoid using `\def` or `\newcommand` in individual posts — custom macros must be declared globally in the build config.
- Use `\text{...}` inside math mode for prose snippets: $f \text{ is continuous at } x_0$.
- Prefer `\langle \rangle` over `< >` for inner products: $\langle u, v \rangle$.
````

---

### `src/posts/02-interactive-demo.md`

````markdown
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
````

---

### `src/posts/03-pyodide-demo.md`

````markdown
---
layout: post.njk
title: "Python in the Browser: Symbolic Computation with Pyodide"
date: 2025-01-25
summary: "Run real Python (with SymPy) directly in a blog post using Pyodide. No server required."
tags: [posts, python, computation, sympy]
---

[Pyodide](https://pyodide.org/) is a WebAssembly port of CPython. It runs entirely in the browser — there is no server, no backend, no API call. This post shows how to embed a live Python computation environment in a blog post.

**Note:** Pyodide loads approximately 10 MB on first use. There will be a brief loading period. Subsequent visits use the browser cache.

## Live Symbolic Computation (SymPy)

Type a SymPy expression and click **Compute**. The result is rendered as LaTeX using KaTeX.

<div class="demo-container" id="pyodide-demo">
  <div id="pyodide-status" style="font-size:0.85rem; color:#6b7280; margin-bottom:0.75rem;">
    Loading Python environment… (this may take a moment)
  </div>
  <div style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-bottom:0.75rem;">
    <input
      type="text"
      id="sympy-input"
      value="integrate(sin(x)**2, x)"
      placeholder="SymPy expression"
      style="flex:1; min-width:200px; padding:0.5rem 0.75rem; border:1px solid #e5e7eb; border-radius:5px; font-size:0.9rem; font-family:monospace;"
      disabled
    />
    <button class="btn" id="compute-btn" onclick="runSympy()" disabled>Compute</button>
  </div>
  <div id="sympy-output" style="font-size:1.1rem; min-height:2rem; padding:0.5rem 0;"></div>
  <details style="margin-top:0.75rem; font-size:0.85rem;">
    <summary style="cursor:pointer; color:#6b7280;">Example expressions to try</summary>
    <ul style="margin-top:0.5rem; color:#374151;">
      <li><code>diff(exp(x)*sin(x), x)</code></li>
      <li><code>limit(sin(x)/x, x, 0)</code></li>
      <li><code>factor(x**3 - x**2 - x + 1)</code></li>
      <li><code>series(cos(x), x, 0, 8)</code></li>
      <li><code>solve(x**2 - 2, x)</code></li>
      <li><code>Matrix([[1,2],[3,4]]).eigenvals()</code></li>
    </ul>
  </details>
</div>

<script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js"></script>
<script>
let pyodide = null;

async function loadPyodide_() {
  const status = document.getElementById("pyodide-status");
  try {
    pyodide = await loadPyodide();
    status.textContent = "Loading SymPy…";
    await pyodide.loadPackage("sympy");
    await pyodide.runPythonAsync("from sympy import *; x, y, z, n = symbols('x y z n')");
    status.textContent = "Python ready.";
    document.getElementById("sympy-input").disabled = false;
    document.getElementById("compute-btn").disabled = false;
    document.getElementById("compute-btn").textContent = "Compute";
  } catch (err) {
    status.textContent = "Failed to load Python: " + err.message;
  }
}

async function runSympy() {
  if (!pyodide) return;
  const expr = document.getElementById("sympy-input").value.trim();
  const output = document.getElementById("sympy-output");
  if (!expr) { output.textContent = ""; return; }
  try {
    const result = await pyodide.runPythonAsync(`
latex(${expr})
`);
    output.innerHTML = `\\[${result}\\]`;
    // Re-render KaTeX on the new content
    if (window.renderMathInElement) {
      renderMathInElement(output, {
        delimiters: [{ left: "\\[", right: "\\]", display: true }]
      });
    } else {
      output.innerHTML = `<code>${result}</code>`;
    }
  } catch (err) {
    output.innerHTML = `<span style="color:#dc2626; font-size:0.85rem;">Error: ${err.message}</span>`;
  }
}

document.getElementById("sympy-input").addEventListener("keydown", e => {
  if (e.key === "Enter") runSympy();
});

loadPyodide_();
</script>

<!-- KaTeX auto-render for dynamically inserted math -->
<script defer
  src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js">
</script>
<script defer
  src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"
  onload="renderMathInElement(document.body)">
</script>

## How It Works

Pyodide loads the full CPython 3.11 interpreter as a WebAssembly binary, then fetches SymPy's wheel file. All computation happens in the browser — the server only ever delivers static files.

The integration pattern for any post:

```html
<script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js"></script>
<script>
async function main() {
  const pyodide = await loadPyodide();
  await pyodide.loadPackage(["numpy", "sympy"]); // add any pure-Python packages
  const result = await pyodide.runPythonAsync(`
    import numpy as np
    np.linalg.norm([3, 4])
  `);
  document.getElementById("output").textContent = result; // → 5.0
}
main();
</script>
```

Available packages include `numpy`, `scipy`, `sympy`, `matplotlib` (static output via `plt.savefig`), and most pure-Python packages via `pyodide.loadPackage("micropip")` → `micropip.install("packagename")`.
````

---

## GitHub Actions Deployment

### `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"

      - run: npm ci

      - run: npm run build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: _site

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

---

## GitHub Pages Configuration

After pushing to GitHub:

1. Go to **Settings → Pages** in your repository.
2. Under **Source**, select **GitHub Actions**.
3. Push a commit to `main` — the site deploys automatically.
4. The live URL will be `https://YOURUSERNAME.github.io/REPONAME/`.

If deploying to a project repo (not a user root repo), set `pathPrefix` in `.eleventy.js`:

```js
// Only needed if your repo is not YOURUSERNAME.github.io
// e.g. github.com/YOURUSERNAME/math-site → set "/math-site"
// Leave as "" for user/org root repos
const PATH_PREFIX = process.env.ELEVENTY_PATH_PREFIX || "";

return {
  pathPrefix: PATH_PREFIX,
  dir: { input: "src", output: "_site" }
};
```

And in the deploy workflow add `env: ELEVENTY_PATH_PREFIX: /math-site` to the build step.

---

## TODO Checklist for the Owner

After Claude Code scaffolds the site, complete these steps manually:

- [ ] Edit `src/_data/metadata.js` — name, institution, email, GitHub URL, bio
- [ ] Add profile photo at `src/assets/img/profile.jpg` (square, ≥ 400×400 px)
- [ ] Add CV PDF at `src/assets/cv/cv.pdf`
- [ ] Add paper PDFs at `src/assets/papers/*.pdf` (optional — arXiv links also work)
- [ ] Update the `papers` array in `src/index.njk` with real titles, authors, venues, abstracts, and links
- [ ] Replace placeholder `baseUrl` in `metadata.js` with your actual GitHub Pages URL
- [ ] Set the correct `PATH_PREFIX` in `.eleventy.js` if deploying to a project repo (not a root user repo)
- [ ] Enable GitHub Pages via Settings → Pages → Source: GitHub Actions

---

## Setup Commands

Run these in order after cloning:

```bash
npm install          # install dependencies
npm start            # dev server at http://localhost:8080 with live reload
npm run build        # production build to _site/
```

---

## Notes for Claude Code

- All file paths above are relative to the project root.
- Create every file listed. Do not skip any.
- Where placeholder content is marked `TODO`, insert sensible placeholder text and an inline `<!-- TODO: ... -->` comment so the owner can find it.
- The CSS is intentionally complete. Do not simplify or remove rules.
- The three demo blog posts must be created exactly as specified — they serve as both working demos and documentation.
- After scaffolding, run `npm install && npm start` and report any build errors.
- Do not install any dependency not listed in the `package.json` above without explaining why it is needed.
