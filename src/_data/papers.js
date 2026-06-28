// Papers & publications, shown on the home page.
//
// IMPORTANT — writing LaTeX in abstracts:
// Author each abstract with `String.raw` (the tag before the backticks) so you
// can write normal single-backslash LaTeX: $x \in S$, $a \geq b$, $\alpha$.
// Without String.raw, a plain string would swallow the backslashes ("\in" → "in")
// and KaTeX would render stray italic letters instead of the symbols.
// Use inline math with $…$. For display math, put $$…$$ on its own.

module.exports = [
  {
    title: "TODO: Paper Title One",
    authors: "Your Name, Collaborator Name",
    venue: "Journal of Mathematics, 2024",
    abstract: String.raw`TODO: Paste abstract here. Inline math works naturally now — e.g. a map $f: M \to N$ between manifolds, a bound $\lvert\langle u, v\rangle\rvert \leq \lVert u\rVert\,\lVert v\rVert$, or a condition $x \in S$.`,
    arxiv: "https://arxiv.org/abs/0000.00000",
    pdf: "",
  },
  {
    title: "TODO: Paper Title Two",
    authors: "Your Name",
    venue: "Preprint, 2025",
    abstract: String.raw`TODO: Paste abstract here. You can write $\geq$, $\alpha \in \mathbb{R}$, and other LaTeX with single backslashes.`,
    arxiv: "",
    pdf: "/assets/papers/paper2.pdf",
  },
];
