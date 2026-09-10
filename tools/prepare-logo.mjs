// Turns the source seal (site/ascgglogo — an RGB PNG on a white field) into
// cropped, transparent webp assets in public/. Runs during the Docker build so
// the repo only ever carries the original file.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const SRC = process.env.LOGO_SRC || 'site/ascgglogo';
const NEAR_WHITE = 244; // any pixel above this on all channels becomes transparent

const { data, info } = await sharp(SRC)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
let minX = width, minY = height, maxX = -1, maxY = -1;

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const i = (y * width + x) * channels;
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (r >= NEAR_WHITE && g >= NEAR_WHITE && b >= NEAR_WHITE) {
      data[i + 3] = 0;
    } else {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
}

if (maxX < 0) throw new Error('Logo appears to be entirely white — check LOGO_SRC.');

const box = { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
await mkdir('public', { recursive: true });

const base = sharp(data, { raw: { width, height, channels } }).extract(box);

await base.clone().resize({ width: 720, fit: 'inside' }).webp({ quality: 90 }).toFile('public/logo.webp');
await base.clone().resize({ width: 220, fit: 'inside' }).webp({ quality: 90 }).toFile('public/logo-sm.webp');

console.log(`logo: ${width}x${height} -> crop ${box.width}x${box.height} -> public/logo.webp, public/logo-sm.webp`);

// --- optional hero photograph ------------------------------------------
// Drop any image at site/hero (or site/hero.jpg/.png/.webp). Absent = the
// page falls back to a plain band, so a missing file never breaks the build.
import { readdir } from 'node:fs/promises';

try {
  const files = await readdir('site');
  const hero = files.find((f) => /^hero(\.(jpe?g|png|webp|avif))?$/i.test(f));
  if (hero) {
    const src = `site/${hero}`;
    // Portrait-ish crop for the split hero, plus a wide crop for the band.
    await sharp(src)
      .resize({ width: 1200, height: 1400, fit: 'cover', position: 'attention' })
      .webp({ quality: 82 })
      .toFile('public/hero.webp');
    await sharp(src)
      .resize({ width: 2000, height: 800, fit: 'cover', position: 'attention' })
      .webp({ quality: 80 })
      .toFile('public/hero-wide.webp');
    console.log(`hero: ${src} -> public/hero.webp + hero-wide.webp`);
  } else {
    console.log('hero: no site/hero image found — band falls back to plain colour');
  }
} catch (err) {
  console.log('hero: skipped —', err.message);
}
