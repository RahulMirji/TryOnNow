import { build } from 'vite';
import { copyFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

async function buildExtension() {
  // Build with Vite
  await build();

  // Copy static files to dist
  const publicFiles = ['manifest.json', 'content.css', 'icon16.png', 'icon48.png', 'icon128.png'];
  
  for (const file of publicFiles) {
    const src = resolve(rootDir, 'public', file);
    const dest = resolve(rootDir, 'dist', file);
    if (existsSync(src)) {
      copyFileSync(src, dest);
      console.log(`Copied ${file}`);
    }
  }

  console.log('Build complete! Load the dist folder in Chrome.');
}

buildExtension().catch(console.error);
