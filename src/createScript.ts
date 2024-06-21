import chalk from 'chalk'
import path from 'node:path'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import { mkdir, writeFile, copyFile } from 'node:fs/promises'

function getScriptDir(scriptName: string) {
  return path.join(process.cwd(), scriptName)
}

async function createScriptDir(scriptName: string) {
  const appDir = getScriptDir(scriptName)

  if (fs.existsSync(appDir)) {
    throw new Error(`Directory "./${scriptName}" already exists.`)
  }

  // const dir = path.resolve(appDir, 'src/svgs')
  const srcDir = path.resolve(appDir, 'src')
  const typesDir = path.resolve(appDir, 'types')
  await Promise.all([
    mkdir(srcDir, { recursive: true }),
    mkdir(typesDir, { recursive: true })
  ])
}

async function createEntryFile(scriptName: string) {
  console.log(` > Creating ${scriptName}/src/index.tsx ...`)

  const filePath = path.join(getScriptDir(scriptName), '/src/index.tsx')

  await writeFile(
    filePath,
    `import { Column, CupertinoNavigationBar, CupertinoPageScaffold, Text, Container, useCupertinoColors, navigator, GestureDetector, Script, Center, CupertinoButton, } from 'scripting'

function App() {
  const cupertinoColors = useCupertinoColors()
  const backgroundColor = cupertinoColors.systemBackground

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
          color={cupertinoColors.label}
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
`,
    'utf-8'
  )

  console.log(
    chalk.green(` ✔️ Created ${scriptName}/src/index.tsx`)
  )
}

async function createPackageJson(scriptName: string) {
  console.log(` > Creating ${scriptName}/package.json ...`)

  const filePath = path.join(getScriptDir(scriptName), 'package.json')

  await writeFile(
    filePath,
    `{
  "name": "${scriptName}",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "npx scripting-cli dev",
    "build": "npx scripting-cli build"
  }
}`,
    'utf-8'
  )

  console.log(
    chalk.green(` ✔️ Created ${scriptName}/package.json`)
  )
}

async function createReadme(scriptName: string) {

  console.log(` > Creating ${scriptName}/README.md ...`)

  const filePath = path.join(getScriptDir(scriptName), 'README.md')

  await writeFile(
    filePath,
    `# ${scriptName} - A Scripting script

## Start dev server

\`npm run dev\`

## Build App

\`npm run build\`
`,
    'utf-8'
  )

  console.log(
    chalk.green(` ✔️ Created ${scriptName}/README.md`)
  )
}

async function createTSConfig(scriptName: string) {

  console.log(` > Creating ${scriptName}/tsconfig.json ...`)

  const filePath = path.join(getScriptDir(scriptName), 'tsconfig.json')

  await writeFile(
    filePath,
    `{
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
    "skipLibCheck": true,
    "jsx": "react",
    "jsxFactory": "createElement",
    "baseUrl": "src",
    "typeRoots": ["./types"],
    // "paths": {
    //   "@/*": [
    //     "src/*"
    //   ]
    // }
  },
  "include": [
    "src"
  ],
}`,
    'utf-8'
  )

  console.log(
    chalk.green(` ✔️ Created ${scriptName}/tsconfig.json`)
  )
}

async function copyAsset(scriptName: string, fileName: string) {
  console.log(` > Creating ${scriptName}/types/${fileName}.d.ts ...`)
  await copyFile(
    path.join(__dirname, `../public/${fileName}.d.ts`),
    path.join(getScriptDir(scriptName), `types/${fileName}.d.ts`)
  )
  console.log(
    chalk.green(` ✔️ Created ${scriptName}/types/${fileName}.d.ts`)
  )
}

async function copyAssets(scriptName: string) {
  await copyAsset(scriptName, 'scripting')
  await copyAsset(scriptName, 'global')
  await copyAsset(scriptName, 'assets')

  // console.log(` > Creating ${scriptName}/src/svgs/logo.svg ...`)
  // await copyFile(
  //   path.join(__dirname, '../public/logo.svg'),
  //   path.join(getScriptDir(scriptName), 'src/svgs/logo.svg')
  // )
  // console.log(
  //   chalk.green(` ✔️ Created ${scriptName}/src/svgs/logo.svg`)
  // )
}

async function createVSCodeSettings(scriptName: string) {
  const destDir = path.join(getScriptDir(scriptName), '.vscode')

  if (!fs.existsSync(destDir)) {
    await mkdir(destDir, { recursive: true })
  }

  await copyFile(
    path.join(__dirname, '../.vscode/settings.json'),
    path.join(destDir, 'settings.json')
  )
}

function installDeps(scriptName: string) {
  console.log(
    ` > cd ${scriptName} && npm i -D ts-loader typescript file-loader`
  )
  execSync(`cd ${scriptName} && npm i -D ts-loader typescript file-loader`)

  console.log(
    chalk.green(` ✔️ Scripting script ${chalk.bold(scriptName)} is ready!`)
  )
}

export async function createScript(scriptName: string) {
  if (!/^[a-zA-Z]+[a-zA-Z0-9-_]+$/.test(scriptName)) {
    console.log(
      chalk.red(`✖️ Invalid Scripting script name "${scriptName}"`)
    )
    return
  }

  console.log(
    `Start creating ${scriptName} ...`
  )

  try {
    await createScriptDir(scriptName)
    await createPackageJson(scriptName)
    await createTSConfig(scriptName)
    await createReadme(scriptName)
    await createEntryFile(scriptName)
    await copyAssets(scriptName)
    await createVSCodeSettings(scriptName)

    installDeps(scriptName)

    console.log(
      `All done! Run ${chalk.bold(
        chalk.green(`cd ${scriptName} && npm run dev`)
      )} to start the dev server.`
    )

  } catch (e: any) {
    console.log(
      chalk.red(`✖️ Create script failed: ${e.message}`)
    )
  }
}