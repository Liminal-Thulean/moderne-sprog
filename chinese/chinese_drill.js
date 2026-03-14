/**
 * chinese_drill.js — Character Drill: Multiple Choice + Hanzi Builder (stub)
 * Part of Glossarium / Language Nexus — Classical Chinese section
 *
 * Exposes: CharDrill()
 * Depends: chinese_shared.js  (C, POS_COLORS, shuffle)
 *          chinese_data.js    (CHARACTERS)
 *
 * DRILL TYPES
 * ──────────────────────────────────────────────────────────────────────────────
 * 1. Multiple Choice (ACTIVE)
 *    Show character → student picks correct English from 4 options.
 *    Options are drawn from the CHARACTERS pool as distractors.
 *
 * 2. Hanzi Builder (STUB — ready for implementation)
 *    Show component radicals + English gloss → student assembles the character.
 *    Data: CHARACTERS[n].components[]
 *    Implementation: drag-and-drop or click-to-slot UI goes in BuilderCard below.
 *    Characters without components[] are filtered out automatically.
 *
 * ADDING A NEW DRILL TYPE: add a mode constant below, add a tab button in
 * CharDrill's render, and add a new Card component.
 */

// ─── DRILL MODE CONSTANTS ─────────────────────────────────────────────────────

const DRILL_MODES = {
  MULTIPLE_CHOICE: "multiple_choice",
  BUILDER:         "builder",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

// Build a set of 4 options: 1 correct + 3 wrong drawn from the pool.
// Returns array of { eng, pinyin, isCorrect } shuffled.
function buildOptions(correct, pool) {
  const distractors = shuffle(pool.filter(c => c.char !== correct.char))
    .slice(0, 3)
    .map(c => ({ label: c.eng.split(",")[0].trim(), pinyin: c.pinyin, isCorrect: false }));
  return shuffle([
    { label: correct.eng.split(",")[0].trim(), pinyin: correct.pinyin, isCorrect: true },
    ...distractors,
  ]);
}

// Characters available for the builder (must have components)
const BUILDER_CHARS = CHARACTERS.filter(c => c.components && c.components.length > 1);

// ─── MULTIPLE CHOICE CARD ─────────────────────────────────────────────────────

function MultipleChoiceCard({ char, options, status, onSelect, onNext }) {
  const pc = POS_COLORS[char.pos.split("/")[0]] || POS_COLORS.noun;
  return (
    <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: "6px", overflow: "hidden", marginBottom: "16px" }}>

      {/* Character display */}
      <div style={{ background: "linear-gradient(180deg,#4a3010 0%,#3a2410 100%)", padding: "36px 20px 28px", textAlign: "center", borderBottom: "1px solid " + C.border }}>
        <div style={{ fontFamily: "'Noto Serif TC',serif", fontSize: "100px", color: "#f0e4c4", lineHeight: 1, marginBottom: "14px" }}>
          {char.char}
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: "8px", letterSpacing: "1.5px", padding: "2px 8px", borderRadius: "10px", background: pc.bg, border: "1px solid " + pc.border, color: pc.border }}>
            {char.pos}
          </span>
          {char.components && (
            <span style={{ fontFamily: "'Noto Serif TC',serif", fontSize: "14px", color: "rgba(255,255,255,0.35)", letterSpacing: "4px" }}>
              {char.components.join(" + ")}
            </span>
          )}
        </div>
      </div>

      {/* Options */}
      <div style={{ padding: "20px 22px" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "2px", color: C.textMuted, textTransform: "uppercase", marginBottom: "12px" }}>
          Select the correct meaning:
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {options.map((opt, i) => {
            let bg = C.surface, border = C.border, color = C.text, labelColor = C.textMuted;
            if (status) {
              if (opt.isCorrect) {
                bg = "rgba(45,138,95,0.10)"; border = C.green; color = C.green; labelColor = C.green;
              } else if (!opt.isCorrect && status === opt.label) {
                bg = "rgba(200,64,48,0.10)"; border = C.red; color = C.red; labelColor = C.red;
              } else {
                color = C.textMuted; labelColor = "#c9b48a";
              }
            }
            return (
              <button key={i} onClick={() => !status && onSelect(opt)}
                disabled={!!status}
                style={{
                  textAlign: "left", padding: "12px 14px",
                  background: bg, border: "1px solid " + border,
                  borderRadius: "4px", cursor: status ? "default" : "pointer",
                  transition: "all 0.15s",
                }}>
                <div style={{ fontFamily: "'EB Garamond',serif", fontSize: "15px", color: color, lineHeight: 1.3, marginBottom: "3px" }}>
                  {opt.label}
                </div>
                <div style={{ fontFamily: "'EB Garamond',serif", fontSize: "11px", color: labelColor, fontStyle: "italic" }}>
                  {opt.pinyin}
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {status && (
          <div style={{ marginTop: "14px", padding: "12px 16px", background: status === "correct" ? "rgba(45,138,95,0.08)" : "rgba(200,64,48,0.07)", border: "1px solid " + (status === "correct" ? C.green : C.red), borderRadius: "4px" }}>
            <div style={{ fontFamily: "'Cinzel',serif", fontSize: "10px", letterSpacing: "1px", color: status === "correct" ? C.green : C.red, marginBottom: "6px" }}>
              {status === "correct" ? "✓  CORRECT" : "✗  INCORRECT"}
            </div>
            <div style={{ fontFamily: "'EB Garamond',serif", fontSize: "15px", color: C.text, marginBottom: "3px" }}>
              <span style={{ fontFamily: "'Noto Serif TC',serif", marginRight: "8px" }}>{char.char}</span>
              {char.eng}
            </div>
            <div style={{ fontFamily: "'EB Garamond',serif", fontSize: "12px", color: C.textMuted, fontStyle: "italic", marginBottom: char.notes ? "6px" : "0" }}>
              {char.pinyin}
            </div>
            {char.notes && (
              <div style={{ fontFamily: "'EB Garamond',serif", fontSize: "12px", color: C.textMuted, fontStyle: "italic", lineHeight: "1.6", borderTop: "1px solid " + C.borderDim, paddingTop: "8px", marginTop: "6px" }}>
                {char.notes}
              </div>
            )}
          </div>
        )}

        {/* Next button */}
        {status && (
          <button onClick={onNext}
            style={{ marginTop: "12px", width: "100%", fontFamily: "'Cinzel',serif", fontSize: "10px", letterSpacing: "1.5px", padding: "10px", background: C.goldDim, color: "#f5f0e8", border: "none", borderRadius: "3px", cursor: "pointer" }}>
            NEXT →
          </button>
        )}
      </div>
    </div>
  );
}

// ─── BUILDER CARD (STUB) ──────────────────────────────────────────────────────
// Placeholder until the drag-and-drop radical assembly is implemented.
// The infrastructure (mode toggle, BUILDER_CHARS filter, score tracking) is
// all in place — this component just needs its UI built out.

function BuilderCard({ char, onCorrect, onWrong, onNext }) {
  return (
    <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: "6px", overflow: "hidden", marginBottom: "16px" }}>
      <div style={{ background: "linear-gradient(180deg,#4a3010 0%,#3a2410 100%)", padding: "36px 20px 28px", textAlign: "center", borderBottom: "1px solid " + C.border }}>
        <div style={{ fontFamily: "'Noto Serif TC',serif", fontSize: "14px", color: "rgba(255,255,255,0.5)", letterSpacing: "6px", marginBottom: "16px" }}>
          {char.components.join("  +  ")}
        </div>
        <div style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: "16px", color: "#e8c97a" }}>
          {char.eng.split(",")[0].trim()}
        </div>
      </div>
      <div style={{ padding: "32px 22px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "3px", color: C.textMuted, textTransform: "uppercase", marginBottom: "16px" }}>
          Hanzi Builder — Coming Soon
        </div>
        <div style={{ fontFamily: "'EB Garamond',serif", fontSize: "14px", color: C.textMuted, lineHeight: "1.7", marginBottom: "20px", maxWidth: "360px", margin: "0 auto 20px" }}>
          Assemble the character from its components.<br/>
          <span style={{ fontStyle: "italic" }}>Drag-and-drop interface in development.</span>
        </div>
        <div style={{ fontFamily: "'Noto Serif TC',serif", fontSize: "72px", color: C.border, lineHeight: 1 }}>
          {char.char}
        </div>
        <button onClick={onNext} style={{ marginTop: "20px", fontFamily: "'Cinzel',serif", fontSize: "10px", letterSpacing: "1.5px", padding: "10px 24px", background: C.goldDim, color: "#f5f0e8", border: "none", borderRadius: "3px", cursor: "pointer" }}>
          NEXT →
        </button>
      </div>
    </div>
  );
}

