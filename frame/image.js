// Use the browser's EXIF-aware decoder, including Safari's native HEIC support when available.
export async function decode(file) {
  const url = URL.createObjectURL(file);
  const image = new Image();
  image.src = url;
  try {
    await image.decode();
    if (!image.naturalWidth || !image.naturalHeight) throw new Error('Empty image');
    return { image, width: image.naturalWidth, height: image.naturalHeight, release() { image.src = ''; URL.revokeObjectURL(url); } };
  } catch (error) { URL.revokeObjectURL(url); throw error; }
}

export function placement(sourceWidth, sourceHeight, width, border) {
  const height = width * 5 / 4;
  // Border is a minimum inset on every edge, as a percentage of output width.
  const inset = width * border / 100;
  const scale = Math.min((width - 2 * inset) / sourceWidth, (height - 2 * inset) / sourceHeight);
  const w = sourceWidth * scale, h = sourceHeight * scale;
  return { x: (width - w) / 2, y: (height - h) / 2, width: w, height: h };
}

function jpeg(canvas, quality) {
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('JPEG konnte nicht erstellt werden.')), 'image/jpeg', quality));
}

export async function makePreview(file) {
  const decoded = await decode(file);
  const canvas = document.createElement('canvas');
  try {
    const scale = Math.min(1, 1000 / Math.max(decoded.width, decoded.height));
    canvas.width = Math.max(1, Math.round(decoded.width * scale));
    canvas.height = Math.max(1, Math.round(decoded.height * scale));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(decoded.image, 0, 0, canvas.width, canvas.height);
    return { blob: await jpeg(canvas, .88), width: decoded.width, height: decoded.height };
  } finally { decoded.release(); canvas.width = canvas.height = 1; }
}

export async function framePhoto(file, width, border) {
  const decoded = await decode(file);
  const canvas = document.createElement('canvas');
  try {
    canvas.width = width; canvas.height = width * 5 / 4;
    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    const p = placement(decoded.width, decoded.height, width, border);
    ctx.drawImage(decoded.image, p.x, p.y, p.width, p.height);
    return await jpeg(canvas, .95);
  } finally { decoded.release(); canvas.width = canvas.height = 1; }
}
