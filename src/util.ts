import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import chalk from 'chalk';
import { globalDtsFileName, scriptingDtsFileName } from './const';

export function md5(content: string): string {
  return crypto
    .createHash('md5')
    .update(content)
    .digest('hex');
}

// Drop an incomplete trailing UTF-8 multibyte sequence so a text file whose
// character happens to straddle the read boundary isn't misjudged as binary.
function trimIncompleteUtf8Tail(chunk: Buffer): Buffer {
  let i = chunk.length - 1;
  let cont = 0;
  // Walk back over continuation bytes (10xxxxxx).
  while (i >= 0 && (chunk[i] & 0xc0) === 0x80) {
    cont++;
    i--;
  }
  if (i < 0) return chunk;

  const lead = chunk[i];
  let seqLen: number;
  if ((lead & 0x80) === 0x00) seqLen = 1;      // ASCII
  else if ((lead & 0xe0) === 0xc0) seqLen = 2;
  else if ((lead & 0xf0) === 0xe0) seqLen = 3;
  else if ((lead & 0xf8) === 0xf0) seqLen = 4;
  else return chunk;                            // invalid lead — let the decoder flag it

  // Fewer bytes than the sequence needs → it's cut off; trim it.
  if (cont + 1 < seqLen) {
    return chunk.subarray(0, i);
  }
  return chunk;
}

// Detect whether a file is binary by content instead of extension.
// Reads the first 1024 bytes: a NUL byte or non-UTF-8 content means binary.
// Conceptually mirrors FileManagerService.isBinaryFileSync on the iOS side.
export function isBinaryFile(filePath: string): boolean {
  let fd: number | null = null;
  try {
    fd = fs.openSync(filePath, 'r');
    const buffer = Buffer.alloc(1024);
    const bytesRead = fs.readSync(fd, buffer, 0, 1024, 0);
    const chunk = buffer.subarray(0, bytesRead);

    if (chunk.includes(0)) {
      return true;
    }

    try {
      new TextDecoder('utf-8', { fatal: true }).decode(trimIncompleteUtf8Tail(chunk));
      return false;
    } catch {
      return true;
    }
  } catch (err) {
    console.log(chalk.red(`Failed to inspect file: ${filePath}, ${err}`));
    // On failure, fall back to treating it as text (previous default behavior).
    return false;
  } finally {
    if (fd != null) {
      fs.closeSync(fd);
    }
  }
}

export function getPath(filename: string) {
  return path.join(process.cwd(), filename);
}

export function getScriptPath(filename?: string) {
  if (filename != null) {
    return path.join(process.cwd(), 'scripts', filename);
  }
  return path.join(process.cwd(), 'scripts');
}

// Function to create tsconfig.json
export function createTsConfig() {
  const tsconfigContent = `{
  "compilerOptions": {
    "target": "ESNext",
    "lib": [
      "esnext"
    ],
    "allowJs": true,
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "CommonJS",
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "jsx": "react",
    "jsxFactory": "createElement",
    "jsxFragmentFactory": "Fragment",
    "paths": {
      "scripting": [
        "./dts/${scriptingDtsFileName}"
      ]
    }
  },
  "include": [
    "./dts/${globalDtsFileName}",
    "scripts"
  ]
}`;

  const filePath = getPath('tsconfig.json');
  ensureDirectoryExistence(filePath);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, tsconfigContent);
    console.log(chalk.green('tsconfig.json created.'));
  } else {
    const tsconfig = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (tsconfig.include && !tsconfig.include.includes('scripts')) {
      tsconfig.include = [
        `./dts/${globalDtsFileName}`,
        "scripts"
      ];
      fs.writeFileSync(filePath, JSON.stringify(tsconfig, null, 2));
      console.log(chalk.yellow('tsconfig.json updated to include scripts directory.'));
    } else {
      console.log(chalk.gray('tsconfig.json already exists.'));
    }
  }
}

export function ensureScriptsDirectory() {
  const scriptsDir = getScriptPath();
  if (!fs.existsSync(scriptsDir)) {
    fs.mkdirSync(scriptsDir, { recursive: true });
    console.log(chalk.green('Scripts directory created.'));
  } else {
    console.log(chalk.gray('Scripts directory already exists.'));
  }
}

export function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

export async function writeDtsFiles(files: Record<string, string>) {
  await Promise.all(
    Object.entries(files).map(async ([filename, content]) => {
      const filePath = getPath(`dts/${filename}`);
      ensureDirectoryExistence(filePath);
      await
        fs
          .promises
          .writeFile(filePath, content)
          .catch((err) => {
            console.log(chalk.red(`Error writing file: ${err}`));
          });
    })
  );
}

export function getRelativePath(from: string, to: string) {
  const relativePath = path.relative(from, to);
  return relativePath.replaceAll("\\", "/");
}

// Whether a script-relative path should be excluded from syncing.
// Always ignores dotfiles/dot-directories and node_modules; `patterns` adds
// user-configured excludes. Kept in sync with the iOS default ignore logic.
export function isIgnoredPath(relativePath: string, patterns: string[] = []): boolean {
  const normalized = relativePath.replaceAll("\\", "/");
  const segments = normalized.split("/").filter(Boolean);

  // Default ignores.
  for (const seg of segments) {
    if (seg.startsWith(".") || seg === "node_modules") {
      return true;
    }
  }

  // User-configured patterns.
  const basename = segments[segments.length - 1] ?? "";
  for (const raw of patterns) {
    const pattern = raw.trim();
    if (!pattern) continue;

    if (pattern.startsWith("*.")) {
      // Extension match, e.g. "*.log".
      if (basename.endsWith(pattern.slice(1))) return true;
    } else if (pattern.includes("/")) {
      // Path match (relative), prefix or exact.
      const p = pattern.replace(/^\/+|\/+$/g, "");
      if (normalized === p || normalized.startsWith(p + "/")) return true;
    } else {
      // Directory or file name match on any segment.
      if (segments.includes(pattern)) return true;
    }
  }

  return false;
}

export async function migrateOldFiles() {
  try {
    const list = await fs.promises.readdir(process.cwd());
    let hasMigrated = false;

    for (const file of list) {

      if (file === 'dts' || file == "scripts" || file === 'tsconfig.json' || file === 'package.json' || file === 'node_modules' || file.startsWith('.')) {
        continue;
      }

      const filePath = path.join(process.cwd(), file);

      const stat = await fs.promises.stat(filePath);

      if (!stat.isDirectory()) {
        continue;
      }

      const newFilePath = path.join(process.cwd(), 'scripts', file);

      if (fs.existsSync(newFilePath)) {
        console.log(chalk.yellow(`File ${newFilePath} already exists, skipping...`));
        continue;
      }

      hasMigrated = true;
      console.log(chalk.blue(`Moving ${filePath} to ${newFilePath}`));
      await fs.promises.rename(filePath, newFilePath);

    }

    if (hasMigrated) {
      console.log(chalk.green('Old files migrated to the scripts directory.'));
    } else {
      console.log(chalk.gray('No old files to migrate.'));
    }

  } catch (err) {
    console.log(`Failed to migrate old files: ${chalk.red(`${err}`)}`);
  }

}