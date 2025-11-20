import { readdir, stat, mkdir, copyFile } from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, 'photos');
const PUBLIC_DIR = path.join(ROOT, 'public', 'photos');
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'photoPairs.generated.ts');
const SUPPORTED_IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.PNG', '.JPG', '.JPEG', '.WEBP']);

const toPublicPath = (filename) => `/photos/${filename}`;

async function ensureDirs() {
  await mkdir(SOURCE_DIR, { recursive: true });
  await mkdir(PUBLIC_DIR, { recursive: true });
}

async function processPhoto(fileName) {
  const sourceImagePath = path.join(SOURCE_DIR, fileName);
  const destImagePath = path.join(PUBLIC_DIR, fileName);
  await copyFile(sourceImagePath, destImagePath);

  const baseName = path.parse(fileName).name;
  const markdownFilename = `${baseName}.md`;
  const sourceMarkdownPath = path.join(SOURCE_DIR, markdownFilename);
  const hasMarkdown = await stat(sourceMarkdownPath).then(
    (stats) => stats.isFile(),
    () => false
  );

  if (hasMarkdown) {
    const destMarkdownPath = path.join(PUBLIC_DIR, markdownFilename);
    await copyFile(sourceMarkdownPath, destMarkdownPath);
  }

  return {
    image: toPublicPath(fileName),
    markdown: hasMarkdown ? toPublicPath(markdownFilename) : null,
  };
}

async function generatePairs() {
  await ensureDirs();
  const entries = await readdir(SOURCE_DIR, { withFileTypes: true });
  const photos = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name);
    if (!SUPPORTED_IMAGE_EXT.has(ext)) continue;

    console.log(`[generate:photoPairs] Found ${entry.name}`);
    const pair = await processPhoto(entry.name);
    photos.push(pair);
  }

  photos.sort((a, b) => a.image.localeCompare(b.image));

  const manifest = `export type PhotoPair = {
  image: string;
  markdown: string | null;
};

export const photoPairs: PhotoPair[] = ${JSON.stringify(photos, null, 2)};`;

  await import('fs/promises').then(({ writeFile }) => writeFile(MANIFEST_PATH, manifest));
  console.log(`[generate:photoPairs] Saved ${photos.length} entries to ${MANIFEST_PATH}`);
}

generatePairs().catch((error) => {
  console.error('[generate:photoPairs] Failed', error);
  process.exit(1);
});
