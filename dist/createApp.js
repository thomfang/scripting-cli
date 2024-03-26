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
exports.createApp = void 0;
const chalk_1 = __importDefault(require("chalk"));
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const promises_1 = require("node:fs/promises");
console.log(__dirname);
function getAppDir(appName) {
    return node_path_1.default.join(__dirname, appName);
}
function createAppDir(appName) {
    return __awaiter(this, void 0, void 0, function* () {
        const dir = node_path_1.default.join(getAppDir(appName), 'src');
        if (node_fs_1.default.existsSync(dir)) {
            throw new Error(`Directory "./${appName}" already exists.`);
        }
        yield (0, promises_1.mkdir)(dir, { recursive: true });
    });
}
function createEntryFile(appName) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(` > Creating ${appName}/src/index.tsx ...`);
        const filePath = node_path_1.default.join(getAppDir(appName), '/src/index.tsx');
        yield (0, promises_1.writeFile)(filePath, `
const { runApp, createElement, RouterProvider, Router, } = Scripting
const { Center, Text, CupertinoPageScaffold, CupertinoNavigationBar, } = Scripting.Widgets

function IndexPage() {
  return (
    <CupertinoPageScaffold
      navigationBar={
        <CupertinoNavigationBar
          middle={
            <Text>${appName}</Text>
          }
        />
      }
    >
      <Center>
        <Text>Welcome to Scripting!</Text>
      </Center>
    </CupertinoPageScaffold>
  )
}

const router = new Router([
  {
    path: '/',
    element: <IndexPage />,
  },
])

runApp(
  <RouterProvider router={router} />
)
`, 'utf-8');
        console.log(chalk_1.default.green(` ✔️ Created ${appName}/src/index.tsx`));
    });
}
function createPackageJson(appName) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(` > Creating ${appName}/package.json ...`);
        const filePath = node_path_1.default.join(getAppDir(appName), 'package.json');
        yield (0, promises_1.writeFile)(filePath, `{
  "name": "${appName}",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "npx scripting-cli dev",
    "build": "npx scripting-cli build"
  }
}`, 'utf-8');
        console.log(chalk_1.default.green(` ✔️ Created ${appName}/package.json`));
    });
}
function createReadme(appName) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(` > Creating ${appName}/README.md ...`);
        const filePath = node_path_1.default.join(getAppDir(appName), 'README.md');
        yield (0, promises_1.writeFile)(filePath, `# ${appName} - A Scripting application

## Quick Start

### Installation

\`npm install\`

### Start dev server

\`npm run dev\`

### Build App

\`npm run build\`
`, 'utf-8');
        console.log(chalk_1.default.green(` ✔️ Created ${appName}/README.md`));
    });
}
function createTSConfig(appName) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(` > Creating ${appName}/tsconfig.json ...`);
        const filePath = node_path_1.default.join(getAppDir(appName), 'tsconfig.json');
        yield (0, promises_1.writeFile)(filePath, `{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "esnext",
    ],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react",
    "jsxFactory": "createElement",
    "baseUrl": "src",
    "paths": {
      "@/*": [
        "src/*"
      ]
    }
  },
  "include": [
    "src"
  ],
}`, 'utf-8');
        console.log(chalk_1.default.green(` ✔️ Created ${appName}/tsconfig.json`));
    });
}
function createScriptingDeclaration(appName) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(` > Creating ${appName}/src/scripting.d.ts ...`);
        const srcPath = node_path_1.default.join(__dirname, '../public/scripting.d.ts');
        const destPath = node_path_1.default.join(getAppDir(appName), 'src/scripting.d.ts');
        yield (0, promises_1.copyFile)(srcPath, destPath);
        console.log(chalk_1.default.green(` ✔️ Created ${appName}/src/scripting.d.ts`));
    });
}
function createApp(appName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!/^[a-zA-Z]+[a-zA-Z0-9-_]+$/.test(appName)) {
            console.log(chalk_1.default.red(`✖️ Invalid Scripting application name "${appName}"`));
            return;
        }
        try {
            yield createAppDir(appName);
            yield createPackageJson(appName);
            yield createTSConfig(appName);
            yield createReadme(appName);
            yield createEntryFile(appName);
            yield createScriptingDeclaration(appName);
            // exec('npm i')
        }
        catch (e) {
            console.log(chalk_1.default.red(`✖️ Create Scripting application failed: ${e.message}`));
        }
    });
}
exports.createApp = createApp;
