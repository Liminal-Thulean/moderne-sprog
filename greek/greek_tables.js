/**
 * greek_tables.js — Paradigm data, vocabulary, and table components
 * Part of Glossarium / Language Nexus — Greek section
 *
 * Exposes globals used by greek.html:
 *   DECLENSION_PATTERNS, CONJUGATION_PATTERNS, CATEGORIES, TAG
 *   getAnswers(category, word)
 *   ScoreBar({ score, total, submitted })
 *   TableGrid({ headers, rows, answers, inputs, submitted, showAnswers, onInput })
 */
// ─── PARADIGM DATA ────────────────────────────────────────────────────────────

// Noun declension patterns
const DECLENSION_PATTERNS = {
  // First declension — feminine in -ā
  "1st_alpha_f": {
    headers: ["", "Singular", "Plural"],
    rows: [
      { label: "Nominative", suffixes: ["ā",    "ai"]   },
      { label: "Genitive",   suffixes: ["ās",   "ōn"]   },
      { label: "Dative",     suffixes: ["āi",   "āis"]  },
      { label: "Accusative", suffixes: ["ān",   "ās"]   },
      { label: "Vocative",   suffixes: ["ā",    "ai"]   },
    ],
  },
  // First declension — feminine in -ē
  "1st_eta_f": {
    headers: ["", "Singular", "Plural"],
    rows: [
      { label: "Nominative", suffixes: ["ē",    "ai"]   },
      { label: "Genitive",   suffixes: ["ēs",   "ōn"]   },
      { label: "Dative",     suffixes: ["ēi",   "āis"]  },
      { label: "Accusative", suffixes: ["ēn",   "ās"]   },
      { label: "Vocative",   suffixes: ["ē",    "ai"]   },
    ],
  },
  // First declension — masculine in -ās
  "1st_alpha_m": {
    headers: ["", "Singular", "Plural"],
    rows: [
      { label: "Nominative", suffixes: ["ās",   "ai"]   },
      { label: "Genitive",   suffixes: ["ou",   "ōn"]   },
      { label: "Dative",     suffixes: ["āi",   "āis"]  },
      { label: "Accusative", suffixes: ["ān",   "ās"]   },
      { label: "Vocative",   suffixes: ["ā",    "ai"]   },
    ],
  },
  // Second declension — masculine in -os
  "2nd_masc": {
    headers: ["", "Singular", "Plural"],
    rows: [
      { label: "Nominative", suffixes: ["os",   "oi"]   },
      { label: "Genitive",   suffixes: ["ou",   "ōn"]   },
      { label: "Dative",     suffixes: ["ōi",   "ois"]  },
      { label: "Accusative", suffixes: ["on",   "ous"]  },
      { label: "Vocative",   suffixes: ["e",    "oi"]   },
    ],
  },
  // Second declension — neuter in -on
  "2nd_neut": {
    headers: ["", "Singular", "Plural"],
    rows: [
      { label: "Nominative", suffixes: ["on",   "a"]    },
      { label: "Genitive",   suffixes: ["ou",   "ōn"]   },
      { label: "Dative",     suffixes: ["ōi",   "ois"]  },
      { label: "Accusative", suffixes: ["on",   "a"]    },
      { label: "Vocative",   suffixes: ["on",   "a"]    },
    ],
  },
  // Third declension — consonant stem
  "3rd_cons": {
    headers: ["", "Singular", "Plural"],
    rows: [
      { label: "Nominative", suffixes: ["—",    "es"]   },
      { label: "Genitive",   suffixes: ["os",   "ōn"]   },
      { label: "Dative",     suffixes: ["i",    "si"]   },
      { label: "Accusative", suffixes: ["a/n",  "as/eis"] },
      { label: "Vocative",   suffixes: ["—",    "es"]   },
    ],
  },
};

