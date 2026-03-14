/**
 * latin_reader.js — Texts and Reader component
 * Part of Glossarium / Language Nexus — Latin section
 *
 * Exposes globals used by latin.html:
 *   WORKS        — library of works and pages
 *   ReaderMode() — full library + paginated reader React component
 *
 * Depends on (must load first):
 *   latin_shared.js  — toKey, tokenise, POS_COLORS, WordToken
 */
// ─── READER DATA & COMPONENTS ────────────────────────────────────────────────
//
//  HOW TO ADD A NEW PASSAGE:
// ─── WORKS & PAGES ────────────────────────────────────────────────────────────
//  Add a page:  find the work, copy an existing page object and edit it.
//  Add a work:  append a new object to WORKS[].

const WORKS = [
  {
    id: "dbg",
    title: "Dē Bellō Gallicō",
    author: "C. Iūlius Caesar",
    date: "58–49 BC",
    desc: "Caesar's own account of the Gallic Wars — terse, third-person, relentless. The ideal first Latin prose text.",
    pages: [
      {
        id: "dbg_1_1", label: "I.1", title: "Dē Bellō Gallicō I.1",
        intro: "The famous opening: Caesar divides Gaul into three parts and introduces its peoples.",
        text: `Gallia est omnis divisa in partes tres, quarum unam incolunt Belgae, aliam Aquitani, tertiam qui ipsorum lingua Celtae, nostra Galli appellantur. Hi omnes lingua, institutis, legibus inter se differunt. Gallos ab Aquitanis Garumna flumen, a Belgis Matrona et Sequana dividit.`
      },
      {
        id: "dbg_1_2", label: "I.2", title: "Dē Bellō Gallicō I.2",
        intro: "Orgetorix, the most powerful nobleman of the Helvetii, conspires to seize royal power.",
        text: `Apud Helvetios longe nobilissimus fuit et ditissimus Orgetorix. Is M. Messala, M. Pupio Pisone consulibus regni cupiditate inductus coniurationem nobilitatis fecit et civitati persuasit ut de finibus suis cum omnibus copiis exirent: perfacile esse, cum virtute omnibus praestarent, totius Galliae imperio potiri.`
      },
      {
        id: "dbg_1_3", label: "I.3", title: "Dē Bellō Gallicō I.3",
        intro: "The Helvetii prepare for their migration, gathering supplies and burning their towns.",
        text: `His rebus adducti et auctoritate Orgetorigis permoti constituerunt ea quae ad proficiscendum pertinerent comparare, iumentorum et carrorum quam maximum numerum coemere, sementes quam maximas facere, ut in itinere copia frumenti suppeteret, cum proximis civitatibus pacem et amicitiam confirmare.`
      },
    ],
  },
  {
    id: "cat",
    title: "In Catilīnam I",
    author: "M. Tullius Cicerō",
    date: "63 BC",
    desc: "Cicero's thundering denunciation of Catiline, delivered in the Senate with the conspirator himself present.",
    pages: [
      {
        id: "cat_1_1", label: "§1", title: "In Catilīnam I.1",
        intro: "The famous opening — Cicero demands to know how long Catiline will abuse the Senate's patience.",
        text: `Quo usque tandem abutere, Catilina, patientia nostra? Quam diu etiam furor iste tuus nos eludet? Quem ad finem sese effrenata iactabit audacia? Nihilne te nocturnum praesidium Palati, nihil urbis vigiliae, nihil timor populi, nihil concursus bonorum omnium, nihil hic munitissimus habendi senatus locus, nihil horum ora voltusque moverunt?`
      },
      {
        id: "cat_1_2", label: "§2", title: "In Catilīnam I.2",
        intro: "Cicero tells Catiline that the Senate already knows everything — the conspiracy is exposed.",
        text: `Patere tua consilia non sentis, constrictam iam horum omnium scientia teneri coniurationem tuam non vides? Quid proxima, quid superiore nocte egeris, ubi fueris, quos convocaveris, quid consilii ceperis, quem nostrum ignorare arbitraris?`
      },
    ],
  },
  {
    id: "aen",
    title: "Aenēis",
    author: "P. Vergilius Marō",
    date: "29–19 BC",
    desc: "Rome's national epic — Aeneas carries the gods of Troy to Italy and founds the Roman people.",
    pages: [
      {
        id: "aen_1_1", label: "I.1–7", title: "Aenēis I.1–7",
        intro: "The invocation: arms, the man, and the wrath of Juno that drove him to found Rome.",
        text: `Arma virumque cano, Troiae qui primus ab oris Italiam fato profugus Laviniaque venit litora, multum ille et terris iactatus et alto vi superum, saevae memorem Iunonis ob iram, multa quoque et bello passus, dum conderet urbem inferretque deos Latio; genus unde Latinum Albanique patres atque altae moenia Romae.`
      },
      {
        id: "aen_1_8", label: "I.8–11", title: "Aenēis I.8–11",
        intro: "Vergil calls on the Muse and poses the great question: can such wrath dwell in heavenly hearts?",
        text: `Musa, mihi causas memora, quo numine laeso quidve dolens regina deum tot volvere casus insignem pietate virum, tot adire labores impulerit. Tantaene animis caelestibus irae?`
      },
    ],
  },
];



