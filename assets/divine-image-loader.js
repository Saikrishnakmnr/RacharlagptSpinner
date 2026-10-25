/* Prefer generated devotional portraits; gracefully fall back to bundled illustrations. */
window.divinePortrait = function(name, img) {
  const safe = String(name).toLowerCase().replace(/[^a-z]/g,'');
  const fallback = '../assets/divine-art/' + safe + '.svg';
  const generated = '../assets/divine-ai/' + safe + '.jpg';
  img.onerror = function() { img.onerror = null; img.src = fallback; };
  img.src = generated;
  return img;
};
