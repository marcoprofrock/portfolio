import { makePreview, framePhoto, placement } from './image.js';
import { makeZip } from './zip.js';

const $ = id => document.getElementById(id);
const input = $('file-input'), border = $('border'), size = $('size');
const photos = []; let selected = 0, busy = false, exports = [], exportUrls = [], zipUrl = null;
const maxPhotos = 30;

function status(message = '', error = false) { $('status').textContent = message; $('status').classList.toggle('error', error); }
function setBusy(value) {
  busy = value;
  for (const id of ['file-input', 'empty', 'add', 'prepare', 'border', 'size', 'remove']) $(id).disabled = value;
  $('prepare').disabled = value || !photos.length;
  $('progress').hidden = !value;
  $('stage').setAttribute('aria-busy', String(value));
}
function invalidate() {
  for (const url of exportUrls) URL.revokeObjectURL(url);
  if (zipUrl) URL.revokeObjectURL(zipUrl);
  zipUrl = null; exports = []; exportUrls = [];
  $('exports').hidden = true; $('export-list').replaceChildren();
}
function updatePreview() {
  $('border-value').value = `${Number(border.value).toLocaleString('de-DE')} %`;
  $('empty').hidden = photos.length > 0; $('photo-mat').hidden = !photos.length;
  $('remove').hidden = !photos.length; $('thumbnails').hidden = !photos.length;
  $('add').textContent = photos.length ? 'Weitere Fotos auswählen' : 'Fotos auswählen';
  $('prepare').textContent = photos.length ? `${photos.length === 1 ? '1 Foto' : `${photos.length} Fotos`} vorbereiten` : 'Fotos vorbereiten';
  $('prepare').disabled = busy || !photos.length;
  if (!photos.length) { $('preview').removeAttribute('src'); $('photo-info').textContent = 'VORSCHAU'; return; }
  const photo = photos[selected], image = $('preview');
  image.src = photo.url;
  image.alt = `${photo.file.name}, vollständig auf weißem Hintergrund`;
  const p = placement(photo.width, photo.height, 100, Number(border.value));
  Object.assign(image.style, { left: `${p.x}%`, top: `${p.y / 1.25}%`, width: `${p.width}%`, height: `${p.height / 1.25}%` });
  $('photo-info').textContent = `${selected + 1} / ${photos.length} · ${photo.file.name}`;
  $('thumbnails').querySelectorAll('button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === selected)));
}
function renderThumbnails() {
  $('thumbnails').replaceChildren(...photos.map((photo, i) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'thumbnail';
    button.setAttribute('aria-label', `Foto ${i + 1}: ${photo.file.name}`);
    button.setAttribute('aria-pressed', String(i === selected));
    const img = new Image(); img.src = photo.url; img.alt = '';
    const number = document.createElement('span'); number.textContent = i + 1;
    button.append(img, number); button.addEventListener('click', () => { selected = i; updatePreview(); });
    return button;
  }));
}
async function addFiles(files) {
  if (busy || !files.length) return;
  const capacity = maxPhotos - photos.length;
  if (!capacity) { status(`Bitte höchstens ${maxPhotos} Fotos pro Durchgang auswählen.`, true); return; }
  const batch = [...files].slice(0, capacity), failed = [], start = photos.length;
  invalidate(); setBusy(true); $('progress').max = batch.length; $('progress').value = 0;
  try {
    for (let i = 0; i < batch.length; i++) {
      status(`Öffne Foto ${i + 1} von ${batch.length} …`);
      try {
        if (batch[i].type && !batch[i].type.startsWith('image/')) throw new Error('Not an image');
        const preview = await makePreview(batch[i]);
        photos.push({ file: batch[i], width: preview.width, height: preview.height, url: URL.createObjectURL(preview.blob) });
      } catch { failed.push(batch[i].name); }
      $('progress').value = i + 1;
    }
    selected = Math.min(start, Math.max(0, photos.length - 1)); renderThumbnails(); updatePreview();
    const messages = [];
    if (failed.length) messages.push(`Nicht geöffnet: ${failed.join(', ')}. Bitte als JPEG oder PNG auswählen.`);
    if (files.length > capacity) messages.push(`Maximal ${maxPhotos} Fotos pro Durchgang; die übrigen wurden nicht hinzugefügt.`);
    status(messages.join(' '), messages.length > 0);
  } finally { setBusy(false); input.value = ''; }
}
function canShare(files) { try { return !!navigator.canShare && navigator.canShare({ files }); } catch { return false; } }
async function shareFiles(files, button) {
  if (busy) return;
  button.disabled = true;
  try {
    // Files are already prepared: this call must stay within the tap's user activation.
    await navigator.share({ files });
    status('Teilen-Menü geschlossen.');
  } catch (error) {
    if (error.name !== 'AbortError') status('Teilen war nicht möglich. Bitte einzeln speichern oder herunterladen.', true);
  } finally { button.disabled = false; }
}
function download(url, name) {
  const a = document.createElement('a'); a.href = url; a.download = name;
  document.body.append(a); a.click(); a.remove();
}
function showExports() {
  $('exports').hidden = false;
  $('ready-label').textContent = `${exports.length === 1 ? '1 Foto ist' : `${exports.length} Fotos sind`} bereit.`;
  const shareable = canShare(exports);
  $('share').hidden = !shareable; $('share-hint').hidden = !shareable;
  $('share').textContent = exports.length === 1 ? 'In Fotos sichern / teilen' : 'Alle in Fotos sichern / teilen';
  $('download').textContent = exports.length === 1 ? 'JPEG herunterladen' : 'Alle als ZIP herunterladen';
  $('individual').hidden = exports.length === 1;
  $('export-list').replaceChildren(...exports.map((file, i) => {
    const row = document.createElement('div'); row.className = 'export-row';
    const a = document.createElement('a'); a.href = exportUrls[i]; a.download = file.name; a.textContent = file.name; row.append(a);
    if (canShare([file])) {
      const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Sichern';
      button.addEventListener('click', () => shareFiles([file], button)); row.append(button);
    }
    return row;
  }));
}
async function prepare() {
  if (busy || !photos.length) return;
  invalidate(); setBusy(true); $('progress').max = photos.length; $('progress').value = 0;
  const width = Number(size.value), inset = Number(border.value); let currentName = '';
  try {
    for (let i = 0; i < photos.length; i++) {
      currentName = photos[i].file.name;
      status(`Rahme Foto ${i + 1} von ${photos.length} …`);
      const blob = await framePhoto(photos[i].file, width, inset);
      const base = currentName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 70) || 'foto';
      const file = new File([blob], `${String(i + 1).padStart(2, '0')}_${base}_4x5.jpg`, { type: 'image/jpeg' });
      exports.push(file); exportUrls.push(URL.createObjectURL(file)); $('progress').value = i + 1;
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    if (exports.length > 1) { status('Download wird vorbereitet …'); zipUrl = URL.createObjectURL(await makeZip(exports)); }
    status(); showExports();
    if (matchMedia('(max-width:700px)').matches) $('exports').scrollIntoView({ block: 'nearest', behavior: 'auto' });
  } catch {
    invalidate(); status(`„${currentName}“ konnte nicht verarbeitet werden. Bitte mit weniger Fotos oder 1080 × 1350 px erneut versuchen.`, true);
  } finally { setBusy(false); }
}

