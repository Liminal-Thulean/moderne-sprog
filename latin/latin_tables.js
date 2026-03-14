/**
 * latin_tables.js — Paradigm data, vocabulary, helpers, matching mode,
 *                   and table components
 * Part of Glossarium / Language Nexus — Latin section
 *
 * Exposes globals used by latin.html:
 *   CONJUGATION_PATTERNS, DECLENSION_PATTERNS, CATEGORIES, TAG
 *   normalize(str), checkAnswer(input, answer), getAnswers(category, word)
 *   MatchingMode()
 *   ScoreBar({ score, total, submitted })
 *   TableGrid({ headers, rows, answers, inputs, submitted, showAnswers, onInput })
 */
// ─── DATA ─────────────────────────────────────────────────────────────────────
// To add vocabulary: find the category you want, copy an existing line inside
// the `words: [...]` array, paste it, and edit the lemma, meaning, and stem.
// For 3rd declension nouns, also include nom_sg (the nominative singular form).
//
// To add a new tense/pattern, copy an existing category block and adjust.

const CONJUGATION_PATTERNS = {
  "1st_present": {
    headers: ["", "Singular", "Plural"],
    rows: [
      { label: "1st", suffixes: ["ō",   "āmus"] },
      { label: "2nd", suffixes: ["ās",  "ātis"] },
      { label: "3rd", suffixes: ["at",  "ant"]  },
    ],
  },
  "1st_imperfect": {
    headers: ["", "Singular", "Plural"],
    rows: [
      { label: "1st", suffixes: ["ābam",  "ābāmus"] },
      { label: "2nd", suffixes: ["ābās",  "ābātis"] },
      { label: "3rd", suffixes: ["ābat",  "ābant"]  },
    ],
  },
  "1st_future": {
    headers: ["", "Singular", "Plural"],
    rows: [
      { label: "1st", suffixes: ["ābō",  "ābimus"] },
      { label: "2nd", suffixes: ["ābis", "ābitis"] },
      { label: "3rd", suffixes: ["ābit", "ābunt"]  },
    ],
  },
  "1st_perfect": {
    headers: ["", "Singular", "Plural"],
    rows: [
      { label: "1st", suffixes: ["āvī",    "āvimus"]  },
      { label: "2nd", suffixes: ["āvistī", "āvistis"] },
      { label: "3rd", suffixes: ["āvit",   "āvērunt"] },
    ],
  },
  "2nd_present": {
    headers: ["", "Singular", "Plural"],
    rows: [
      { label: "1st", suffixes: ["eō", "ēmus"] },
      { label: "2nd", suffixes: ["ēs", "ētis"] },
      { label: "3rd", suffixes: ["et", "ent"]  },
    ],
  },
  "2nd_imperfect": {
    headers: ["", "Singular", "Plural"],
    rows: [
      { label: "1st", suffixes: ["ēbam",  "ēbāmus"] },
      { label: "2nd", suffixes: ["ēbās",  "ēbātis"] },
      { label: "3rd", suffixes: ["ēbat",  "ēbant"]  },
    ],
  },
  "3rd_present": {
    headers: ["", "Singular", "Plural"],
    rows: [
      { label: "1st", suffixes: ["ō",  "imus"] },
      { label: "2nd", suffixes: ["is", "itis"] },
      { label: "3rd", suffixes: ["it", "unt"]  },
    ],
  },
  "4th_present": {
    headers: ["", "Singular", "Plural"],
    rows: [
      { label: "1st", suffixes: ["iō", "īmus"] },
      { label: "2nd", suffixes: ["īs", "ītis"] },
      { label: "3rd", suffixes: ["it", "iunt"] },
    ],
  },
};

const DECLENSION_PATTERNS = {
  "1st_decl": {
    headers: ["Case", "Singular", "Plural"],
    rows: [
      { label: "Nominative", suffixes: ["a",  "ae"]   },
      { label: "Genitive",   suffixes: ["ae", "ārum"] },
      { label: "Dative",     suffixes: ["ae", "īs"]   },
      { label: "Accusative", suffixes: ["am", "ās"]   },
      { label: "Ablative",   suffixes: ["ā",  "īs"]   },
      { label: "Vocative",   suffixes: ["a",  "ae"]   },
    ],
  },
  "2nd_decl_m": {
    headers: ["Case", "Singular", "Plural"],
    rows: [
      { label: "Nominative", suffixes: ["us", "ī"]   },
      { label: "Genitive",   suffixes: ["ī",  "ōrum"] },
      { label: "Dative",     suffixes: ["ō",  "īs"]   },
      { label: "Accusative", suffixes: ["um", "ōs"]   },
      { label: "Ablative",   suffixes: ["ō",  "īs"]   },
      { label: "Vocative",   suffixes: ["e",  "ī"]    },
    ],
  },
  "2nd_decl_n": {
    headers: ["Case", "Singular", "Plural"],
    rows: [
      { label: "Nominative", suffixes: ["um", "a"]    },
      { label: "Genitive",   suffixes: ["ī",  "ōrum"] },
      { label: "Dative",     suffixes: ["ō",  "īs"]   },
      { label: "Accusative", suffixes: ["um", "a"]    },
      { label: "Ablative",   suffixes: ["ō",  "īs"]   },
      { label: "Vocative",   suffixes: ["um", "a"]    },
    ],
  },
  "3rd_decl": {
    headers: ["Case", "Singular", "Plural"],
    rows: [
      { label: "Nominative", suffixes: [null, "ēs"]   },
      { label: "Genitive",   suffixes: ["is",  "um"]  },
      { label: "Dative",     suffixes: ["ī",   "ibus"] },
      { label: "Accusative", suffixes: ["em",  "ēs"]  },
      { label: "Ablative",   suffixes: ["e",   "ibus"] },
      { label: "Vocative",   suffixes: [null,  "ēs"]  },
    ],
  },
};

