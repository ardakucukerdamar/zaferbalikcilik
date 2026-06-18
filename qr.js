/* =====================================================================
   QR PANEL — generate, print, batch download
   Uses qrcode (CDN) — falls back to api.qrserver.com if blocked
   ===================================================================== */
(() => {
  'use strict';
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  /* ------------- PASTE YOUR PLACE ID HERE (optional) -------------
     Find it at: https://developers.google.com/maps/documentation/places/web-service/place-id
     The review card link will use it. Until set, the card will still
     render (with the placeholder URL) — but tapping it won't open the
     correct review form. -------------------------------------------- */
  const GOOGLE_PLACE_ID = ''; // e.g. 'ChIJ8Yk4j3rsxxQRZxxxx...'

  if (GOOGLE_PLACE_ID) {
    const review = document.querySelector('[data-payload="review"] .qr-canvas-wrap');
    if (review) review.dataset.text =
      `https://search.google.com/local/writereview?placeid=${encodeURIComponent(GOOGLE_PLACE_ID)}`;
  }

  /* ------------- GENERATE QR CODES ------------- */
  const wraps = $$('.qr-canvas-wrap');
  const colors = { dark: '#0a141d', light: '#ffffff' };

  const renderCanvas = (wrap) => {
    const text = wrap.dataset.text;
    if (!text) return Promise.resolve(null);

    return new Promise(resolve => {
      const c = document.createElement('canvas');
      c.width = 440; c.height = 440;

      const drawn = (err) => {
        if (err) {
          // Fallback to remote
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = `https://api.qrserver.com/v1/create-qr-code/?size=440x440&margin=2&data=${encodeURIComponent(text)}`;
          img.onload = () => {
            wrap.innerHTML = '';
            wrap.appendChild(img);
            resolve(img);
          };
          img.onerror = () => resolve(null);
          return;
        }
        wrap.innerHTML = '';
        wrap.appendChild(c);
        resolve(c);
      };

      if (window.QRCode && typeof window.QRCode.toCanvas === 'function') {
        window.QRCode.toCanvas(c, text, {
          margin: 1,
          width: 440,
          errorCorrectionLevel: 'M',
          color: colors,
        }, drawn);
      } else {
        drawn(new Error('QRCode lib missing'));
      }
    });
  };

  Promise.all(wraps.map(renderCanvas)).then(() => {
    /* ------------- DOWNLOAD ALL PNG ------------- */
    const dlAll = document.getElementById('qrDownloadAll');
    if (dlAll) {
      dlAll.addEventListener('click', () => {
        wraps.forEach((wrap) => {
          const name = wrap.dataset.name || 'qrcode';
          const node = wrap.querySelector('canvas, img');
          if (!node) return;
          let url;
          if (node.tagName === 'CANVAS') {
            url = node.toDataURL('image/png');
          } else {
            // For remote image fallback we can't easily save; open in new tab
            window.open(node.src, '_blank');
            return;
          }
          const a = document.createElement('a');
          a.href = url;
          a.download = `zafer-balikcilik-${name}.png`;
          document.body.appendChild(a);
          a.click();
          a.remove();
        });
      });
    }
  });

  /* ------------- PRINT BUTTON ------------- */
  const printBtn = document.getElementById('qrPrint');
  printBtn?.addEventListener('click', () => window.print());

  /* ------------- PWA ------------- */
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    });
  }
})();
