// Shrinks a photo (camera, gallery or file) to a small JPEG data URL.

export function toSmallJpeg(src, max = 1024) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
      const c = document.createElement('canvas');
      c.width = Math.round((img.naturalWidth || img.width) * k); c.height = Math.round((img.naturalHeight || img.height) * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      try { resolve(c.toDataURL('image/jpeg', 0.72)); } catch (e) { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
