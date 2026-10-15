// Preferred Stimuli: the full-screen viewer.
(() => {
  'use strict';

  const works = window.WORKS || [];
  const total = works.length;
  const bySlug = new Map(works.map((w) => [w.slug, w]));
  const $ = (id) => document.getElementById(id);
  const MICROSCOPE = 'https://already-clean.goodfire.com/microscope/medium.html';
  const number = new Intl.NumberFormat('en-US');

  const viewer = $('viewer');
  let current = null;

  const section = (w) => (w.room === 'literal' ? 'Literal' : 'Abstract');
  const sees = (w) => (w.rf >= 224 ? 'Sees the whole image' : `Sees a patch ${w.rf} pixels wide`);

  function render(w) {
    current = w;
    viewer.dataset.room = w.room;
    $('v-where').textContent = `${section(w)}, ${w.no} of ${total}`;

    const img = $('v-img');
    img.src = `assets/works/${w.slug}.webp`;
    img.alt = w.alt;

    $('v-title').textContent = w.title;
    $('v-neuron').textContent = `Stage ${w.stage}, block ${w.block}, neuron ${w.unit} of ${number.format(w.of)}`;
    $('v-sees').textContent = sees(w);
    $('v-desc').textContent = w.desc;

    $('v-photos').replaceChildren(...w.life.map((label, i) => {
      const li = document.createElement('li');
      const photo = document.createElement('img');
      photo.src = `assets/life/${w.slug}-${i + 1}.jpg`;
      photo.alt = '';
      photo.width = 192;
      photo.height = 192;
      const caption = document.createElement('span');
      caption.textContent = label;
      li.append(photo, caption);
      return li;
    }));

    $('v-src').href = `${MICROSCOPE}?layer=${encodeURIComponent(w.layer)}&neuron=${w.unit}&view=fv`;

    const i = w.no - 1;
    const prev = works[(i - 1 + total) % total];
    const next = works[(i + 1) % total];
    $('v-prev').textContent = `← ${prev.title}`;
    $('v-prev').setAttribute('aria-label', `Previous: ${prev.title}`);
    $('v-next').textContent = `${next.title} →`;
    $('v-next').setAttribute('aria-label', `Next: ${next.title}`);
  }

  function open(slug) {
    const w = bySlug.get(slug);
    if (!w) return;
    render(w);
    if (!viewer.open) {
      viewer.showModal();
      document.body.classList.add('is-viewing');
    }
    viewer.scrollTop = 0;
  }

  function step(delta) {
    if (!current) return;
    const i = current.no - 1;
    render(works[(i + delta + total) % total]);
    viewer.scrollTop = 0;
  }

  document.addEventListener('click', (event) => {
    const opener = event.target.closest('.work-open');
    if (opener) open(opener.dataset.slug);
  });

  $('v-close').addEventListener('click', () => viewer.close());
  $('v-prev').addEventListener('click', () => step(-1));
  $('v-next').addEventListener('click', () => step(1));

  viewer.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
  });

  // After closing, scroll to the last work viewed if it's off screen and focus it.
  viewer.addEventListener('close', () => {
    document.body.classList.remove('is-viewing');
    const button = current && document.querySelector(`.work-open[data-slug="${current.slug}"]`);
    if (!button) return;
    const box = button.getBoundingClientRect();
    if (box.bottom < 0 || box.top > window.innerHeight) {
      button.scrollIntoView({ block: 'center' });
    }
    button.focus({ preventScroll: true });
  });
})();
