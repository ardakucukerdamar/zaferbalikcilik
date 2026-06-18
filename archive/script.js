/* =====================================================================
   ZAFER BALIKÇILIK ARTUR — Interactions
   Lenis-style lerp scroll · canvas water · splittext · magnetic cursor
   ===================================================================== */
(() => {
  'use strict';

  const $  = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => Array.from(ctx.querySelectorAll(s));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = matchMedia('(hover:hover) and (pointer:fine) and (min-width: 1100px)').matches;

  /* ===================================================================
     CINEMATIC PRELOADER
     =================================================================== */
  document.body.classList.add('loading');
  const loaderCount = $('#loaderCount');
  let loaderTick = 0;
  const loaderInterval = setInterval(() => {
    loaderTick = Math.min(99, loaderTick + Math.ceil(Math.random() * 9));
    if (loaderCount) loaderCount.textContent = String(loaderTick).padStart(2, '0');
    if (loaderTick >= 99) clearInterval(loaderInterval);
  }, 90);
  requestAnimationFrame(() => document.body.classList.add('preload-tick'));

  const finishLoader = () => {
    if (loaderCount) loaderCount.textContent = '100';
    clearInterval(loaderInterval);
    setTimeout(() => {
      document.body.classList.remove('loading');
      document.body.classList.add('loaded');
    }, 400);
  };
  if (document.readyState === 'complete') setTimeout(finishLoader, 900);
  else window.addEventListener('load', () => setTimeout(finishLoader, 900));

  /* ===================================================================
     FOOTER YEAR
     =================================================================== */
  const yEl = $('#yil');
  if (yEl) yEl.textContent = new Date().getFullYear();

  /* ===================================================================
     HEADER SCROLL STATE + PROGRESS
     =================================================================== */
  const header = $('#header');
  const progress = $('#scrollProgress i');
  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('scrolled', y > 40);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ===================================================================
     LIVE STATUS PILL
     =================================================================== */
  const liveEl = $('#liveStatus');
  const refreshLive = () => {
    if (!liveEl) return;
    const now = new Date();
    const min = now.getHours() * 60 + now.getMinutes();
    const open = 8 * 60, close = 21 * 60;
    const txt = liveEl.querySelector('.live-text');
    if (min >= open && min < close) {
      liveEl.classList.remove('closed');
      txt.textContent = "Açık · 21:00'a kadar";
    } else {
      liveEl.classList.add('closed');
      txt.textContent = min < open ? "Kapalı · 08:00'da açılır" : "Kapalı · Yarın 08:00'da";
    }
  };
  refreshLive();
  setInterval(refreshLive, 60_000);

  /* ===================================================================
     MOBILE PANEL
     =================================================================== */
  const burger = $('#burger');
  const panel = $('#panel');
  const closePanel = () => {
    burger?.classList.remove('open');
    panel?.classList.remove('open');
    burger?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  };
  burger?.addEventListener('click', () => {
    const open = !panel.classList.contains('open');
    burger.classList.toggle('open', open);
    panel.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('no-scroll', open);
  });
  $$('#panel a').forEach(a => a.addEventListener('click', closePanel));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

  /* ===================================================================
     REVEAL ON SCROLL
     =================================================================== */
  const revealItems = $$('[data-fade], .reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.style.opacity = '';
          en.target.style.transform = '';
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealItems.forEach(el => io.observe(el));
  }

  /* ===================================================================
     SPLIT-WORDS MANIFESTO REVEAL
     =================================================================== */
  const wordsEl = $('[data-words]');
  if (wordsEl && !reduce) {
    const text = wordsEl.innerHTML;
    // Wrap each whitespace-separated chunk with a span; preserve <em>
    const wrapped = text
      .replace(/<em>/g, '<em>')
      .replace(/<\/em>/g, '</em>')
      .split(/(\s+)/)
      .map(chunk => {
        if (!chunk.trim()) return chunk;
        if (chunk.includes('<em>')) return `<span class="mw">${chunk}</span>`;
        return `<span class="mw">${chunk}</span>`;
      })
      .join('')
      .replace(//g, '');
    wordsEl.innerHTML = wrapped;

    // Inline starting styles (avoid extra CSS rules)
    const wordEls = $$('.mw', wordsEl);
    wordEls.forEach(w => {
      w.style.display = 'inline-block';
      w.style.opacity = '.18';
      w.style.transition = 'opacity .8s ease, color .8s ease';
    });

    const onWordsScroll = () => {
      const rect = wordsEl.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.85;
      const end   = vh * 0.15;
      const total = wordEls.length;
      const top = rect.top;
      const p = (start - top) / (start - end);
      const litCount = Math.max(0, Math.min(total, Math.floor(p * total)));
      wordEls.forEach((w, i) => {
        w.style.opacity = i < litCount ? '1' : '.18';
      });
    };
    window.addEventListener('scroll', onWordsScroll, { passive: true });
    onWordsScroll();
  }

  /* ===================================================================
     ANIMATED COUNTERS
     =================================================================== */
  const counters = $$('[data-count]');
  const animateCount = el => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1500;
    const start = performance.now();
    const tick = now => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      el.textContent = (decimals > 0 ? val.toFixed(decimals) : Math.round(val)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = (decimals > 0 ? target.toFixed(decimals) : target) + suffix;
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const cio = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: .5 });
    counters.forEach(c => cio.observe(c));
  } else counters.forEach(animateCount);

  /* ===================================================================
     PARALLAX (mouse + scroll)
     =================================================================== */
  const parallaxEls = $$('[data-parallax]');
  if (!reduce && parallaxEls.length) {
    const onScrollPx = () => {
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || .1;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        el.style.transform = `translate3d(0, ${-center * speed}px, 0)`;
      });
    };
    window.addEventListener('scroll', onScrollPx, { passive: true });
    onScrollPx();
  }

  /* ===================================================================
     CUSTOM CURSOR + MAGNETIC + LABEL
     =================================================================== */
  const cursor = $('#cursor');
  const cursorLabel = $('#cursorLabel');
  if (cursor && isDesktop) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    const dot  = $('.cursor-dot', cursor);
    const ring = $('.cursor-ring', cursor);
    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      if (dot)  dot.style.transform  = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      if (ring) ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      if (cursorLabel) cursorLabel.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, calc(-50% + 56px))`;
      requestAnimationFrame(loop);
    };
    loop();

    const setHover = (on, label) => {
      cursor.classList.toggle('hover', on);
      cursor.classList.toggle('label', !!(on && label));
      if (cursorLabel) cursorLabel.textContent = label || '';
    };
    $$('a, button, .ga, [data-cursor], [data-tilt]').forEach(el => {
      const label = el.dataset.cursor;
      el.addEventListener('mouseenter', () => setHover(true, label));
      el.addEventListener('mouseleave', () => setHover(false, ''));
    });

    // detect dark sections for inverse cursor
    const darkSections = ['.hero', '.mutfak', '.ctabar', '.footer', '.panel'];
    const darkObserver = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting && en.intersectionRatio > 0.5) {
          cursor.classList.add('dark');
        }
      });
    }, { threshold: [0.5] });
    darkSections.forEach(sel => { const s = $(sel); if (s) darkObserver.observe(s); });

    let lastInDark = false;
    const trackDark = () => {
      const cy = my;
      let dark = false;
      darkSections.forEach(sel => {
        const s = $(sel);
        if (!s) return;
        const r = s.getBoundingClientRect();
        if (cy >= r.top && cy <= r.bottom) dark = true;
      });
      if (dark !== lastInDark) {
        cursor.classList.toggle('dark', dark);
        lastInDark = dark;
      }
    };
    document.addEventListener('mousemove', trackDark);
  }

  /* ===================================================================
     MAGNETIC BUTTONS
     =================================================================== */
  if (isDesktop && !reduce) {
    $$('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - r.left - r.width / 2;
        const dy = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${dx * 0.18}px, ${dy * 0.25}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ===================================================================
     3D TILT CARDS
     =================================================================== */
  if (isDesktop && !reduce) {
    $$('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(1000px) rotateX(${-y * 5}deg) rotateY(${x * 7}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  /* ===================================================================
     CANVAS — WATER SURFACE + DRIFTING FISH SILHOUETTES
     =================================================================== */
  const canvas = $('#heroCanvas');
  if (canvas && !reduce) {
    const ctx = canvas.getContext('2d');
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    let W = 0, H = 0;
    const resize = () => {
      W = canvas.clientWidth = canvas.offsetWidth;
      H = canvas.clientHeight = canvas.offsetHeight;
      canvas.width  = W * DPR;
      canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Wave layers (multiple sine waves)
    const waves = [
      { y: 0.65, amp: 14, len: 280, speed: 0.0008, color: 'rgba(201,163,107,0.16)' },
      { y: 0.74, amp: 22, len: 420, speed: 0.0006, color: 'rgba(201,163,107,0.10)' },
      { y: 0.82, amp: 30, len: 540, speed: 0.0004, color: 'rgba(246,239,225,0.06)' },
    ];

    // Drifting fish silhouettes
    const fishCount = 6;
    const fishes = Array.from({ length: fishCount }, (_, i) => ({
      x: Math.random() * W,
      y: (0.55 + Math.random() * 0.35),
      size: 0.5 + Math.random() * 1.1,
      speed: 0.18 + Math.random() * 0.32,
      phase: Math.random() * Math.PI * 2,
      flip: Math.random() < 0.5,
    }));

    // Bubbles
    const bubbles = Array.from({ length: 30 }, () => ({
      x: Math.random() * W,
      y: H + Math.random() * H,
      r: 1 + Math.random() * 2.5,
      speed: 0.25 + Math.random() * 0.6,
      drift: (Math.random() - 0.5) * 0.3,
      a: 0.1 + Math.random() * 0.35,
    }));

    const drawWave = (t, w) => {
      ctx.beginPath();
      const baseY = H * w.y;
      ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 8) {
        const y = baseY + Math.sin(x / w.len + t * w.speed) * w.amp + Math.sin(x / (w.len * 0.5) + t * w.speed * 1.8) * (w.amp * 0.3);
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.closePath();
      ctx.fillStyle = w.color;
      ctx.fill();
    };

    const drawFish = (f, t) => {
      const x = ((f.x + t * f.speed * 0.08) % (W + 200)) - 100;
      const yWave = H * f.y + Math.sin(t * 0.0009 + f.phase) * 8;
      const size = 36 * f.size;
      ctx.save();
      ctx.translate(x, yWave);
      if (f.flip) ctx.scale(-1, 1);
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = '#c9a36b';
      // body
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.5, size * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();
      // tail
      ctx.beginPath();
      ctx.moveTo(-size * 0.45, 0);
      ctx.lineTo(-size * 0.7, -size * 0.18);
      ctx.lineTo(-size * 0.7, size * 0.18);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawBubble = (b, t) => {
      b.y -= b.speed;
      b.x += Math.sin(t * 0.001 + b.y * 0.01) * b.drift;
      if (b.y < -10) { b.y = H + 10; b.x = Math.random() * W; }
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(246,239,225,${b.a})`;
      ctx.fill();
    };

    let raf = 0, last = 0;
    const draw = (t) => {
      ctx.clearRect(0, 0, W, H);
      bubbles.forEach(b => drawBubble(b, t));
      fishes.forEach(f => drawFish(f, t));
      waves.forEach(w => drawWave(t, w));
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    // Pause when off-screen
    const heroSec = $('.hero');
    if (heroSec && 'IntersectionObserver' in window) {
      const heroIO = new IntersectionObserver(entries => {
        entries.forEach(en => {
          if (en.isIntersecting && !raf) raf = requestAnimationFrame(draw);
          else if (!en.isIntersecting && raf) { cancelAnimationFrame(raf); raf = 0; }
        });
      }, { threshold: 0 });
      heroIO.observe(heroSec);
    }
  }

  /* ===================================================================
     RESERVATION MODAL
     =================================================================== */
  const modal = $('#reserveModal');
  const openModal = () => {
    if (!modal) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    const dateInput = modal.querySelector('input[name="date"]');
    if (dateInput && !dateInput.value) {
      const t = new Date();
      const iso = t.toISOString().split('T')[0];
      dateInput.min = iso;
      dateInput.value = iso;
    }
    setTimeout(() => modal.querySelector('input[name="name"]')?.focus(), 350);
  };
  const closeModal = () => {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  };
  $$('.js-open-reserve').forEach(b => b.addEventListener('click', openModal));
  $$('.js-close-reserve').forEach(b => b.addEventListener('click', closeModal));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal?.classList.contains('open')) closeModal();
  });

  const form = $('#reserveForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const data = new FormData(form);
      const lines = [
        '*Rezervasyon Talebi — Zafer Balıkçılık Artur*',
        '—',
        `Ad      : ${data.get('name')}`,
        `Tarih   : ${data.get('date')}`,
        `Saat    : ${data.get('time')}`,
        `Kişi    : ${data.get('people')}`,
        `Telefon : ${data.get('phone')}`,
      ];
      const note = String(data.get('note') || '').trim();
      if (note) lines.push(`Not     : ${note}`);
      const msg = encodeURIComponent(lines.join('\n'));
      window.open(`https://wa.me/905327985244?text=${msg}`, '_blank', 'noopener');
    });
  }

  /* ===================================================================
     LIGHTBOX
     =================================================================== */
  const lb = $('#lightbox');
  if (lb) {
    const lbImg = $('#lbImg');
    const lbCap = $('#lbCap');
    const lbIdx = $('#lbIdx');
    const lbTot = $('#lbTotal');
    const triggers = $$('.ga');
    if (lbTot) lbTot.textContent = String(triggers.length);
    let idx = 0;

    const set = i => {
      idx = (i + triggers.length) % triggers.length;
      const t = triggers[idx];
      lbImg.src = t.dataset.img;
      lbImg.alt = t.dataset.cap || '';
      if (lbCap) lbCap.textContent = t.dataset.cap || '';
      if (lbIdx) lbIdx.textContent = String(idx + 1);
    };
    const open = i => {
      set(i);
      lb.classList.add('open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
    };
    const close = () => {
      lb.classList.remove('open');
      lb.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
    };
    triggers.forEach((t, i) => t.addEventListener('click', () => open(i)));
    $('.lb-close', lb)?.addEventListener('click', close);
    $('.lb-prev', lb)?.addEventListener('click', () => set(idx - 1));
    $('.lb-next', lb)?.addEventListener('click', () => set(idx + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') set(idx - 1);
      if (e.key === 'ArrowRight') set(idx + 1);
    });
  }

  /* ===================================================================
     DEFTER (testimonial) carousel arrows
     =================================================================== */
  const dt = $('#defterTrack');
  if (dt) {
    const prev = $('.dc-prev');
    const next = $('.dc-next');
    const step = () => dt.firstElementChild ? dt.firstElementChild.getBoundingClientRect().width + 22 : 360;
    prev?.addEventListener('click', () => dt.scrollBy({ left: -step(), behavior: 'smooth' }));
    next?.addEventListener('click', () => dt.scrollBy({ left:  step(), behavior: 'smooth' }));
  }

  /* ===================================================================
     SMOOTH ANCHOR
     =================================================================== */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const rect = target.getBoundingClientRect();
      const top = window.scrollY + rect.top - 60;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ===================================================================
     CALENDAR — highlight current month
     =================================================================== */
  const calGrid = $('#calGrid');
  if (calGrid) {
    const month = new Date().getMonth(); // 0..11
    $$('.cal-head span[data-m]', calGrid).forEach(s => {
      if (Number(s.dataset.m) === month) s.classList.add('now-month');
    });
    $$('.cal-row', calGrid).forEach(row => {
      const cells = $$('i', row);
      if (cells[month]) cells[month].classList.add('now');
    });
    // Update the "şu an" pill in rhythm timeline based on current hour
    const hr = new Date().getHours();
    const rlItems = $$('.rhythm-line li');
    let bestIdx = -1;
    const targetHours = [6, 8, 11, 14, 17, 19, 21];
    for (let i = 0; i < targetHours.length; i++) {
      if (hr >= targetHours[i]) bestIdx = i;
    }
    rlItems.forEach((li, i) => {
      const dot = li.querySelector('.rl-dot');
      const now = li.querySelector('.rl-now');
      if (i === bestIdx) {
        dot?.classList.add('rl-dot-active');
        if (!now) {
          const span = document.createElement('span');
          span.className = 'rl-now';
          span.textContent = 'şu an';
          li.querySelector('.rl-body')?.appendChild(span);
        }
      } else {
        dot?.classList.remove('rl-dot-active');
        now?.remove();
      }
    });
  }

  /* ===================================================================
     FAQ — only one open at a time
     =================================================================== */
  const faqItems = $$('.faq-item');
  faqItems.forEach(item => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach(o => { if (o !== item) o.open = false; });
      }
    });
  });

  /* ===================================================================
     HERO TITLE — character shimmer on hover
     =================================================================== */
  const heroTitle = $('.hero-title');
  if (heroTitle && isDesktop && !reduce) {
    $$('.word', heroTitle).forEach(word => {
      const original = word.textContent;
      const chars = [...original].map(ch => {
        const span = document.createElement('span');
        span.className = 'hch';
        span.textContent = ch === ' ' ? ' ' : ch;
        return span;
      });
      word.textContent = '';
      chars.forEach(c => word.appendChild(c));
    });

    // Stagger shimmer on hover
    heroTitle.addEventListener('mouseenter', () => {
      $$('.hch', heroTitle).forEach((c, i) => {
        c.style.transition = `transform .35s var(--ease) ${i * 22}ms, color .35s ease ${i * 22}ms, opacity .3s ease ${i * 22}ms`;
        c.style.transform = `translateY(-6px)`;
        c.style.color = 'var(--gold)';
      });
    });
    heroTitle.addEventListener('mouseleave', () => {
      $$('.hch', heroTitle).forEach((c, i) => {
        c.style.transform = '';
        c.style.color = '';
      });
    });
  }

  /* ===================================================================
     PWA — service worker
     =================================================================== */
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
})();
