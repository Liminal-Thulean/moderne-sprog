/**
 * greek_reader.js — Texts, dictionary, and Reader component
 * Part of Glossarium / Language Nexus — Greek section
 *
 * Exposes globals used by greek.html:
 *   INLINE_DICT   — fallback vocabulary for Anabasis passages
 *   WORKS         — library of works and pages
 *   ReaderMode()  — full library + paginated reader React component
 *
 * Depends on (must load first):
 *   greek_shared.js  — toKey, tokenise, POS_COLORS, WordToken
 */
// ─── DICTIONARY (Anabasis vocabulary) ────────────────────────────────────────
// Loaded from greek_dict.json — inline fallback for key Anabasis words

const INLINE_DICT = {
  // Core Anabasis vocabulary — Book I
  "kyros":      { lemma: "Κῦρος",    pos: "noun", eng: "Cyrus" },
  "dareios":    { lemma: "Δαρεῖος",  pos: "noun", eng: "Darius" },
  "artaxerxes": { lemma: "Ἀρταξέρξης",pos:"noun", eng: "Artaxerxes" },
  "hellas":     { lemma: "Ἑλλάς",    pos: "noun", eng: "Greece, Hellas" },
  "hellenes":   { lemma: "Ἕλληνες",  pos: "noun", eng: "Greeks, Hellenes" },
  "barbaros":   { lemma: "βάρβαρος", pos: "adj",  eng: "foreign, barbarian" },
  "stratos":    { lemma: "στρατός",  pos: "noun", eng: "army" },
  "stratia":    { lemma: "στρατιά",  pos: "noun", eng: "army, expedition" },
  "strategos":  { lemma: "στρατηγός",pos: "noun", eng: "general" },
  "polis":      { lemma: "πόλις",    pos: "noun", eng: "city, city-state" },
  "logos":      { lemma: "λόγος",    pos: "noun", eng: "word, speech, reason" },
  "anthropos":  { lemma: "ἄνθρωπος",pos: "noun", eng: "human being" },
  "theos":      { lemma: "θεός",     pos: "noun", eng: "god" },
  "potamos":    { lemma: "ποταμός",  pos: "noun", eng: "river" },
  "chora":      { lemma: "χώρα",     pos: "noun", eng: "land, country, region" },
  "hodos":      { lemma: "ὁδός",     pos: "noun", eng: "road, way, journey" },
  "nomos":      { lemma: "νόμος",    pos: "noun", eng: "law, custom" },
  "topos":      { lemma: "τόπος",    pos: "noun", eng: "place" },
  "polemos":    { lemma: "πόλεμος",  pos: "noun", eng: "war" },
  "hippos":     { lemma: "ἵππος",    pos: "noun", eng: "horse" },
  "ergon":      { lemma: "ἔργον",    pos: "noun", eng: "work, deed" },
  "hoplon":     { lemma: "ὅπλον",    pos: "noun", eng: "weapon, tool" },
  "pedion":     { lemma: "πεδίον",   pos: "noun", eng: "plain" },
  "stratopedon":{ lemma: "στρατόπεδον",pos:"noun",eng: "camp, army" },
  "teihos":     { lemma: "τεῖχος",   pos: "noun", eng: "wall" },
  "arche":      { lemma: "ἀρχή",     pos: "noun", eng: "beginning, rule, command" },
  "gnome":      { lemma: "γνώμη",    pos: "noun", eng: "opinion, judgment, plan" },
  "nike":       { lemma: "νίκη",     pos: "noun", eng: "victory" },
  "time":       { lemma: "τιμή",     pos: "noun", eng: "honour, price" },
  "boule":      { lemma: "βουλή",    pos: "noun", eng: "council, plan" },
  "eirene":     { lemma: "εἰρήνη",   pos: "noun", eng: "peace" },
  "thalatta":   { lemma: "θάλαττα",  pos: "noun", eng: "sea" },
  "hemera":     { lemma: "ἡμέρā",    pos: "noun", eng: "day" },
  // Core verbs
  "lyo":        { lemma: "λύω",      pos: "verb", eng: "loosen, destroy" },
  "poreuomai":  { lemma: "πορεύομαι",pos: "verb", eng: "travel, march" },
  "ago":        { lemma: "ἄγω",      pos: "verb", eng: "lead, bring" },
  "lego":       { lemma: "λέγω",     pos: "verb", eng: "say, speak" },
  "grapho":     { lemma: "γράφω",    pos: "verb", eng: "write" },
  "pisteuо":    { lemma: "πιστεύω",  pos: "verb", eng: "trust, believe" },
  "keleuо":     { lemma: "κελεύω",   pos: "verb", eng: "order, command" },
  "pauо":       { lemma: "παύω",     pos: "verb", eng: "stop, cease" },
  "thuо":       { lemma: "θύω",      pos: "verb", eng: "sacrifice" },
  "pheugo":     { lemma: "φεύγω",    pos: "verb", eng: "flee" },
  "boulomai":   { lemma: "βούλομαι", pos: "verb", eng: "wish, want" },
  "eimi":       { lemma: "εἰμί",     pos: "verb", eng: "be, exist" },
  "erchomai":   { lemma: "ἔρχομαι",  pos: "verb", eng: "come, go" },
  "echo":       { lemma: "ἔχω",      pos: "verb", eng: "have, hold" },
  "poieo":      { lemma: "ποιέω",    pos: "verb", eng: "make, do" },
  "horао":      { lemma: "ὁράω",     pos: "verb", eng: "see" },
  "lambanо":    { lemma: "λαμβάνω",  pos: "verb", eng: "take, receive" },
  "erchоmai":   { lemma: "ἔρχομαι",  pos: "verb", eng: "come, go" },
  "nomizо":     { lemma: "νομίζω",   pos: "verb", eng: "think, believe, practise" },
  "pempo":      { lemma: "πέμπω",    pos: "verb", eng: "send" },
  "phemi":      { lemma: "φημί",     pos: "verb", eng: "say, assert" },
  "aperchomai": { lemma: "ἀπέρχομαι",pos: "verb", eng: "go away, depart" },
  // Adjectives
  "agathos":    { lemma: "ἀγαθός",   pos: "adj",  eng: "good, brave, noble" },
  "kakos":      { lemma: "κακός",    pos: "adj",  eng: "bad, evil, cowardly" },
  "kalos":      { lemma: "καλός",    pos: "adj",  eng: "beautiful, noble, fine" },
  "megas":      { lemma: "μέγας",    pos: "adj",  eng: "great, large" },
  "mikros":     { lemma: "μικρός",   pos: "adj",  eng: "small, little" },
  "polys":      { lemma: "πολύς",    pos: "adj",  eng: "much, many" },
  "pas":        { lemma: "πᾶς",      pos: "adj",  eng: "all, every, whole" },
  "allos":      { lemma: "ἄλλος",    pos: "adj",  eng: "other, another" },
  "autos":      { lemma: "αὐτός",    pos: "pron", eng: "self; (he, she, it)" },
  "houtos":     { lemma: "οὗτος",    pos: "pron", eng: "this" },
  "ekeinos":    { lemma: "ἐκεῖνος",  pos: "pron", eng: "that" },
  // Prepositions & particles
  "ek":         { lemma: "ἐκ/ἐξ",   pos: "prep", eng: "out of, from (+ gen.)" },
  "en":         { lemma: "ἐν",       pos: "prep", eng: "in, on (+ dat.)" },
  "eis":        { lemma: "εἰς",      pos: "prep", eng: "into, to (+ acc.)" },
  "epi":        { lemma: "ἐπί",      pos: "prep", eng: "on, upon, at (+ dat./acc.)" },
  "apo":        { lemma: "ἀπό",      pos: "prep", eng: "from, away from (+ gen.)" },
  "dia":        { lemma: "διά",      pos: "prep", eng: "through (+ gen.); because of (+ acc.)" },
  "kata":       { lemma: "κατά",     pos: "prep", eng: "down; according to" },
  "meta":       { lemma: "μετά",     pos: "prep", eng: "with (+ gen.); after (+ acc.)" },
  "para":       { lemma: "παρά",     pos: "prep", eng: "beside, at (+ dat.); from (+ gen.)" },
  "pros":       { lemma: "πρός",     pos: "prep", eng: "to, towards (+ acc.)" },
  "hypo":       { lemma: "ὑπό",      pos: "prep", eng: "under; by (agent, + gen.)" },
  "peri":       { lemma: "περί",     pos: "prep", eng: "around, about (+ gen./acc.)" },
  "kai":        { lemma: "καί",      pos: "conj", eng: "and, also, even" },
  "de":         { lemma: "δέ",       pos: "conj", eng: "but, and, now (postpositive)" },
  "men":        { lemma: "μέν",      pos: "conj", eng: "on the one hand (postpositive)" },
  "gar":        { lemma: "γάρ",      pos: "conj", eng: "for, because (postpositive)" },
  "alla":       { lemma: "ἀλλά",     pos: "conj", eng: "but, however" },
  "hoti":       { lemma: "ὅτι",      pos: "conj", eng: "that, because" },
  "hos":        { lemma: "ὡς",       pos: "conj", eng: "as, how, that, when" },
  "an":         { lemma: "ἄν",       pos: "part", eng: "(modal particle — untranslatable)" },
  "ou":         { lemma: "οὐ/οὐκ",  pos: "adv",  eng: "not (indicative)" },
  "me":         { lemma: "μή",       pos: "adv",  eng: "not (non-indicative)" },
  "nun":        { lemma: "νῦν",      pos: "adv",  eng: "now" },
  "ede":        { lemma: "ἤδη",      pos: "adv",  eng: "now, already" },
  "eti":        { lemma: "ἔτι",      pos: "adv",  eng: "still, yet, besides" },
  "tote":       { lemma: "τότε",     pos: "adv",  eng: "at that time, then" },
  "enthaden":   { lemma: "ἐντεῦθεν", pos: "adv",  eng: "from there, thereupon" },
  "entha":      { lemma: "ἔνθα",     pos: "adv",  eng: "there, where, then" },
};


