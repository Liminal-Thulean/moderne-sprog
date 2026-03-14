/**
 * chinese_reader.js — Library browser and passage reader
 * Part of Glossarium / Language Nexus — Classical Chinese section
 *
 * Exposes: ReaderMode()
 * Depends: chinese_shared.js (C, POS_COLORS)
 *          chinese_data.js   (PASSAGES)
 *
 * To add a text: edit PASSAGES in chinese_data.js.
 * PASSAGE format: { id, title, source, date, intro, text:"字 字 ，字 。" }
 * Separate every character and punctuation mark with a single space.
 */

// ─── READER ───────────────────────────────────────────────────────────────────

function ReaderMode() {
  const [dict, setDict]         = React.useState(null);
  const [err, setErr]           = React.useState(null);
  const [view, setView]         = React.useState("library");
  const [pidx, setPidx]         = React.useState(null);
  const [activeId, setActiveId] = React.useState(null);

  React.useEffect(() => {
    fetch("chinese_dict.json")
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(setDict).catch(e => setErr(e.message));
  }, []);

  // All hooks unconditional — guard with null checks
  const passage    = pidx !== null ? PASSAGES[pidx] : null;
  const tokens     = React.useMemo(() => passage ? passage.text.split(" ").filter(t => t.length > 0) : [], [pidx]);
  const charTokens = tokens.filter(t => /[\u4e00-\u9fff]/.test(t));
  const inDict     = dict ? charTokens.filter(t => dict[t]).length : 0;
  const coverage   = charTokens.length > 0 ? Math.round((inDict / charTokens.length) * 100) : 0;
  const isPunct    = t => /^[，。？！；：「」『』、]$/.test(t);

  const openPassage = (i) => { setPidx(i); setView("reading"); setActiveId(null); };
  const back        = ()  => { setView("library"); setActiveId(null); };

  // ── Library view ─────────────────────────────────────────────────────────────
  if (view === "library") {
    return (
      <div style={{ marginTop: "20px" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "3px", color: C.textMuted, textTransform: "uppercase", marginBottom: "14px" }}>Select a text</div>
        {err && (
          <div style={{ padding: "10px 14px", background: "rgba(180,30,30,0.06)", border: "1px solid #c88080", borderRadius: "4px", marginBottom: "12px", fontFamily: "'EB Garamond',serif", fontSize: "13px", color: "#c06060" }}>
            Dictionary not loaded — hover popups unavailable. ({err})
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: "12px" }}>
          {PASSAGES.map((p, i) => (
            <button key={p.id} onClick={() => openPassage(i)}
              style={{ textAlign: "left", background: C.surface, border: "1px solid " + C.border, borderRadius: "4px", padding: "18px 20px", cursor: "pointer", boxShadow: "0 2px 10px rgba(44,31,14,0.07)", transition: "all 0.15s", display: "block", width: "100%" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.boxShadow = "0 4px 18px rgba(44,31,14,0.13)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "0 2px 10px rgba(44,31,14,0.07)"; }}>
              <div style={{ fontFamily: "'Noto Serif TC',serif", fontSize: "22px", fontWeight: "600", color: C.text, marginBottom: "6px", letterSpacing: "2px" }}>{p.title}</div>
              <div style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: "12px", color: C.textMuted, marginBottom: "10px" }}>{p.source} · {p.date}</div>
              {p.intro && <div style={{ fontFamily: "'EB Garamond',serif", fontSize: "13px", color: "#5a4020", lineHeight: "1.5" }}>{p.intro}</div>}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Reading view ──────────────────────────────────────────────────────────────
  let wc = 0;

  return (
    <div style={{ marginTop: "16px" }}>
      {/* Breadcrumb + passage tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
        <button onClick={back} style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "1.5px", padding: "5px 12px", background: "transparent", color: C.textMuted, border: "1px solid " + C.border, borderRadius: "2px", cursor: "pointer" }}>← LIBRARY</button>
        <div style={{ marginLeft: "auto", display: "flex", gap: "5px", flexWrap: "wrap" }}>
          {PASSAGES.map((p, i) => (
            <button key={p.id} onClick={() => { setPidx(i); setActiveId(null); }}
              style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "0.5px", padding: "4px 10px", border: "1px solid", borderColor: i === pidx ? C.gold : C.border, borderRadius: "12px", background: i === pidx ? "#3a2410" : "transparent", color: i === pidx ? C.goldLight : C.textMuted, cursor: "pointer", transition: "all 0.15s" }}>
              {p.title}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: C.surface, border: "1px solid " + C.border, borderRadius: "4px", boxShadow: "0 2px 16px rgba(44,31,14,0.09)", padding: "24px 28px" }}>
        {/* Header */}
        <div style={{ marginBottom: "16px", paddingBottom: "14px", borderBottom: "1px solid " + C.borderDim }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <h2 style={{ fontFamily: "'Noto Serif TC',serif", fontSize: "18px", fontWeight: "600", color: C.text, marginBottom: "4px" }}>{passage.title}</h2>
              <div style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: "13px", color: C.textMuted }}>{passage.source} · {passage.date}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px", flexShrink: 0 }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: "8px", letterSpacing: "1px", color: C.textMuted, textTransform: "uppercase" }}>Dictionary coverage</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "70px", height: "3px", background: C.borderDim, borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: coverage + "%", background: coverage > 80 ? C.gold : coverage > 50 ? "#c88030" : C.red, transition: "width 0.5s" }} />
                </div>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: "11px", color: C.goldDim, fontWeight: "600" }}>{coverage}%</span>
              </div>
              <div style={{ fontFamily: "'EB Garamond',serif", fontSize: "11px", color: C.textMuted, fontStyle: "italic" }}>{inDict}/{charTokens.length} chars</div>
            </div>
          </div>
          {passage.intro && (
            <div style={{ marginTop: "10px", fontFamily: "'EB Garamond',serif", fontSize: "13px", color: C.textMuted, lineHeight: "1.6", fontStyle: "italic" }}>{passage.intro}</div>
          )}
        </div>

        {/* POS legend */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "16px", alignItems: "center" }}>
          {Object.entries(POS_COLORS).map(([pos, c]) => (
            <span key={pos} style={{ fontFamily: "'Cinzel',serif", fontSize: "8px", letterSpacing: "1px", textTransform: "uppercase", padding: "2px 6px", borderRadius: "10px", background: c.bg, border: "1px solid " + c.border, color: c.border }}>{pos}</span>
          ))}
          <span style={{ fontFamily: "'EB Garamond',serif", fontSize: "12px", color: C.textMuted, fontStyle: "italic", marginLeft: "6px" }}>
            {dict ? "tap any character" : "loading dictionary…"}
          </span>
        </div>

        {/* Text */}
        <div style={{ fontFamily: "'Noto Serif TC',serif", fontSize: "26px", lineHeight: "2.8", color: C.text, marginBottom: "20px", letterSpacing: "2px" }}>
          {tokens.map((token, i) => {
            if (isPunct(token)) return <span key={i} style={{ color: C.textMuted }}>{token}</span>;
            const id = wc++;
            const entry = dict ? dict[token] : null;
            const pc = entry ? (POS_COLORS[entry.pos] || POS_COLORS.noun) : null;
            const isActive = activeId === id;
            return (
              <React.Fragment key={i}>
                <span style={{ position: "relative", display: "inline-block" }}
                  onMouseEnter={() => entry && setActiveId(id)}
                  onMouseLeave={() => setActiveId(null)}>
                  <span onClick={() => setActiveId(isActive ? null : id)}
                    style={{ cursor: entry ? "pointer" : "default", borderBottom: entry ? "2px solid " + (pc.border + "88") : "none", background: isActive ? (pc ? pc.bg : "transparent") : "transparent", borderRadius: "2px", padding: "0 1px", transition: "all 0.15s" }}>
                    {token}
                  </span>
                  {isActive && entry && (
                    <div style={{ position: "absolute", top: "110%", left: "50%", transform: "translateX(-50%)", background: C.surface, border: "1px solid " + C.border, borderRadius: "4px", padding: "8px 12px", zIndex: 100, minWidth: "160px", boxShadow: "0 4px 16px rgba(44,31,14,0.20)", textAlign: "left", pointerEvents: "none" }}>
                      <div style={{ fontFamily: "'Noto Serif TC',serif", fontSize: "22px", color: C.text, marginBottom: "2px" }}>{token}</div>
                      <div style={{ fontFamily: "'EB Garamond',serif", fontSize: "12px", color: C.textMuted, marginBottom: "4px" }}>{entry.pinyin}</div>
                      <div style={{ fontFamily: "'Cinzel',serif", fontSize: "8px", padding: "1px 5px", borderRadius: "8px", background: pc.bg, border: "1px solid " + pc.border, color: pc.border, display: "inline-block", marginBottom: "4px" }}>{entry.pos}</div>
                      <div style={{ fontFamily: "'EB Garamond',serif", fontSize: "13px", color: C.text }}>{entry.eng}</div>
                      {entry.notes && <div style={{ fontFamily: "'EB Garamond',serif", fontSize: "11px", color: C.textMuted, marginTop: "4px", fontStyle: "italic", lineHeight: "1.4" }}>{entry.notes}</div>}
                    </div>
                  )}
                </span>
              </React.Fragment>
            );
          })}
        </div>

        {/* Prev / Next */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid " + C.borderDim, marginBottom: "16px" }}>
          <button onClick={() => { setPidx(p => p - 1); setActiveId(null); }} disabled={pidx === 0}
            style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "1px", padding: "8px 16px", background: "transparent", color: pidx === 0 ? C.border : C.textMuted, border: "1px solid", borderColor: pidx === 0 ? C.borderDim : C.border, borderRadius: "2px", cursor: pidx === 0 ? "default" : "pointer" }}>
            ← PREV
          </button>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", color: C.textMuted, letterSpacing: "1px" }}>{pidx + 1} / {PASSAGES.length}</span>
          <button onClick={() => { setPidx(p => p + 1); setActiveId(null); }} disabled={pidx === PASSAGES.length - 1}
            style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "1px", padding: "8px 16px", background: pidx === PASSAGES.length - 1 ? "transparent" : C.goldDim, color: pidx === PASSAGES.length - 1 ? C.border : "#f5f0e8", border: "1px solid", borderColor: pidx === PASSAGES.length - 1 ? C.borderDim : C.goldDim, borderRadius: "2px", cursor: pidx === PASSAGES.length - 1 ? "default" : "pointer" }}>
            NEXT →
          </button>
        </div>

        {/* Character list */}
        <details>
          <summary style={{ fontFamily: "'Cinzel',serif", fontSize: "10px", letterSpacing: "2px", color: C.goldDim, cursor: "pointer", userSelect: "none", textTransform: "uppercase" }}>
            ▸ Character List ({inDict} found · {charTokens.length - inDict} missing)
          </summary>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: "4px", marginTop: "10px" }}>
            {charTokens.map((token, i) => {
              const entry = dict ? dict[token] : null;
              const pc = entry ? (POS_COLORS[entry.pos] || POS_COLORS.noun) : null;
              return (
                <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "6px", padding: "5px 9px", background: entry ? "rgba(200,170,100,0.05)" : "rgba(150,50,50,0.04)", border: "1px solid", borderColor: entry ? C.borderDim : "#e0c0c0", borderRadius: "3px" }}>
                  <span style={{ fontFamily: "'Noto Serif TC',serif", fontSize: "18px", color: entry ? C.text : "#c08080", minWidth: "28px" }}>{token}</span>
                  {entry
                    ? <><span style={{ fontFamily: "'Cinzel',serif", fontSize: "8px", padding: "1px 5px", borderRadius: "8px", background: pc.bg, border: "1px solid " + pc.border, color: pc.border, whiteSpace: "nowrap" }}>{entry.pos}</span>
                        <span style={{ fontFamily: "'EB Garamond',serif", fontSize: "12px", color: C.textMuted, fontStyle: "italic" }}>{entry.pinyin} — {entry.eng}</span></>
                    : <span style={{ fontFamily: "'Cinzel',serif", fontSize: "8px", color: "#c08080" }}>not in dictionary</span>
                  }
                </div>
              );
            })}
          </div>
        </details>
      </div>
    </div>
  );
}
