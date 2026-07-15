import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import chalk from 'chalk';
import { globalDtsFileName, scriptingDtsFileName } from './const';

const textScriptFileExtensions = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.json',
  '.md',
  '.txt',
  '.py',
]);

export function md5(content: string): string {
  return crypto
    .createHash('md5')
    .update(content)
    .digest('hex');
}

export function isTextScriptFile(filePath: string): boolean {
  return textScriptFileExtensions.has(path.extname(filePath).toLowerCase());
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