// ─── WORKS & PAGES ────────────────────────────────────────────────────────────

const WORKS = [
  {
    id: "anab",
    title: "Ἀνάβασις",
    author: "Ξενοφῶν",
    date: "c. 370 BC",
    desc: "The march of ten thousand Greek mercenaries into the Persian heartland and their epic retreat to the sea — one of antiquity's greatest adventure narratives.",
    pages: [
      {
        id: "anab_1_1_1", label: "I.1.1–2", title: "Ἀνάβασις I.1.1–2",
        intro: "Xenophon opens with the dynastic background: Darius and Parysatis have two sons. When Darius falls ill, both are summoned to court.",
        text: `Δαρείου καὶ Παρυσάτιδος γίγνονται παῖδες δύο, πρεσβύτερος μὲν Ἀρταξέρξης, νεώτερος δὲ Κῦρος· ἐπεὶ δὲ ἠσθένει Δαρεῖος καὶ ὑπώπτευε τελευτὴν τοῦ βίου, ἐβούλετο τὼ παῖδε ἀμφοτέρω παρεῖναι. ὁ μὲν οὖν πρεσβύτερος παρὼν ἐτύγχανε· Κῦρον δὲ μεταπέμπεται ἀπὸ τῆς ἀρχῆς ἧς αὐτὸν σατράπην ἐποίησε.`
      },
      {
        id: "anab_1_1_3", label: "I.1.3", title: "Ἀνάβασις I.1.3",
        intro: "Tissaphernes accuses Cyrus of plotting against the king. Cyrus is arrested, but his mother Parysatis secures his release.",
        text: `Κατηγόρει δὲ Κύρου πρὸς τὸν πατέρα Τισσαφέρνης ὡς ἐπιβουλεύοι αὐτῷ. ὁ δὲ πείθεται· Κῦρον δὲ συλλαμβάνει ὡς ἀποκτενῶν· ἡ δὲ μήτηρ ἐξαιτεῖται αὐτόν, καὶ ἀποπέμπει πάλιν ἐπὶ τὴν ἀρχήν· ὁ δ᾽ ὡς ἀπῆλθε κινδυνεύσας καὶ ἀτιμασθείς, βουλεύεται ὅπως μήποτε ἔτι ἔσται ἐπὶ τῷ ἀδελφῷ, ἀλλά, ἢν δύνηται, βασιλεύσει ἀντ᾽ αὐτοῦ.`
      },
      {
        id: "anab_1_2_1", label: "I.2.1", title: "Ἀνάβασις I.2.1",
        intro: "Cyrus musters Greek and barbarian forces, pretending to march against Tissaphernes.",
        text: `Κῦρος δὲ συλλέγει στράτευμα ἑλληνικόν τε καὶ βαρβαρικόν, ὡς ἐπὶ Τισσαφέρνην ἰών, ἄγων τοὺς Ἕλληνας κατὰ τὴν ὁδὸν ἄνω· οἱ δὲ Ἕλληνες οὐκ ᾔδεσαν ὅποι ποτε πορεύσονται, ἐξαπατώμενοι δ᾽ ἐπορεύοντο. ἐνταῦθα Κῦρος ἐξετάζει τό τε βαρβαρικὸν καὶ τὸ Ἑλληνικὸν στράτευμα ἐν τῷ πεδίῳ.`
      },
      {
        id: "anab_1_7_3", label: "I.7.3", title: "Ἀνάβασις I.7.3",
        intro: "Before Cunaxa, Cyrus instructs Clearchus to hold the centre. Clearchus politely deflects.",
        text: `Κῦρος δὲ μεταπέμπεται Κλέαρχον καὶ κελεύει αὐτὸν λαβεῖν τοὺς Ἕλληνας καὶ ἄγειν κατὰ τὸ μέσον, ὅτι ἐκεῖ βασιλέα εἶναι. ὁ δὲ Κλέαρχος ἔλεξεν ὅτι ταῦτα ποιήσει ὅπως ἂν αὐτῷ δοκῇ ἄριστα εἶναι.`
      },
      {
        id: "anab_3_1_2", label: "III.1.2", title: "Ἀνάβασις III.1.2",
        intro: "After the generals are treacherously slain, Xenophon rises to address the army.",
        text: `ἐν τούτῳ δὲ τῷ καιρῷ Ξενοφῶν ἀνίσταται καὶ λέγει ὅτι δεῖ τοὺς στρατηγοὺς ἑλέσθαι καὶ τοὺς λοχαγοὺς ἀντὶ τῶν τεθνεώτων. δεῖ γὰρ τοὺς Ἕλληνας σῴζεσθαι· ἄνευ δὲ στρατηγῶν οὐδὲν οἷόν τε γίγνεσθαι ἀγαθόν.`
      },
    ],
  },
];

