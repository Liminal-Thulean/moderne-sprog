/**
 * chinese_patterns.js — Grammar Patterns component
 * Part of Glossarium / Language Nexus — Classical Chinese section
 *
 * Exposes: PatternsMode()
 * Depends: chinese_shared.js (C)
 *          chinese_data.js   (PATTERNS)
 *
 * To add a pattern: edit PATTERNS in chinese_data.js.
 */

// ─── GRAMMAR PATTERNS ─────────────────────────────────────────────────────────

function PatternsMode() {
  const [pidx, setPidx]   = React.useState(0);
  const [revealed, setRevealed] = React.useState(false);
  const pat = PATTERNS[pidx];

  const go = (dir) => {
    setPidx(i=>(i+dir+PATTERNS.length)%PATTERNS.length);
    setRevealed(false);
  };

  return (
    <div style={{marginTop:"20px"}}>
      {/* Pattern pills */}
      <div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"16px"}}>
        {PATTERNS.map((p,i)=>(
          <button key={p.id} onClick={()=>{setPidx(i);setRevealed(false);}} style={{fontFamily:"'Cinzel',serif",fontSize:"9px",letterSpacing:"0.8px",padding:"4px 12px",border:"1px solid",borderColor:i===pidx?C.gold:C.border,borderRadius:"20px",background:i===pidx?"#3a2410":"transparent",color:i===pidx?C.goldLight:C.textMuted,cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"}}>
            {p.pattern}
          </button>
        ))}
      </div>

      <div style={{background:C.surface,border:"1px solid "+C.border,borderRadius:"6px",overflow:"hidden"}}>
        {/* Pattern header */}
        <div style={{background:"linear-gradient(180deg,#140e04,#1e1508)",padding:"24px 28px",borderBottom:"1px solid "+C.border}}>
          <div style={{fontFamily:"'Noto Serif TC',serif",fontSize:"36px",color:C.text,letterSpacing:"8px",marginBottom:"8px",textAlign:"center"}}>{pat.pattern}</div>
          <div style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:"14px",color:C.textMuted,textAlign:"center",marginBottom:"6px"}}>{pat.pinyin}</div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:"11px",letterSpacing:"1px",color:C.text,textAlign:"center"}}>{pat.meaning}</div>
        </div>

        <div style={{padding:"22px 28px"}}>
          {/* Example text */}
          <div style={{marginBottom:"16px"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:"9px",letterSpacing:"2px",color:C.textMuted,textTransform:"uppercase",marginBottom:"8px"}}>Example</div>
            <div style={{fontFamily:"'Noto Serif TC',serif",fontSize:"26px",color:C.text,letterSpacing:"4px",lineHeight:"1.6",marginBottom:"8px"}}>{pat.example}</div>
            {revealed
              ? <div style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:"16px",color:C.text,lineHeight:"1.5"}}>{pat.translation}</div>
              : <button onClick={()=>setRevealed(true)} style={{fontFamily:"'Cinzel',serif",fontSize:"10px",letterSpacing:"1.5px",padding:"7px 18px",background:"transparent",color:C.textMuted,border:"1px solid "+C.border,borderRadius:"3px",cursor:"pointer"}}>REVEAL TRANSLATION</button>
            }
          </div>

          {/* Notes */}
          <div style={{borderTop:"1px solid "+C.borderDim,paddingTop:"14px"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:"9px",letterSpacing:"2px",color:C.textMuted,textTransform:"uppercase",marginBottom:"8px"}}>Note</div>
            <div style={{fontFamily:"'EB Garamond',serif",fontSize:"14px",color:C.textMuted,lineHeight:"1.7",fontStyle:"italic"}}>{pat.notes}</div>
          </div>

          {/* Nav */}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:"18px"}}>
            <button onClick={()=>go(-1)} style={{fontFamily:"'Cinzel',serif",fontSize:"9px",letterSpacing:"1px",padding:"8px 16px",background:"transparent",color:C.textMuted,border:"1px solid "+C.border,borderRadius:"3px",cursor:"pointer"}}>← PREV</button>
            <span style={{fontFamily:"'Cinzel',serif",fontSize:"10px",color:C.textMuted,alignSelf:"center"}}>{pidx+1} / {PATTERNS.length}</span>
            <button onClick={()=>go(1)} style={{fontFamily:"'Cinzel',serif",fontSize:"9px",letterSpacing:"1px",padding:"8px 16px",background:C.gold,color:"#1a1000",border:"none",borderRadius:"3px",cursor:"pointer"}}>NEXT →</button>
          </div>
        </div>
      </div>
    </div>
  );
}