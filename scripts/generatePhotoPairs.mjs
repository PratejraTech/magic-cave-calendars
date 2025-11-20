import { readdir, stat, mkdir, copyFile, readFile, writeFile } from 'fs/promises';
import path from 'path';

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, 'photos');
const PUBLIC_DIR = path.join(ROOT, 'public', 'photos');
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'photoPairs.generated.ts');
const SUPPORTED_IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.PNG', '.JPG', '.JPEG', '.WEBP']);
const DEFAULT_MESSAGE = 'A sparkling Christmas memory filled with butterflies, heartbeats, and Daddy moments.';

const toPublicPath = (filename) => `/photos/${filename}`;

async function ensureDirs() {
  await mkdir(SOURCE_DIR, { recursive: true });
  await mkdir(PUBLIC_DIR, { recursive: true });
}

async function parseMarkdown(baseName) {
  const mdPath = path.join(SOURCE_DIR, `${baseName}.md`);
  const hasMarkdown = await stat(mdPath).then(
    (stats) => stats.isFile(),
    () => false
  );

  if (!hasMarkdown) {
    return { title: baseName, message: DEFAULT_MESSAGE, markdownPath: null };
  }

  const raw = await readFile(mdPath, 'utf8');
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) {
    return { title: baseName, message: DEFAULT_MESSAGE };
  }

  const [firstLine, ...rest] = lines;
  const title = firstLine.replace(/^#\s*/, '') || baseName;
  const message = rest.join('\n') || DEFAULT_MESSAGE;

  const destMarkdownPath = path.join(PUBLIC_DIR, `${baseName}.md`);
  await copyFile(mdPath, destMarkdownPath);

  return { title, message, markdownPath: toPublicPath(`${baseName}.md`) };
}

async function processPhoto(fileName) {
  const sourceImagePath = path.join(SOURCE_DIR, fileName);
  const destImagePath = path.join(PUBLIC_DIR, fileName);
  await copyFile(sourceImagePath, destImagePath);

  const baseName = path.parse(fileName).name;
  const { title, message, markdownPath } = await parseMarkdown(baseName);

  return {
    image: toPublicPath(fileName),
    title,
    message,
    markdown: markdownPath,
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

    console.log(`[generate:photoPairs] Processing ${entry.name}`);
    const pair = await processPhoto(entry.name);
    photos.push(pair);
  }

  photos.sort((a, b) => a.image.localeCompare(b.image));

  const manifest = `export type PhotoPair = {
  image: string;
  title: string;
  message: string;
};

export const photoPairs: PhotoPair[] = ${JSON.stringify(photos, null, 2)};`;

  await writeFile(MANIFEST_PATH, manifest);
  console.log(`[generate:photoPairs] Saved ${photos.length} entries to ${MANIFEST_PATH}`);
}

generatePairs().catch((error) => {
  console.error('[generate:photoPairs] Failed', error);
  process.exit(1);
});