// Verb conjugation patterns
const CONJUGATION_PATTERNS = {
  // Thematic present active indicative
  "pres_act_ind": {
    headers: ["", "Singular", "Plural"],
    rows: [
      { label: "1st", suffixes: ["ō",    "omen"] },
      { label: "2nd", suffixes: ["eis",  "ete"]  },
      { label: "3rd", suffixes: ["ei",   "ousi"] },
    ],
  },
  // Imperfect active indicative
  "imperf_act_ind": {
    headers: ["", "Singular", "Plural"],
    rows: [
      { label: "1st", suffixes: ["on",   "omen"] },
      { label: "2nd", suffixes: ["es",   "ete"]  },
      { label: "3rd", suffixes: ["e",    "on"]   },
    ],
  },
  // Future active indicative
  "fut_act_ind": {
    headers: ["", "Singular", "Plural"],
    rows: [
      { label: "1st", suffixes: ["sō",   "somen"] },
      { label: "2nd", suffixes: ["seis", "sete"]  },
      { label: "3rd", suffixes: ["sei",  "sousi"] },
    ],
  },
  // Aorist active indicative (weak/sigmatic)
  "aor_act_ind": {
    headers: ["", "Singular", "Plural"],
    rows: [
      { label: "1st", suffixes: ["sa",   "samen"] },
      { label: "2nd", suffixes: ["sas",  "sate"]  },
      { label: "3rd", suffixes: ["se",   "san"]   },
    ],
  },
  // Present middle/passive indicative
  "pres_mid_ind": {
    headers: ["", "Singular", "Plural"],
    rows: [
      { label: "1st", suffixes: ["omai",  "ometha"] },
      { label: "2nd", suffixes: ["ei",    "esthe"]  },
      { label: "3rd", suffixes: ["etai",  "ontai"]  },
    ],
  },
  // Imperfect middle/passive indicative
  "imperf_mid_ind": {
    headers: ["", "Singular", "Plural"],
    rows: [
      { label: "1st", suffixes: ["omēn",  "ometha"] },
      { label: "2nd", suffixes: ["ou",    "esthe"]  },
      { label: "3rd", suffixes: ["eto",   "onto"]   },
    ],
  },
};

