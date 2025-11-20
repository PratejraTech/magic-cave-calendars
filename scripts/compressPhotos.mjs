import { readdir, stat, mkdir, copyFile, rm, writeFile } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const ROOT = process.cwd();
const PHOTOS_DIR = path.join(ROOT, 'photos');
const BACKUP_DIR = path.join(PHOTOS_DIR, '__original_backup');
const MANIFEST_PATH = path.join(ROOT, 'src', 'data', 'photoManifest.generated.ts');
const SUPPORTED_EXT = new Set(['.png', '.PNG']);
const processedRegistry = new Map();

async function ensureDirs() {
  await mkdir(PHOTOS_DIR, { recursive: true });
  await mkdir(BACKUP_DIR, { recursive: true });
}

async function compressFile(filePath) {
  const fileStats = await stat(filePath);
  if (!fileStats.isFile()) return;

  const filename = path.basename(filePath);
  if (filename.includes('_processed')) {
    console.log(`[compress:photos] Skipping already processed file ${filename}`);
    processedRegistry.set(filename, `/photos/${filename}`);
    return;
  }
  const backupPath = path.join(BACKUP_DIR, filename);

  console.log(`[compress:photos] Backing up ${filename} -> ${backupPath}`);
  await copyFile(filePath, backupPath);

  console.log(`[compress:photos] Compressing ${filename}`);
  const buffer = await sharp(filePath, { failOn: 'none' })
    .png({
      compressionLevel: 9,
      effort: 10,
      adaptiveFiltering: true,
      palette: true,
      quality: 60,
      colors: 64,
    })
    .toBuffer();

  const processedName = filename.replace(/(\.png)$/i, '_processed$1');
  const processedPath = path.join(PHOTOS_DIR, processedName);
  await writeFile(processedPath, buffer);
  await rm(backupPath, { force: true });
  processedRegistry.set(processedName, `/photos/${processedName}`);
  console.log(`[compress:photos] Done ${processedName}`);
}

async function compressAllPhotos() {
  await ensureDirs();
  const entries = await readdir(PHOTOS_DIR, { withFileTypes: true });
  const pngFiles = entries
    .filter((entry) => entry.isFile() && SUPPORTED_EXT.has(path.extname(entry.name)))
    .map((entry) => path.join(PHOTOS_DIR, entry.name));

  if (pngFiles.length === 0) {
    console.log('[compress:photos] No PNG files found.');
    return;
  }

  for (const filePath of pngFiles) {
    try {
      await compressFile(filePath);
    } catch (error) {
      console.warn(`[compress:photos] Failed for ${path.basename(filePath)}:`, error);
    }
  }

  await writeManifest();
}

async function writeManifest() {
  const manifestObject = Array.from(processedRegistry.entries()).reduce((acc, [filename, publicPath], index) => {
    acc[index] = publicPath;
    return acc;
  }, {});

  const content = `export const generatedPhotoManifest: Record<number, string> = ${JSON.stringify(manifestObject, null, 2)};`;
  await writeFile(MANIFEST_PATH, content);
  console.log(`[compress:photos] Updated manifest at ${MANIFEST_PATH}`);
}

compressAllPhotos().catch((error) => {
  console.error('[compress:photos] Fatal error:', error);
  process.exit(1);
});
