"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.md5 = md5;
exports.getPath = getPath;
exports.tryOpenFileInVSCode = tryOpenFileInVSCode;
exports.createTsConfig = createTsConfig;
exports.createVSCodeSettings = createVSCodeSettings;
exports.ensureDirectoryExistence = ensureDirectoryExistence;
exports.writeDtsFiles = writeDtsFiles;
exports.getRelativePath = getRelativePath;
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
    "./dts/global.d.ts"
  ]
}`;
    const filePath = getPath('tsconfig.json');
    ensureDirectoryExistence(filePath);
    if (!fs_1.default.existsSync(filePath)) {
        fs_1.default.writeFileSync(filePath, tsconfigContent);
        console.log(chalk_1.default.green('tsconfig.json created.'));
    }
    else {
        console.log(chalk_1.default.gray('tsconfig.json already exists.'));
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
function ensureDirectoryExistence(filePath) {
    const dirname = path_1.default.dirname(filePath);
    if (!fs_1.default.existsSync(dirname)) {
        fs_1.default.mkdirSync(dirname, { recursive: true });
    }
}
function writeDtsFiles(files) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Promise.all(Object.entries(files).map((_a) => __awaiter(this, [_a], void 0, function* ([filename, content]) {
            const filePath = getPath(`dts/${filename}`);
            ensureDirectoryExistence(filePath);
            yield fs_1.default
                .promises
                .writeFile(filePath, content)
                .catch((err) => {
                console.log(chalk_1.default.red(`Error writing file: ${err}`));
            });
        })));
    });
}
function getRelativePath(from, to) {
    const relativePath = path_1.default.relative(from, to);
    return relativePath.replace("\\", "/");
}