// ─── VOCABULARY ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  // ── Nouns ──────────────────────────────────────────────────────────────────
  {
    id: "1decl_f",
    label: "1st Decl.",
    sublabel: "feminine",
    type: "declension",
    pattern: "1st_eta_f",
    words: [
      { lemma: "χώρā",     meaning: "land, country, region",  stem: "χώρ" },
      { lemma: "στρατιά",  meaning: "army, expedition",        stem: "στρατι" },
      { lemma: "γνώμη",    meaning: "opinion, judgment, plan", stem: "γνώμ" },
      { lemma: "ἀρχή",     meaning: "beginning, rule, command",stem: "ἀρχ" },
      { lemma: "βουλή",    meaning: "council, plan",           stem: "βουλ" },
      { lemma: "εἰρήνη",   meaning: "peace",                   stem: "εἰρήν" },
      { lemma: "ἡμέρā",    meaning: "day",                     stem: "ἡμέρ" },
      { lemma: "θάλαττα",  meaning: "sea",                     stem: "θαλάττ" },
      { lemma: "νίκη",     meaning: "victory",                 stem: "νίκ" },
      { lemma: "τιμή",     meaning: "honour, price",           stem: "τιμ" },
    ],
  },
  {
    id: "1decl_m",
    label: "1st Decl.",
    sublabel: "masculine",
    type: "declension",
    pattern: "1st_alpha_m",
    words: [
      { lemma: "στρατηγός", meaning: "general",                stem: "στρατηγ", pattern_override: "2nd_masc" },
      { lemma: "νεανίāς",   meaning: "young man",              stem: "νεανί" },
      { lemma: "πολίτης",   meaning: "citizen",                stem: "πολίτ", note: "3rd decl. -ης" },
      { lemma: "κριτής",    meaning: "judge",                  stem: "κριτ" },
      { lemma: "δεσπότης",  meaning: "master, lord",           stem: "δεσπότ" },
    ],
  },
  {
    id: "2decl_m",
    label: "2nd Decl.",
    sublabel: "masculine",
    type: "declension",
    pattern: "2nd_masc",
    words: [
      { lemma: "ἄνθρωπος", meaning: "human being, man",       stem: "ἀνθρώπ" },
      { lemma: "λόγος",    meaning: "word, speech, reason",   stem: "λόγ" },
      { lemma: "θεός",     meaning: "god",                    stem: "θε" },
      { lemma: "ποταμός",  meaning: "river",                  stem: "ποταμ" },
      { lemma: "νόμος",    meaning: "law, custom",            stem: "νόμ" },
      { lemma: "τόπος",    meaning: "place",                  stem: "τόπ" },
      { lemma: "δοῦλος",   meaning: "slave",                  stem: "δούλ" },
      { lemma: "ἵππος",    meaning: "horse",                  stem: "ἵππ" },
      { lemma: "πόλεμος",  meaning: "war",                    stem: "πόλεμ" },
    ],
  },
  {
    id: "2decl_n",
    label: "2nd Decl.",
    sublabel: "neuter",
    type: "declension",
    pattern: "2nd_neut",
    words: [
      { lemma: "δῶρον",   meaning: "gift",                    stem: "δώρ" },
      { lemma: "ἔργον",   meaning: "work, deed",              stem: "ἔργ" },
      { lemma: "ὅπλον",   meaning: "weapon, tool",            stem: "ὅπλ" },
      { lemma: "στρατόπεδον", meaning: "camp, army",          stem: "στρατόπεδ" },
      { lemma: "πεδίον",  meaning: "plain",                   stem: "πεδί" },
      { lemma: "τεῖχος",  meaning: "wall",                    stem: "τείχ", note: "3rd decl." },
    ],
  },
  // ── Verbs ──────────────────────────────────────────────────────────────────
  {
    id: "pres_act",
    label: "Present",
    sublabel: "act. ind.",
    type: "conjugation",
    pattern: "pres_act_ind",
    words: [
      { lemma: "λύω",      meaning: "loosen, destroy",        stem: "λύ"    },
      { lemma: "πορεύω",   meaning: "lead, march, travel",    stem: "πορεύ" },
      { lemma: "ἄγω",      meaning: "lead, bring",            stem: "ἄγ"   },
      { lemma: "λέγω",     meaning: "say, speak",             stem: "λέγ"  },
      { lemma: "γράφω",    meaning: "write, draw",            stem: "γράφ" },
      { lemma: "πιστεύω",  meaning: "trust, believe",         stem: "πιστεύ"},
      { lemma: "παύω",     meaning: "stop, cease",            stem: "παύ"  },
      { lemma: "θύω",      meaning: "sacrifice, offer",       stem: "θύ"   },
      { lemma: "κελεύω",   meaning: "order, command",         stem: "κελεύ"},
      { lemma: "φεύγω",    meaning: "flee, escape",           stem: "φεύγ" },
    ],
  },
  {
    id: "imperf_act",
    label: "Imperfect",
    sublabel: "act. ind.",
    type: "conjugation",
    pattern: "imperf_act_ind",
    words: [
      { lemma: "λύω",      meaning: "loosen, destroy",        stem: "λύ",   augmented: "ἔλυ"   },
      { lemma: "πορεύω",   meaning: "lead, march, travel",    stem: "πορεύ",augmented: "ἐπόρευ"},
      { lemma: "ἄγω",      meaning: "lead, bring",            stem: "ἄγ",   augmented: "ἦγ"   },
      { lemma: "λέγω",     meaning: "say, speak",             stem: "λέγ",  augmented: "ἔλεγ" },
      { lemma: "γράφω",    meaning: "write, draw",            stem: "γράφ", augmented: "ἔγραφ"},
      { lemma: "κελεύω",   meaning: "order, command",         stem: "κελεύ",augmented: "ἐκέλευ"},
    ],
  },
  {
    id: "aor_act",
    label: "Aorist",
    sublabel: "act. ind.",
    type: "conjugation",
    pattern: "aor_act_ind",
    words: [
      { lemma: "λύω",      meaning: "loosen, destroy",        stem: "λύ",   augmented: "ἔλυ"    },
      { lemma: "πιστεύω",  meaning: "trust, believe",         stem: "πιστεύ",augmented: "ἐπίστευ"},
      { lemma: "κελεύω",   meaning: "order, command",         stem: "κελεύ", augmented: "ἐκέλευ"},
      { lemma: "παύω",     meaning: "stop, cease",            stem: "παύ",   augmented: "ἔπαυ"  },
      { lemma: "θύω",      meaning: "sacrifice",              stem: "θύ",    augmented: "ἔθυ"   },
    ],
  },
  {
    id: "pres_mid",
    label: "Present",
    sublabel: "mid./pass.",
    type: "conjugation",
    pattern: "pres_mid_ind",
    words: [
      { lemma: "λύω",      meaning: "loosen (mid: ransom)",   stem: "λύ"    },
      { lemma: "πορεύω",   meaning: "travel, march",          stem: "πορεύ" },
      { lemma: "παύω",     meaning: "stop (mid: cease)",      stem: "παύ"   },
      { lemma: "βούλομαι", meaning: "wish, want",             stem: "βούλ"  },
    ],
  },
];