// ─── VOCABULARY ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  // ════════════════════════════════════════════════════════════
  //  CONJUGATIONS
  // ════════════════════════════════════════════════════════════
  {
    id: "conj_1_present",
    label: "1st Conjugation",
    sublabel: "Present Active Indicative",
    type: "conjugation",
    pattern: "1st_present",
    words: [
      // ADD NEW 1ST CONJUGATION VERBS HERE — copy a line and edit it
      // Format: { lemma: "infinitive", meaning: "English", stem: "stem before endings" }
      { lemma: "amāre",     meaning: "to love",        stem: "am"     },
      { lemma: "portāre",   meaning: "to carry",       stem: "port"   },
      { lemma: "laudāre",   meaning: "to praise",      stem: "laud"   },
      { lemma: "vocāre",    meaning: "to call",        stem: "voc"    },
      { lemma: "dare",      meaning: "to give",        stem: "d"      },
      { lemma: "stāre",     meaning: "to stand",       stem: "st"     },
      { lemma: "nārrāre",   meaning: "to tell",        stem: "nārr"   },
      { lemma: "habitāre",  meaning: "to live/dwell",  stem: "habit"  },
      { lemma: "labōrāre",  meaning: "to work",        stem: "labōr"  },
      { lemma: "ambulāre",  meaning: "to walk",        stem: "ambul"  },
      { lemma: "cantāre",   meaning: "to sing",        stem: "cant"   },
      { lemma: "cūrāre",    meaning: "to care for",    stem: "cūr"    },
      { lemma: "festīnāre", meaning: "to hurry",       stem: "festīn" },
      { lemma: "nuntiāre",  meaning: "to announce",    stem: "nunti"  },
      { lemma: "oppugnāre", meaning: "to attack",      stem: "oppugn" },
      { lemma: "parāre",    meaning: "to prepare",     stem: "par"    },
      { lemma: "pugnāre",   meaning: "to fight",       stem: "pugn"   },
      { lemma: "rogāre",    meaning: "to ask",         stem: "rog"    },
      { lemma: "spectāre",  meaning: "to watch",       stem: "spect"  },
      { lemma: "errāre",    meaning: "to wander/err",  stem: "err"    },
      { lemma: "nāvigāre",  meaning: "to sail",        stem: "nāvig"  },
      { lemma: "servāre",   meaning: "to save/keep",   stem: "serv"   },
      { lemma: "superāre",  meaning: "to overcome",    stem: "super"  },
      { lemma: "clamāre",   meaning: "to shout",       stem: "clam"   },
      { lemma: "vastāre",   meaning: "to devastate",   stem: "vast"   },
    ],
  },
  {
    id: "conj_1_imperfect",
    label: "1st Conjugation",
    sublabel: "Imperfect Active Indicative",
    type: "conjugation",
    pattern: "1st_imperfect",
    words: [
      { lemma: "amāre",     meaning: "to love",        stem: "am"     },
      { lemma: "portāre",   meaning: "to carry",       stem: "port"   },
      { lemma: "laudāre",   meaning: "to praise",      stem: "laud"   },
      { lemma: "vocāre",    meaning: "to call",        stem: "voc"    },
      { lemma: "nārrāre",   meaning: "to tell",        stem: "nārr"   },
      { lemma: "habitāre",  meaning: "to live/dwell",  stem: "habit"  },
      { lemma: "labōrāre",  meaning: "to work",        stem: "labōr"  },
      { lemma: "ambulāre",  meaning: "to walk",        stem: "ambul"  },
      { lemma: "cantāre",   meaning: "to sing",        stem: "cant"   },
      { lemma: "cūrāre",    meaning: "to care for",    stem: "cūr"    },
      { lemma: "festīnāre", meaning: "to hurry",       stem: "festīn" },
      { lemma: "oppugnāre", meaning: "to attack",      stem: "oppugn" },
      { lemma: "parāre",    meaning: "to prepare",     stem: "par"    },
      { lemma: "pugnāre",   meaning: "to fight",       stem: "pugn"   },
      { lemma: "rogāre",    meaning: "to ask",         stem: "rog"    },
      { lemma: "spectāre",  meaning: "to watch",       stem: "spect"  },
      { lemma: "errāre",    meaning: "to wander/err",  stem: "err"    },
      { lemma: "nāvigāre",  meaning: "to sail",        stem: "nāvig"  },
      { lemma: "servāre",   meaning: "to save/keep",   stem: "serv"   },
      { lemma: "superāre",  meaning: "to overcome",    stem: "super"  },
      { lemma: "vastāre",   meaning: "to devastate",   stem: "vast"   },
      { lemma: "nuntiāre",  meaning: "to announce",    stem: "nunti"  },
      { lemma: "clamāre",   meaning: "to shout",       stem: "clam"   },
      { lemma: "dēlectāre", meaning: "to delight",     stem: "dēlect" },
      { lemma: "vetāre",    meaning: "to forbid",      stem: "vet"    },
    ],
  },
  {
    id: "conj_1_future",
    label: "1st Conjugation",
    sublabel: "Future Active Indicative",
    type: "conjugation",
    pattern: "1st_future",
    words: [
      { lemma: "amāre",     meaning: "to love",        stem: "am"     },
      { lemma: "portāre",   meaning: "to carry",       stem: "port"   },
      { lemma: "laudāre",   meaning: "to praise",      stem: "laud"   },
      { lemma: "vocāre",    meaning: "to call",        stem: "voc"    },
      { lemma: "nārrāre",   meaning: "to tell",        stem: "nārr"   },
      { lemma: "habitāre",  meaning: "to live/dwell",  stem: "habit"  },
      { lemma: "labōrāre",  meaning: "to work",        stem: "labōr"  },
      { lemma: "parāre",    meaning: "to prepare",     stem: "par"    },
      { lemma: "pugnāre",   meaning: "to fight",       stem: "pugn"   },
      { lemma: "rogāre",    meaning: "to ask",         stem: "rog"    },
      { lemma: "spectāre",  meaning: "to watch",       stem: "spect"  },
      { lemma: "errāre",    meaning: "to wander/err",  stem: "err"    },
      { lemma: "nāvigāre",  meaning: "to sail",        stem: "nāvig"  },
      { lemma: "servāre",   meaning: "to save/keep",   stem: "serv"   },
      { lemma: "superāre",  meaning: "to overcome",    stem: "super"  },
      { lemma: "vastāre",   meaning: "to devastate",   stem: "vast"   },
      { lemma: "nuntiāre",  meaning: "to announce",    stem: "nunti"  },
      { lemma: "clamāre",   meaning: "to shout",       stem: "clam"   },
      { lemma: "dēlectāre", meaning: "to delight",     stem: "dēlect" },
      { lemma: "vetāre",    meaning: "to forbid",      stem: "vet"    },
      { lemma: "festīnāre", meaning: "to hurry",       stem: "festīn" },
      { lemma: "oppugnāre", meaning: "to attack",      stem: "oppugn" },
      { lemma: "cūrāre",    meaning: "to care for",    stem: "cūr"    },
      { lemma: "cantāre",   meaning: "to sing",        stem: "cant"   },
      { lemma: "ambulāre",  meaning: "to walk",        stem: "ambul"  },
    ],
  },
  {
    id: "conj_1_perfect",
    label: "1st Conjugation",
    sublabel: "Perfect Active Indicative",
    type: "conjugation",
    pattern: "1st_perfect",
    words: [
      { lemma: "amāre",     meaning: "to love",        stem: "am"     },
      { lemma: "portāre",   meaning: "to carry",       stem: "port"   },
      { lemma: "laudāre",   meaning: "to praise",      stem: "laud"   },
      { lemma: "vocāre",    meaning: "to call",        stem: "voc"    },
      { lemma: "nārrāre",   meaning: "to tell",        stem: "nārr"   },
      { lemma: "habitāre",  meaning: "to live/dwell",  stem: "habit"  },
      { lemma: "labōrāre",  meaning: "to work",        stem: "labōr"  },
      { lemma: "parāre",    meaning: "to prepare",     stem: "par"    },
      { lemma: "pugnāre",   meaning: "to fight",       stem: "pugn"   },
      { lemma: "rogāre",    meaning: "to ask",         stem: "rog"    },
      { lemma: "spectāre",  meaning: "to watch",       stem: "spect"  },
      { lemma: "errāre",    meaning: "to wander/err",  stem: "err"    },
      { lemma: "nāvigāre",  meaning: "to sail",        stem: "nāvig"  },
      { lemma: "servāre",   meaning: "to save/keep",   stem: "serv"   },
      { lemma: "superāre",  meaning: "to overcome",    stem: "super"  },
      { lemma: "vastāre",   meaning: "to devastate",   stem: "vast"   },
      { lemma: "nuntiāre",  meaning: "to announce",    stem: "nunti"  },
      { lemma: "clamāre",   meaning: "to shout",       stem: "clam"   },
      { lemma: "dēlectāre", meaning: "to delight",     stem: "dēlect" },
      { lemma: "festīnāre", meaning: "to hurry",       stem: "festīn" },
      { lemma: "oppugnāre", meaning: "to attack",      stem: "oppugn" },
      { lemma: "cūrāre",    meaning: "to care for",    stem: "cūr"    },
      { lemma: "cantāre",   meaning: "to sing",        stem: "cant"   },
      { lemma: "ambulāre",  meaning: "to walk",        stem: "ambul"  },
      { lemma: "vetāre",    meaning: "to forbid",      stem: "vet"    },
    ],
  },
  {
    id: "conj_2_present",
    label: "2nd Conjugation",
    sublabel: "Present Active Indicative",
    type: "conjugation",
    pattern: "2nd_present",
    words: [
      { lemma: "monēre",     meaning: "to warn/advise",   stem: "mon"     },
      { lemma: "habēre",     meaning: "to have",          stem: "hab"     },
      { lemma: "vidēre",     meaning: "to see",           stem: "vid"     },
      { lemma: "tenēre",     meaning: "to hold",          stem: "ten"     },
      { lemma: "docēre",     meaning: "to teach",         stem: "doc"     },
      { lemma: "timēre",     meaning: "to fear",          stem: "tim"     },
      { lemma: "manēre",     meaning: "to remain",        stem: "man"     },
      { lemma: "movēre",     meaning: "to move",          stem: "mov"     },
      { lemma: "respondēre", meaning: "to respond",       stem: "respond" },
      { lemma: "sedēre",     meaning: "to sit",           stem: "sed"     },
      { lemma: "tacēre",     meaning: "to be silent",     stem: "tac"     },
      { lemma: "valēre",     meaning: "to be strong",     stem: "val"     },
      { lemma: "iubēre",     meaning: "to order",         stem: "iub"     },
      { lemma: "dēbēre",     meaning: "to owe/ought",     stem: "dēb"     },
      { lemma: "flēre",      meaning: "to weep",          stem: "fl"      },
      { lemma: "mordēre",    meaning: "to bite",          stem: "mord"    },
      { lemma: "nocēre",     meaning: "to harm",          stem: "noc"     },
      { lemma: "placēre",    meaning: "to please",        stem: "plac"    },
      { lemma: "prohibēre",  meaning: "to prohibit",      stem: "prohib"  },
      { lemma: "ridēre",     meaning: "to laugh",         stem: "rid"     },
      { lemma: "splendēre",  meaning: "to shine",         stem: "splend"  },
      { lemma: "terrēre",    meaning: "to terrify",       stem: "terr"    },
      { lemma: "torquēre",   meaning: "to twist",         stem: "torqu"   },
      { lemma: "patēre",     meaning: "to lie open",      stem: "pat"     },
      { lemma: "augēre",     meaning: "to increase",      stem: "aug"     },
    ],
  },
  {
    id: "conj_2_imperfect",
    label: "2nd Conjugation",
    sublabel: "Imperfect Active Indicative",
    type: "conjugation",
    pattern: "2nd_imperfect",
    words: [
      { lemma: "monēre",     meaning: "to warn/advise",   stem: "mon"     },
      { lemma: "habēre",     meaning: "to have",          stem: "hab"     },
      { lemma: "vidēre",     meaning: "to see",           stem: "vid"     },
      { lemma: "tenēre",     meaning: "to hold",          stem: "ten"     },
      { lemma: "docēre",     meaning: "to teach",         stem: "doc"     },
      { lemma: "timēre",     meaning: "to fear",          stem: "tim"     },
      { lemma: "manēre",     meaning: "to remain",        stem: "man"     },
      { lemma: "movēre",     meaning: "to move",          stem: "mov"     },
      { lemma: "respondēre", meaning: "to respond",       stem: "respond" },
      { lemma: "sedēre",     meaning: "to sit",           stem: "sed"     },
      { lemma: "tacēre",     meaning: "to be silent",     stem: "tac"     },
      { lemma: "valēre",     meaning: "to be strong",     stem: "val"     },
      { lemma: "iubēre",     meaning: "to order",         stem: "iub"     },
      { lemma: "dēbēre",     meaning: "to owe/ought",     stem: "dēb"     },
      { lemma: "nocēre",     meaning: "to harm",          stem: "noc"     },
      { lemma: "placēre",    meaning: "to please",        stem: "plac"    },
      { lemma: "prohibēre",  meaning: "to prohibit",      stem: "prohib"  },
      { lemma: "ridēre",     meaning: "to laugh",         stem: "rid"     },
      { lemma: "terrēre",    meaning: "to terrify",       stem: "terr"    },
      { lemma: "augēre",     meaning: "to increase",      stem: "aug"     },
      { lemma: "flēre",      meaning: "to weep",          stem: "fl"      },
      { lemma: "mordēre",    meaning: "to bite",          stem: "mord"    },
      { lemma: "splendēre",  meaning: "to shine",         stem: "splend"  },
      { lemma: "torquēre",   meaning: "to twist",         stem: "torqu"   },
      { lemma: "patēre",     meaning: "to lie open",      stem: "pat"     },
    ],
  },
  {
    id: "conj_3_present",
    label: "3rd Conjugation",
    sublabel: "Present Active Indicative",
    type: "conjugation",
    pattern: "3rd_present",
    words: [
      { lemma: "dūcere",     meaning: "to lead",          stem: "dūc"     },
      { lemma: "mittere",    meaning: "to send",          stem: "mitt"    },
      { lemma: "scrībere",   meaning: "to write",         stem: "scrīb"   },
      { lemma: "legere",     meaning: "to read/gather",   stem: "leg"     },
      { lemma: "regere",     meaning: "to rule",          stem: "reg"     },
      { lemma: "currere",    meaning: "to run",           stem: "curr"    },
      { lemma: "dicere",     meaning: "to say",           stem: "dīc"     },
      { lemma: "facere",     meaning: "to make/do",       stem: "fac"     },
      { lemma: "vincere",    meaning: "to conquer",       stem: "vinc"    },
      { lemma: "discere",    meaning: "to learn",         stem: "disc"    },
      { lemma: "ponere",     meaning: "to place",         stem: "pon"     },
      { lemma: "capere",     meaning: "to take/seize",    stem: "cap"     },
      { lemma: "trahere",    meaning: "to drag/draw",     stem: "trah"    },
      { lemma: "gerere",     meaning: "to carry/wage",    stem: "ger"     },
      { lemma: "petere",     meaning: "to seek/attack",   stem: "pet"     },
      { lemma: "quaerere",   meaning: "to seek/ask",      stem: "quaer"   },
      { lemma: "relinquere", meaning: "to leave behind",  stem: "relinqu" },
      { lemma: "solvere",    meaning: "to loosen/pay",    stem: "solv"    },
      { lemma: "vertere",    meaning: "to turn",          stem: "vert"    },
      { lemma: "vivere",     meaning: "to live",          stem: "viv"     },
      { lemma: "cadere",     meaning: "to fall",          stem: "cad"     },
      { lemma: "cedere",     meaning: "to yield/go",      stem: "ced"     },
      { lemma: "colere",     meaning: "to cultivate",     stem: "col"     },
      { lemma: "credere",    meaning: "to believe",       stem: "cred"    },
      { lemma: "defendere",  meaning: "to defend",        stem: "defend"  },
    ],
  },
  {
    id: "conj_4_present",
    label: "4th Conjugation",
    sublabel: "Present Active Indicative",
    type: "conjugation",
    pattern: "4th_present",
    words: [
      { lemma: "audīre",     meaning: "to hear",          stem: "aud"     },
      { lemma: "venīre",     meaning: "to come",          stem: "ven"     },
      { lemma: "sentīre",    meaning: "to feel/sense",    stem: "sent"    },
      { lemma: "dormīre",    meaning: "to sleep",         stem: "dorm"    },
      { lemma: "scīre",      meaning: "to know",          stem: "sc"      },
      { lemma: "invenīre",   meaning: "to find",          stem: "inven"   },
      { lemma: "munīre",     meaning: "to fortify",       stem: "mun"     },
      { lemma: "servīre",    meaning: "to serve",         stem: "serv"    },
      { lemma: "impedīre",   meaning: "to hinder",        stem: "imped"   },
      { lemma: "aperīre",    meaning: "to open",          stem: "aper"    },
      { lemma: "custōdīre",  meaning: "to guard",         stem: "custōd"  },
      { lemma: "fīnīre",     meaning: "to finish/limit",  stem: "fīn"     },
      { lemma: "nescīre",    meaning: "to not know",      stem: "nesc"    },
      { lemma: "punīre",     meaning: "to punish",        stem: "pun"     },
      { lemma: "reperīre",   meaning: "to discover",      stem: "reper"   },
      { lemma: "salīre",     meaning: "to leap",          stem: "sal"     },
      { lemma: "sepelīre",   meaning: "to bury",          stem: "sepel"   },
      { lemma: "sitīre",     meaning: "to thirst",        stem: "sit"     },
      { lemma: "vincīre",    meaning: "to bind",          stem: "vinc"    },
      { lemma: "vestīre",    meaning: "to clothe",        stem: "vest"    },
      { lemma: "largīrī",    meaning: "to give freely",   stem: "larg"    },
      { lemma: "mōlīrī",     meaning: "to toil/build",    stem: "mōl"     },
      { lemma: "ōrdīrī",     meaning: "to begin",         stem: "ōrd"     },
      { lemma: "experīrī",   meaning: "to try/test",      stem: "exper"   },
      { lemma: "obīre",      meaning: "to meet/die",      stem: "ob"      },
    ],
  },
  // ════════════════════════════════════════════════════════════
  //  IRREGULAR VERBS
  //  Each word has its own `tables` array with explicit answers.
  //  To edit forms, find the word and change the `answers` arrays.
  // ════════════════════════════════════════════════════════════
  {
    id: "irreg_esse",
    label: "Irregular: esse",
    sublabel: "To Be — Present, Imperfect, Future",
    type: "irregular",
    words: [
      {
        lemma: "esse", meaning: "to be",
        tables: [
          {
            tense: "Present",
            headers: ["", "Singular", "Plural"],
            rows: [
              { label: "1st", answers: ["sum",  "sumus"] },
              { label: "2nd", answers: ["es",   "estis"] },
              { label: "3rd", answers: ["est",  "sunt"]  },
            ],
          },
          {
            tense: "Imperfect",
            headers: ["", "Singular", "Plural"],
            rows: [
              { label: "1st", answers: ["eram",  "erāmus"] },
              { label: "2nd", answers: ["erās",  "erātis"] },
              { label: "3rd", answers: ["erat",  "erant"]  },
            ],
          },
          {
            tense: "Future",
            headers: ["", "Singular", "Plural"],
            rows: [
              { label: "1st", answers: ["erō",  "erimus"] },
              { label: "2nd", answers: ["eris", "eritis"] },
              { label: "3rd", answers: ["erit", "erunt"]  },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "irreg_ire",
    label: "Irregular: īre",
    sublabel: "To Go — Present, Imperfect, Future",
    type: "irregular",
    words: [
      {
        lemma: "īre", meaning: "to go",
        tables: [
          {
            tense: "Present",
            headers: ["", "Singular", "Plural"],
            rows: [
              { label: "1st", answers: ["eō",  "īmus"] },
              { label: "2nd", answers: ["īs",  "ītis"] },
              { label: "3rd", answers: ["it",  "eunt"] },
            ],
          },
          {
            tense: "Imperfect",
            headers: ["", "Singular", "Plural"],
            rows: [
              { label: "1st", answers: ["ībam",  "ībāmus"] },
              { label: "2nd", answers: ["ībās",  "ībātis"] },
              { label: "3rd", answers: ["ībat",  "ībant"]  },
            ],
          },
          {
            tense: "Future",
            headers: ["", "Singular", "Plural"],
            rows: [
              { label: "1st", answers: ["ībō",  "ībimus"] },
              { label: "2nd", answers: ["ībis", "ībitis"] },
              { label: "3rd", answers: ["ībit", "ībunt"]  },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "irreg_velle",
    label: "Irregular: velle",
    sublabel: "To Want — Present, Imperfect",
    type: "irregular",
    words: [
      {
        lemma: "velle", meaning: "to want/wish",
        tables: [
          {
            tense: "Present",
            headers: ["", "Singular", "Plural"],
            rows: [
              { label: "1st", answers: ["volō",  "volumus"] },
              { label: "2nd", answers: ["vīs",   "vultis"]  },
              { label: "3rd", answers: ["vult",  "volunt"]  },
            ],
          },
          {
            tense: "Imperfect",
            headers: ["", "Singular", "Plural"],
            rows: [
              { label: "1st", answers: ["volēbam",  "volēbāmus"] },
              { label: "2nd", answers: ["volēbās",  "volēbātis"] },
              { label: "3rd", answers: ["volēbat",  "volēbant"]  },
            ],
          },
        ],
      },
    ],
  },
  // ════════════════════════════════════════════════════════════
  //  DECLENSIONS
  // ════════════════════════════════════════════════════════════
  {
    id: "decl_1",
    label: "1st Declension",
    sublabel: "Feminine Nouns (-a, -ae)",
    type: "declension",
    pattern: "1st_decl",
    words: [
      // Format: { lemma: "nom, gen", meaning: "English", stem: "stem" }
      { lemma: "puella, -ae",   meaning: "girl",            stem: "puell"   },
      { lemma: "fēmina, -ae",   meaning: "woman",           stem: "fēmin"   },
      { lemma: "aqua, -ae",     meaning: "water",           stem: "aqu"     },
      { lemma: "terra, -ae",    meaning: "land/earth",      stem: "terr"    },
      { lemma: "porta, -ae",    meaning: "gate/door",       stem: "port"    },
      { lemma: "via, -ae",      meaning: "road/way",        stem: "vi"      },
      { lemma: "silva, -ae",    meaning: "forest/wood",     stem: "silv"    },
      { lemma: "insula, -ae",   meaning: "island",          stem: "insul"   },
      { lemma: "casa, -ae",     meaning: "house/cottage",   stem: "cas"     },
      { lemma: "luna, -ae",     meaning: "moon",            stem: "lun"     },
      { lemma: "stella, -ae",   meaning: "star",            stem: "stell"   },
      { lemma: "nauta, -ae",    meaning: "sailor (m.)",     stem: "naut"    },
      { lemma: "poeta, -ae",    meaning: "poet (m.)",       stem: "poet"    },
      { lemma: "cōpia, -ae",    meaning: "abundance/supply",stem: "cōpi"    },
      { lemma: "fāma, -ae",     meaning: "fame/rumor",      stem: "fām"     },
      { lemma: "fortūna, -ae",  meaning: "fortune/luck",    stem: "fortūn"  },
      { lemma: "glōria, -ae",   meaning: "glory",           stem: "glōri"   },
      { lemma: "īra, -ae",      meaning: "anger",           stem: "īr"      },
      { lemma: "patria, -ae",   meaning: "fatherland",      stem: "patri"   },
      { lemma: "pīrāta, -ae",   meaning: "pirate (m.)",     stem: "pīrāt"   },
      { lemma: "rēgīna, -ae",   meaning: "queen",           stem: "rēgīn"   },
      { lemma: "sagitta, -ae",  meaning: "arrow",           stem: "sagitt"  },
      { lemma: "toga, -ae",     meaning: "toga",            stem: "tog"     },
      { lemma: "victoria, -ae", meaning: "victory",         stem: "victori" },
      { lemma: "lingua, -ae",   meaning: "tongue/language", stem: "lingu"   },
    ],
  },
  {
    id: "decl_2_m",
    label: "2nd Declension",
    sublabel: "Masculine Nouns (-us, -ī)",
    type: "declension",
    pattern: "2nd_decl_m",
    words: [
      { lemma: "servus, -ī",    meaning: "slave/servant",   stem: "serv"    },
      { lemma: "dominus, -ī",   meaning: "master/lord",     stem: "domin"   },
      { lemma: "filius, -ī",    meaning: "son",             stem: "fili"    },
      { lemma: "amicus, -ī",    meaning: "friend",          stem: "amic"    },
      { lemma: "equus, -ī",     meaning: "horse",           stem: "equ"     },
      { lemma: "lupus, -ī",     meaning: "wolf",            stem: "lup"     },
      { lemma: "animus, -ī",    meaning: "mind/spirit",     stem: "anim"    },
      { lemma: "modus, -ī",     meaning: "manner/way",      stem: "mod"     },
      { lemma: "populus, -ī",   meaning: "people",          stem: "popul"   },
      { lemma: "locus, -ī",     meaning: "place",           stem: "loc"     },
      { lemma: "nuntius, -ī",   meaning: "messenger/news",  stem: "nunti"   },
      { lemma: "oculus, -ī",    meaning: "eye",             stem: "ocul"    },
      { lemma: "hortus, -ī",    meaning: "garden",          stem: "hort"    },
      { lemma: "mundus, -ī",    meaning: "world",           stem: "mund"    },
      { lemma: "numerus, -ī",   meaning: "number",          stem: "numer"   },
      { lemma: "puer, -ī",      meaning: "boy",             stem: "puer"    },
      { lemma: "vir, virī",     meaning: "man/husband",     stem: "vir"     },
      { lemma: "ager, agrī",    meaning: "field",           stem: "agr"     },
      { lemma: "deus, -ī",      meaning: "god",             stem: "de"      },
      { lemma: "gladius, -ī",   meaning: "sword",           stem: "gladi"   },
      { lemma: "liber, librī",  meaning: "book",            stem: "libr"    },
      { lemma: "murus, -ī",     meaning: "wall",            stem: "mur"     },
      { lemma: "socius, -ī",    meaning: "ally/companion",  stem: "soci"    },
      { lemma: "ventus, -ī",    meaning: "wind",            stem: "vent"    },
      { lemma: "focus, -ī",     meaning: "hearth/fire",     stem: "foc"     },
    ],
  },
  {
    id: "decl_2_n",
    label: "2nd Declension",
    sublabel: "Neuter Nouns (-um, -ī)",
    type: "declension",
    pattern: "2nd_decl_n",
    words: [
      { lemma: "bellum, -ī",    meaning: "war",             stem: "bell"    },
      { lemma: "verbum, -ī",    meaning: "word",            stem: "verb"    },
      { lemma: "templum, -ī",   meaning: "temple",          stem: "templ"   },
      { lemma: "oppidum, -ī",   meaning: "town",            stem: "oppid"   },
      { lemma: "periculum, -ī", meaning: "danger",          stem: "pericul" },
      { lemma: "auxilium, -ī",  meaning: "help/aid",        stem: "auxili"  },
      { lemma: "caelum, -ī",    meaning: "sky/heaven",      stem: "cael"    },
      { lemma: "consilium, -ī", meaning: "plan/council",    stem: "consili" },
      { lemma: "dōnum, -ī",     meaning: "gift",            stem: "dōn"     },
      { lemma: "fātum, -ī",     meaning: "fate",            stem: "fāt"     },
      { lemma: "forum, -ī",     meaning: "forum/market",    stem: "for"     },
      { lemma: "gaudium, -ī",   meaning: "joy",             stem: "gaudi"   },
      { lemma: "imperium, -ī",  meaning: "command/empire",  stem: "imperi"  },
      { lemma: "initium, -ī",   meaning: "beginning",       stem: "initi"   },
      { lemma: "iūdicium, -ī",  meaning: "judgment",        stem: "iūdici"  },
      { lemma: "malum, -ī",     meaning: "evil/apple",      stem: "mal"     },
      { lemma: "medium, -ī",    meaning: "middle",          stem: "medi"    },
      { lemma: "odium, -ī",     meaning: "hatred",          stem: "odi"     },
      { lemma: "praemium, -ī",  meaning: "reward",          stem: "praemi"  },
      { lemma: "proelium, -ī",  meaning: "battle",          stem: "proeli"  },
      { lemma: "rēgnum, -ī",    meaning: "kingdom/rule",    stem: "rēgn"    },
      { lemma: "signum, -ī",    meaning: "sign/signal",     stem: "sign"    },
      { lemma: "vinum, -ī",     meaning: "wine",            stem: "vin"     },
      { lemma: "saxum, -ī",     meaning: "rock/stone",      stem: "sax"     },
      { lemma: "scūtum, -ī",    meaning: "shield",          stem: "scūt"    },
    ],
  },
  {
    id: "decl_3",
    label: "3rd Declension",
    sublabel: "Consonant Stem Nouns",
    type: "declension",
    pattern: "3rd_decl",
    words: [
      // 3rd decl needs nom_sg (the nominative singular) since it can't be derived from stem
      { lemma: "rēx, rēgis",      meaning: "king",            stem: "rēg",    nom_sg: "rēx"    },
      { lemma: "lēx, lēgis",      meaning: "law",             stem: "lēg",    nom_sg: "lēx"    },
      { lemma: "miles, militis",  meaning: "soldier",         stem: "milit",  nom_sg: "miles"  },
      { lemma: "dux, ducis",      meaning: "leader",          stem: "duc",    nom_sg: "dux"    },
      { lemma: "pater, patris",   meaning: "father",          stem: "patr",   nom_sg: "pater"  },
      { lemma: "mater, matris",   meaning: "mother",          stem: "matr",   nom_sg: "mater"  },
      { lemma: "frāter, frātris", meaning: "brother",         stem: "frātr",  nom_sg: "frāter" },
      { lemma: "homō, hominis",   meaning: "man/person",      stem: "homin",  nom_sg: "homō"   },
      { lemma: "leō, leōnis",     meaning: "lion",            stem: "leōn",   nom_sg: "leō"    },
      { lemma: "canis, canis",    meaning: "dog",             stem: "can",    nom_sg: "canis"  },
      { lemma: "corpus, corporis",meaning: "body",            stem: "corpor", nom_sg: "corpus" },
      { lemma: "tempus, temporis",meaning: "time",            stem: "tempor", nom_sg: "tempus" },
      { lemma: "nōmen, nōminis",  meaning: "name",            stem: "nōmin",  nom_sg: "nōmen"  },
      { lemma: "iter, itineris",  meaning: "journey/route",   stem: "itiner", nom_sg: "iter"   },
      { lemma: "flūmen, flūminis",meaning: "river",           stem: "flūmin", nom_sg: "flūmen" },
      { lemma: "ōrātor, -ōris",   meaning: "orator/speaker",  stem: "ōrātōr", nom_sg: "ōrātor" },
      { lemma: "pāx, pācis",      meaning: "peace",           stem: "pāc",    nom_sg: "pāx"    },
      { lemma: "vōx, vōcis",      meaning: "voice",           stem: "vōc",    nom_sg: "vōx"    },
      { lemma: "amor, amōris",    meaning: "love",            stem: "amōr",   nom_sg: "amor"   },
      { lemma: "timor, timōris",  meaning: "fear",            stem: "timōr",  nom_sg: "timor"  },
      { lemma: "virtūs, virtūtis",meaning: "virtue/courage",  stem: "virtūt", nom_sg: "virtūs" },
      { lemma: "cīvis, cīvis",    meaning: "citizen",         stem: "cīv",    nom_sg: "cīvis"  },
      { lemma: "nox, noctis",     meaning: "night",           stem: "noct",   nom_sg: "nox"    },
      { lemma: "urbs, urbis",     meaning: "city",            stem: "urb",    nom_sg: "urbs"   },
      { lemma: "dens, dentis",    meaning: "tooth",           stem: "dent",   nom_sg: "dens"   },
    ],
  },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function normalize(str) {
  return str.trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[āa]/g,"a").replace(/[ēe]/g,"e").replace(/[īi]/g,"i")
    .replace(/[ōo]/g,"o").replace(/[ūu]/g,"u");
}

function checkAnswer(input, answer) {
  if (!input.trim()) return "empty";
  return normalize(input) === normalize(answer) ? "correct" : "wrong";
}

function getAnswers(category, word) {
  const patterns = category.type === "conjugation" ? CONJUGATION_PATTERNS : DECLENSION_PATTERNS;
  const pattern = patterns[category.pattern];
  return pattern.rows.map((row) =>
    row.suffixes.map((suf) => suf === null ? word.nom_sg : word.stem + suf)
  );
}

// ─── TAG COLORS ───────────────────────────────────────────────────────────────

const TAG = {
  conjugation: { bg: "#3a2410", text: "#e8c97a" },
  irregular:   { bg: "#2a1040", text: "#c4a0f0" },
  declension:  { bg: "#0f2e20", text: "#7ed8a4" },
};


// ─── MATCHING MODE ────────────────────────────────────────────────────────────

// Build a flat pool of all {latin, english} pairs from all CATEGORIES
function buildMatchPool() {
  const pool = [];
  CATEGORIES.forEach(cat => {
    cat.words.forEach(w => {
      // For irregular verbs with multiple tables, just use the lemma
      const latin = w.lemma;
      const english = w.meaning;
      if (latin && english) pool.push({ latin, english, catId: cat.id });
    });
  });
  return pool;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PAIRS_PER_ROUND = 8;

// Pastel pair colors — one per matched pair so lines/highlights share a color
const PAIR_COLORS = [
  { light: "#fef3c7", border: "#d97706", text: "#92400e" },
  { light: "#d1fae5", border: "#059669", text: "#065f46" },
  { light: "#dbeafe", border: "#2563eb", text: "#1e3a8a" },
  { light: "#fce7f3", border: "#db2777", text: "#831843" },
  { light: "#ede9fe", border: "#7c3aed", text: "#4c1d95" },
  { light: "#ffedd5", border: "#ea580c", text: "#7c2d12" },
  { light: "#cffafe", border: "#0891b2", text: "#164e63" },
  { light: "#dcfce7", border: "#16a34a", text: "#14532d" },
];

function MatchingMode() {
  const allPairs = React.useMemo(() => buildMatchPool(), []);

  const [round, setRound] = React.useState(0);
  const [roundPairs, setRoundPairs] = React.useState([]);
  const [leftItems, setLeftItems] = React.useState([]);   // shuffled latin
  const [rightItems, setRightItems] = React.useState([]); // shuffled english
  const [selectedLeft, setSelectedLeft] = React.useState(null);
  const [selectedRight, setSelectedRight] = React.useState(null);
  const [matched, setMatched] = React.useState({}); // id -> colorIdx
  const [wrong, setWrong] = React.useState({ left: null, right: null });
  const [roundDone, setRoundDone] = React.useState(false);
  const [totalCorrect, setTotalCorrect] = React.useState(0);
  const [totalAttempts, setTotalAttempts] = React.useState(0);

  const startRound = React.useCallback((roundNum) => {
    const start = (roundNum * PAIRS_PER_ROUND) % allPairs.length;
    // slice cyclically
    let slice = [];
    for (let i = 0; i < PAIRS_PER_ROUND; i++) {
      slice.push(allPairs[(start + i) % allPairs.length]);
    }
    // give each pair a unique id for this round
    const pairs = slice.map((p, i) => ({ ...p, id: i }));
    setRoundPairs(pairs);
    setLeftItems(shuffle(pairs.map(p => ({ id: p.id, text: p.latin }))));
    setRightItems(shuffle(pairs.map(p => ({ id: p.id, text: p.english }))));
    setMatched({});
    setSelectedLeft(null);
    setSelectedRight(null);
    setWrong({ left: null, right: null });
    setRoundDone(false);
  }, [allPairs]);

  React.useEffect(() => { startRound(0); }, []);

  // When both sides selected, check match
  React.useEffect(() => {
    if (selectedLeft === null || selectedRight === null) return;
    setTotalAttempts(a => a + 1);
    if (selectedLeft === selectedRight) {
      // correct
      const colorIdx = Object.keys(matched).length % PAIR_COLORS.length;
      setMatched(m => ({ ...m, [selectedLeft]: colorIdx }));
      setTotalCorrect(c => c + 1);
      setSelectedLeft(null);
      setSelectedRight(null);
      // check if round complete
      setTimeout(() => {
        setMatched(m => {
          if (Object.keys(m).length === PAIRS_PER_ROUND) setRoundDone(true);
          return m;
        });
      }, 300);
    } else {
      // wrong — flash red briefly
      setWrong({ left: selectedLeft, right: selectedRight });
      setTimeout(() => {
        setWrong({ left: null, right: null });
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 700);
    }
  }, [selectedLeft, selectedRight]);

  const handleLeft = (id) => {
    if (matched[id] !== undefined) return;
    if (wrong.left !== null) return;
    setSelectedLeft(id);
  };

  const handleRight = (id) => {
    if (matched[id] !== undefined) return;
    if (wrong.left !== null) return;
    setSelectedRight(id);
  };

  const nextRound = () => {
    setRound(r => { const next = r + 1; startRound(next); return next; });
  };

  const matchedCount = Object.keys(matched).length;
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : null;

  const itemStyle = (id, side) => {
    const isMatched = matched[id] !== undefined;
    const colorIdx = isMatched ? matched[id] : null;
    const c = colorIdx !== null ? PAIR_COLORS[colorIdx] : null;
    const isSelected = side === "left" ? selectedLeft === id : selectedRight === id;
    const isWrong = side === "left" ? wrong.left === id : wrong.right === id;

    return {
      padding: "10px 16px",
      border: "1.5px solid",
      borderColor: isMatched ? c.border
        : isWrong ? "#9b2335"
        : isSelected ? "#b8973e"
        : "#d4bc84",
      borderRadius: "4px",
      background: isMatched ? c.light
        : isWrong ? "rgba(155,35,53,0.08)"
        : isSelected ? "rgba(184,151,62,0.12)"
        : "#fffdf6",
      color: isMatched ? c.text
        : isWrong ? "#9b2335"
        : "#2c1f0e",
      cursor: isMatched ? "default" : "pointer",
      fontFamily: side === "left" ? "'EB Garamond',serif" : "'EB Garamond',serif",
      fontSize: "15px",
      transition: "all 0.15s",
      textAlign: "center",
      userSelect: "none",
      opacity: isMatched ? 0.75 : 1,
      textDecoration: isMatched ? "line-through" : "none",
      fontStyle: side === "left" ? "italic" : "normal",
      minHeight: "44px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    };
  };

  return (
    <div style={{ marginTop: "16px" }}>

      {/* Progress bar */}
      <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ flex: 1, height: "6px", background: "#e8dfc0", borderRadius: "3px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(matchedCount / PAIRS_PER_ROUND) * 100}%`, background: "#8a6914", borderRadius: "3px", transition: "width 0.4s ease" }} />
        </div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: "11px", color: "#8a6a3a", whiteSpace: "nowrap" }}>
          {matchedCount} / {PAIRS_PER_ROUND} matched
        </div>
        {accuracy !== null && (
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: "11px", color: "#8a6a3a", whiteSpace: "nowrap" }}>
            {accuracy}% accuracy
          </div>
        )}
      </div>

      {/* Instruction */}
      {!roundDone && (
        <div style={{ textAlign: "center", marginBottom: "14px", fontStyle: "italic", color: "#9a7a3a", fontSize: "13px" }}>
          Click a Latin word, then its English meaning
        </div>
      )}

      {/* Round complete banner */}
      {roundDone && (
        <div style={{ textAlign: "center", marginBottom: "16px", padding: "16px", background: "linear-gradient(180deg,#4a3010,#3a2410)", borderRadius: "4px", border: "1px solid #b8973e" }}>
          <div style={{ fontFamily: "'Cinzel',serif", fontSize: "20px", color: "#e8c97a", fontWeight: "700", marginBottom: "4px" }}>
            {accuracy === 100 ? "Optimus! 🏆" : accuracy >= 80 ? "Bene! ✓" : accuracy >= 60 ? "Satis" : "Melius studē!"}
          </div>
          <div style={{ color: "#c4a060", fontSize: "13px", marginBottom: "14px" }}>
            Round complete · {accuracy}% accuracy
          </div>
          <button onClick={nextRound} style={{ fontFamily: "'Cinzel',serif", fontSize: "11px", letterSpacing: "1.5px", padding: "9px 24px", background: "#8a6914", color: "#f5f0e8", border: "none", borderRadius: "2px", cursor: "pointer" }}>
            NEXT ROUND →
          </button>
        </div>
      )}

      {/* Two-column matching grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px" }}>
        {/* Left column header */}
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "2px", color: "#8a6a3a", textAlign: "center", paddingBottom: "4px", borderBottom: "1px solid #d4bc84", textTransform: "uppercase" }}>Latin</div>
        <div style={{ fontFamily: "'Cinzel',serif", fontSize: "9px", letterSpacing: "2px", color: "#8a6a3a", textAlign: "center", paddingBottom: "4px", borderBottom: "1px solid #d4bc84", textTransform: "uppercase" }}>English</div>

        {/* Items — left and right columns rendered together in grid */}
        {leftItems.map((item, i) => (
          <React.Fragment key={item.id}>
            <div onClick={() => handleLeft(item.id)} style={itemStyle(item.id, "left")}>
              {item.text}
            </div>
            <div onClick={() => handleRight(rightItems[i].id)} style={itemStyle(rightItems[i].id, "right")}>
              {rightItems[i].text}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}


// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function ScoreBar({ score, total, submitted }) {
  if (!submitted) return null;
  const pct = Math.round((score / total) * 100);
  const grade =
    pct === 100 ? { label: "Optimus!", color: "#2d6a4f" }
    : pct >= 80  ? { label: "Bene!",    color: "#4a7c59" }
    : pct >= 60  ? { label: "Satis",    color: "#8a6914" }
    :              { label: "Melius studē!", color: "#9b2335" };
  return (
    <div style={{ padding:"12px 24px", background:"#f9f3e3", borderBottom:"1px solid #d4bc84", display:"flex", alignItems:"center", gap:"16px" }}>
      <div style={{ fontFamily:"'Cinzel',serif", fontSize:"19px", fontWeight:"700", color:grade.color, minWidth:"140px" }}>{grade.label}</div>
      <div style={{ flex:1 }}>
        <div style={{ height:"5px", background:"#e0d0a8", borderRadius:"3px", overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${pct}%`, background:grade.color, borderRadius:"3px", transition:"width 0.6s ease" }} />
        </div>
      </div>
      <div style={{ fontSize:"14px", color:"#5a3e1b", fontWeight:"500", minWidth:"80px", textAlign:"right" }}>{score}/{total} · {pct}%</div>
    </div>
  );
}

function TableGrid({ headers, rows, answers, inputs, submitted, showAnswers, onInput }) {
  return (
    <table style={{ width:"100%", borderCollapse:"collapse" }}>
      <thead>
        <tr>
          {headers.map((h,i) => (
            <th key={i} style={{ fontFamily:"'Cinzel',serif", fontSize:"10px", letterSpacing:"2px", textTransform:"uppercase", color:"#7a5c2a", padding:"7px 10px", textAlign: i===0?"left":"center", borderBottom:"1px solid #d4bc84", fontWeight:"600" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, ri) => (
          <tr key={ri} style={{ background: ri%2===0?"transparent":"rgba(200,170,100,0.04)" }}>
            <td style={{ padding:"8px 10px", fontFamily:"'Cinzel',serif", fontSize:"11px", letterSpacing:"0.5px", color:"#5a3e1b", borderBottom:"1px solid #e8dfc0", whiteSpace:"nowrap", fontWeight:"500" }}>{row.label}</td>
            {answers[ri].map((answer, ci) => {
              const key = `${ri}-${ci}`;
              const val = inputs[key] || "";
              const status = submitted ? checkAnswer(val, answer) : null;
              return (
                <td key={ci} style={{ padding:"5px 8px", textAlign:"center", borderBottom:"1px solid #e8dfc0",
                  background: !status?"transparent": status==="correct"?"rgba(45,106,79,0.07)": status==="wrong"?"rgba(155,35,53,0.07)":"rgba(200,170,100,0.08)" }}>
                  <div style={{ position:"relative" }}>
                    <input type="text" value={val} onChange={(e) => onInput(key, e.target.value)}
                      style={{ width:"100%", minWidth:"80px", padding:"5px 6px",
                        fontFamily:"'EB Garamond',serif", fontSize:"15px", textAlign:"center",
                        background: !status?"#faf8f0": status==="correct"?"rgba(45,106,79,0.05)": status==="wrong"?"rgba(155,35,53,0.05)":"rgba(200,150,50,0.08)",
                        border:"1px solid",
                        borderColor: !status?"#d4bc84": status==="correct"?"#2d6a4f": status==="wrong"?"#9b2335":"#b8973e",
                        borderRadius:"2px", outline:"none", color:"#2c1f0e", transition:"border-color 0.2s, background 0.2s" }} />
                    {submitted && status==="wrong" && showAnswers && (
                      <div style={{ position:"absolute", bottom:"-16px", left:"50%", transform:"translateX(-50%)", fontSize:"11px", color:"#2d6a4f", fontStyle:"italic", whiteSpace:"nowrap", pointerEvents:"none", zIndex:1 }}>{answer}</div>
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

