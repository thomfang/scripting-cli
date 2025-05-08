"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.md5 = md5;
exports.getPath = getPath;
exports.getScriptPath = getScriptPath;
exports.tryOpenFileInVSCode = tryOpenFileInVSCode;
exports.createTsConfig = createTsConfig;
exports.createVSCodeSettings = createVSCodeSettings;
exports.ensureScriptsDirectory = ensureScriptsDirectory;
exports.ensureDirectoryExistence = ensureDirectoryExistence;
exports.writeDtsFiles = writeDtsFiles;
exports.getRelativePath = getRelativePath;
exports.migrateOldFiles = migrateOldFiles;
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const os_1 = __importDefault(require("os"));
const child_process_1 = __importDefault(require("child_process"));
const fs_1 = __importDefault(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
function md5(content) {
    return crypto_1.default
        .createHash('md5')
        .update(content)
        .digest('hex');
}
function getPath(filename) {
    return path_1.default.join(process.cwd(), filename);
}
function getScriptPath(filename) {
    if (filename != null) {
        return path_1.default.join(process.cwd(), 'scripts', filename);
    }
    return path_1.default.join(process.cwd(), 'scripts');
}
function tryOpenFileInVSCode(filePath) {
    let cmd = `code "${filePath}"`;
    if (os_1.default.platform() === "win32") {
        cmd = `cmd.exe /c ${cmd}`;
    }
    else if (os_1.default.platform() === "linux") {
        const shell = process.env["SHELL"];
        cmd = `${shell} -c ${cmd}`;
    }
    else {
        cmd = `"/Applications/Visual Studio Code.app/Contents/MacOS/Electron" "${filePath}"`;
    }
    child_process_1.default.execSync(cmd);
}
// Function to create tsconfig.json
function createTsConfig() {
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
    "./dts/global.d.ts",
    "scripts"
  ]
}`;
    const filePath = getPath('tsconfig.json');
    ensureDirectoryExistence(filePath);
    if (!fs_1.default.existsSync(filePath)) {
        fs_1.default.writeFileSync(filePath, tsconfigContent);
        console.log(chalk_1.default.green('tsconfig.json created.'));
    }
    else {
        const tsconfig = JSON.parse(fs_1.default.readFileSync(filePath, 'utf-8'));
        if (tsconfig.include && !tsconfig.include.includes('scripts')) {
            tsconfig.include = [
                "./dts/global.d.ts",
                "scripts"
            ];
            fs_1.default.writeFileSync(filePath, JSON.stringify(tsconfig, null, 2));
            console.log(chalk_1.default.yellow('tsconfig.json updated to include scripts directory.'));
        }
        else {
            console.log(chalk_1.default.gray('tsconfig.json already exists.'));
        }
    }
}
function createVSCodeSettings() {
    const settingsContent = `{
  "typescript.format.semicolons": "remove",
  "typescript.preferences.jsxAttributeCompletionStyle": "braces",
}`;
    const filePath = getPath('.vscode/settings.json');
    ensureDirectoryExistence(filePath);
    if (!fs_1.default.existsSync(filePath)) {
        fs_1.default.writeFileSync(filePath, settingsContent);
        console.log(chalk_1.default.green('.vscode/settings.json created.'));
    }
    else {
        console.log(chalk_1.default.gray('.vscode/settings.json already exists.'));
    }
}
function ensureScriptsDirectory() {
    const scriptsDir = getScriptPath();
    if (!fs_1.default.existsSync(scriptsDir)) {
        fs_1.default.mkdirSync(scriptsDir, { recursive: true });
        console.log(chalk_1.default.green('Scripts directory created.'));
    }
    else {
        console.log(chalk_1.default.gray('Scripts directory already exists.'));
    }
}
function ensureDirectoryExistence(filePath) {
    const dirname = path_1.default.dirname(filePath);
    if (!fs_1.default.existsSync(dirname)) {
        fs_1.default.mkdirSync(dirname, { recursive: true });
    }
}
async function writeDtsFiles(files) {
    await Promise.all(Object.entries(files).map(async ([filename, content]) => {
        const filePath = getPath(`dts/${filename}`);
        ensureDirectoryExistence(filePath);
        await fs_1.default
            .promises
            .writeFile(filePath, content)
            .catch((err) => {
            console.log(chalk_1.default.red(`Error writing file: ${err}`));
        });
    }));
}
function getRelativePath(from, to) {
    const relativePath = path_1.default.relative(from, to);
    return relativePath.replaceAll("\\", "/");
}
async function migrateOldFiles() {
    try {
        const list = await fs_1.default.promises.readdir(process.cwd());
        for (const file of list) {
            if (file === 'dts' || file === '.vscode' || file == "scripts" || file === 'tsconfig.json' || file === 'package.json' || file === 'node_modules') {
                continue;
            }
            const filePath = path_1.default.join(process.cwd(), file);
            const stat = await fs_1.default.promises.stat(filePath);
            if (!stat.isDirectory()) {
                continue;
            }
            const newFilePath = path_1.default.join(process.cwd(), 'scripts', file);
            if (fs_1.default.existsSync(newFilePath)) {
                console.log(chalk_1.default.yellow(`File ${newFilePath} already exists, skipping...`));
                continue;
            }
            console.log(chalk_1.default.blue(`Moving ${filePath} to ${newFilePath}`));
            await fs_1.default.promises.rename(filePath, newFilePath);
        }
    }
    catch (err) {
        console.log(`Failed to migrate old files: ${chalk_1.default.red(`${err}`)}`);
    }
}
