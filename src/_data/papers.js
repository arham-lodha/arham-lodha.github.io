module.exports = [
  {
    title: "Asymptotic Bounds on Homomorphism Densities in Triangle-Constrained Graphons.",
    authors: "Arham Rajendra Lodha",
    venue: "Honors Thesis, 2026",
    abstract: String.raw`This thesis investigates the asymptotic behavior of the maximum homomorphism density of an arbitrary subgraph $G$, denoted $T_{\max}^G(\epsilon, \tau)$, within graphons constrained by a fixed edge density $\epsilon \in (0, \frac{1}{2}]$ and a vanishing triangle density $\tau \to 0$. The main result establishes that this decay is governed by a precise power-law scaling, $T_{\max}^G(\epsilon, \tau) = \Theta(\tau^{\alpha(G)})$. The exponent $\alpha(G)$ is a graph parameter defined as the optimal value of a linear program whose variables correspond to the vertices of $G$ and whose constraints are dictated by the triangles of $G$. The upper bound, $T_{\max}^G(\epsilon, \tau) = \mathcal{O}(\tau^{\alpha(G)})$, is proven by introducing a Triangle Spanning Decomposition and applying Finner's Generalized Hölder Inequality in conjunction with Strong Duality in Linear Programming. To establish a matching lower bound, $T_{\max}^G(\epsilon, \tau) = \Omega(\tau^{\alpha(G)})$, a family of multipodal graphons is explicitly constructed, parameterized directly by the optimal solutions to the linear program to anchor the graphons tightly to the boundary. Ultimately, this parameter quantifies the exact rate at which complex, higher-order multi-particle interactions must decay when fundamental 3-particle interactions are actively suppressed.`,
    arxiv: "",
    pdf: "",
  },
  {
    title: "The Discrete Schwarz-Pick Lemma for Circle Packings Revisited",
    authors: "Arham Rajendra Lodha",
    venue: "Preprint, 2025",
    abstract: String.raw`The Discrete Schwarz-Pick Lemma is a discrete analogue of the classical result from complex analysis, arising from the connection between circle packings and conformal maps established by Thurston. Previous works by Beardon-Stephanson and Van Eeuwen proved this lemma for circle packings where circles are tangent or intersect at non-obtuse angles, corresponding to inversive distances $I \in [0, 1]$. This paper extends the investigation to circle packings with obtuse intersection ($I \in (-1, 0)$) and disjoint packings ($I > 1$). We prove that the Discrete Schwarz-Pick Lemma holds for the full range of intersecting circle packings with inversive distances in $(-1, 1]$, provided an additional condition on the weights of each triangle is satisfied. The proof relies on a variational principle for circle packings with inversive distances. Conversely, we show that the lemma fails for disjoint circle packings where $I \geq 1$. This is demonstrated by constructing a specific counterexample on a triangulated disk with four vertices.`,
    arxiv: "https://arxiv.org/abs/2511.10703",
    pdf: "",
  },
];
