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
exports.createScript = void 0;
const chalk_1 = __importDefault(require("chalk"));
const node_path_1 = __importDefault(require("node:path"));
const node_child_process_1 = require("node:child_process");
const node_fs_1 = __importDefault(require("node:fs"));
const promises_1 = require("node:fs/promises");
function getScriptDir(scriptName) {
    return node_path_1.default.join(process.cwd(), scriptName);
}
function createScriptDir(scriptName) {
    return __awaiter(this, void 0, void 0, function* () {
        const appDir = getScriptDir(scriptName);
        if (node_fs_1.default.existsSync(appDir)) {
            throw new Error(`Directory "./${scriptName}" already exists.`);
        }
        // const dir = path.resolve(appDir, 'src/svgs')
        const srcDir = node_path_1.default.resolve(appDir, 'src');
        const typesDir = node_path_1.default.resolve(appDir, 'types');
        yield Promise.all([
            (0, promises_1.mkdir)(srcDir, { recursive: true }),
            (0, promises_1.mkdir)(typesDir, { recursive: true })
        ]);
    });
}
function createEntryFile(scriptName) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(` > Creating ${scriptName}/src/index.tsx ...`);
        const filePath = node_path_1.default.join(getScriptDir(scriptName), '/src/index.tsx');
        yield (0, promises_1.writeFile)(filePath, `import { Column, CupertinoNavigationBar, CupertinoPageScaffold, Text, Container, useCupertinoColors, navigator, GestureDetector, Script, Center, CupertinoButton, } from 'scripting'

function App() {
  const colors = useCupertinoColors()
  const backgroundColor = colors.systemBackground

  return (
    <CupertinoPageScaffold
      navigationBar={
        <CupertinoNavigationBar
          middle={
            <Text>My Script</Text>
          }
          backgroundColor={backgroundColor}
        />
      }
    >
      <Center>
        <Text
          color={colors.label}
        >Welcome to Scripting!</Text>
      </Center>
    </CupertinoPageScaffold>
  )
}

async function run() {
  const result = await navigator.push({
    element: <App />
  })

  Script.exit(result)
}

run()
`, 'utf-8');
        console.log(chalk_1.default.green(` ✔️ Created ${scriptName}/src/index.tsx`));
    });
}
function createPackageJson(scriptName) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(` > Creating ${scriptName}/package.json ...`);
        const filePath = node_path_1.default.join(getScriptDir(scriptName), 'package.json');
        yield (0, promises_1.writeFile)(filePath, `{
  "name": "${scriptName}",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "start": "npx scripting-cli dev",
    "build": "npx scripting-cli build"
  }
}`, 'utf-8');
        console.log(chalk_1.default.green(` ✔️ Created ${scriptName}/package.json`));
    });
}
function createReadme(scriptName) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(` > Creating ${scriptName}/README.md ...`);
        const filePath = node_path_1.default.join(getScriptDir(scriptName), 'README.md');
        yield (0, promises_1.writeFile)(filePath, `# ${scriptName} - A script for Scripting app.

## Start dev server

\`npm start\`

## Build Script

\`npm run build\`
`, 'utf-8');
        console.log(chalk_1.default.green(` ✔️ Created ${scriptName}/README.md`));
    });
}
function createTSConfig(scriptName) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(` > Creating ${scriptName}/tsconfig.json ...`);
        const filePath = node_path_1.default.join(getScriptDir(scriptName), 'tsconfig.json');
        yield (0, promises_1.writeFile)(filePath, `{
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
    "paths": {
      "scripting": [
        "./types/scripting.d.ts"
      ]
    }
  },
  "include": [
    "src",
    "types/assets.d.ts",
    "types/global.d.ts",
  ],
}`, 'utf-8');
        console.log(chalk_1.default.green(` ✔️ Created ${scriptName}/tsconfig.json`));
    });
}
function copyDtsAsset(scriptName, fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(` > Creating ${scriptName}/types/${fileName}.d.ts ...`);
        yield (0, promises_1.copyFile)(node_path_1.default.join(__dirname, `../public/${fileName}.d.ts`), node_path_1.default.join(getScriptDir(scriptName), `types/${fileName}.d.ts`));
        console.log(chalk_1.default.green(` ✔️ Created ${scriptName}/types/${fileName}.d.ts`));
    });
}
function copyAssets(scriptName) {
    return __awaiter(this, void 0, void 0, function* () {
        yield copyDtsAsset(scriptName, 'scripting');
        yield copyDtsAsset(scriptName, 'global');
        yield copyDtsAsset(scriptName, 'assets');
        // console.log(` > Creating ${scriptName}/src/svgs/logo.svg ...`)
        // await copyFile(
        //   path.join(__dirname, '../public/logo.svg'),
        //   path.join(getScriptDir(scriptName), 'src/svgs/logo.svg')
        // )
        // console.log(
        //   chalk.green(` ✔️ Created ${scriptName}/src/svgs/logo.svg`)
        // )
    });
}
function createVSCodeSettings(scriptName) {
    return __awaiter(this, void 0, void 0, function* () {
        const destDir = node_path_1.default.join(getScriptDir(scriptName), '.vscode');
        if (!node_fs_1.default.existsSync(destDir)) {
            yield (0, promises_1.mkdir)(destDir, { recursive: true });
        }
        yield (0, promises_1.copyFile)(node_path_1.default.join(__dirname, '../.vscode/settings.json'), node_path_1.default.join(destDir, 'settings.json'));
    });
}
function installDeps(scriptName) {
    console.log(` > cd ${scriptName} && npm i -D ts-loader typescript file-loader`);
    (0, node_child_process_1.execSync)(`cd ${scriptName} && npm i -D ts-loader typescript file-loader`);
    console.log(chalk_1.default.green(` ✔️ Scripting script ${chalk_1.default.bold(scriptName)} is ready!`));
}
function createScript(scriptName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!/^[a-zA-Z]+[a-zA-Z0-9-_]+$/.test(scriptName)) {
            console.log(chalk_1.default.red(`✖️ Invalid Scripting script name "${scriptName}"`));
            return;
        }
        console.log(`Start creating ${scriptName} ...`);
        try {
            yield createScriptDir(scriptName);
            yield createPackageJson(scriptName);
            yield createTSConfig(scriptName);
            yield createReadme(scriptName);
            yield createEntryFile(scriptName);
            yield copyAssets(scriptName);
            yield createVSCodeSettings(scriptName);
            installDeps(scriptName);
            console.log(`All done! Run ${chalk_1.default.bold(chalk_1.default.green(`cd ${scriptName} && npm start`))} to start the dev server.`);
        }
        catch (e) {
            console.log(chalk_1.default.red(`✖️ Create script failed: ${e.message}`));
        }
    });
}
exports.createScript = createScript;