// ─── UTILITIES ────────────────────────────────────────────────────────────────

// Normalise Greek text for dictionary lookup:

// ─── LIBRARY + READER ─────────────────────────────────────────────────────────

function ReaderMode() {
  const [dict, setDict]         = React.useState(null);
  const [view, setView]         = React.useState("library");
  const [workIdx, setWorkIdx]   = React.useState(null);
  const [pageIdx, setPageIdx]   = React.useState(0);
  const [activeId, setActiveId] = React.useState(null);

  React.useEffect(() => {
    fetch("greek_dict.json")
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(setDict).catch(() => setDict({}));
  }, []);

  // ALL hooks must be called unconditionally — guard values instead of early-returning
  const work   = workIdx !== null ? WORKS[workIdx] : null;
  const page   = work ? work.pages[pageIdx] : null;
  const tokens = React.useMemo(() => page ? tokenise(page.text) : [], [workIdx, pageIdx]);

  const openWork = (i) => { setWorkIdx(i); setPageIdx(0); setView("reading"); setActiveId(null); };
  const back     = ()  => { setView("library"); setActiveId(null); };

  if (view === "library") {
    return (
      <div style={{ marginTop: "20px" }}>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "3px", color: "#9a7a3a", textTransform: "uppercase", marginBottom: "14px" }}>Select a work</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: "12px" }}>
          {WORKS.map((work, i) => (
            <button key={work.id} onClick={() => openWork(i)}
              style={{ textAlign: "left", background: "#fffdf6", border: "1px solid #d4bc84", borderRadius: "4px", padding: "18px 20px", cursor: "pointer", boxShadow: "0 2px 10px rgba(44,31,14,0.07)", transition: "all 0.15s", display: "block", width: "100%" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#b8973e"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(44,31,14,0.13)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#d4bc84"; e.currentTarget.style.boxShadow = "0 2px 10px rgba(44,31,14,0.07)"; }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: "15px", fontWeight: "700", color: "#2c1f0e", marginBottom: "3px", lineHeight: "1.3" }}>{work.title}</div>
              <div style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: "12px", color: "#7a5c2a", marginBottom: "10px" }}>{work.author} · {work.date}</div>
              <div style={{ fontFamily: "'EB Garamond',serif", fontSize: "13px", color: "#5a4020", lineHeight: "1.5", marginBottom: "12px" }}>{work.desc}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {work.pages.map(p => (
                  <span key={p.id} style={{ fontFamily: "'Cinzel',serif", fontSize: "8px", letterSpacing: "0.8px", padding: "2px 7px", borderRadius: "10px", background: "rgba(200,170,100,0.12)", border: "1px solid #d4bc84", color: "#8a6914" }}>{p.label}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── Reading view ───────────────────────────────────────────────────────────
  const wordTokens = tokens.filter(t => t.type === "word");
  const activeDict = dict || {};
  const inDict = wordTokens.filter(t => {
    const k = toKey(t.text);
    return activeDict[k] || INLINE_DICT[k];
  }).length;
  const coverage = wordTokens.length > 0 ? Math.round((inDict / wordTokens.length) * 100) : 0;
  let wc = 0;

  return (
    <div style={{ marginTop: "16px" }}>
      {/* Breadcrumb + page nav */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
        <button onClick={back} style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "1.5px", padding: "5px 12px", background: "transparent", color: "#7a5c2a", border: "1px solid #c9b48a", borderRadius: "2px", cursor: "pointer" }}>← LIBRARY</button>
        <span style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", color: "#b8973e", letterSpacing: "1px" }}>{work.title}</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: "5px", flexWrap: "wrap" }}>
          {work.pages.map((p, i) => (
            <button key={p.id} onClick={() => { setPageIdx(i); setActiveId(null); }}
              style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "0.5px", padding: "4px 10px", border: "1px solid", borderColor: i === pageIdx ? "#b8973e" : "#c9b48a", borderRadius: "12px", background: i === pageIdx ? "#3a2410" : "transparent", color: i === pageIdx ? "#e8c97a" : "#7a5c2a", cursor: "pointer", transition: "all 0.15s" }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: "#fffdf6", border: "1px solid #d4bc84", borderRadius: "4px", boxShadow: "0 2px 16px rgba(44,31,14,0.09)", padding: "24px 28px" }}>
        {/* Header */}
        <div style={{ marginBottom: "14px", paddingBottom: "12px", borderBottom: "1px solid #e8dfc0" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
            <div>
              <h2 style={{ fontFamily: "'Cinzel',serif", fontSize: "17px", fontWeight: "700", color: "#2c1f0e", marginBottom: "3px" }}>{page.title}</h2>
              <div style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: "13px", color: "#7a5c2a" }}>
                {work.author} · <em>{work.title}</em> · {work.date}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "3px", flexShrink: 0 }}>
              <div style={{ fontFamily: "'Cinzel',serif", fontSize: "8px", letterSpacing: "1px", color: "#9a7a3a", textTransform: "uppercase" }}>Dictionary coverage</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "70px", height: "3px", background: "#e8dfc0", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: coverage + "%", background: coverage > 80 ? "#b8973e" : coverage > 50 ? "#c88030" : "#c84030", transition: "width 0.5s" }} />
                </div>
                <span style={{ fontFamily: "'Cinzel',serif", fontSize: "11px", color: "#8a6914", fontWeight: "600" }}>{coverage}%</span>
              </div>
              <div style={{ fontFamily: "'EB Garamond',serif", fontSize: "11px", color: "#9a7a3a", fontStyle: "italic" }}>{inDict}/{wordTokens.length} words</div>
            </div>
          </div>
          {page.intro && (
            <div style={{ marginTop: "8px", fontFamily: "'EB Garamond',serif", fontSize: "13px", color: "#9a7a3a", lineHeight: "1.6", fontStyle: "italic" }}>{page.intro}</div>
          )}
        </div>

        {/* POS legend */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "14px", alignItems: "center" }}>
          {Object.entries(POS_COLORS).map(([pos, c]) => (
            <span key={pos} style={{ fontFamily: "'Cinzel',serif", fontSize: "8px", letterSpacing: "1px", textTransform: "uppercase", padding: "2px 6px", borderRadius: "10px", background: c.bg, border: "1px solid " + c.border, color: c.border }}>{pos}</span>
          ))}
          <span style={{ fontFamily: "'EB Garamond',serif", fontSize: "12px", color: "#9a7a3a", fontStyle: "italic", marginLeft: "6px" }}>
            {dict ? "hover or tap any word" : "loading dictionary…"}
          </span>
        </div>

        {/* Text */}
        <div style={{ fontFamily: "'EB Garamond',serif", fontSize: "22px", lineHeight: "2.5", color: "#2c1f0e", marginBottom: "18px" }}>
          {tokens.map((token, i) => {
            if (token.type !== "word") return <span key={i} style={{ color: "#7a5c2a" }}>{token.text}</span>;
            const id = wc++;
            return (
              <React.Fragment key={i}>
                <WordToken text={token.text} dict={activeDict} activeId={activeId} setActiveId={setActiveId} idx={id} />
                {" "}
              </React.Fragment>
            );
          })}
        </div>

        {/* Prev / Next */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingTop: "10px", borderTop: "1px solid #e8dfc0" }}>
          <button onClick={() => { setPageIdx(p => p - 1); setActiveId(null); }} disabled={pageIdx === 0}
            style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "1px", padding: "8px 16px", background: "transparent", color: pageIdx === 0 ? "#c9b48a" : "#7a5c2a", border: "1px solid", borderColor: pageIdx === 0 ? "#e8dfc0" : "#c9b48a", borderRadius: "2px", cursor: pageIdx === 0 ? "default" : "pointer" }}>
            ← PREV
          </button>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", color: "#9a7a3a", letterSpacing: "1px" }}>{pageIdx + 1} / {work.pages.length}</span>
          <button onClick={() => { setPageIdx(p => p + 1); setActiveId(null); }} disabled={pageIdx === work.pages.length - 1}
            style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "1px", padding: "8px 16px", background: pageIdx === work.pages.length - 1 ? "transparent" : "#8a6914", color: pageIdx === work.pages.length - 1 ? "#c9b48a" : "#f5f0e8", border: "1px solid", borderColor: pageIdx === work.pages.length - 1 ? "#e8dfc0" : "#8a6914", borderRadius: "2px", cursor: pageIdx === work.pages.length - 1 ? "default" : "pointer" }}>
            NEXT →
          </button>
        </div>

        {/* Word list */}
        <details>
          <summary style={{ fontFamily: "'Cinzel',serif", fontSize: "10px", letterSpacing: "2px", color: "#8a6914", cursor: "pointer", userSelect: "none", textTransform: "uppercase" }}>
            ▸ Word List ({inDict} found · {wordTokens.length - inDict} missing)
          </summary>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: "4px", marginTop: "10px" }}>
            {wordTokens.map((token, i) => {
              const k = toKey(token.text);
              const entry = activeDict[k] || INLINE_DICT[k];
              const pc = entry ? (POS_COLORS[entry.pos] || POS_COLORS.noun) : null;
              return (
                <div key={i} style={{ display: "flex", alignItems: "baseline", gap: "6px", padding: "5px 9px", background: entry ? "rgba(200,170,100,0.05)" : "rgba(150,50,50,0.04)", border: "1px solid", borderColor: entry ? "#e8dfc0" : "#e0c0c0", borderRadius: "3px" }}>
                  <span style={{ fontFamily: "'EB Garamond',serif", fontStyle: "italic", fontSize: "15px", color: entry ? "#8a6914" : "#c08080", minWidth: "80px" }}>{token.text}</span>
                  {entry
                    ? <><span style={{ fontFamily: "'Cinzel',serif", fontSize: "8px", padding: "1px 5px", borderRadius: "8px", background: pc.bg, border: "1px solid " + pc.border, color: pc.border, whiteSpace: "nowrap" }}>{entry.pos}</span>
                        <span style={{ fontFamily: "'EB Garamond',serif", fontSize: "12px", color: "#7a5c2a", fontStyle: "italic" }}>{entry.eng}</span></>
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