// ─── MAIN CHAR DRILL ─────────────────────────────────────────────────────────

function CharDrill() {
  const [drillMode, setDrillMode] = React.useState(DRILL_MODES.MULTIPLE_CHOICE);

  // Multiple-choice state
  const [mcOrder]  = React.useState(() => shuffle([...Array(CHARACTERS.length).keys()]));
  const [mcIdx,  setMcIdx]  = React.useState(0);
  const [options, setOptions] = React.useState(() => buildOptions(CHARACTERS[0], CHARACTERS));
  const [mcStatus, setMcStatus] = React.useState(null); // null | "correct" | wrong_label
  const [mcScore, setMcScore]   = React.useState({ c: 0, w: 0 });

  // Builder state (wired up, component itself is a stub)
  const [bOrder]   = React.useState(() => shuffle([...Array(BUILDER_CHARS.length).keys()]));
  const [bIdx,   setBIdx]   = React.useState(0);
  const [bScore, setBScore] = React.useState({ c: 0, w: 0 });

  // ── Multiple choice handlers ────────────────────────────────────────────────
  const mcChar = CHARACTERS[mcOrder[mcIdx % mcOrder.length]];

  const handleMcSelect = (opt) => {
    const correct = opt.isCorrect;
    setMcStatus(correct ? "correct" : opt.label);
    setMcScore(s => correct ? { ...s, c: s.c + 1 } : { ...s, w: s.w + 1 });
  };

  const handleMcNext = () => {
    const nextIdx = mcIdx + 1;
    const nextChar = CHARACTERS[mcOrder[nextIdx % mcOrder.length]];
    setMcIdx(nextIdx);
    setOptions(buildOptions(nextChar, CHARACTERS));
    setMcStatus(null);
  };

  // ── Builder handlers ────────────────────────────────────────────────────────
  const bChar = BUILDER_CHARS.length > 0 ? BUILDER_CHARS[bOrder[bIdx % bOrder.length]] : null;

  const handleBNext = () => setBIdx(i => i + 1);

  // ── Shared progress ─────────────────────────────────────────────────────────
  const ismc   = drillMode === DRILL_MODES.MULTIPLE_CHOICE;
  const pool   = ismc ? CHARACTERS : BUILDER_CHARS;
  const idx    = ismc ? mcIdx : bIdx;
  const score  = ismc ? mcScore : bScore;
  const total  = score.c + score.w;
  const acc    = total > 0 ? Math.round((score.c / total) * 100) : null;

  return (
    <div style={{ marginTop: "20px" }}>

      {/* Drill type toggle */}
      <div style={{ display: "flex", gap: "0", marginBottom: "20px", border: "1px solid " + C.border, borderRadius: "4px", overflow: "hidden", alignSelf: "flex-start", width: "fit-content" }}>
        {[
          [DRILL_MODES.MULTIPLE_CHOICE, "Multiple Choice"],
          [DRILL_MODES.BUILDER,         "Hanzi Builder"],
        ].map(([mode, label]) => {
          const active = drillMode === mode;
          const isBuilder = mode === DRILL_MODES.BUILDER;
          return (
            <button key={mode}
              onClick={() => !isBuilder && setDrillMode(mode)}
              title={isBuilder ? "Coming soon" : ""}
              style={{
                fontFamily: "'Cinzel',serif", fontSize: "10px", letterSpacing: "1px",
                padding: "8px 18px",
                background: active ? "#3a2410" : "transparent",
                color: active ? "#e8c97a" : isBuilder ? C.border : C.textMuted,
                border: "none",
                borderRight: mode === DRILL_MODES.MULTIPLE_CHOICE ? "1px solid " + C.border : "none",
                cursor: isBuilder ? "not-allowed" : "pointer",
                transition: "all 0.15s",
                position: "relative",
              }}>
              {label}
              {isBuilder && (
                <span style={{ marginLeft: "6px", fontFamily: "'EB Garamond',serif", fontSize: "9px", fontStyle: "italic", color: C.border }}>
                  soon
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Progress bar */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <div style={{ flex: 1, height: "3px", background: C.borderDim, borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${((idx % pool.length) / pool.length) * 100}%`, background: C.gold, transition: "width 0.4s" }} />
        </div>
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: "10px", color: C.textMuted, whiteSpace: "nowrap" }}>
          {(idx % pool.length) + 1} / {pool.length}
          {acc !== null && <span style={{ marginLeft: "8px", color: acc >= 80 ? C.green : acc >= 60 ? C.gold : C.red }}>{acc}% acc</span>}
        </span>
      </div>

      {/* Active drill card */}
      {drillMode === DRILL_MODES.MULTIPLE_CHOICE && (
        <MultipleChoiceCard
          char={mcChar}
          options={options}
          status={mcStatus}
          onSelect={handleMcSelect}
          onNext={handleMcNext}
        />
      )}
      {drillMode === DRILL_MODES.BUILDER && bChar && (
        <BuilderCard
          char={bChar}
          onCorrect={() => { setBScore(s => ({...s, c: s.c+1})); }}
          onWrong={()   => { setBScore(s => ({...s, w: s.w+1})); }}
          onNext={handleBNext}
        />
      )}
      {drillMode === DRILL_MODES.BUILDER && BUILDER_CHARS.length === 0 && (
        <div style={{ padding: "40px", textAlign: "center", fontFamily: "'EB Garamond',serif", fontSize: "14px", color: C.textMuted, fontStyle: "italic" }}>
          No characters with component data yet — add components[] to CHARACTERS in chinese_data.js.
        </div>
      )}

      {/* Score summary */}
      {total > 0 && (
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", fontFamily: "'Cinzel',serif", fontSize: "10px", letterSpacing: "1px" }}>
          <span style={{ color: C.green }}>✓ {score.c} correct</span>
          <span style={{ color: C.textMuted }}>·</span>
          <span style={{ color: C.red }}>✗ {score.w} wrong</span>
          <span style={{ color: C.textMuted }}>·</span>
          <span style={{ color: C.textMuted }}>{total} attempted</span>
        </div>
      )}
    </div>
  );
}
