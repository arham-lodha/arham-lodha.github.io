(function () {
  const data = window.__searchIndex || [];
  // Stored post URLs are root-relative ("/posts/…/"); prepend the pathPrefix
  // root so links work when the site is served from a subpath.
  const base = (window.__pathPrefix || "/").replace(/\/$/, "");
  const withBase = (url) => base + url;

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
            <a href="${withBase(doc.url)}" class="search-result-title">${doc.title}</a>
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