for (const id of ['add', 'empty']) $(id).addEventListener('click', () => input.click());
input.addEventListener('change', () => addFiles(input.files));
border.addEventListener('input', () => { invalidate(); status(); updatePreview(); });
size.addEventListener('change', () => { invalidate(); status(); });
$('remove').addEventListener('click', () => {
  if (busy || !photos.length) return;
  invalidate(); URL.revokeObjectURL(photos[selected].url); photos.splice(selected, 1);
  selected = Math.min(selected, Math.max(0, photos.length - 1)); status(); renderThumbnails(); updatePreview();
});
$('prepare').addEventListener('click', prepare);
$('share').addEventListener('click', () => shareFiles(exports, $('share')));
$('download').addEventListener('click', () => {
  if (exports.length === 1) download(exportUrls[0], exports[0].name);
  else if (zipUrl) download(zipUrl, 'frame_4x5.zip');
});
for (const event of ['dragenter', 'dragover']) $('stage').addEventListener(event, e => { e.preventDefault(); if (!busy) $('stage').classList.add('dragging'); });
for (const event of ['dragleave', 'drop']) $('stage').addEventListener(event, e => { e.preventDefault(); $('stage').classList.remove('dragging'); });
$('stage').addEventListener('drop', e => addFiles(e.dataTransfer.files));

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js', { scope: './' }).then(async registration => {
    const ready = await navigator.serviceWorker.ready;
    if (ready.active) $('offline-status').textContent = 'Auch offline bereit.';
    registration.update().catch(() => {});
  }).catch(() => { $('offline-status').textContent = 'Lokal verarbeitet.'; });
}
updatePreview();
