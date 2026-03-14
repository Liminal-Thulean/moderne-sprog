/**
 * chinese_data.js — Character set, grammar patterns, and reader passages
 * Part of Glossarium / Language Nexus — Classical Chinese section
 *
 * Exposes: CHARACTERS[], PATTERNS[], PASSAGES[]
 *
 * TO ADD A CHARACTER: copy any entry in CHARACTERS and edit.
 *   { char:"人", pinyin:"rén", eng:"person, people", pos:"noun", notes:"..." }
 *
 * TO ADD A PASSAGE: copy any entry in PASSAGES and edit.
 *   { id, title, source, date, intro, text:"字 字 字 ，字 字 。" }
 *   Separate each character/punctuation with a space for the tokeniser.
 *
 * TO ADD A PATTERN: copy any entry in PATTERNS and edit.
 *   { id, pattern, pinyin, meaning, example, translation, notes }
 */

// ─── CHARACTER DATA ───────────────────────────────────────────────────────────

const CHARACTERS = [
  // Core high-frequency characters
  { char:"人", pinyin:"rén",  eng:"person, people, human being",      pos:"noun",     notes:"One of the most frequent characters in Classical Chinese. As a suffix it often means 'a person of' e.g. 學人 a scholar." },
  { char:"天", pinyin:"tiān", eng:"heaven, sky, nature, day",         pos:"noun",     notes:"In Classical thought 天 is the supreme moral order as well as the physical sky. Contrast 地 (earth)." },
  { char:"地", pinyin:"dì",   eng:"earth, ground, place, land",       pos:"noun",     notes:"Paired with 天 in the cosmological pair 天地 (heaven and earth = the universe)." },
  { char:"王", pinyin:"wáng", eng:"king, ruler, to rule",             pos:"noun/verb",notes:"As a verb 王 means 'to act as king' or 'to become king'. The three horizontal strokes represent Heaven, Humanity, Earth; the vertical stroke connects them." },
  { char:"子", pinyin:"zǐ",   eng:"son, child, master, you (honorific)",pos:"noun",   notes:"子 is used as an honorific title for philosophers: 孔子 (Confucius), 孟子 (Mencius). Also the first Earthly Branch." },
  { char:"學", pinyin:"xué",  eng:"to learn, to study, learning",     pos:"verb",     notes:"The opening character of the Analects: 學而時習之。The traditional form 學 shows hands above a child under a roof." },
  { char:"道", pinyin:"dào",  eng:"way, path, principle, to speak",   pos:"noun/verb",notes:"The central concept of Taoism. As a verb it means 'to say' or 'to lead'. Contains 首 (head) + 辶 (movement)." },
  { char:"德", pinyin:"dé",   eng:"virtue, moral power, character",   pos:"noun",     notes:"A key Confucian concept: inner moral cultivation that radiates outward. Related to 得 (to obtain)." },
  { char:"仁", pinyin:"rén",  eng:"benevolence, humaneness, goodness",pos:"noun",     notes:"The supreme Confucian virtue. Written 人 (person) + 二 (two) — benevolence exists between people." },
  { char:"義", pinyin:"yì",   eng:"righteousness, rightness, duty",   pos:"noun",     notes:"One of the five cardinal Confucian virtues. Contrast with 利 (profit, advantage)." },
  { char:"禮", pinyin:"lǐ",   eng:"ritual, propriety, rites, courtesy",pos:"noun",   notes:"The system of social ritual and proper conduct. A core Confucian concern — ritual structures social harmony." },
  { char:"知", pinyin:"zhī",  eng:"to know, knowledge, wisdom",       pos:"verb",     notes:"Also read zhì (wisdom as a noun). Distinct from 識 (to recognise, to be acquainted with)." },
  { char:"心", pinyin:"xīn",  eng:"heart, mind, thought, feeling",    pos:"noun",     notes:"In Classical Chinese the heart is the seat of both emotion and thought — there is no word/thought distinction." },
  { char:"國", pinyin:"guó",  eng:"state, kingdom, country",          pos:"noun",     notes:"Literally 'people/territory enclosed by a border'. The 戰國 (Warring States) period was named from 諸國 (the various states)." },
  { char:"君", pinyin:"jūn",  eng:"ruler, lord, gentleman, you",      pos:"noun",     notes:"君子 (the noble person / gentleman) is a key Confucian concept — the morally cultivated person." },
  { char:"民", pinyin:"mín",  eng:"people, subjects, the people",     pos:"noun",     notes:"The governed populace as distinct from 君 (ruler). Mencius famously argued 民 are the most important element of a state." },
  { char:"文", pinyin:"wén",  eng:"writing, culture, civil, pattern", pos:"noun/adj", notes:"文言 (literary language) = the written classical style. Contrast 武 (martial, military)." },
  { char:"言", pinyin:"yán",  eng:"to speak, words, speech, saying",  pos:"verb/noun",notes:"言 as a noun means a word, statement or saying. 言而有信 = to speak and be trustworthy." },
  { char:"行", pinyin:"xíng", eng:"to walk, to act, conduct, practice",pos:"verb",   notes:"Also read háng (a row, a profession). The pair 知行 (knowing and acting) is a key Neo-Confucian theme." },
  { char:"學", pinyin:"xué",  eng:"to learn, learning",               pos:"verb",     notes:"See above." },
  { char:"不", pinyin:"bù",   eng:"not, no (negation before verbs)",  pos:"particle", notes:"The most common negation particle. 不 negates present or general facts. Contrast 無 (there is not) and 非 (is not = not equal to)." },
  { char:"之", pinyin:"zhī",  eng:"(1) of, 's (possessive particle) (2) it, him, them (object pronoun) (3) to go to", pos:"particle/pronoun", notes:"之 is the most versatile particle in Classical Chinese. Context determines its function. It never carries stress." },
  { char:"而", pinyin:"ér",   eng:"and, but, yet, and then (connective particle)", pos:"particle", notes:"而 connects clauses. It can be additive (and), adversative (but), or sequential (and then). It never acts as a noun." },
  { char:"以", pinyin:"yǐ",   eng:"by means of, with, using, because, in order to", pos:"particle/verb", notes:"以 introduces the instrument or means of an action. 以...為 = 'to regard...as' or 'to use...as'." },
  { char:"於", pinyin:"yú",   eng:"at, in, on, from, by, than (preposition)", pos:"particle", notes:"The primary Classical Chinese preposition for location, source, and comparison. Often written 于 in bronze inscriptions." },
  { char:"其", pinyin:"qí",   eng:"his, her, its, their (3rd person possessive)", pos:"pronoun",  notes:"Also used as a modal particle expressing supposition or exhortation. 其 never appears as a direct object." },
  { char:"者", pinyin:"zhě",  eng:"(nominaliser) one who, that which, the -er", pos:"particle", notes:"者 follows a verb or adjective to create a noun phrase: 學者 = one who studies = a scholar. Part of the 者...也 pattern." },
  { char:"也", pinyin:"yě",   eng:"(sentence-final particle, asserting a judgment)", pos:"particle", notes:"也 ends declarative sentences, especially definitions and judgments. 者...也 = 'as for X, it is Y'." },
  { char:"乎", pinyin:"hū",   eng:"(question particle) ? / (exclamatory) oh!", pos:"particle", notes:"The main rhetorical question marker. 不亦...乎 = 'is it not...?' — a common Analects construction." },
  { char:"為", pinyin:"wéi",  eng:"to be, to act as, to do, to become, for (preposition)", pos:"verb/particle", notes:"One of the most flexible characters. 以...為 = regard as. 為...所 = passive construction. Read wèi when meaning 'for the sake of'." },
  { char:"有", pinyin:"yǒu",  eng:"to have, there is/are, to exist",  pos:"verb",     notes:"Negated by 無 (wú) not 不有. 有 begins many existential sentences: 有朋自遠方來 = there are friends coming from afar." },
  { char:"無", pinyin:"wú",   eng:"to not have, there is no, without, nothingness", pos:"verb/noun", notes:"The existential negative paired with 有. Also a key Taoist concept: 無為 (non-action, effortless action)." },
  { char:"是", pinyin:"shì",  eng:"this, this is right, correct",     pos:"pronoun/adj",notes:"In Classical Chinese 是 is primarily a demonstrative pronoun (this). The copular use (= is) develops later. 是以 = therefore." },
  { char:"非", pinyin:"fēi",  eng:"is not, wrong, to negate, to blame",pos:"verb",   notes:"The copular negative: 非 negates equations. 非...不 = 'only if not X then not Y' — a double negative affirmative." },
  { char:"古", pinyin:"gǔ",   eng:"ancient, old, antiquity",          pos:"adj/noun", notes:"The Classical authors frequently appealed to 古 (antiquity) as a moral standard. 古之人 = the people of antiquity." },
  { char:"今", pinyin:"jīn",  eng:"now, the present, today",          pos:"adv/noun", notes:"Often contrasted with 古: 古今 = antiquity and the present = throughout all time." },
  { char:"大", pinyin:"dà",   eng:"great, large, important",          pos:"adj",      notes:"Also read tài (supreme: 太/大極 the supreme ultimate). 大人 = a great person, a lord." },
  { char:"小", pinyin:"xiǎo", eng:"small, minor, petty",              pos:"adj",      notes:"小人 = the petty person / the base person, contrasted with 君子 in Confucian ethics." },
  { char:"上", pinyin:"shàng",eng:"above, upper, superior, to ascend",pos:"noun/verb",notes:"As a directional complement: going up. 上 = the superior, the ruler (used as a euphemism for the emperor)." },
  { char:"下", pinyin:"xià",  eng:"below, lower, inferior, to descend",pos:"noun/verb",notes:"天下 (under heaven = the realm, the world) is one of the most important compounds in Classical Chinese." },
];

