/* Silent on-screen guidance. Patterns are allowlisted; all state is transient. */
(() => {
  'use strict';
  const contract = window.GLP_BREATHING;
  const root = document.documentElement;
  if (!contract || root.dataset.contentLayer !== contract.spec.kind || root.dataset.practiceKind !== contract.spec.practice) return;
  const $ = id => document.getElementById(id);
  const stage = $('pacer-stage'), card = $('pacer-card'), orb = $('pacer-orb'), dot = $('box-dot');
  const phase = $('phase'), detail = $('phase-detail'), count = $('phase-count'), state = $('breathing-state');
  const start = $('breathing-start'), pause = $('breathing-pause'), stop = $('breathing-stop');
  const patternSelect = $('breathing-pattern'), paceSelect = $('breathing-pace'), motion = $('show-motion');
  const patternButtons = [...document.querySelectorAll('[data-pattern].practice-choice')];
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const notes = Object.freeze({
    even: Object.freeze({description: 'Give the in-breath and out-breath equal space, with no holding.', evidence: 'Researchers have studied this rhythm. Changes in heart-rate variability do not guarantee that you will feel calmer.'}),
    'longer-exhale': Object.freeze({description: 'Let the out-breath take a little longer, without pushing the air out.', evidence: 'This is another studied rhythm. A longer out-breath is an option, not a requirement or a promise of greater benefit.'}),
    box: Object.freeze({description: 'Four equal phases: breathe in, hold, breathe out, hold. The holds are always optional.', evidence: 'A small 2026 laboratory trial found less stress reactivity with box breathing. That does not establish lasting benefits or an ideal pattern for everyone.'})
  });
  const phaseNames = Object.freeze({in: 'In', out: 'Out', 'hold-in': 'Hold', 'hold-out': 'Hold'});
  let pattern = contract.getPattern(), running = false, animation = null, startedAt = 0, lastTick = 0, lastPhase = '', lastSecond = -1;
  let sequence = [];

  function cancelFrame() {
    if (animation !== null) window.cancelAnimationFrame(animation);
    animation = null;
  }

  function setMotion() {
    motion.disabled = preference.matches;
    $('motion-note').hidden = !preference.matches;
    stage.dataset.motion = motion.checked && !preference.matches ? 'on' : 'off';
  }

  function finish(message = 'Stopped. Return to your normal breathing whenever you choose.', paused = false) {
    running = false;
    cancelFrame();
    lastPhase = ''; lastSecond = -1;
    stage.dataset.state = paused ? 'paused' : 'ready';
    delete stage.dataset.phase;
    orb.style.transform = 'scale(.66)';
    dot.setAttribute('cx', '7'); dot.setAttribute('cy', '7');
    phase.textContent = paused ? 'Breathe naturally' : 'Ready when you are';
    detail.textContent = paused ? 'Restart when comfortable' : 'No need to follow a pace';
    count.textContent = '';
    sequence.forEach(item => item.removeAttribute('aria-current'));
    start.hidden = false;
    start.textContent = paused ? 'Restart breathing guide' : 'Begin breathing guide';
    pause.hidden = true; stop.hidden = !paused;
    state.textContent = message;
  }

  function focusView(enabled) {
    root.dataset.focusGuide = enabled ? 'on' : 'off';
    $('focus-guide').setAttribute('aria-pressed', String(enabled));
    $('focus-guide').textContent = enabled ? 'Leave focus view' : 'Focus view';
  }

  function updatePattern(message) {
    finish(message || 'Ready. Begin this pattern only while it feels comfortable.');
    try {
      pattern = contract.getPattern(patternSelect.value, paceSelect.value);
    } catch {
      start.disabled = true;
      state.textContent = 'Choose one of the available patterns and paces before beginning.';
      return;
    }
    start.disabled = false;
    stage.dataset.pattern = pattern.id;
    $('pattern-title').textContent = pattern.name;
    $('pattern-description').textContent = notes[pattern.id].description;
    $('pattern-evidence').textContent = notes[pattern.id].evidence;
    $('hold-notice').hidden = !pattern.hasHolds;
    start.setAttribute('aria-describedby', pattern.hasHolds ? 'comfort caution hold-notice' : 'comfort caution');
    $('skip-holds').hidden = !pattern.hasHolds;
    patternButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.pattern === pattern.id)));
    $('pace-label').textContent = pattern.phases.map(part => `${part.durationMs / 1000} seconds ${phaseNames[part.kind].toLowerCase()}`).join(' · ') + (pattern.hasHolds ? ' · Includes holds' : ' · No holds');
    $('pace-adaptation').textContent = pattern.adapted
      ? 'Shorter phases are a comfort adaptation, not the exact timing tested in the comparison study. Stop if this still feels strained.'
      : 'The standard timings have been studied. No single pace suits everyone.';
    $('phase-sequence').replaceChildren(...pattern.phases.map(part => {
      const item = document.createElement('li'), duration = document.createElement('span');
      item.append(document.createTextNode(phaseNames[part.kind] + ' '));
      duration.textContent = part.durationMs / 1000 + 's'; item.append(duration);
      if (part.kind === 'hold-in') item.setAttribute('aria-label', 'Hold after inhaling, ' + part.durationMs / 1000 + ' seconds');
      if (part.kind === 'hold-out') item.setAttribute('aria-label', 'Hold after exhaling, ' + part.durationMs / 1000 + ' seconds');
      return item;
    }));
    sequence = [...$('phase-sequence').children];
  }

  function render(now) {
    if (!running) return;
    // A suspended or stalled screen must never jump into a missed hold.
    if (now - lastTick > 1500) {
      finish('The guide stopped after an interruption. Breathe naturally, then begin again if you choose.');
      return;
    }
    lastTick = now;
    const value = contract.frame(now - startedAt, pattern);
    stage.dataset.phase = value.phase;
    if (stage.dataset.motion === 'on') {
      orb.style.transform = 'scale(' + value.scale.toFixed(5) + ')';
      if (pattern.id === 'box') {
        dot.setAttribute('cx', String(7 + 86 * value.boxX));
        dot.setAttribute('cy', String(7 + 86 * value.boxY));
      }
    }
    if (lastSecond !== value.remainingSeconds) {
      count.textContent = String(value.remainingSeconds);
      lastSecond = value.remainingSeconds;
    }
    if (lastPhase !== value.phase) {
      phase.textContent = value.label;
      detail.textContent = value.phase.startsWith('hold') ? 'Only while comfortable' : value.phase === 'in' ? 'A gentle, ordinary breath' : 'Let the air leave gently';
      sequence.forEach((item, index) => index === value.phaseIndex ? item.setAttribute('aria-current', 'step') : item.removeAttribute('aria-current'));
      lastPhase = value.phase;
    }
    animation = window.requestAnimationFrame(render);
  }

  motion.checked = !preference.matches; setMotion();
  motion.addEventListener('change', setMotion);
  preference.addEventListener('change', () => { if (preference.matches) motion.checked = false; setMotion(); });
  patternSelect.disabled = false; paceSelect.disabled = false; $('focus-guide').disabled = false;
  patternButtons.forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => {
      patternSelect.value = button.dataset.pattern;
      updatePattern('Pattern changed. The guide is stopped; begin again when comfortable.');
    });
  });
  patternSelect.addEventListener('change', () => updatePattern('Pattern changed. The guide is stopped; begin again when comfortable.'));
  paceSelect.addEventListener('change', () => updatePattern('Pace changed. The guide is stopped; begin again when comfortable.'));
  $('focus-guide').addEventListener('click', () => { focusView(root.dataset.focusGuide !== 'on'); card.scrollIntoView({block: 'start', behavior: 'instant'}); });
  $('skip-holds').addEventListener('click', () => {
    patternSelect.value = 'even'; paceSelect.value = 'shorter';
    updatePattern('Switched to even breathing: 4 seconds in, 4 out, with no holds. Breathe normally; begin again only if you choose.');
    start.focus({preventScroll: true});
  });
  start.addEventListener('click', () => {
    if (running || document.hidden || start.disabled) return;
    running = true;
    startedAt = performance.now(); lastTick = startedAt; lastPhase = ''; lastSecond = -1;
    stage.dataset.state = 'running';
    start.hidden = true; pause.hidden = false; stop.hidden = false;
    $('guide-settings').open = false;
    state.textContent = 'Follow only while comfortable. Stop or pause whenever you choose.';
    // On a phone, bring the cue and its adjacent Stop/no-hold controls together
    // into view; the longer preparation copy must not push Stop below the screen.
    (window.matchMedia('(max-width: 850px)').matches ? stage : card).scrollIntoView({block: 'start', behavior: 'instant'});
    stop.focus({preventScroll: true});
    render(startedAt);
  });
  pause.addEventListener('click', () => {
    finish('Guide paused. Breathe normally. Restart begins with a fresh in-breath, never halfway through a hold.', true);
    start.focus({preventScroll: true});
  });
  stop.addEventListener('click', () => { finish(); start.focus({preventScroll: true}); });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    if (running || stage.dataset.state === 'paused') { finish(); start.focus({preventScroll: true}); }
    if (root.dataset.focusGuide === 'on') focusView(false);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && (running || stage.dataset.state === 'paused')) finish('Stopped when this page was hidden. Begin again only if you choose.');
  });
  window.addEventListener('pagehide', () => finish('Stopped when you left this page. Begin again only if you choose.'));
  window.addEventListener('pageshow', event => { if (event.persisted) finish('Ready. Begin again only if you choose.'); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      if (!running || entries.every(entry => entry.isIntersecting)) return;
      const bounds = stage.getBoundingClientRect();
      if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) finish('The guide stopped when it moved off screen. Breathe normally; begin again if you choose.');
    }).observe(stage);
  }
  updatePattern('Ready. The guide is silent and saves nothing.');
})();
