---
layout: post.njk
title: "Writing Mathematics: A LaTeX Guide for This Blog"
date: 2025-01-15
summary: "A reference post showing how to write inline and display math, aligned equations, and common notation."
kind: note
status: evergreen
updated: 2025-01-15
tags: [posts, notes, meta, latex]
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
