const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generate() {
  const rootDir = process.cwd();
  const iconSvgPath = path.join(rootDir, 'public', 'pwa-icon.svg');
  const maskableSvgPath = path.join(rootDir, 'public', 'pwa-maskable.svg');

  const iconSvg = fs.readFileSync(iconSvgPath);
  const maskableSvg = fs.readFileSync(maskableSvgPath);

  console.log('Rendering pwa-192x192.png...');
  await sharp(iconSvg)
    .resize(192, 192)
    .png()
    .toFile(path.join(rootDir, 'public', 'pwa-192x192.png'));

  console.log('Rendering pwa-512x512.png...');
  await sharp(iconSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(rootDir, 'public', 'pwa-512x512.png'));

  console.log('Rendering pwa-maskable-512x512.png...');
  await sharp(maskableSvg)
    .resize(512, 512)
    .png()
    .toFile(path.join(rootDir, 'public', 'pwa-maskable-512x512.png'));

  console.log('Rendering apple-touch-icon.png (180x180)...');
  await sharp(iconSvg)
    .resize(180, 180)
    .png()
    .toFile(path.join(rootDir, 'public', 'apple-touch-icon.png'));

  console.log('Rendering favicon.png (192x192)...');
  await sharp(iconSvg)
    .resize(192, 192)
    .png()
    .toFile(path.join(rootDir, 'public', 'favicon.png'));

  console.log('Rendering favicon-32x32.png...');
  await sharp(iconSvg)
    .resize(32, 32)
    .png()
    .toFile(path.join(rootDir, 'public', 'favicon-32x32.png'));

  // Also create a 48x48 PNG for favicon.ico
  const icoBuf = await sharp(iconSvg).resize(48, 48).png().toBuffer();
  fs.writeFileSync(path.join(rootDir, 'public', 'favicon.ico'), icoBuf);

  console.log('All icons generated successfully!');
}

generate().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
