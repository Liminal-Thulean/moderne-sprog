/**
 * chinese_drill.js — Character Drill component (multiple-choice + flashcard)
 * Part of Glossarium / Language Nexus — Classical Chinese section
 *
 * Exposes: CharDrill()
 * Depends: chinese_shared.js (C, POS_COLORS, shuffle)
 *          chinese_data.js   (CHARACTERS)
 *
 * Hanzi builder (drag-and-drop radical assembly) will be added here later.
 */

// ─── CHARACTER DRILL ──────────────────────────────────────────────────────────

function CharDrill() {
  const [order]     = React.useState(() => shuffle([...Array(CHARACTERS.length).keys()]));
  const [idx, setIdx] = React.useState(0);
  const [input, setInput]   = React.useState("");
  const [status, setStatus] = React.useState(null); // null | "correct" | "wrong"
  const [showHint, setShowHint] = React.useState(false);
  const [score, setScore]   = React.useState({c:0,w:0});

  const char = CHARACTERS[order[idx % order.length]];

  const check = () => {
    if (!input.trim()) return;
    const answers = char.eng.split(",").map(a => normalise(a));
    const attempt = normalise(input);
    const ok = answers.some(a => attempt === a || a.includes(attempt) || attempt.includes(a.split(" ")[0]));
    if (ok) {
      setStatus("correct");
      setScore(s => ({...s, c:s.c+1}));
    } else {
      setStatus("wrong");
      setScore(s => ({...s, w:s.w+1}));
    }
  };

  const next = () => {
    setIdx(i => i+1);
    setInput(""); setStatus(null); setShowHint(false);
  };

  const total = score.c + score.w;
  const acc = total > 0 ? Math.round((score.c/total)*100) : null;

  return (
    <div style={{marginTop:"20px"}}>
      {/* Progress */}
      <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}}>
        <div style={{flex:1,height:"3px",background:C.borderDim,borderRadius:"2px",overflow:"hidden"}}>
          <div style={{height:"100%",width:`${((idx%CHARACTERS.length)/CHARACTERS.length)*100}%`,background:C.gold,transition:"width 0.4s"}}/>
        </div>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:"10px",color:C.textMuted,whiteSpace:"nowrap"}}>
          {idx%CHARACTERS.length+1}/{CHARACTERS.length}{acc!==null?` · ${acc}% acc`:""}
        </span>
      </div>

      {/* Card */}
      <div style={{background:C.surface,border:"1px solid "+C.border,borderRadius:"6px",overflow:"hidden",marginBottom:"16px"}}>
        {/* Character display */}
        <div style={{background:"linear-gradient(180deg,#4a3010 0%,#3a2410 100%)",padding:"40px 20px",textAlign:"center",borderBottom:"1px solid "+C.border}}>
          <div style={{fontFamily:"'Noto Serif TC',serif",fontSize:"96px",color:"#f0e4c4",lineHeight:1,marginBottom:"12px",textShadow:"none"}}>
            {char.char}
          </div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:"9px",letterSpacing:"2px",color:"rgba(255,255,255,0.5)",textTransform:"uppercase"}}>
            {char.pos}
          </div>
        </div>

        {/* Input area */}
        <div style={{padding:"20px 24px"}}>
          <div style={{fontFamily:"'EB Garamond',serif",fontSize:"13px",color:C.textMuted,marginBottom:"10px",fontStyle:"italic"}}>
            Enter the English meaning:
          </div>
          <div style={{display:"flex",gap:"8px"}}>
            <input
              value={input}
              onChange={e=>{setInput(e.target.value);setStatus(null);}}
              onKeyDown={e=>{if(e.key==="Enter") status?next():check();}}
              disabled={!!status}
              placeholder="e.g. person"
              style={{flex:1,background:C.surface,border:"1px solid",borderColor:status==="correct"?C.green:status==="wrong"?C.red:C.border,borderRadius:"3px",padding:"9px 12px",fontFamily:"'EB Garamond',serif",fontSize:"16px",color:C.text}}
            />
            {!status
              ? <button onClick={check} disabled={!input.trim()} style={{fontFamily:"'Cinzel',serif",fontSize:"10px",letterSpacing:"1.5px",padding:"9px 18px",background:input.trim()?C.gold:"#3a2a10",color:input.trim()?"#1a1000":C.textMuted,border:"none",borderRadius:"3px",cursor:input.trim()?"pointer":"default"}}>CHECK</button>
              : <button onClick={next} style={{fontFamily:"'Cinzel',serif",fontSize:"10px",letterSpacing:"1.5px",padding:"9px 18px",background:C.gold,color:"#1a1000",border:"none",borderRadius:"3px",cursor:"pointer"}}>NEXT →</button>
            }
          </div>

          {/* Feedback */}
          {status==="correct" && (
            <div style={{marginTop:"12px",padding:"10px 14px",background:"rgba(58,138,80,0.12)",border:"1px solid "+C.green,borderRadius:"3px"}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:"10px",letterSpacing:"1px",color:C.green,marginBottom:"4px"}}>✓ CORRECT</div>
              <div style={{fontFamily:"'EB Garamond',serif",fontSize:"14px",color:C.text}}>{char.eng}</div>
              <div style={{fontFamily:"'EB Garamond',serif",fontSize:"12px",color:C.textMuted,fontStyle:"italic",marginTop:"3px"}}>Pinyin: {char.pinyin}</div>
            </div>
          )}
          {status==="wrong" && (
            <div style={{marginTop:"12px",padding:"10px 14px",background:"rgba(200,64,48,0.1)",border:"1px solid "+C.red,borderRadius:"3px"}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:"10px",letterSpacing:"1px",color:C.red,marginBottom:"4px"}}>✗ INCORRECT</div>
              <div style={{fontFamily:"'EB Garamond',serif",fontSize:"14px",color:C.text}}>{char.eng}</div>
              <div style={{fontFamily:"'EB Garamond',serif",fontSize:"12px",color:C.textMuted,fontStyle:"italic",marginTop:"3px"}}>Pinyin: {char.pinyin}</div>
            </div>
          )}

          {/* Hint / notes */}
          {char.notes && (
            <button onClick={()=>setShowHint(v=>!v)} style={{marginTop:"10px",background:"transparent",border:"none",fontFamily:"'Cinzel',serif",fontSize:"9px",letterSpacing:"1.5px",color:C.textMuted,cursor:"pointer",textTransform:"uppercase",padding:0}}>
              {showHint?"▾ HIDE NOTE":"▸ SHOW NOTE"}
            </button>
          )}
          {showHint && char.notes && (
            <div style={{marginTop:"8px",fontFamily:"'EB Garamond',serif",fontSize:"13px",color:C.textMuted,fontStyle:"italic",lineHeight:"1.6",borderLeft:"2px solid #b8973e",paddingLeft:"12px"}}>
              {char.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}