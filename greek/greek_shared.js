/**
 * greek_shared.js — Shared utilities and base components
 * Part of Glossarium / Language Nexus — Greek section
 *
 * Exposes globals used by both greek_reader.js and greek_tables.js:
 *   toKey(w)       — strip diacritics + transliterate for dict lookup
 *   tokenise(text) — split text into word/punct tokens
 *   checkAnswer(input, correct) — "correct" | "partial" | "wrong"
 *   POS_COLORS     — part-of-speech colour map
 *   WordToken      — interactive word span with hover popup
 */
// strip diacritics (breathing, accent, iota subscript), lowercase, transliterate
function toKey(w) {
  return w
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // strip combining diacritics
    .replace(/\u03b9/g, "i")            // ι → i
    .replace(/\u03b1/g, "a")
    .replace(/\u03b2/g, "b")
    .replace(/\u03b3/g, "g")
    .replace(/\u03b4/g, "d")
    .replace(/\u03b5/g, "e")
    .replace(/\u03b6/g, "z")
    .replace(/\u03b7/g, "e")
    .replace(/\u03b8/g, "th")
    .replace(/\u03ba/g, "k")
    .replace(/\u03bb/g, "l")
    .replace(/\u03bc/g, "m")
    .replace(/\u03bd/g, "n")
    .replace(/\u03be/g, "x")
    .replace(/\u03bf/g, "o")
    .replace(/\u03c0/g, "p")
    .replace(/\u03c1/g, "r")
    .replace(/\u03c3/g, "s").replace(/\u03c2/g, "s")
    .replace(/\u03c4/g, "t")
    .replace(/\u03c5/g, "y")
    .replace(/\u03c6/g, "ph")
    .replace(/\u03c7/g, "kh")
    .replace(/\u03c8/g, "ps")
    .replace(/\u03c9/g, "o")
    .replace(/[^a-z]/g, "");
}

function tokenise(text) {
  const tokens = [];
  const re = /([·,.·;·—\s]+)|([^\s·,.;—]+)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m[1]) { tokens.push({ type: "space", text: m[1] }); }
    else {
      const raw = m[2];
      const stripped = raw.replace(/^[·,."()\[\]]+|[·,."()\[\]]+$/g, "");
      const prefix = raw.slice(0, raw.indexOf(stripped.charAt(0)) > -1 ? raw.indexOf(stripped) : 0);
      const suffix = raw.slice(raw.indexOf(stripped) + stripped.length);
      if (prefix) tokens.push({ type: "punct", text: prefix });
      if (stripped) tokens.push({ type: "word", text: stripped });
      if (suffix) tokens.push({ type: "punct", text: suffix });
    }
  }
  return tokens;
}

function checkAnswer(input, correct) {
  const norm = s => (s||"").trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-zα-ωάέήίόύώΐΰ]/gi,"");
  const n = norm(input);
  const c = norm(correct);
  if (n === c) return "correct";
  if (n.length > 1 && c.length > 1 && (c.includes(n) || n.includes(c))) return "partial";
  return "wrong";
}

// ─── POS COLOURS ──────────────────────────────────────────────────────────────

const POS_COLORS = {
  noun: { bg: "rgba(45,106,79,0.15)",   border: "#2d6a4f" },
  verb: { bg: "rgba(74,52,16,0.15)",    border: "#8a6914" },
  adj:  { bg: "rgba(60,30,100,0.12)",   border: "#6a3a9a" },
  adv:  { bg: "rgba(20,80,120,0.12)",   border: "#2a6090" },
  prep: { bg: "rgba(120,40,20,0.12)",   border: "#902a14" },
  conj: { bg: "rgba(80,80,20,0.12)",    border: "#807814" },
  pron: { bg: "rgba(100,30,80,0.12)",   border: "#7a2060" },
  part: { bg: "rgba(20,100,100,0.12)",  border: "#146a6a" },
  num:  { bg: "rgba(140,60,0,0.12)",    border: "#8c3c00" },
};

const TAG = {
  declension:  { bg: "#2d4a3e", text: "#a8d4b8" },
  conjugation: { bg: "#3a2c10", text: "#d4b870" },
};

// ─── WORD TOKEN COMPONENT ─────────────────────────────────────────────────────

function WordToken({ text, dict, activeId, setActiveId, idx }) {
  const isActive = activeId === idx;
  const key = toKey(text);
  const entry = dict ? (dict[key] || INLINE_DICT[key]) : INLINE_DICT[key];
  const pc = entry ? (POS_COLORS[entry.pos] || POS_COLORS.noun) : null;

  return (
    <span style={{ position: "relative", display: "inline" }}>
      <span
        onClick={() => setActiveId(isActive ? null : idx)}
        onMouseEnter={() => setActiveId(idx)}
        onMouseLeave={() => setActiveId(null)}
        style={{
          cursor: "pointer",
          fontStyle: "italic",
          borderBottom: isActive
            ? (entry ? "2px solid #b8973e" : "2px solid #888")
            : (entry ? "1px dotted #c9a84c" : "none"),
          color: isActive ? (entry ? "#8a6914" : "#888") : "#2c1f0e",
          background: isActive ? "rgba(184,151,62,0.07)" : "transparent",
          borderRadius: "1px",
          padding: "0 1px",
          transition: "all 0.1s",
        }}
      >
        {text}
      </span>
      {isActive && (
        <span style={{
          position: "absolute", bottom: "calc(100% + 10px)", left: "50%",
          transform: "translateX(-50%)", zIndex: 200, width: "280px",
          background: "#1e1408", border: "1px solid " + (entry ? "#8a6914" : "#555"),
          borderRadius: "5px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
          padding: "12px 14px", pointerEvents: "none",
        }}>
          <span style={{
            position: "absolute", bottom: "-6px", left: "50%", width: "10px",
            height: "10px", background: "#1e1408",
            border: "1px solid " + (entry ? "#8a6914" : "#555"),
            borderTop: "none", borderLeft: "none",
            transform: "translateX(-50%) rotate(45deg)", display: "block",
          }} />
          {entry ? (
            <>
              <div style={{ display: "flex", alignItems: "baseline", gap: "7px", marginBottom: "6px" }}>
                <span style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: "18px", color: "#e8c97a" }}>{text}</span>
                <span style={{ fontFamily: "'EB Garamond',serif", fontSize: "12px", color: "#c4a060", fontStyle: "italic" }}>{entry.lemma}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "5px" }}>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: "8px", letterSpacing: "1.5px", textTransform: "uppercase", padding: "2px 7px", borderRadius: "10px", background: pc.bg, border: "1px solid " + pc.border, color: pc.border }}>{entry.pos}</span>
              </div>
              <div style={{ fontFamily: "'EB Garamond',serif", fontSize: "13px", color: "#e8c97a", lineHeight: "1.4" }}>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: "7px", letterSpacing: "1px", color: "#6a5a3a", textTransform: "uppercase", marginRight: "5px" }}>Meaning</span>
                "{entry.eng}"
              </div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: "17px", color: "#aaa", marginBottom: "8px" }}>{text}</div>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "1px", color: "#666", textTransform: "uppercase", marginBottom: "5px" }}>Not in dictionary</div>
              <div style={{ fontFamily: "'EB Garamond',serif", fontSize: "11px", color: "#555", fontStyle: "italic" }}>
                Key: <span style={{ fontFamily: "monospace", background: "#111", padding: "1px 5px", borderRadius: "2px", color: "#888" }}>"{key}"</span>
              </div>
            </>
          )}
        </span>
      )}
    </span>
  );
}


