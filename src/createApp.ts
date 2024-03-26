import chalk from 'chalk'
import path from 'node:path'
import { exec } from 'node:child_process'
import fs from 'node:fs'
import { mkdir, writeFile, copyFile } from 'node:fs/promises'

console.log(__dirname)

function getAppDir(appName: string) {
  return path.join(__dirname, appName)
}

async function createAppDir(appName: string) {
  const dir = path.join(getAppDir(appName), 'src')
  if (fs.existsSync(dir)) {
    throw new Error(`Directory "./${appName}" already exists.`)
  }
  await mkdir(dir, { recursive: true })
}

async function createEntryFile(appName: string) {
  console.log(` > Creating ${appName}/src/index.tsx ...`)

  const filePath = path.join(getAppDir(appName), '/src/index.tsx')

  await writeFile(
    filePath,
    `
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
`,
    'utf-8'
  )

  console.log(
    chalk.green(` ✔️ Created ${appName}/src/index.tsx`)
  )
}

async function createPackageJson(appName: string) {
  console.log(` > Creating ${appName}/package.json ...`)

  const filePath = path.join(getAppDir(appName), 'package.json')

  await writeFile(
    filePath,
    `{
  "name": "${appName}",
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
    chalk.green(` ✔️ Created ${appName}/package.json`)
  )
}

async function createReadme(appName: string) {

  console.log(` > Creating ${appName}/README.md ...`)

  const filePath = path.join(getAppDir(appName), 'README.md')

  await writeFile(
    filePath,
    `# ${appName} - A Scripting application

## Quick Start

### Installation

\`npm install\`

### Start dev server

\`npm run dev\`

### Build App

\`npm run build\`
`,
    'utf-8'
  )

  console.log(
    chalk.green(` ✔️ Created ${appName}/README.md`)
  )
}

async function createTSConfig(appName: string) {

  console.log(` > Creating ${appName}/tsconfig.json ...`)

  const filePath = path.join(getAppDir(appName), 'tsconfig.json')

  await writeFile(
    filePath,
    `{
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
}`,
    'utf-8'
  )

  console.log(
    chalk.green(` ✔️ Created ${appName}/tsconfig.json`)
  )
}

async function createScriptingDeclaration(appName: string) {
  console.log(` > Creating ${appName}/src/scripting.d.ts ...`)

  const srcPath = path.join(__dirname, '../public/scripting.d.ts')
  const destPath = path.join(getAppDir(appName), 'src/scripting.d.ts')

  await copyFile(srcPath, destPath)

  console.log(
    chalk.green(` ✔️ Created ${appName}/src/scripting.d.ts`)
  )
}

export async function createApp(appName: string) {
  if (!/^[a-zA-Z]+[a-zA-Z0-9-_]+$/.test(appName)) {
    console.log(
      chalk.red(`✖️ Invalid Scripting application name "${appName}"`)
    )
    return
  }

  try {
    await createAppDir(appName)
    await createPackageJson(appName)
    await createTSConfig(appName)
    await createReadme(appName)
    await createEntryFile(appName)
    await createScriptingDeclaration(appName)

    // exec('npm i')
  } catch (e: any) {
    console.log(
      chalk.red(`✖️ Create Scripting application failed: ${e.message}`)
    )
  }
}