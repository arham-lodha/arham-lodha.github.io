---
layout: post.njk
title: "What are graphons?"
date: 2026-06-28
summary: "An interactive visualization of circle packing using D3.js, embedded directly in a Markdown post."
kind: research
status: incomplete
updated: 2026-06-29
tags: [posts, research, graphons, extremal combinatorics, probability]
---

## Introduction

Extremal combinatorics fundamentally asks the question about how local constraints affect global behavior. Historically, such questions were asked about graphs, which intuitively are collections of points and lines between them. Work in this area has led to fundamental theorems like Mantel's Theorem, Turán's Theorem, and the Kruskal-Katona Theorem @bollobas1998modern. However, the development of the theory of dense graph limits, specifically the introduction of graphons by Lovász and Szegedy @lovasz2006limits, provided a powerful continuous framework for these discrete problems. Graphons act as limit objects for sequences of dense graphs, allowing us to study subgraph densities using the tools of real analysis, topology, and measure theory.

<!--> TODO figure out how to cite sources </-->
Philosophically, graphons represent the completion of the space of dense finite graphs, much as the real numbers complete the rationals @lovasz2012large. In the discrete realm, graphs are notoriously rigid. For example, how do you compare two graphs of different sizes? Does the question asking how similar two finite graphs of different sizes are even make sense? Graphons wash away this discrete noise, capturing the pure "structural essence" of a network. By mapping graphs to symmetric measurable functions, the fundamentally combinatorial act of counting subgraphs is transformed into the analytic act of integration.

## The Basics

TODO Find a better way to insert definitions
  A *simple graph*, informally, is a collection of points together with lines connecting the points, where no line can connect a point to itself. Formally, we define a simple graph $G$ as a pair $G = (V, E)$ where $V$ is finite set, identified with ${1, ..., abs(V)}$, and $E$ is a set of unordered pairs of distinct elements of $V$. We call elements of $V$ vertices and elements of $E$ edges. When we need to refer to the vertex and edge sets of a particular graph $G$, we can write $V(G)$ and $E(G)$. Let the set of simple graphs be $cal(G)$.


Graphons were introduced by Lovász and Szegedy @lovasz2006limits as a limit object for sequences of dense simple graphs. Before giving the formal definition, we motivate the choice of object by describing how a graphon parametrizes a natural random graph model — a perspective that will make the equivalence relations in the formal definition feel inevitable rather than arbitrary.

Given a symmetric measurable function $W: [0, 1]^(2) -> [0, 1]$ and an integer $n$, the *$W$-random graph* $G(n, W)$ on a vertex set ${1, #sym.dots.h, n}$ is constructed in two steps. First, independently sample $n$ random variables $U_(1), #sym.dots.h, U_(n)$ uniformly on $[0, 1]$ and assign the label $U_(i)$ to vertex $i$. Secondly, independently on each pair $i < j$, include the edge ${i, j}$ with probability $W(U_(i), U_(j))$. The value $W(x, y)$ is then the connection probability between vertices labeled $x$ and $y$ and the uniform distribution on $[0, 1]$ is the distribution over the labels. This construction recovers the Erdös-Rényi model $G(n, p)$ when $W equiv p$ is constant, and recovers the stochastic block model when $W$ is a step function, which we will call multipodal.


