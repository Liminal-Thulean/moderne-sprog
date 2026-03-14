/**
 * chinese_matching.js — Vocabulary Matching component
 * Part of Glossarium / Language Nexus — Classical Chinese section
 *
 * Exposes: MatchingMode()
 * Depends: chinese_shared.js (C, shuffle)
 *          chinese_data.js   (CHARACTERS)
 */

// ─── MATCHING MODE ────────────────────────────────────────────────────────────

const MATCH_COLORS = [
  {light:"rgba(212,168,64,0.12)",  border:"#d4a840"},
  {light:"rgba(80,160,100,0.12)",  border:"#50a064"},
  {light:"rgba(80,120,200,0.12)",  border:"#5078c8"},
  {light:"rgba(200,80,80,0.12)",   border:"#c85050"},
  {light:"rgba(160,80,200,0.12)",  border:"#a050c8"},
  {light:"rgba(80,180,180,0.12)",  border:"#50b4b4"},
  {light:"rgba(200,140,40,0.12)",  border:"#c88c28"},
  {light:"rgba(100,180,80,0.12)",  border:"#64b450"},
];
const PAIRS_PER_ROUND = 8;

function MatchingMode() {
  const allPairs = React.useMemo(()=>CHARACTERS.map(c=>({left:c.char,right:c.eng.split(",")[0].trim()})),[]);
  const [round, setRound]     = React.useState(0);
  const [left, setLeft]       = React.useState([]);
  const [right, setRight]     = React.useState([]);
  const [matched, setMatched] = React.useState({});
  const [selL, setSelL]       = React.useState(null);
  const [selR, setSelR]       = React.useState(null);
  const [wrong, setWrong]     = React.useState({l:null,r:null});
  const [done, setDone]       = React.useState(false);
  const [corr, setCorr]       = React.useState(0);
  const [att, setAtt]         = React.useState(0);

  const startRound = React.useCallback((r)=>{
    const start=(r*PAIRS_PER_ROUND)%allPairs.length;
    const slice=Array.from({length:PAIRS_PER_ROUND},(_,i)=>({...allPairs[(start+i)%allPairs.length],id:i}));
    setLeft(shuffle(slice.map(p=>({id:p.id,text:p.left}))));
    setRight(shuffle(slice.map(p=>({id:p.id,text:p.right}))));
    setMatched({}); setSelL(null); setSelR(null);
    setWrong({l:null,r:null}); setDone(false);
  },[allPairs]);

  React.useEffect(()=>{startRound(0);},[]);

  React.useEffect(()=>{
    if(selL===null||selR===null) return;
    setAtt(a=>a+1);
    if(selL===selR){
      const ci=Object.keys(matched).length%MATCH_COLORS.length;
      const nm={...matched,[selL]:ci};
      setMatched(nm); setCorr(c=>c+1);
      setSelL(null); setSelR(null);
      if(Object.keys(nm).length===PAIRS_PER_ROUND) setTimeout(()=>setDone(true),300);
    } else {
      setWrong({l:selL,r:selR});
      setTimeout(()=>{setWrong({l:null,r:null});setSelL(null);setSelR(null);},650);
    }
  },[selL,selR]);

  const mc=Object.keys(matched).length;
  const acc=att>0?Math.round((corr/att)*100):null;

  const tile=(id,side)=>{
    const isM=matched[id]!==undefined;
    const col=isM?MATCH_COLORS[matched[id]]:null;
    const isSel=side==="l"?selL===id:selR===id;
    const isW=side==="l"?wrong.l===id:wrong.r===id;
    return {
      padding:"10px 8px", border:"1.5px solid",
      borderColor:isM?col.border:isW?"#c85050":isSel?C.gold:C.border,
      borderRadius:"4px",
      background:isM?col.light:isW?"rgba(200,80,80,0.1)":isSel?C.goldFaint:C.card,
      color:isM?col.border:isW?"#c87070":isSel?C.goldLight:C.text,
      cursor:isM?"default":"pointer", transition:"all 0.15s", textAlign:"center",
      userSelect:"none", opacity:isM?0.55:1, textDecoration:isM?"line-through":"none",
      minHeight:"52px", display:"flex", alignItems:"center", justifyContent:"center",
    };
  };

  return (
    <div style={{marginTop:"20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"12px"}}>
        <div style={{flex:1,height:"3px",background:C.borderDim,borderRadius:"2px",overflow:"hidden"}}>
          <div style={{height:"100%",width:`${(mc/PAIRS_PER_ROUND)*100}%`,background:C.gold,transition:"width 0.4s"}}/>
        </div>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:"10px",color:C.textMuted,whiteSpace:"nowrap"}}>{mc}/{PAIRS_PER_ROUND}{acc!==null?` · ${acc}% acc`:""}</span>
      </div>
      {!done && <div style={{textAlign:"center",marginBottom:"10px",color:C.textMuted,fontSize:"12px",fontFamily:"'Cinzel',serif",letterSpacing:"0.5px"}}>Match each character to its English meaning</div>}
      {done && (
        <div style={{textAlign:"center",padding:"16px",background:C.surface,border:"1px solid "+C.border,borderRadius:"6px",marginBottom:"14px"}}>
          <div style={{fontFamily:"'Noto Serif TC',serif",fontSize:"22px",color:C.text,marginBottom:"4px"}}>
            {acc===100?"善！🎋":acc>=80?"甚好！✓":acc>=60?"尚可":"再學！"}
          </div>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:"10px",color:C.textMuted,letterSpacing:"1px",marginBottom:"12px"}}>{acc}% ACCURACY</div>
          <button onClick={()=>{setRound(r=>{const n=r+1;startRound(n);return n;});}} style={{fontFamily:"'Cinzel',serif",fontSize:"10px",letterSpacing:"1.5px",padding:"8px 22px",background:C.gold,color:"#1a1000",border:"none",borderRadius:"3px",cursor:"pointer"}}>NEXT ROUND →</button>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px 16px"}}>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:"9px",letterSpacing:"2px",color:C.textMuted,textAlign:"center",paddingBottom:"4px",borderBottom:"1px solid "+C.border}}>CHARACTER</div>
        <div style={{fontFamily:"'Cinzel',serif",fontSize:"9px",letterSpacing:"2px",color:C.textMuted,textAlign:"center",paddingBottom:"4px",borderBottom:"1px solid "+C.border}}>ENGLISH</div>
        {left.map((item,i)=>(
          <React.Fragment key={item.id}>
            <div onClick={()=>!matched[item.id]&&wrong.l===null&&setSelL(item.id)} style={tile(item.id,"l")}>
              <span style={{fontFamily:"'Noto Serif TC',serif",fontSize:"28px",lineHeight:1}}>{item.text}</span>
            </div>
            <div onClick={()=>!matched[right[i].id]&&wrong.l===null&&setSelR(right[i].id)} style={tile(right[i].id,"r")}>
              <span style={{fontFamily:"'EB Garamond',serif",fontSize:"14px",fontStyle:"italic"}}>{right[i].text}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}