function ReaderMode() {
  const [dict, setDict]         = React.useState(null);
  const [err, setErr]           = React.useState(null);
  const [view, setView]         = React.useState("library");
  const [workIdx, setWorkIdx]   = React.useState(null);
  const [pageIdx, setPageIdx]   = React.useState(0);
  const [activeId, setActiveId] = React.useState(null);

  React.useEffect(()=>{
    fetch("latin_dict.json")
      .then(r=>{ if(!r.ok) throw new Error("HTTP "+r.status); return r.json(); })
      .then(setDict).catch(e=>setErr(e.message));
  },[]);

  // ALL hooks must be unconditional — guard values, never early-return before a hook
  const work       = workIdx !== null ? WORKS[workIdx] : null;
  const page       = work ? work.pages[pageIdx] : null;
  const tokens     = React.useMemo(() => page ? tokenise(page.text) : [], [workIdx, pageIdx]);
  const wordTokens = tokens.filter(t => t.type === "word");
  const inDict     = dict ? wordTokens.filter(t => dict[toKey(t.text)]).length : 0;
  const coverage   = wordTokens.length > 0 ? Math.round((inDict / wordTokens.length) * 100) : 0;

  const openWork = (i) => { setWorkIdx(i); setPageIdx(0); setView("reading"); setActiveId(null); };
  const back     = ()  => { setView("library"); setActiveId(null); };

  if (view === "library") {
    return (
      <div style={{marginTop:"20px"}}>
        {err && (
          <div style={{padding:"10px 14px",background:"rgba(180,30,30,0.06)",border:"1px solid #c88080",borderRadius:"4px",marginBottom:"12px",fontFamily:"'EB Garamond',serif",fontSize:"13px",color:"#c06060"}}>
            Could not load <code>latin_dict.json</code>: {err}
          </div>
        )}
        <div style={{fontFamily:"'Cinzel',serif",fontSize:"9px",letterSpacing:"3px",color:"#9a7a3a",textTransform:"uppercase",marginBottom:"14px"}}>Select a work</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(240px,1fr))",gap:"12px"}}>
          {WORKS.map((work,i)=>(
            <button key={work.id} onClick={()=>openWork(i)}
              style={{textAlign:"left",background:"#fffdf6",border:"1px solid #d4bc84",borderRadius:"4px",padding:"18px 20px",cursor:"pointer",boxShadow:"0 2px 10px rgba(44,31,14,0.07)",transition:"all 0.15s",display:"block",width:"100%"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#b8973e";e.currentTarget.style.boxShadow="0 4px 18px rgba(44,31,14,0.13)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#d4bc84";e.currentTarget.style.boxShadow="0 2px 10px rgba(44,31,14,0.07)";}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:"15px",fontWeight:"700",color:"#2c1f0e",marginBottom:"3px",lineHeight:"1.3"}}>{work.title}</div>
              <div style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:"12px",color:"#7a5c2a",marginBottom:"10px"}}>{work.author} · {work.date}</div>
              <div style={{fontFamily:"'EB Garamond',serif",fontSize:"13px",color:"#5a4020",lineHeight:"1.5",marginBottom:"12px"}}>{work.desc}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:"4px"}}>
                {work.pages.map(p=>(
                  <span key={p.id} style={{fontFamily:"'Cinzel',serif",fontSize:"8px",letterSpacing:"0.8px",padding:"2px 7px",borderRadius:"10px",background:"rgba(200,170,100,0.12)",border:"1px solid #d4bc84",color:"#8a6914"}}>{p.label}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Reading view ──────────────────────────────────────────────────────────
  let wc = 0;

  return (
    <div style={{marginTop:"16px"}}>
      {/* Breadcrumb + page tabs */}
      <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px",flexWrap:"wrap"}}>
        <button onClick={back} style={{fontFamily:"'Cinzel',serif",fontSize:"9px",letterSpacing:"1.5px",padding:"5px 12px",background:"transparent",color:"#7a5c2a",border:"1px solid #c9b48a",borderRadius:"2px",cursor:"pointer"}}>← LIBRARY</button>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:"9px",color:"#b8973e",letterSpacing:"1px"}}>{work.title}</span>
        <div style={{marginLeft:"auto",display:"flex",gap:"5px",flexWrap:"wrap"}}>
          {work.pages.map((p,i)=>(
            <button key={p.id} onClick={()=>{setPageIdx(i);setActiveId(null);}}
              style={{fontFamily:"'Cinzel',serif",fontSize:"9px",letterSpacing:"0.5px",padding:"4px 10px",border:"1px solid",borderColor:i===pageIdx?"#b8973e":"#c9b48a",borderRadius:"12px",background:i===pageIdx?"#3a2410":"transparent",color:i===pageIdx?"#e8c97a":"#7a5c2a",cursor:"pointer",transition:"all 0.15s"}}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{background:"#fffdf6",border:"1px solid #d4bc84",borderRadius:"4px",boxShadow:"0 2px 16px rgba(44,31,14,0.09)",padding:"24px 28px"}}>
        {/* Header */}
        <div style={{marginBottom:"14px",paddingBottom:"12px",borderBottom:"1px solid #e8dfc0"}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:"8px"}}>
            <div>
              <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"17px",fontWeight:"700",color:"#2c1f0e",marginBottom:"3px"}}>{page.title}</h2>
              <div style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:"13px",color:"#7a5c2a"}}>{work.author} · <em>{work.title}</em> · {work.date}</div>
            </div>
            {dict && (
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:"3px",flexShrink:0}}>
                <div style={{fontFamily:"'Cinzel',serif",fontSize:"8px",letterSpacing:"1px",color:"#9a7a3a",textTransform:"uppercase"}}>Dictionary coverage</div>
                <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                  <div style={{width:"70px",height:"3px",background:"#e8dfc0",borderRadius:"2px",overflow:"hidden"}}>
                    <div style={{height:"100%",width:coverage+"%",background:coverage>80?"#b8973e":coverage>50?"#c88030":"#c84030",transition:"width 0.5s"}}/>
                  </div>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:"11px",color:"#8a6914",fontWeight:"600"}}>{coverage}%</span>
                </div>
                <div style={{fontFamily:"'EB Garamond',serif",fontSize:"11px",color:"#9a7a3a",fontStyle:"italic"}}>{inDict}/{wordTokens.length} words</div>
              </div>
            )}
          </div>
          {page.intro && <div style={{marginTop:"8px",fontFamily:"'EB Garamond',serif",fontSize:"13px",color:"#9a7a3a",lineHeight:"1.6",fontStyle:"italic"}}>{page.intro}</div>}
        </div>

        {/* POS legend */}
        <div style={{display:"flex",flexWrap:"wrap",gap:"4px",marginBottom:"14px",alignItems:"center"}}>
          {Object.entries(POS_COLORS).map(([pos,c])=>(
            <span key={pos} style={{fontFamily:"'Cinzel',serif",fontSize:"8px",letterSpacing:"1px",textTransform:"uppercase",padding:"2px 6px",borderRadius:"10px",background:c.bg,border:"1px solid "+c.border,color:c.border}}>{pos}</span>
          ))}
          <span style={{fontFamily:"'EB Garamond',serif",fontSize:"12px",color:"#9a7a3a",fontStyle:"italic",marginLeft:"6px"}}>
            {dict?"hover or tap any word":"loading dictionary…"}
          </span>
        </div>

        {/* Text */}
        <div style={{fontFamily:"'EB Garamond',serif",fontSize:"22px",lineHeight:"2.4",color:"#2c1f0e",marginBottom:"18px"}}>
          {tokens.map((token,i)=>{
            if(token.type==="punct") return <span key={i} style={{color:"#7a5c2a"}}>{token.text}{" "}</span>;
            const id=wc++;
            return <React.Fragment key={i}><WordToken text={token.text} dict={dict} activeId={activeId} setActiveId={setActiveId} idx={id}/>{" "}</React.Fragment>;
          })}
        </div>

        {/* Prev / Next */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px",paddingTop:"10px",borderTop:"1px solid #e8dfc0"}}>
          <button onClick={()=>{setPageIdx(p=>p-1);setActiveId(null);}} disabled={pageIdx===0}
            style={{fontFamily:"'Cinzel',serif",fontSize:"9px",letterSpacing:"1px",padding:"8px 16px",background:"transparent",color:pageIdx===0?"#c9b48a":"#7a5c2a",border:"1px solid",borderColor:pageIdx===0?"#e8dfc0":"#c9b48a",borderRadius:"2px",cursor:pageIdx===0?"default":"pointer"}}>
            ← PREV
          </button>
          <span style={{fontFamily:"'Cinzel',serif",fontSize:"9px",color:"#9a7a3a",letterSpacing:"1px"}}>{pageIdx+1} / {work.pages.length}</span>
          <button onClick={()=>{setPageIdx(p=>p+1);setActiveId(null);}} disabled={pageIdx===work.pages.length-1}
            style={{fontFamily:"'Cinzel',serif",fontSize:"9px",letterSpacing:"1px",padding:"8px 16px",background:pageIdx===work.pages.length-1?"transparent":"#8a6914",color:pageIdx===work.pages.length-1?"#c9b48a":"#f5f0e8",border:"1px solid",borderColor:pageIdx===work.pages.length-1?"#e8dfc0":"#8a6914",borderRadius:"2px",cursor:pageIdx===work.pages.length-1?"default":"pointer"}}>
            NEXT →
          </button>
        </div>

        {/* Word list */}
        <details>
          <summary style={{fontFamily:"'Cinzel',serif",fontSize:"10px",letterSpacing:"2px",color:"#8a6914",cursor:"pointer",userSelect:"none",textTransform:"uppercase"}}>
            ▸ Word List {dict?`(${inDict} found · ${wordTokens.length-inDict} missing)`:""}
          </summary>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(250px,1fr))",gap:"4px",marginTop:"10px"}}>
            {wordTokens.map((token,i)=>{
              const entry=dict?dict[toKey(token.text)]:null;
              const pc=entry?(POS_COLORS[entry.pos]||POS_COLORS.noun):null;
              return (
                <div key={i} style={{display:"flex",alignItems:"baseline",gap:"6px",padding:"5px 9px",background:entry?"rgba(200,170,100,0.05)":"rgba(150,50,50,0.04)",border:"1px solid",borderColor:entry?"#e8dfc0":"#e0c0c0",borderRadius:"3px"}}>
                  <span style={{fontFamily:"'EB Garamond',serif",fontStyle:"italic",fontSize:"15px",color:entry?"#8a6914":"#c08080",minWidth:"72px"}}>{token.text}</span>
                  {entry
                    ? <><span style={{fontFamily:"'Cinzel',serif",fontSize:"8px",padding:"1px 5px",borderRadius:"8px",background:pc.bg,border:"1px solid "+pc.border,color:pc.border,whiteSpace:"nowrap"}}>{entry.pos}</span>
                        <span style={{fontFamily:"'EB Garamond',serif",fontSize:"12px",color:"#7a5c2a",fontStyle:"italic"}}>{entry.eng}</span></>
                    : <span style={{fontFamily:"'Cinzel',serif",fontSize:"8px",color:"#c08080"}}>{dict?"not in dictionary":"loading…"}</span>
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

