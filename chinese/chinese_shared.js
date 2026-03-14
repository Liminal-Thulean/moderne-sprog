/**
 * chinese_shared.js — Colour palette, POS colours, and utilities
 * Part of Glossarium / Language Nexus — Classical Chinese section
 *
 * Exposes: C, POS_COLORS, shuffle(arr), normalise(s)
 */

// ─── COLOUR PALETTE ───────────────────────────────────────────────────────────
// Parchment/gold theme — matches Latin, Greek, Sanskrit

const C = {
  bg:         "#f5f0e8",
  surface:    "#fffdf6",
  card:       "#fffdf6",
  border:     "#d4bc84",
  borderDim:  "#e8dfc0",
  gold:       "#b8973e",
  goldLight:  "#f0e4c4",
  goldDim:    "#8a6914",
  goldFaint:  "rgba(184,151,62,0.10)",
  text:       "#2c1f0e",
  textMuted:  "#9a7a3a",
  red:        "#c84030",
  green:      "#2d8a5f",
};

const POS_COLORS = {
  noun:    { bg:"rgba(45,106,79,0.18)",   border:"#2d6a4f" },
  verb:    { bg:"rgba(180,120,20,0.18)",  border:"#b07818" },
  adj:     { bg:"rgba(80,40,140,0.18)",   border:"#6a3aaa" },
  adv:     { bg:"rgba(20,80,140,0.18)",   border:"#1a60aa" },
  particle:{ bg:"rgba(140,40,40,0.18)",   border:"#8a2828" },
  pronoun: { bg:"rgba(40,100,140,0.18)",  border:"#2878aa" },
  numeral: { bg:"rgba(100,60,0,0.18)",    border:"#7a4800" },
};

// ─── UTILITIES ────────────────────────────────────────────────────────────────

// ─── UTILITIES ───────────────────────────────────────────────────────────────

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

function normalise(s) {
  return s.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g,"");
}