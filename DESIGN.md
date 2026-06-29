# Design System - Arham Lodha Research Garden

## Product Context
- **What this is:** A personal website and research garden for a mathematics PhD student.
- **Who it is for:** Arham first, then peers, advisors, curious mathematicians, and people who want to follow the trail of the work.
- **Project type:** Editorial personal site, blog, research log, and archive.
- **Memorable thing:** This person is doing cool interesting things.

## Aesthetic Direction
- **Direction:** Organized research garden.
- **Mood:** Serious enough for mathematics, alive enough for unfinished thinking. The site should feel like a public research desk rather than a static academic CV.
- **References:** Andy Matuschak's notes for connected evergreen thinking; Gwern.net for dense metadata and longform infrastructure; Tufte only as a reading-quality influence.
- **Avoid:** Full Tufte cosplay, generic academic minimalism, startup portfolio polish, and Gwern-level visual density.

## Typography
- **Body:** Self-hosted `et-book`, used for longform mathematical prose.
- **UI and metadata:** Gill Sans stack, used for navigation, labels, statuses, and archive controls.
- **Code:** SFMono/Consolas/Menlo stack.
- **Principle:** Serif prose carries the human reading experience; sans and mono metadata create the organized garden layer.

## Color
- **Approach:** Restrained but warmer than Tufte.
- **Paper:** `#fffdf2`
- **Ink:** `#171512`
- **Muted text:** `#676052`
- **Rule:** `#cbbda3`
- **Accent:** `#9f2f20`
- **Blue thread color:** `#2f6f9f`
- **Green status color:** `#6f8068`
- **Dark mode:** Warm dark surfaces, not pure black, with softened blue/green/red accents.

## Information Architecture
- **Home:** Map of the current mind: identity, current threads, ways into the garden, recent entries, then formal papers.
- **Garden archive:** Chronological archive of notes, logs, and experiments.
- **Trails:** Tags are cross-paths through the site, not rigid categories.
- **Post metadata:** `kind`, `status`, `updated`, and tags give readers lightweight context.

## Content Modes
- **Research log:** Rough, dated, in progress.
- **Notes:** Semi-polished and reusable.
- **Essays:** More finished arguments or explanations.
- **Experiments:** Interactive demos, visualizations, code sketches, and computational artifacts.
- **Papers:** Formal and citable work.

## Layout
- **Approach:** Hybrid. Longform posts stay narrow and calm; home and archive pages use wider index layouts.
- **Max post width:** About `48rem`.
- **Max site width:** About `72rem`.
- **Borders:** Thin rules and index rows instead of heavy cards.
- **Radius:** Small, never bubbly.

## Motion
- **Approach:** Minimal functional motion only.
- **Use:** Hover transitions, focus states, and small interaction feedback.
- **Avoid:** Scroll choreography, decorative animation, and anything that makes reading math harder.

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-28 | Move from pure Tufte to organized research garden | Tufte was elegant but too finished and impersonal for a site about ongoing PhD work, notes, logs, and experiments. |
