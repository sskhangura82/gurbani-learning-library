// Optional editorial study. Original source nodes, routes and storage stay owned by the reader.
import {lessonForUnit} from './lesson-core.mjs';

const COPY = Object.freeze({
  en: Object.freeze({
    optional: 'Optional study', language: 'Language', level: 'Study level',
    simple: 'Simple', detailed: 'Detailed', deep: 'Deep study',
    review: 'AI-assisted draft · Claude review pending',
    introduction: 'Read these explanatory notes alongside the original above and the named sources below. Row numbers refer to positions within this complete source group.',
    rows: count => `All ${count} source rows`, row: number => `Row ${number}`,
    goToRow: (number, page) => `Read original source row ${number}, Ang ${page}`,
    sourceRows: 'Original rows', witnesses: 'Sources',
    reflection: 'Personal reflection', questions: 'Questions to consider',
    reflectionNote: 'Consider these prompts in your own life as you reread the original.',
    psychology: 'Optional psychology · open access',
    sources: 'Named sources and locations',
    announcement: (language, depth) => `${language} · ${depth}`
  }),
  pa: Object.freeze({
    optional: 'ਚੋਣਵਾਂ ਅਧਿਐਨ', language: 'ਭਾਸ਼ਾ', level: 'ਅਧਿਐਨ ਦਾ ਪੱਧਰ',
    simple: 'ਸਰਲ', detailed: 'ਵਿਸਥਾਰ', deep: 'ਡੂੰਘਾ ਅਧਿਐਨ',
    review: 'ਏਆਈ ਦੀ ਸਹਾਇਤਾ ਨਾਲ ਤਿਆਰ ਖਰੜਾ · Claude ਦੀ ਸਮੀਖਿਆ ਬਾਕੀ ਹੈ',
    introduction: 'ਇਹ ਵਿਆਖਿਆਤਮਕ ਨੋਟ ਉੱਪਰ ਦਿੱਤੇ ਮੂਲ ਪਾਠ ਅਤੇ ਹੇਠਾਂ ਦਿੱਤੇ ਹਵਾਲਿਆਂ ਨਾਲ ਪੜ੍ਹੋ। ਕਤਾਰਾਂ ਦੇ ਨੰਬਰ ਇਸ ਪੂਰੇ ਪਾਠ ਦੇ ਅੰਦਰ ਉਨ੍ਹਾਂ ਦੀ ਥਾਂ ਦੱਸਦੇ ਹਨ।',
    rows: count => `ਸਰੋਤ ਦੀਆਂ ਸਾਰੀਆਂ ${count} ਕਤਾਰਾਂ`, row: number => `ਕਤਾਰ ${number}`,
    goToRow: (number, page) => `ਮੂਲ ਪਾਠ ਦੀ ਕਤਾਰ ${number}, ਅੰਗ ${page} ਪੜ੍ਹੋ`,
    sourceRows: 'ਮੂਲ ਕਤਾਰਾਂ', witnesses: 'ਹਵਾਲੇ',
    reflection: 'ਨਿੱਜੀ ਮਨਨ', questions: 'ਵਿਚਾਰਨ ਲਈ ਸਵਾਲ',
    reflectionNote: 'ਮੂਲ ਪਾਠ ਮੁੜ ਪੜ੍ਹਦਿਆਂ ਇਨ੍ਹਾਂ ਸਵਾਲਾਂ ਨੂੰ ਆਪਣੇ ਜੀਵਨ ਦੇ ਸੰਦਰਭ ਵਿੱਚ ਵਿਚਾਰੋ।',
    psychology: 'ਚੋਣਵਾਂ ਮਨੋਵਿਗਿਆਨ · ਖੁੱਲ੍ਹਾ ਅਧਿਐਨ',
    sources: 'ਨਾਮ ਸਮੇਤ ਸਰੋਤ ਅਤੇ ਹਵਾਲੇ',
    announcement: (language, depth) => `${language} · ${depth}`
  })
});

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function button(text, action) {
  const element = node('button', '', text);
  element.type = 'button';
  element.addEventListener('click', action);
  return element;
}

function witnessLink(source) {
  const link = node('a', 'source-learning-witness', source.label);
  link.lang = 'en';
  link.href = source.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.dataset.learningSourceId = source.id;
  return link;
}

function originalRows(article, unit) {
  const originals = [...article.querySelectorAll('.source-lines [data-source-line-id]')];
  if (originals.length !== unit.lines.length) throw Error('Study original unavailable');
  const rows = new Map();
  unit.lines.forEach((line, index) => {
    const original = originals[index];
    if (original.dataset.sourceLineId !== line.id || original.dataset.sourcePage !== String(line.page)
      || original.textContent !== line.text) throw Error('Study original mismatch');
    rows.set(line.id, {original, number: index + 1, page: line.page});
  });
  return rows;
}

