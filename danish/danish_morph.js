/**
 * danish_morph.js — Danish Morphological Analyser & Grammar Checker
 * Part of Glossarium / Language Nexus
 *
 * Exposes a single global: DanishMorph
 *
 * Public API:
 *   DanishMorph.load(dictPath)   → Promise  — fetch dict, build index
 *   DanishMorph.analyse(word)    → Analysis[]
 *   DanishMorph.annotate(text)   → AnnotatedToken[]
 *   DanishMorph.check(text)      → CheckResult
 *   DanishMorph.ready            → boolean
 *
 * Analysis object:
 *   { form, lemma, pos, tense, auxiliary, gender, number,
 *     definiteness, case_, adjForm }
 *
 * CheckResult:
 *   { spelling[], grammar[], tokens[], wordCount, sentenceCount, score }
 */

(function (global) {
  'use strict';

  // ── Private state ──────────────────────────────────────────────────────────

  var _ready       = false;
  var DICT_ENTRIES = {};   // raw dict: lemma → { en, pos, gender, class, forms, auxiliary }
  var FORM_INDEX   = {};   // wordform (lowercase) → Analysis[]
  var NOUN_DICT    = {};   // lemma → "en"|"et"|"pl"
  var VERB_DICT    = {};   // lemma → verb entry

  // Populated by _buildIndex()
  var ER_VERBS     = {};   // lemma → true  (take "er" in perfect)
  var HAR_VERBS    = {};   // lemma → true  (take "har" in perfect)

  // ── Closed-class constants ─────────────────────────────────────────────────

  var PRONOUNS = {
    jeg:1, du:1, han:1, hun:1, den:1, det:1, vi:1, i:1, de:1, man:1
  };
  var OBJ_PRONOUNS = {
    mig:1, dig:1, ham:1, hende:1, os:1, jer:1, dem:1
  };
  var REFL_PRONOUNS = { sig:1 };

  var PREPOSITIONS = {
    fra:1, til:1, på:1, af:1, med:1, om:1, i:1, ved:1, hos:1,
    efter:1, for:1, over:1, under:1, mod:1, uden:1, ad:1,
    langs:1, siden:1, frem:1, bag:1, mellem:1, inden:1, omkring:1,
    ifølge:1, ifølge:1, angående:1
  };

  var AUXILIARIES = {
    er:1, var:1, har:1, havde:1, bliver:1, blev:1,
    vil:1, ville:1, skal:1, skulle:1, kan:1, kunne:1,
    må:1, måtte:1, bør:1, burde:1, tør:1, turde:1
  };

  var SUBORD_CONJUNCTIONS = {
    at:1, fordi:1, hvis:1, når:1, da:1, selvom:1, mens:1,
    som:1, hvor:1, hvad:1, hvem:1, hvilken:1, hvilket:1, skønt:1,
    idet:1, inden:1, efter:1, siden:1, indtil:1, medmindre:1
  };

  // Possessives and their required noun gender
  var POSS_GENDER = {
    min:'en', mit:'et', mine:'pl',
    din:'en', dit:'et', dine:'pl',
    sin:'en', sit:'et', sine:'pl'
  };

  // Irregular plural → lemma mapping (covers umlaut and suppletive plurals)
  var IRREG_PLURAL_TO_LEMMA = {
    'mænd':'mand',      'mændene':'mand',
    'børn':'barn',      'børnene':'barn',
    'bøger':'bog',      'bøgerne':'bog',
    'fødder':'fod',     'fødderne':'fod',
    'tænder':'tand',    'tænderne':'tand',
    'nætter':'nat',     'nætterne':'nat',
    'fædre':'far',      'fædrene':'far',
    'mødre':'mor',      'mødrene':'mor',
    'brødre':'bror',    'søskende':'søskende',
    'døtre':'datter',   'døtrene':'datter',
    'mænd':'mand',      'mændenes':'mand',
    'øjne':'øje',       'øjnene':'øje',
    'ører':'øre',       'ørerne':'øre',
    'hænder':'hånd',    'hænderne':'hånd',
    'fødder':'fod',     'tæer':'tå',
    'knæ':'knæ',
    'folk':'folk',
    'forældre':'forældre'
  };

  // ── Index builders ─────────────────────────────────────────────────────────

  function _addForm(form, analysis) {
    if (!form || form.length < 1) return;
    var f = form.toLowerCase();
    if (!FORM_INDEX[f]) FORM_INDEX[f] = [];
    // Avoid exact duplicates
    for (var i = 0; i < FORM_INDEX[f].length; i++) {
      if (FORM_INDEX[f][i].lemma === analysis.lemma &&
          FORM_INDEX[f][i].tense === analysis.tense &&
          FORM_INDEX[f][i].number === analysis.number &&
          FORM_INDEX[f][i].definiteness === analysis.definiteness) return;
    }
    FORM_INDEX[f].push(analysis);
  }

  function _indexNoun(lemma, data) {
    var g = data.gender;
    if (!g) return;
    NOUN_DICT[lemma] = g;
    var base = { lemma: lemma, pos: 'noun', gender: g };

    // Singular indefinite — the bare lemma
    _addForm(lemma, _merge(base, { number: 'singular', definiteness: 'indef' }));

    // Singular definite
    if (g === 'en') {
      _addForm(lemma + 'en', _merge(base, { number: 'singular', definiteness: 'def' }));
    } else if (g === 'et') {
      _addForm(lemma + 'et', _merge(base, { number: 'singular', definiteness: 'def' }));
    }
    // pl nouns have no sg/def distinction here

    // Genitive: indef sg
    _addForm(lemma + 's', _merge(base, { number: 'singular', definiteness: 'indef', case_: 'genitive' }));

    // Plural forms — we add all common paradigm variants
    // Most nouns: +er (pl indef) / +erne (pl def)
    _addForm(lemma + 'er',   _merge(base, { number: 'plural', definiteness: 'indef' }));
    _addForm(lemma + 'ere',  _merge(base, { number: 'plural', definiteness: 'indef' }));
    _addForm(lemma + 'e',    _merge(base, { number: 'plural', definiteness: 'indef' }));
    _addForm(lemma + 'r',    _merge(base, { number: 'plural', definiteness: 'indef' }));
    _addForm(lemma + 'erne', _merge(base, { number: 'plural', definiteness: 'def' }));
    _addForm(lemma + 'ene',  _merge(base, { number: 'plural', definiteness: 'def' }));
    _addForm(lemma + 'ne',   _merge(base, { number: 'plural', definiteness: 'def' }));
    _addForm(lemma + 're',   _merge(base, { number: 'plural', definiteness: 'indef' }));
    _addForm(lemma + 'rene', _merge(base, { number: 'plural', definiteness: 'def' }));

    // Genitive: pl and def sg
    var defSg = g === 'en' ? lemma + 'en' : lemma + 'et';
    _addForm(defSg + 's',    _merge(base, { number: 'singular', definiteness: 'def', case_: 'genitive' }));
    _addForm(lemma + 'ens',  _merge(base, { number: 'singular', definiteness: 'def', case_: 'genitive' }));
    _addForm(lemma + 'ets',  _merge(base, { number: 'singular', definiteness: 'def', case_: 'genitive' }));
    _addForm(lemma + 'ers',  _merge(base, { number: 'plural',   definiteness: 'indef', case_: 'genitive' }));

    // Double-consonant stems: e.g. "sol" → "soller" — add stem+l+er
    // handled by suffix stripping in analyse()
  }

  function _indexVerb(lemma, data) {
    var aux = data.auxiliary || 'har';
    var base = { lemma: lemma, pos: 'verb', auxiliary: aux };
    if (aux === 'er') ER_VERBS[lemma] = true;
    else              HAR_VERBS[lemma] = true;

    // Always index the bare infinitive
    _addForm(lemma, _merge(base, { tense: 'infinitive' }));

    if (data.class === 'irregular' && data.forms) {
      var f = data.forms;
      if (f.present)    _addForm(f.present,    _merge(base, { tense: 'present' }));
      if (f.past)       _addForm(f.past,        _merge(base, { tense: 'past' }));
      if (f.participle) _addForm(f.participle,  _merge(base, { tense: 'participle' }));
      if (f.gerund)     _addForm(f.gerund,      _merge(base, { tense: 'gerund' }));
      if (f.passive)    _addForm(f.passive,     _merge(base, { tense: 'passive' }));
    } else {
      var stem = lemma.endsWith('e') ? lemma.slice(0, -1) : lemma;
      if (data.class === 'regular_short') {
        _addForm(lemma + 'r',    _merge(base, { tense: 'present' }));
        _addForm(lemma + 'ede',  _merge(base, { tense: 'past' }));
        _addForm(lemma + 'et',   _merge(base, { tense: 'participle' }));
        _addForm(lemma + 'ende', _merge(base, { tense: 'gerund' }));
        _addForm(lemma + 's',    _merge(base, { tense: 'passive' }));
      } else if (data.class === 'regular_te') {
        _addForm(stem + 'er',    _merge(base, { tense: 'present' }));
        _addForm(stem + 'te',    _merge(base, { tense: 'past' }));
        _addForm(stem + 't',     _merge(base, { tense: 'participle' }));
        _addForm(stem + 'ende',  _merge(base, { tense: 'gerund' }));
        _addForm(stem + 'es',    _merge(base, { tense: 'passive' }));
      } else {
        // regular_ede (default)
        _addForm(stem + 'er',    _merge(base, { tense: 'present' }));
        _addForm(stem + 'ede',   _merge(base, { tense: 'past' }));
        _addForm(stem + 'et',    _merge(base, { tense: 'participle' }));
        _addForm(stem + 'ende',  _merge(base, { tense: 'gerund' }));
        _addForm(stem + 'es',    _merge(base, { tense: 'passive' }));
      }
    }
  }

  function _indexAdj(lemma, data) {
    var base = { lemma: lemma, pos: 'adj' };

    // Invariant adjectives (mange, alle, samme, lille, næste etc.) —
    // already in their final form, do not add inflectional suffixes
    if (data.adjClass === 'invariant') {
      _addForm(lemma, _merge(base, { adjForm: 'invariant' }));
      return;
    }

    _addForm(lemma,          _merge(base, { adjForm: 'base' }));
    _addForm(lemma + 't',    _merge(base, { adjForm: 'neuter' }));
    _addForm(lemma + 'e',    _merge(base, { adjForm: 'weak' }));
    _addForm(lemma + 'ere',  _merge(base, { adjForm: 'comparative' }));
    _addForm(lemma + 'est',  _merge(base, { adjForm: 'superlative' }));
    _addForm(lemma + 'este', _merge(base, { adjForm: 'sup_attr' }));
  }

  function _buildIndex(entries) {
    DICT_ENTRIES = entries;
    FORM_INDEX   = {};
    NOUN_DICT    = {};
    VERB_DICT    = {};
    ER_VERBS     = {};
    HAR_VERBS    = {};

    // Index irregular plurals
    var irreg = IRREG_PLURAL_TO_LEMMA;
    Object.keys(irreg).forEach(function (form) {
      var lemma = irreg[form];
      var gender = NOUN_DICT[lemma] || (entries[lemma] && entries[lemma].gender) || null;
      var isDef = form.endsWith('ene') || form.endsWith('erne') || form.endsWith('ne');
      _addForm(form, {
        lemma: lemma, pos: 'noun', gender: gender,
        number: 'plural', definiteness: isDef ? 'def' : 'indef'
      });
    });

    // Index all dictionary entries
    Object.keys(entries).forEach(function (lemma) {
      var data = entries[lemma];
      if (data.pos === 'noun')  { _indexNoun(lemma, data); }
      if (data.pos === 'verb')  { VERB_DICT[lemma] = data; _indexVerb(lemma, data); }
      if (data.pos === 'adj')   { _indexAdj(lemma, data); }
      // adv / prep / conj / pron / num / phrase — index lemma directly
      _addForm(lemma, { lemma: lemma, pos: data.pos });
    });

    // Index pronoun object/reflexive forms not in the main dict
    var pronounForms = [
      ['mig','jeg','object'], ['dig','du','object'], ['ham','han','object'],
      ['hende','hun','object'], ['os','vi','object'],
      ['jer','i','object'], ['dem','de','object'], ['sig','sig','reflexive']
    ];
    pronounForms.forEach(function (row) {
      _addForm(row[0], { lemma: row[1], pos: 'pron', case_: row[2] });
    });

    _ready = true;
    console.log(
      'DanishMorph ready: ' + Object.keys(entries).length + ' lemmas → ' +
      Object.keys(FORM_INDEX).length + ' indexed forms'
    );
  }

  // ── Utility ────────────────────────────────────────────────────────────────

  function _merge(base, extra) {
    var out = {};
    Object.keys(base).forEach(function (k) { out[k] = base[k]; });
    Object.keys(extra).forEach(function (k) { out[k] = extra[k]; });
    return out;
  }

  // ── Core analyser ──────────────────────────────────────────────────────────

  /**
   * Analyse a single word form.
   * Returns an array of possible analyses (may be empty for truly unknown words).
   */
  function analyse(wordform) {
    var w = wordform.toLowerCase().replace(/[.,!?;:»«"']/g, '');
    if (!w) return [];

    // 1. Direct index lookup — covers all known inflected forms
    if (FORM_INDEX[w]) return FORM_INDEX[w];

    var results = [];

    // 2. Irregular plural lookup
    if (IRREG_PLURAL_TO_LEMMA[w]) {
      var irLemma = IRREG_PLURAL_TO_LEMMA[w];
      var irGender = NOUN_DICT[irLemma] || null;
      var irDef = w.endsWith('ene') || w.endsWith('erne') || w.endsWith('ne');
      results.push({
        lemma: irLemma, pos: 'noun', gender: irGender,
        number: 'plural', definiteness: irDef ? 'def' : 'indef'
      });
    }

    // 3. Suffix-based noun analysis (longest suffix first)
    var nounSuffixes = [
      ['ernes', 'plural',   'def',   'genitive'],
      ['enes',  'plural',   'def',   'genitive'],
      ['erne',  'plural',   'def',   null],
      ['ene',   'plural',   'def',   null],
      ['ens',   'singular', 'def',   'genitive'],
      ['ets',   'singular', 'def',   'genitive'],
      ['ers',   'plural',   'indef', 'genitive'],
      ['es',    'plural',   'indef', null],
      ['en',    'singular', 'def',   null],
      ['et',    'singular', 'def',   null],
      ['er',    'plural',   'indef', null],
      ['ne',    'plural',   'def',   null],
      ['e',     'plural',   'indef', null],
      ['s',     'singular', 'indef', 'genitive'],
      ['r',     'plural',   'indef', null]
    ];

    for (var ni = 0; ni < nounSuffixes.length; ni++) {
      var nsfx = nounSuffixes[ni];
      var sfx = nsfx[0];
      if (!w.endsWith(sfx) || w.length <= sfx.length + 1) continue;
      var stem = w.slice(0, -sfx.length);

      // Try stem directly, then stem+"e" (for lemmas ending in consonant)
      var candidates = [stem, stem + 'e'];
      // Also try double-consonant reduction: "hunde" → stem "hund" → lemma "hund"
      if (stem.length > 2 && stem[stem.length - 1] === stem[stem.length - 2]) {
        candidates.push(stem.slice(0, -1));
      }

      for (var ci = 0; ci < candidates.length; ci++) {
        var cand = candidates[ci];
        if (NOUN_DICT[cand] !== undefined) {
          var nounAn = {
            lemma: cand, pos: 'noun', gender: NOUN_DICT[cand],
            number: nsfx[1], definiteness: nsfx[2]
          };
          if (nsfx[3]) nounAn.case_ = nsfx[3];
          results.push(nounAn);
          break;
        }
      }
      if (results.length > 0) break;
    }

    // 4. Suffix-based verb analysis (longest suffix first)
    var verbSuffixes = [
      ['endes', 'gerund'],
      ['edes',  'passive'],
      ['ende',  'gerund'],
      ['ede',   'past'],
      ['tes',   'passive'],
      ['tes',   'past'],
      ['ede',   'participle'],   // less common but exists
      ['te',    'past'],
      ['es',    'passive'],
      ['er',    'present'],
      ['et',    'participle'],
      ['t',     'participle'],
      ['r',     'present'],
      ['s',     'passive']
    ];

    for (var vi = 0; vi < verbSuffixes.length; vi++) {
      var vsfx = verbSuffixes[vi][0];
      var vtense = verbSuffixes[vi][1];
      if (!w.endsWith(vsfx) || w.length <= vsfx.length) continue;
      var vstem = w.slice(0, -vsfx.length);

      // Try stem and stem+"e" as infinitives
      var vinfs = [vstem, vstem + 'e'];
      for (var vci = 0; vci < vinfs.length; vci++) {
        var vinf = vinfs[vci];
        if (VERB_DICT[vinf]) {
          results.push({
            lemma: vinf, pos: 'verb', tense: vtense,
            auxiliary: VERB_DICT[vinf].auxiliary || 'har'
          });
          break;
        }
      }
      if (results.length > 0) break;
    }

    // 5. Adjective suffix analysis
    var adjSuffixes = [
      ['este', 'sup_attr'],
      ['ere',  'comparative'],
      ['est',  'superlative'],
      ['t',    'neuter'],
      ['e',    'weak']
    ];
    for (var ai = 0; ai < adjSuffixes.length; ai++) {
      var asfx = adjSuffixes[ai][0];
      var aform = adjSuffixes[ai][1];
      if (!w.endsWith(asfx) || w.length <= asfx.length + 1) continue;
      var astem = w.slice(0, -asfx.length);
      if (FORM_INDEX[astem]) {
        var baseEntry = FORM_INDEX[astem].find(function (a) { return a.pos === 'adj'; });
        if (baseEntry) {
          results.push({ lemma: baseEntry.lemma, pos: 'adj', adjForm: aform });
          break;
        }
      }
    }

    return results;
  }

  // ── Tokeniser & annotator ──────────────────────────────────────────────────

  function _tokenise(text) {
    var tokens = [];
    var re = /([\wæøåÆØÅ]+)|([^\wæøåÆØÅ\s]+)/giu;
    var m;
    while ((m = re.exec(text)) !== null) {
      tokens.push({
        word:   m[0],
        start:  m.index,
        end:    m.index + m[0].length,
        isWord: !!m[1]
      });
    }
    return tokens;
  }

  /**
   * Annotate each token with its morphological analyses.
   * Returns AnnotatedToken[]:
   *   { word, start, end, isWord, known, properNoun, analyses }
   */
  function annotate(text) {
    var tokens = _tokenise(text);
    return tokens.map(function (t) {
      if (!t.isWord) return _merge(t, { analyses: [], known: true });

      var w = t.word;
      // Proper noun heuristic: capitalised and not at sentence start
      var isCapMid = /^[A-ZÆØÅ]/.test(w) && t.start > 0;
      // Numbers
      if (/^\d+$/.test(w)) return _merge(t, { analyses: [], known: true, numeric: true });
      if (isCapMid)         return _merge(t, { analyses: [], known: true, properNoun: true });

      var analyses = analyse(w);
      return _merge(t, { analyses: analyses, known: analyses.length > 0 });
    });
  }

  /** Return the single best (first) analysis for a token, or null. */
  function _best(token) {
    return (token.analyses && token.analyses.length > 0) ? token.analyses[0] : null;
  }

  function _getSentences(text) {
    // Split on sentence-ending punctuation followed by whitespace
    var raw = text.split(/[.!?]+/);
    return raw.map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; });
  }

  // ── Grammar checks ─────────────────────────────────────────────────────────

  /**
   * Run all grammar checks on an annotated, word-only token sequence.
   * sentTokens: AnnotatedToken[] — already filtered to isWord === true
   */
  function _checkSentence(sentTokens) {
    var errors = [];
    var words = sentTokens;
    if (words.length < 1) return errors;

    var w0 = words[0] ? words[0].word.toLowerCase() : '';
    var b0 = _best(words[0]);

    // ── 1. Missing finite verb ───────────────────────────────────────────────
    var hasFinite = words.some(function (t) {
      var ab = _best(t);
      return ab && ab.pos === 'verb' &&
        (ab.tense === 'present' || ab.tense === 'past' || ab.tense === 'passive');
    });

    var hasSubject = PRONOUNS[w0] ||
      (words.length >= 2 && (function () {
        // article/det + noun
        var b1 = _best(words[1]);
        return (w0 === 'en' || w0 === 'et' || (b0 && b0.pos === 'num')) &&
               b1 && b1.pos === 'noun';
      })()) ||
      (b0 && b0.pos === 'noun'); // bare noun subject

    if (hasSubject && !hasFinite && words.length >= 2) {
      var hasContent = words.some(function (t) {
        var ab = _best(t);
        return ab && (ab.pos === 'noun' || ab.pos === 'adj' ||
                      ab.pos === 'adv'  || ab.pos === 'prep');
      });
      if (hasContent) {
        errors.push({
          type: 'missing_verb',
          message: 'Missing verb: this clause has no finite verb. ' +
            'Every Danish sentence needs one (e.g. er, har, hedder, kommer...)'
        });
      }
    }

    // ── 2. V2 word order ────────────────────────────────────────────────────
    var FRONTED_ADVS = {
      'i dag':1,'i morgen':1,'i går':1,'i aftes':1,'i nat':1,'i år':1,
      'i sommer':1,'i vinter':1,'i foråret':1,'i efteråret':1,
      her:1, der:1, nu:1, så:1, derfor:1, alligevel:1, desuden:1,
      faktisk:1, normalt:1, altid:1, aldrig:1, sommetider:1,
      indimellem:1, ofte:1, sjældent:1, 'til sidst':1, 'til slut':1,
      først:1, derefter:1, bagefter:1, heldigvis:1, desværre:1,
      forhåbentlig:1, selvfølgelig:1, egentlig:1, ellers:1, pludselig:1,
      i:1  // "i dag" caught above, but bare "i" could front a clause too
    };
    var w1 = words[1] ? words[1].word.toLowerCase() : '';
    var firstTwo = w0 + ' ' + w1;
    var frontedLen = 0;
    if (FRONTED_ADVS[firstTwo]) frontedLen = 2;
    else if (FRONTED_ADVS[w0])  frontedLen = 1;

    if (frontedLen > 0 && words.length > frontedLen + 1) {
      var postFront0 = words[frontedLen]     ? words[frontedLen].word.toLowerCase()     : '';
      var postFront1 = words[frontedLen + 1] ? words[frontedLen + 1].word.toLowerCase() : '';
      if (PRONOUNS[postFront0]) {
        var pfb1 = _best(words[frontedLen + 1]);
        if (pfb1 && pfb1.pos === 'verb') {
          var frontedText = words.slice(0, frontedLen).map(function (t) { return t.word; }).join(' ');
          errors.push({
            type: 'v2',
            message: 'Word order (V2): after "' + frontedText + '", the verb must come ' +
              'before the subject. Write: "' + frontedText + ' ' + postFront1 + ' ' + postFront0 + '..."'
          });
        }
      }
    }

    // ── 3. SOV word order ────────────────────────────────────────────────────
    if (PRONOUNS[w0] && words.length >= 3) {
      var lastTok = words[words.length - 1];
      var lastB   = _best(lastTok);
      if (lastB && lastB.pos === 'verb' &&
          lastB.tense !== 'infinitive' && lastB.tense !== 'gerund') {
        var mid = words.slice(1, -1);
        var midHasContent = mid.some(function (t) {
          return !PRONOUNS[t.word.toLowerCase()] && !PREPOSITIONS[t.word.toLowerCase()];
        });
        if (midHasContent) {
          errors.push({
            type: 'sov',
            message: 'Word order: the verb should come right after the subject, not at the end. ' +
              'Try: ' + w0 + ' ' + lastTok.word + ' ' +
              mid.map(function (t) { return t.word; }).join(' ')
          });
        }
      }
    }

    // ── 4. Non-finite verb used as main clause verb ──────────────────────────
    words.forEach(function (t, i) {
      var ab = _best(t);
      if (!ab || ab.pos !== 'verb') return;
      if (ab.tense !== 'infinitive' && ab.tense !== 'participle') return;

      var prev  = words[i - 1];
      var prevW = prev ? prev.word.toLowerCase() : '';

      // Legitimate uses: after auxiliary, after "at", coordinated after "og"
      if (AUXILIARIES[prevW] || SUBORD_CONJUNCTIONS[prevW] || prevW === 'og') return;

      // Check: is there a subject-like element before this verb?
      var subjectFound = false;
      for (var si = 0; si < i; si++) {
        var sb = _best(words[si]);
        var sw = words[si].word.toLowerCase();
        if (PRONOUNS[sw] || (sb && sb.pos === 'noun') ||
            (sb && sb.pos === 'num') || sw === 'en' || sw === 'et') {
          subjectFound = true;
          break;
        }
      }
      if (!subjectFound) return;

      var vdata = VERB_DICT[ab.lemma];
      var pres  = _getPresent(ab.lemma, vdata);
      var past  = _getPast(ab.lemma, vdata);
      var formName = ab.tense === 'infinitive' ? 'infinitive' : 'past participle';

      errors.push({
        type: 'nonfinite_as_finite',
        message: '"' + t.word + '" is the ' + formName + ' of "' + ab.lemma + '" — ' +
          'use a finite form: present "' + pres + '" or past "' + past + '"'
      });
    });

    // ── 5. Article + noun agreement ─────────────────────────────────────────
    words.forEach(function (t, i) {
      var w = t.word.toLowerCase();
      if (w !== 'en' && w !== 'et') return;
      var next = words[i + 1];
      if (!next) return;
      var nb = _best(next);
      if (!nb || nb.pos !== 'noun') return;
      var gender = nb.gender || NOUN_DICT[nb.lemma];
      if (!gender) return;

      // Definite double-marking: article before a definitised noun form
      var nbDef = next.analyses.find(function (a) { return a.definiteness === 'def'; });
      if (nbDef) {
        errors.push({
          type: 'definite',
          message: '"' + w + ' ' + next.word + '" — cannot combine article with definite suffix. ' +
            'Use "' + w + ' ' + (nb.lemma || next.word) + '" or just "' + next.word + '"'
        });
        return; // don't double-report
      }

      if (w === 'en' && gender === 'et') {
        errors.push({
          type: 'article',
          message: '"' + (nb.lemma || next.word) + '" is an et-noun — use "et ' +
            (nb.lemma || next.word) + '", not "en ' + (nb.lemma || next.word) + '"'
        });
      } else if (w === 'et' && gender === 'en') {
        errors.push({
          type: 'article',
          message: '"' + (nb.lemma || next.word) + '" is an en-noun — use "en ' +
            (nb.lemma || next.word) + '", not "et ' + (nb.lemma || next.word) + '"'
        });
      } else if (gender === 'pl') {
        errors.push({
          type: 'article',
          message: '"' + (nb.lemma || next.word) + '" is always plural — no article needed'
        });
      }
    });

    // ── 6. Adjective–noun agreement ─────────────────────────────────────────
    words.forEach(function (t, i) {
      var ab = _best(t);
      if (!ab || ab.pos !== 'adj') return;
      // Skip invariant adjectives — they never change form
      if (ab.adjForm === 'invariant') return;
      var next = words[i + 1];
      if (!next) return;
      var nb = _best(next);
      if (!nb || nb.pos !== 'noun') return;
      var gender = nb.gender || NOUN_DICT[nb.lemma];
      var number = nb.number;
      var def    = nb.definiteness;
      var adjf   = ab.adjForm;
      if (!gender || !adjf) return;

      var prev  = words[i - 1];
      var prevW = prev ? prev.word.toLowerCase() : '';
      var afterArticle = (prevW === 'en' || prevW === 'et' ||
                          prevW === 'den' || prevW === 'det' || prevW === 'de');

      // Only suggest a form if it is actually in the index (avoids mangee, allée etc.)
      var weakForm = FORM_INDEX[ab.lemma + 'e'] ? ab.lemma + 'e' : null;
      var neutForm = FORM_INDEX[ab.lemma + 't'] ? ab.lemma + 't' : null;

      // Indefinite singular: neuter noun needs -t form, en-noun needs base form
      if (def === 'indef' && number === 'singular' && !afterArticle) {
        if (gender === 'et' && adjf === 'base' && neutForm) {
          errors.push({
            type: 'adj_agreement',
            message: 'Adjective agreement: "' + t.word + '" before an et-noun needs ' +
              'the neuter form "' + neutForm + '"'
          });
        }
        if (gender === 'en' && adjf === 'neuter') {
          errors.push({
            type: 'adj_agreement',
            message: 'Adjective agreement: "' + t.word + '" before an en-noun should ' +
              'be the base form "' + ab.lemma + '"'
          });
        }
      }

      // Plural or definite: always weak (-e) form
      if ((number === 'plural' || def === 'def') &&
          (adjf === 'base' || adjf === 'neuter') && weakForm) {
        errors.push({
          type: 'adj_agreement',
          message: 'Adjective agreement: "' + t.word + '" should use the weak form "' +
            weakForm + '" (definite or plural context)'
        });
      }
    });

    // ── 7. Auxiliary selection (har vs er) ───────────────────────────────────
    words.forEach(function (t, i) {
      var w = t.word.toLowerCase();
      if (w !== 'har' && w !== 'er' && w !== 'havde' && w !== 'var') return;
      var isHar = (w === 'har' || w === 'havde');
      var next  = words[i + 1];
      if (!next) return;
      var nb = _best(next);
      if (!nb || nb.pos !== 'verb' || nb.tense !== 'participle') return;
      var vLemma = nb.lemma;
      if (!vLemma) return;
      if (isHar && ER_VERBS[vLemma]) {
        errors.push({
          type: 'auxiliary',
          message: '"' + vLemma + '" takes "er" in the perfect tense: "er ' + next.word + '"'
        });
      }
      if (!isHar && HAR_VERBS[vLemma]) {
        errors.push({
          type: 'auxiliary',
          message: '"' + vLemma + '" takes "har" in the perfect tense: "har ' + next.word + '"'
        });
      }
    });

    // ── 8. Possessive agreement ──────────────────────────────────────────────
    words.forEach(function (t, i) {
      var w       = t.word.toLowerCase();
      var pGender = POSS_GENDER[w];
      if (!pGender) return;
      var next = words[i + 1];
      if (!next) return;
      var nb     = _best(next);
      var gender = (nb && nb.gender) || NOUN_DICT[nb && nb.lemma] ||
                   NOUN_DICT[next.word.toLowerCase()];
      if (!gender) return;
      if (pGender === gender) return;

      var owner  = (w[0] === 'm') ? 'min/mit/mine' : (w[0] === 'd') ? 'din/dit/dine' : 'sin/sit/sine';
      var prefix = w[0];
      var fix    = gender === 'et' ? prefix + 'it' :
                   gender === 'en' ? prefix + 'in' :
                   prefix + 'ine';
      errors.push({
        type: 'possessive',
        message: '"' + (nb && nb.lemma ? nb.lemma : next.word) + '" is ' +
          (gender === 'pl' ? 'plural' : 'an ' + gender + '-noun') +
          ' — use "' + fix + '", not "' + w + '"'
      });
    });

    // ── 9. Reflexive pronoun ─────────────────────────────────────────────────
    var THIRD_SUBJ_TO_OBJ = { han:'ham', hun:'hende', de:'dem' };
    if (THIRD_SUBJ_TO_OBJ[w0]) {
      var expectedObj = THIRD_SUBJ_TO_OBJ[w0];
      words.forEach(function (t, i) {
        if (i === 0) return;
        if (t.word.toLowerCase() !== expectedObj) return;
        // There must be a verb between subject and this object pronoun
        var verbBetween = words.slice(1, i).some(function (tok) {
          var ab = _best(tok);
          return ab && ab.pos === 'verb';
        });
        if (verbBetween) {
          errors.push({
            type: 'reflexive',
            message: 'Reflexive: when subject and object are the same person, ' +
              'use "sig" instead of "' + t.word + '"'
          });
        }
      });
    }

    // ── 10. Genitive apostrophe ──────────────────────────────────────────────
    words.forEach(function (t) {
      if (t.word.indexOf("'") !== -1 && t.word.toLowerCase().endsWith('s')) {
        errors.push({
          type: 'genitive',
          message: 'Genitive: Danish does not use an apostrophe — write "' +
            t.word.replace(/'/g, '') + '", not "' + t.word + '"'
        });
      }
    });

    return errors;
  }

  // ── Verb form helpers ──────────────────────────────────────────────────────

  function _getPresent(lemma, vdata) {
    if (vdata && vdata.forms && vdata.forms.present) return vdata.forms.present;
    if (!vdata) return lemma + 'er';
    if (vdata.class === 'regular_short') return lemma + 'r';
    var stem = lemma.endsWith('e') ? lemma.slice(0, -1) : lemma;
    return stem + 'er';
  }

  function _getPast(lemma, vdata) {
    if (vdata && vdata.forms && vdata.forms.past) return vdata.forms.past;
    if (!vdata) return lemma + 'ede';
    if (vdata.class === 'regular_short') return lemma + 'ede';
    var stem = lemma.endsWith('e') ? lemma.slice(0, -1) : lemma;
    if (vdata.class === 'regular_te') return stem + 'te';
    return stem + 'ede';
  }

  // ── Spell checker ──────────────────────────────────────────────────────────

  function _checkSpelling(annotated) {
    return annotated.filter(function (t) {
      return t.isWord && !t.known && !t.properNoun && !t.numeric;
    }).map(function (t) {
      var hint = _verbHint(t.word);
      return {
        type:    'spelling',
        word:    t.word,
        start:   t.start,
        end:     t.end,
        message: '"' + t.word + '" — not in dictionary' + hint
      };
    });
  }

  function _verbHint(word) {
    var w = word.toLowerCase();
    var sfxs = ['er','ede','te','et','t','ende','es','r'];
    for (var i = 0; i < sfxs.length; i++) {
      var sfx = sfxs[i];
      if (!w.endsWith(sfx)) continue;
      var stem = w.slice(0, -sfx.length);
      var inf  = VERB_DICT[stem] ? stem : (VERB_DICT[stem + 'e'] ? stem + 'e' : null);
      if (inf) {
        var pres = _getPresent(inf, VERB_DICT[inf]);
        return ' (looks like a form of "' + inf + '" — present: "' + pres + '")';
      }
    }
    return '';
  }

  // ── Main check function ────────────────────────────────────────────────────

  /**
   * Run the full analyser pipeline on free text.
   * Returns CheckResult:
   *   { spelling[], grammar[], tokens[], wordCount, sentenceCount, score }
   */
  function check(text) {
    var annotated    = annotate(text);
    var spelling     = _checkSpelling(annotated);
    var grammar      = [];
    var sentences    = _getSentences(text);

    sentences.forEach(function (s) {
      var sToks = annotate(s).filter(function (t) { return t.isWord; });
      var errs  = _checkSentence(sToks);
      errs.forEach(function (e) { grammar.push(e); });
    });

    var wordCount     = annotated.filter(function (t) { return t.isWord; }).length;
    var sentenceCount = sentences.length;
    var totalErrors   = spelling.length + grammar.length;
    var errorRate     = wordCount > 0 ? totalErrors / wordCount : 0;
    var score         = Math.max(0, Math.round((1 - errorRate * 3) * 100));

    return {
      spelling:      spelling,
      grammar:       grammar,
      tokens:        annotated,
      wordCount:     wordCount,
      sentenceCount: sentenceCount,
      score:         score
    };
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  global.DanishMorph = {

    /** Load the dictionary from a JSON path and build the form index. */
    load: function (dictPath) {
      return fetch(dictPath || '../danish_dict.json')
        .then(function (r) { return r.json(); })
        .then(function (data) { _buildIndex(data); })
        .catch(function (e) { console.error('DanishMorph.load failed:', e); });
    },

    /** Analyse a single word form → Analysis[] */
    analyse: analyse,

    /** Annotate full text → AnnotatedToken[] */
    annotate: annotate,

    /** Run full grammar check → CheckResult */
    check: check,

    /** True once load() has completed */
    get ready() { return _ready; },

    /** Expose internals for debugging */
    _debug: {
      formIndex:   function () { return FORM_INDEX; },
      nounDict:    function () { return NOUN_DICT; },
      verbDict:    function () { return VERB_DICT; },
      erVerbs:     function () { return ER_VERBS; },
      harVerbs:    function () { return HAR_VERBS; }
    }
  };

})(window);
