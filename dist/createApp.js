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
const node_child_process_1 = require("node:child_process");
const node_fs_1 = __importDefault(require("node:fs"));
const promises_1 = require("node:fs/promises");
function getAppDir(appName) {
    return node_path_1.default.join(process.cwd(), appName);
}
function createAppDir(appName) {
    return __awaiter(this, void 0, void 0, function* () {
        const appDir = getAppDir(appName);
        if (node_fs_1.default.existsSync(appDir)) {
            throw new Error(`Directory "./${appName}" already exists.`);
        }
        const dir = node_path_1.default.resolve(appDir, 'src/svgs');
        yield (0, promises_1.mkdir)(dir, { recursive: true });
    });
}
function createEntryFile(appName) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(` > Creating ${appName}/src/index.tsx ...`);
        const filePath = node_path_1.default.join(getAppDir(appName), '/src/index.tsx');
        yield (0, promises_1.writeFile)(filePath, `import { runApp, createElement, RouterProvider, Router, Column, CupertinoNavigationBar, CupertinoPageScaffold, Svg, Text, Container, useCupertinoColors } from 'scripting'
import Logo from './svgs/logo.svg'

function ScriptingLogo() {
  return (
    <Container
      clipBehavior={'hardEdge'}
      width={80}
      height={80}
      margin={{
        vertical: 100,
      }}
      borderRadius={16}
    >
      <Svg src={Logo} />
    </Container>
  )
}

function HomePage() {
  const cupertinoColors = useCupertinoColors()
  const backgroundColor = cupertinoColors.systemBackground

  return (
    <CupertinoPageScaffold
      navigationBar={
        <CupertinoNavigationBar
          middle={
            <Text>${appName}</Text>
          }
          backgroundColor={backgroundColor}
        />
      }
    >
      <Container
        width={'infinity'}
        height={'infinity'}
        color={backgroundColor}
      >
        <Column
          crossAxisAlignment={'center'}
        >
          <ScriptingLogo />
          <Text
            color={cupertinoColors.label}
          >Welcome to Scripting!</Text>
        </Column>
      </Container>
    </CupertinoPageScaffold>
  )
}

const router = new Router([
  {
    path: '/',
    element: <HomePage />,
  },
])

runApp(
  <RouterProvider router={router} />
)`, 'utf-8');
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

## Start dev server

\`npm run dev\`

## Build App

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
function copyAssets(appName) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(` > Creating ${appName}/src/scripting.d.ts ...`);
        yield (0, promises_1.copyFile)(node_path_1.default.join(__dirname, '../public/scripting.d.ts'), node_path_1.default.join(getAppDir(appName), 'src/scripting.d.ts'));
        console.log(chalk_1.default.green(` ✔️ Created ${appName}/src/scripting.d.ts`));
        console.log(` > Creating ${appName}/src/assets.d.ts ...`);
        yield (0, promises_1.copyFile)(node_path_1.default.join(__dirname, '../public/assets.d.ts'), node_path_1.default.join(getAppDir(appName), 'src/assets.d.ts'));
        console.log(chalk_1.default.green(` ✔️ Created ${appName}/src/assets.d.ts`));
        console.log(` > Creating ${appName}/src/svgs/logo.svg ...`);
        yield (0, promises_1.copyFile)(node_path_1.default.join(__dirname, '../public/logo.svg'), node_path_1.default.join(getAppDir(appName), 'src/svgs/logo.svg'));
        console.log(chalk_1.default.green(` ✔️ Created ${appName}/src/svgs/logo.svg`));
    });
}
function createVSCodeSettings(appName) {
    return __awaiter(this, void 0, void 0, function* () {
        const destDir = node_path_1.default.join(getAppDir(appName), '.vscode');
        if (!node_fs_1.default.existsSync(destDir)) {
            yield (0, promises_1.mkdir)(destDir, { recursive: true });
        }
        yield (0, promises_1.copyFile)(node_path_1.default.join(__dirname, '../.vscode/settings.json'), node_path_1.default.join(destDir, 'settings.json'));
    });
}
function installDeps(appName) {
    console.log(` > cd ${appName} && npm i -D ts-loader typescript file-loader`);
    (0, node_child_process_1.execSync)(`cd ${appName} && npm i -D ts-loader typescript file-loader`);
    console.log(chalk_1.default.green(` ✔️ Scripting application ${chalk_1.default.bold(appName)} is ready!`));
}
function createApp(appName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!/^[a-zA-Z]+[a-zA-Z0-9-_]+$/.test(appName)) {
            console.log(chalk_1.default.red(`✖️ Invalid Scripting application name "${appName}"`));
            return;
        }
        console.log(`Start creating ${appName} ...`);
        try {
            yield createAppDir(appName);
            yield createPackageJson(appName);
            yield createTSConfig(appName);
            yield createReadme(appName);
            yield createEntryFile(appName);
            yield copyAssets(appName);
            yield createVSCodeSettings(appName);
            installDeps(appName);
            console.log(`All done! Run ${chalk_1.default.bold(chalk_1.default.green(`cd ${appName} && npm run dev`))} to start the dev server.`);
        }
        catch (e) {
            console.log(chalk_1.default.red(`✖️ Create Scripting application failed: ${e.message}`));
        }
    });
}
exports.createApp = createApp;
