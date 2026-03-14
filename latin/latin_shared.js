/**
 * latin_shared.js — Shared utilities and base components
 * Part of Glossarium / Language Nexus — Latin section
 *
 * Exposes globals used by both latin_reader.js and latin_tables.js:
 *   toKey(w)       — normalise Latin for dict lookup (strip macrons etc.)
 *   tokenise(text) — split text into word/punct tokens
 *   POS_COLORS     — part-of-speech colour map
 *   WordToken      — interactive word span with hover popup
 */
function toKey(w) {
  return w.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z]/g,"");
}

function tokenise(text) {
  const tokens = [];
  text.trim().split(/\s+/).forEach(raw => {
    const m = raw.match(/^([^a-zA-Z\xC0-\xFF]*)([a-zA-Z\xC0-\xFF\-]+)([^a-zA-Z\xC0-\xFF]*)$/);
    if (m) {
      if (m[1]) tokens.push({type:"punct",text:m[1]});
      tokens.push({type:"word",text:m[2]});
      if (m[3]) tokens.push({type:"punct",text:m[3]});
    } else { tokens.push({type:"punct",text:raw}); }
  });
  return tokens;
}

const POS_COLORS = {
  noun:{bg:"rgba(45,106,79,0.15)",  border:"#2d6a4f"},
  verb:{bg:"rgba(74,52,16,0.15)",   border:"#8a6914"},
  adj: {bg:"rgba(60,30,100,0.12)",  border:"#6a3a9a"},
  adv: {bg:"rgba(20,80,120,0.12)",  border:"#2a6090"},
  prep:{bg:"rgba(120,40,20,0.12)",  border:"#902a14"},
  conj:{bg:"rgba(80,80,20,0.12)",   border:"#807814"},
  pron:{bg:"rgba(100,30,80,0.12)",  border:"#7a2060"},
  part:{bg:"rgba(20,100,100,0.12)", border:"#146a6a"},
  num: {bg:"rgba(140,60,0,0.12)",   border:"#8c3c00"},
};

function WordToken({ text, dict, activeId, setActiveId, idx }) {
  const isActive = activeId === idx;
  const entry = dict ? dict[toKey(text)] : null;
  const pc = entry ? (POS_COLORS[entry.pos] || POS_COLORS.noun) : null;
  return (
    <span style={{position:"relative",display:"inline"}}>
      <span onClick={()=>setActiveId(isActive?null:idx)} onMouseEnter={()=>setActiveId(idx)} onMouseLeave={()=>setActiveId(null)}
        style={{cursor:"pointer",fontStyle:"italic",
          borderBottom:isActive?(entry?"2px solid #b8973e":"2px solid #888"):(entry?"1px dotted #c9a84c":"none"),
          color:isActive?(entry?"#8a6914":"#888"):"#2c1f0e",
          background:isActive?"rgba(184,151,62,0.07)":"transparent",
          borderRadius:"2px",padding:"0 1px",transition:"all 0.1s"}}>
        {text}
      </span>
      {isActive && (
        <span style={{position:"absolute",bottom:"calc(100% + 10px)",left:"50%",transform:"translateX(-50%)",zIndex:200,width:"268px",background:"#1e1408",border:"1px solid "+(entry?"#8a6914":"#555"),borderRadius:"5px",boxShadow:"0 8px 32px rgba(0,0,0,0.5)",padding:"12px 14px",pointerEvents:"none"}}>
          <span style={{position:"absolute",bottom:"-6px",left:"50%",width:"10px",height:"10px",background:"#1e1408",border:"1px solid "+(entry?"#8a6914":"#555"),borderTop:"none",borderLeft:"none",transform:"translateX(-50%) rotate(45deg)",display:"block"}}/>
          {entry ? <>
            <div style={{display:"flex",alignItems:"baseline",gap:"8px",marginBottom:"7px",flexWrap:"wrap"}}>
              <span style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:"18px",color:"#e8c97a"}}>{text}</span>
              <span style={{fontFamily:"'EB Garamond',serif",fontSize:"12px",color:"#c4a060",fontStyle:"italic"}}>{entry.lemma}</span>
            </div>
            <div style={{marginBottom:"6px"}}>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:"8px",letterSpacing:"1.5px",textTransform:"uppercase",padding:"2px 7px",borderRadius:"10px",background:pc.bg,border:"1px solid "+pc.border,color:pc.border}}>{entry.pos}</span>
            </div>
            <div style={{fontFamily:"'EB Garamond',serif",fontSize:"12px",color:"#a09070",marginBottom:"5px",lineHeight:"1.4"}}>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:"7px",letterSpacing:"1px",color:"#6a5a3a",textTransform:"uppercase",marginRight:"5px"}}>Form</span>{entry.parse}
            </div>
            <div style={{fontFamily:"'EB Garamond',serif",fontSize:"13px",color:"#e8c97a",lineHeight:"1.4"}}>
              <span style={{fontFamily:"'Cinzel',serif",fontSize:"7px",letterSpacing:"1px",color:"#6a5a3a",textTransform:"uppercase",marginRight:"5px"}}>Meaning</span>"{entry.eng}"
            </div>
          </> : <>
            <div style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:"17px",color:"#aaa",marginBottom:"8px"}}>{text}</div>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:"9px",letterSpacing:"1px",color:"#666",textTransform:"uppercase",marginBottom:"5px"}}>Not yet in dictionary</div>
            <div style={{fontFamily:"'EB Garamond',serif",fontSize:"11px",color:"#555",fontStyle:"italic"}}>Key to add: <span style={{fontFamily:"monospace",background:"#111",padding:"1px 5px",borderRadius:"2px",color:"#888"}}>"{toKey(text)}"</span></div>
          </>}
        </span>
      )}
    </span>
  );
}