function getAnswers(category, word) {
  const patterns = category.type === "conjugation" ? CONJUGATION_PATTERNS : DECLENSION_PATTERNS;
  const patternKey = word.pattern_override || category.pattern;
  const pattern = patterns[patternKey];
  const base = word.augmented || word.stem;
  return pattern.rows.map(row => row.suffixes.map(sfx => {
    if (sfx === "—") return "—";
    return base + sfx;
  }));
}

// ─── SCORE BAR ────────────────────────────────────────────────────────────────

function ScoreBar({ score, total, submitted }) {
  if (!submitted) return null;
  const pct = Math.round((score / total) * 100);
  const grade =
    pct === 100 ? { label: "Ἄριστα!",  color: "#2d6a4f" }
    : pct >= 80  ? { label: "Καλῶς!",   color: "#4a7c59" }
    : pct >= 60  ? { label: "Ἱκανῶς",   color: "#8a6914" }
    :              { label: "Μελέτα!",   color: "#9b2335" };
  return (
    <div style={{ padding: "12px 24px", background: "#f9f3e3", borderBottom: "1px solid #d4bc84", display: "flex", alignItems: "center", gap: "16px" }}>
      <div style={{ fontFamily: "'Cinzel',serif", fontSize: "19px", fontWeight: "700", color: grade.color, minWidth: "140px" }}>{grade.label}</div>
      <div style={{ flex: 1 }}>
        <div style={{ height: "5px", background: "#e0d0a8", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: grade.color, borderRadius: "3px", transition: "width 0.6s ease" }} />
        </div>
      </div>
      <div style={{ fontSize: "14px", color: "#5a3e1b", fontWeight: "500", minWidth: "80px", textAlign: "right" }}>{score}/{total} · {pct}%</div>
    </div>
  );
}

// ─── TABLE GRID ───────────────────────────────────────────────────────────────

function TableGrid({ headers, rows, answers, inputs, submitted, showAnswers, onInput }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} style={{ fontFamily: "'Cinzel',serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#7a5c2a", padding: "7px 10px", textAlign: i === 0 ? "left" : "center", borderBottom: "1px solid #d4bc84", fontWeight: "600" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} style={{ background: ri % 2 === 0 ? "transparent" : "rgba(200,170,100,0.04)" }}>
            <td style={{ padding: "8px 10px", fontFamily: "'Cinzel',serif", fontSize: "11px", letterSpacing: "0.5px", color: "#5a3e1b", borderBottom: "1px solid #e8dfc0", whiteSpace: "nowrap", fontWeight: "500" }}>{row.label}</td>
            {answers[ri].map((answer, ci) => {
              const key = `${ri}-${ci}`;
              const val = inputs[key] || "";
              const status = submitted ? checkAnswer(val, answer) : null;
              return (
                <td key={ci} style={{ padding: "5px 8px", textAlign: "center", borderBottom: "1px solid #e8dfc0", background: !status ? "transparent" : status === "correct" ? "rgba(45,106,79,0.07)" : status === "wrong" ? "rgba(155,35,53,0.07)" : "rgba(200,170,100,0.08)" }}>
                  <div style={{ position: "relative" }}>
                    <input type="text" value={val} onChange={e => onInput(key, e.target.value)}
                      style={{ width: "100%", minWidth: "90px", padding: "5px 6px", fontFamily: "'EB Garamond',serif", fontSize: "15px", textAlign: "center", background: !status ? "#faf8f0" : status === "correct" ? "rgba(45,106,79,0.05)" : status === "wrong" ? "rgba(155,35,53,0.05)" : "rgba(200,150,50,0.08)", border: "1px solid", borderColor: !status ? "#d4bc84" : status === "correct" ? "#2d6a4f" : status === "wrong" ? "#9b2335" : "#b8973e", borderRadius: "2px", outline: "none", color: "#2c1f0e", transition: "border-color 0.2s, background 0.2s" }} />
                    {submitted && status === "wrong" && showAnswers && (
                      <div style={{ position: "absolute", bottom: "-16px", left: "50%", transform: "translateX(-50%)", fontSize: "11px", color: "#2d6a4f", fontStyle: "italic", whiteSpace: "nowrap", pointerEvents: "none", zIndex: 1 }}>{answer}</div>
                    )}
                  </div>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

