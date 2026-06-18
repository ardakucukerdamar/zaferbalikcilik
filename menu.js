/* =====================================================================
   MENU PAGE — search, filter, sticky toolbar, active category tracking
   ===================================================================== */
(() => {
  'use strict';
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));

  /* ------------------- TOOLBAR STUCK STATE ------------------- */
  const toolbar = $('#mToolbar');
  if (toolbar) {
    const onScroll = () => {
      toolbar.classList.toggle('stuck', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------- CATEGORY ACTIVE TRACK ------------------- */
  const catLinks = $$('#mCats a');
  const cats = catLinks.map(a => ({
    link: a,
    sec: document.querySelector(a.getAttribute('href')),
  })).filter(x => x.sec);

  const scrollCatIntoView = (link) => {
    const wrap = $('#mCats');
    if (!wrap || !link) return;
    const r = link.getBoundingClientRect();
    const wr = wrap.getBoundingClientRect();
    if (r.left < wr.left + 12 || r.right > wr.right - 12) {
      wrap.scrollTo({
        left: link.offsetLeft - wrap.clientWidth / 2 + link.offsetWidth / 2,
        behavior: 'smooth'
      });
    }
  };

  const trackActive = () => {
    const probe = window.scrollY + 200;
    let active = cats[0];
    for (const c of cats) {
      if (c.sec.offsetTop <= probe) active = c;
    }
    catLinks.forEach(l => l.classList.toggle('active', l === active.link));
    scrollCatIntoView(active.link);
  };
  window.addEventListener('scroll', trackActive, { passive: true });
  trackActive();

  /* ------------------- SMOOTH SCROLL FOR CATEGORY LINKS ------------------- */
  catLinks.forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const toolbarH = toolbar ? toolbar.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - toolbarH - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ------------------- FILTER CHIPS ------------------- */
  const chips = $$('.m-chip');
  let activeFilter = 'all';
  let activeSearch = '';

  const applyFilter = () => {
    const items = $$('.m-item, .mf-card');
    const q = activeSearch.toLowerCase().trim();

    items.forEach(item => {
      const tags = (item.dataset.tags || '').toLowerCase();
      const text = item.textContent.toLowerCase();
      const tagMatch = activeFilter === 'all' || tags.includes(activeFilter);
      const searchMatch = !q || text.includes(q);
      item.classList.toggle('hidden', !(tagMatch && searchMatch));
    });

    // Hide empty categories
    $$('.m-cat').forEach(cat => {
      const visible = $$('.m-item, .mf-card', cat).filter(it => !it.classList.contains('hidden'));
      cat.style.display = (visible.length === 0 && (q || activeFilter !== 'all')) ? 'none' : '';
    });
  };

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.toggle('active', c === chip));
      activeFilter = chip.dataset.filter;
      applyFilter();
    });
  });

  /* ------------------- SEARCH ------------------- */
  const search = $('#mSearch');
  const searchClear = $('#mSearchClear');
  if (search) {
    search.addEventListener('input', () => {
      activeSearch = search.value;
      searchClear.hidden = !activeSearch;
      applyFilter();
    });
    searchClear?.addEventListener('click', () => {
      search.value = '';
      activeSearch = '';
      searchClear.hidden = true;
      applyFilter();
      search.focus();
    });
  }

  /* ------------------- BACK-TO-TOP ------------------- */
  const topBtn = $('#mTopBtn');
  topBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ------------------- PWA REGISTER ------------------- */
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
})();