// ─── GRAMMAR PATTERNS ────────────────────────────────────────────────────────

const PATTERNS = [
  {
    id:"zhe_ye",
    pattern:"者 … 也",
    pinyin:"zhě … yě",
    meaning:"Nominal predication — 'As for X, it is Y'",
    example:"學者，所以求道也。",
    translation:"A scholar is one who seeks the Way.",
    notes:"The most fundamental Classical Chinese sentence pattern. 者 nominalises the subject; 也 asserts the predicate. The verb 是 (to be) is NOT used."
  },
  {
    id:"bu_yi_hu",
    pattern:"不亦 … 乎",
    pinyin:"bù yì … hū",
    meaning:"Rhetorical question — 'Is it not … ?'",
    example:"學而時習之，不亦說乎？",
    translation:"To learn and at due times to practise what one has learned — is that not a pleasure?",
    notes:"One of the most famous Analects constructions. 不亦 = 'is it not also'; 乎 ends the rhetorical question. The expected answer is always 'yes, it is'."
  },
  {
    id:"yi_wei",
    pattern:"以 … 為",
    pinyin:"yǐ … wéi",
    meaning:"'To regard X as Y' / 'To use X as Y'",
    example:"以天下為己任。",
    translation:"To regard the realm under Heaven as one's own responsibility.",
    notes:"以 introduces the object/instrument; 為 introduces what it is treated as. One of the most productive patterns for expressing judgment or purpose."
  },
  {
    id:"wei_suo",
    pattern:"為 … 所",
    pinyin:"wéi … suǒ",
    meaning:"Passive construction — 'to be X-ed by'",
    example:"吾為汝所欺。",
    translation:"I was deceived by you.",
    notes:"The main passive pattern in Classical Chinese. 為 introduces the agent; 所 precedes the verb. Compare the later 被 passive which becomes dominant in Literary Chinese."
  },
  {
    id:"fei_bu",
    pattern:"非 … 不",
    pinyin:"fēi … bù",
    meaning:"Double negative — 'Only X can / Unless X, not'",
    example:"非禮勿視，非禮勿聽。",
    translation:"Do not look at what is contrary to ritual; do not listen to what is contrary to ritual.",
    notes:"Two negatives create a strong affirmative or exclusive statement. 非 negates a noun/condition; 不 negates the verb. Extremely common in Analects-style prose."
  },
  {
    id:"shi_yi",
    pattern:"是以",
    pinyin:"shì yǐ",
    meaning:"'Therefore, for this reason'",
    example:"是以聖人處無為之事。",
    translation:"Therefore the sage dwells in non-action.",
    notes:"是以 = 'by means of this' → therefore. A very common connective in philosophical prose. 是 here is a demonstrative pronoun (this), not the later copula."
  },
  {
    id:"wu_wei",
    pattern:"無為",
    pinyin:"wú wéi",
    meaning:"Non-action, effortless action, acting in accordance with nature",
    example:"為學日益，為道日損。",
    translation:"In pursuit of learning, something is gained every day; in pursuit of the Way, something is relinquished every day.",
    notes:"無為 is the Taoist ideal of acting without forced, artificial effort. The pattern 為X日Y contrasts the Confucian (learning/gaining) with the Taoist (the Way/losing) paths."
  },
  {
    id:"yu_bi",
    pattern:"與其 … 寧",
    pinyin:"yǔ qí … nìng",
    meaning:"'Rather than X, it is better to Y'",
    example:"與其媚於奧，寧媚於竈。",
    translation:"Rather than curry favour with the southwest corner, it is better to curry favour with the stove.",
    notes:"A preference construction. 與其 introduces the less preferred option; 寧 (or 不如) introduces the preferred one. Found in the Analects."
  },
  {
    id:"suo_v",
    pattern:"所 + Verb",
    pinyin:"suǒ + Verb",
    meaning:"Nominalisation — 'that which is verb-ed', 'what one verbs'",
    example:"所學者，道也。",
    translation:"What one studies is the Way.",
    notes:"所 before a verb creates a noun phrase referring to the object of that verb. 所學 = what is studied; 所見 = what is seen. Extremely productive in Classical Chinese."
  },
  {
    id:"qi_modal",
    pattern:"其 + Verb/Adj",
    pinyin:"qí + Verb/Adj",
    meaning:"Modal 其 — supposition, exhortation, or rhetorical question",
    example:"其恕乎！",
    translation:"Is it not perhaps reciprocity?",
    notes:"When 其 does not clearly refer to a third-person possessor, it functions as a modal particle expressing supposition (perhaps) or exhortation (let). Context is decisive."
  },
];

