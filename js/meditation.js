/* Optional, manually advanced attention prompts. No timer, storage or sacred inputs. */
(() => {
  'use strict';
  if (document.documentElement.dataset.contentLayer !== 'meditation-room') return;
  const byId = id => document.getElementById(id);
  const room = byId('natural-attention');
  const setup = byId('attention-setup');
  const panel = byId('attention-panel');
  const start = byId('attention-start');
  const heading = byId('attention-heading');
  const instruction = byId('attention-instruction');
  const support = byId('attention-support');
  const anchorLabel = byId('attention-anchor-label');
  const back = byId('attention-back');
  const next = byId('attention-next');
  const end = byId('attention-end');
  const status = byId('attention-state');
  if (![room, setup, panel, start, heading, instruction, support, anchorLabel, back, next, end, status].every(Boolean)) return;

  // Original app guidance. This short introduction is not a translation of MN 118.
  const guides = Object.freeze({
    breath: Object.freeze([
      Object.freeze({title: 'Arrive as you are.', text: 'Find a position that feels supported. Your eyes can stay open.', support: 'There is no special posture to achieve. Stay with this prompt for as long as you wish.'}),
      Object.freeze({title: 'Let the breath be.', text: 'Let your breathing find its own pace. Notice where a breath is easiest to feel.', support: 'You do not need to take a bigger breath or match a count. If this feels uncomfortable, end the guide and choose surroundings instead.'}),
      Object.freeze({title: 'Notice, then return.', text: 'When your attention wanders, notice that and gently return to the sensation of breathing.', support: 'Wandering is something to notice. You do not need to empty your mind.'}),
      Object.freeze({title: 'Make a little room.', text: 'Rest here with breathing as it is, while also noticing the support beneath you.', support: 'Nothing needs to change. You can continue, go back, or end whenever you choose.'}),
      Object.freeze({title: 'Return to your day.', text: 'Notice the space around you. Let your attention open out and take your time before moving on.', support: 'Choose Finish when you are ready. Nothing about this practice is recorded.'})
    ]),
    surroundings: Object.freeze([
      Object.freeze({title: 'Arrive as you are.', text: 'Find a position that feels supported. Keep your eyes open if that feels comfortable.', support: 'Your breathing can take care of itself. Stay with this prompt for as long as you wish.'}),
      Object.freeze({title: 'Notice some support.', text: 'Notice the contact of your feet, your seat, or your hands with a surface.', support: 'Choose whichever point of contact is comfortable to notice. You can end at any time.'}),
      Object.freeze({title: 'Let the room be here.', text: 'Rest your attention on a steady shape nearby, or on a sound you can hear.', support: 'There is no need to search for a particular sound or feeling. Choose what is available and comfortable.'}),
      Object.freeze({title: 'Gently return.', text: 'If your attention wanders, return to your chosen contact, sight or sound.', support: 'You can choose a different anchor, go back, or end. There is no result to achieve.'}),
      Object.freeze({title: 'Return to your day.', text: 'Take in the space around you. Choose when you are ready to move on.', support: 'Choose Finish when you are ready. Nothing about this practice is recorded.'})
    ])
  });
  let activeGuide = null;
  let step = 0;

  function showPrompt() {
    const prompt = activeGuide[step];
    heading.textContent = prompt.title;
    instruction.textContent = prompt.text;
    support.textContent = prompt.support;
    back.disabled = step === 0;
    next.textContent = step === activeGuide.length - 1 ? 'Finish' : 'Continue';
    heading.focus();
  }

  function finish(message, restoreFocus) {
    if (!activeGuide) return;
    activeGuide = null;
    step = 0;
    panel.hidden = true;
    setup.hidden = false;
    room.dataset.state = 'idle';
    heading.textContent = '';
    instruction.textContent = '';
    support.textContent = '';
    status.textContent = message;
    if (restoreFocus) start.focus();
  }

  start.addEventListener('click', () => {
    if (activeGuide || document.hidden) return;
    const selection = document.querySelector('input[name="attention-anchor"]:checked');
    const anchor = selection?.value;
    if (anchor !== 'breath' && anchor !== 'surroundings') return;
    activeGuide = guides[anchor];
    step = 0;
    setup.hidden = true;
    panel.hidden = false;
    room.dataset.state = 'active';
    anchorLabel.textContent = anchor === 'breath' ? 'Natural-breath attention' : 'Attention to surroundings';
    status.textContent = '';
    showPrompt();
  });

  back.addEventListener('click', () => {
    if (!activeGuide || step === 0) return;
    step -= 1;
    showPrompt();
  });
  next.addEventListener('click', () => {
    if (!activeGuide) return;
    if (step === activeGuide.length - 1) {
      finish('The guide has ended. Take your time before moving on.', true);
      return;
    }
    step += 1;
    showPrompt();
  });
  end.addEventListener('click', () => finish('The guide has ended. Begin again whenever you choose.', true));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && activeGuide) {
      event.preventDefault();
      finish('The guide has ended. Begin again whenever you choose.', true);
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) finish('The guide ended while the page was hidden. Begin again whenever you choose.', false);
  });
  window.addEventListener('pagehide', () => finish('The guide ended when you left the page. Begin again whenever you choose.', false));
  start.disabled = false;
  status.textContent = 'Ready whenever you are. Nothing is recorded.';
})();
