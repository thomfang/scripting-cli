import path from 'path';
import crypto from 'crypto';
import os from 'os';
import childProcess from 'child_process';
import fs from 'fs';
import chalk from 'chalk';

export function md5(content: string): string {
  return crypto
    .createHash('md5')
    .update(content)
    .digest('hex');
}

export function getPath(filename: string) {
  return path.join(process.cwd(), filename);
}

export function tryOpenFileInVSCode(filePath: string) {
  let cmd = `code "${filePath}"`;
  if (os.platform() === "win32") {
    cmd = `cmd.exe /c ${cmd}`;
  } else if (os.platform() === "linux") {
    const shell = process.env["SHELL"];
    cmd = `${shell} -c ${cmd}`;
  } else {
    cmd = `"/Applications/Visual Studio Code.app/Contents/MacOS/Electron" "${filePath}"`;
  }
  childProcess.execSync(cmd);
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
        "./dts/scripting.d.ts"
      ]
    }
  },
  "include": [
    "./dts/global.d.ts"
  ]
}`;

  const filePath = getPath('tsconfig.json');
  ensureDirectoryExistence(filePath);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, tsconfigContent);
    console.log(chalk.green('tsconfig.json created.'));
  } else {
    console.log(chalk.gray('tsconfig.json already exists.'));
  }
}

export function createVSCodeSettings() {
  const settingsContent = `{
  "typescript.format.semicolons": "remove",
  "typescript.preferences.jsxAttributeCompletionStyle": "braces",
}`;

  const filePath = getPath('.vscode/settings.json');
  ensureDirectoryExistence(filePath);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, settingsContent);
    console.log(chalk.green('.vscode/settings.json created.'));
  } else {
    console.log(chalk.gray('.vscode/settings.json already exists.'));
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