function buildPanel(lesson, unit, rows) {
  let language = 'en', depth = 'simple';
  const panel = node('details', 'source-learning');
  panel.dataset.lessonId = lesson.id;
  panel.dataset.lessonUnit = unit.id;
  panel.dataset.lessonRevision = String(lesson.revision);
  panel.dataset.contentKind = 'editorial';

  const summary = node('summary', 'source-learning-summary');
  const kicker = node('span', 'source-learning-kicker');
  const title = node('span', 'source-learning-title');
  const coverage = node('span', 'source-learning-coverage');
  summary.append(kicker, title, coverage);
  const review = node('p', 'source-learning-review');
  review.dataset.reviewStatus = lesson.review.status;
  review.dataset.secondReview = lesson.review.secondReview;
  const introduction = node('p', 'source-learning-introduction');
  const controls = node('div', 'source-learning-controls');
  const languages = node('fieldset', 'source-learning-language');
  const languageLegend = node('legend');
  const levels = node('fieldset', 'source-learning-levels');
  const levelLegend = node('legend');
  const content = node('div', 'source-learning-content');
  content.id = `source-learning-${unit.id}-content`;
  content.dataset.contentKind = 'editorial';
  const announcement = node('p', 'source-learning-announcement');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  languages.append(languageLegend); levels.append(levelLegend);
  const languageButtons = new Map(), levelButtons = new Map();
  for (const [value, label] of [['en', 'English'], ['pa', 'ਪੰਜਾਬੀ']]) {
    const choice = button(label, () => { language = value; render(true); });
    choice.lang = value === 'pa' ? 'pa-Guru' : 'en';
    choice.dataset.learningLanguage = value;
    choice.setAttribute('aria-controls', content.id);
    languages.append(choice); languageButtons.set(value, choice);
  }
  for (const value of ['simple', 'detailed', 'deep']) {
    const choice = button('', () => { depth = value; render(true); });
    choice.dataset.learningDepth = value;
    choice.setAttribute('aria-controls', content.id);
    levels.append(choice); levelButtons.set(value, choice);
  }
  controls.append(languages, levels);
  panel.append(summary, review, introduction, controls, announcement, content);
  const sources = new Map(lesson.sources.map(source => [source.id, source]));

  function references(paragraph, copy) {
    const refs = node('div', 'source-learning-references');
    const originals = node('div', 'source-learning-row-links');
    originals.append(node('span', 'source-learning-reference-label', copy.sourceRows + ':'));
    for (const id of paragraph.lineIds) {
      const row = rows.get(id);
      if (!row) throw Error('Study row unavailable');
      const go = button(copy.row(row.number), () => {
        if (!row.original.isConnected) return;
        row.original.scrollIntoView({block: 'start'});
        row.original.focus({preventScroll: true});
      });
      go.dataset.learningLineId = id;
      go.setAttribute('aria-label', copy.goToRow(row.number, row.page));
      originals.append(go);
    }
    refs.append(originals);
    if (paragraph.sourceIds.length) {
      const witnesses = node('div', 'source-learning-witnesses');
      witnesses.append(node('span', 'source-learning-reference-label', copy.witnesses + ':'));
      for (const id of paragraph.sourceIds) witnesses.append(witnessLink(sources.get(id)));
      refs.append(witnesses);
    }
    return refs;
  }

  function render(announce = false) {
    const copy = COPY[language];
    panel.lang = language === 'pa' ? 'pa-Guru' : 'en';
    panel.dataset.learningLanguage = language;
    panel.dataset.learningDepth = depth;
    kicker.textContent = copy.optional;
    title.textContent = lesson.title[language];
    coverage.textContent = copy.rows(unit.lines.length);
    review.textContent = copy.review;
    introduction.textContent = copy.introduction;
    languageLegend.textContent = copy.language;
    levelLegend.textContent = copy.level;
    for (const [value, choice] of languageButtons) choice.setAttribute('aria-pressed', String(language === value));
    for (const [value, choice] of levelButtons) {
      choice.textContent = copy[value];
      choice.setAttribute('aria-pressed', String(depth === value));
    }
    const fragment = document.createDocumentFragment();
    for (const section of lesson.sections) {
      const block = node('section', 'source-learning-section');
      block.dataset.learningSection = section.id;
      block.append(node('h3', '', section.title[language]));
      for (const paragraph of section[depth]) {
        const passage = node('div', 'source-learning-paragraph');
        passage.append(node('p', 'source-learning-explanation', paragraph[language]), references(paragraph, copy));
        block.append(passage);
      }
      fragment.append(block);
    }
    const reflection = node('section', 'source-learning-reflection');
    reflection.append(node('h3', '', copy.reflection), node('p', '', lesson.reflection[language]));
    if (lesson.questions.length) {
      reflection.append(node('h4', '', copy.questions));
      const questions = node('ul');
      for (const question of lesson.questions) questions.append(node('li', '', question[language]));
      reflection.append(questions);
    }
    reflection.append(node('p', 'source-learning-note', copy.reflectionNote));
    fragment.append(reflection);

    const psychology = node('section', 'source-learning-psychology');
    psychology.append(node('h3', '', copy.psychology), node('p', '', lesson.psychologyLink.note[language]));
    const psychologyLink = node('a', '', lesson.psychologyLink.title[language]);
    psychologyLink.href = lesson.psychologyLink.path;
    psychology.append(psychologyLink); fragment.append(psychology);

    const bibliography = node('section', 'source-learning-sources');
    bibliography.append(node('h3', '', copy.sources));
    const list = node('ul');
    for (const source of lesson.sources) {
      const item = node('li');
      const locator = node('p', 'source-learning-locator', source.locator); locator.lang = 'en';
      item.append(witnessLink(source), locator);
      list.append(item);
    }
    bibliography.append(list); fragment.append(bibliography);
    content.replaceChildren(fragment);
    if (announce) announcement.textContent = copy.announcement(language === 'pa' ? 'ਪੰਜਾਬੀ' : 'English', copy[depth]);
  }
  render();
  return panel;
}

export function appendLearning({article, manifest, unit}) {
  if (manifest.collectionId !== 'sggs') return;
  try {
    const lesson = lessonForUnit(manifest, unit);
    if (!lesson) return;
    const panel = buildPanel(lesson, unit, originalRows(article, unit));
    article.append(panel);
  } catch {
    const unavailable = node('p', 'source-learning-unavailable', 'Study notes are unavailable for this source group. You can keep reading the verified original text.');
    unavailable.setAttribute('role', 'status');
    article.append(unavailable);
  }
}