// ─── PASSAGES ─────────────────────────────────────────────────────────────────
// Each character separated by a space for the tokeniser.
// Use ， 。 ？ ！ for punctuation — also space-separated.

const PASSAGES = [
  {
    id:"lunyu_1_1",
    title:"論語 學而篇 1.1",
    source:"孔子 Confucius — Analects",
    date:"Compiled c. 5th–4th century BC",
    intro:"The opening passage of the Analects — perhaps the most famous lines in the entire Classical Chinese canon. Three rhetorical questions using the 不亦…乎 pattern.",
    text:"學 而 時 習 之 ， 不 亦 說 乎 ？ 有 朋 自 遠 方 來 ， 不 亦 樂 乎 ？ 有 人 不 知 而 不 慍 ， 不 亦 君 子 乎 ？"
  },
  {
    id:"laozi_1",
    title:"道德經 第一章",
    source:"老子 Laozi — Tao Te Ching",
    date:"c. 4th–3rd century BC",
    intro:"The opening of the Tao Te Ching — the most translated Chinese text. It immediately problematises language itself: the Way that can be named is not the eternal Way.",
    text:"道 可 道 ， 非 常 道 。 名 可 名 ， 非 常 名 。 無 名 天 地 之 始 ； 有 名 萬 物 之 母 。"
  },
  {
    id:"lunyu_4_15",
    title:"論語 里仁篇 4.15",
    source:"孔子 Confucius — Analects",
    date:"Compiled c. 5th–4th century BC",
    intro:"Confucius reveals to his disciple Zengzi that his Way is threaded through by a single principle. Zengzi interprets this as 忠恕 — loyalty and reciprocity.",
    text:"子 曰 ： 吾 道 一 以 貫 之 。 曾 子 曰 ： 唯 。 子 出 ， 門 人 問 曰 ： 何 謂 也 ？ 曾 子 曰 ： 夫 子 之 道 ， 忠 恕 而 已 矣 。"
  },
];