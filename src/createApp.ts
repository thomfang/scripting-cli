import chalk from 'chalk'
import path from 'node:path'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import { mkdir, writeFile, copyFile } from 'node:fs/promises'

function getAppDir(appName: string) {
  return path.join(process.cwd(), appName)
}

async function createAppDir(appName: string) {
  const appDir = getAppDir(appName)

  if (fs.existsSync(appDir)) {
    throw new Error(`Directory "./${appName}" already exists.`)
  }

  const dir = path.resolve(appDir, 'src/svgs')
  await mkdir(dir, { recursive: true })
}

async function createEntryFile(appName: string) {
  console.log(` > Creating ${appName}/src/index.tsx ...`)

  const filePath = path.join(getAppDir(appName), '/src/index.tsx')

  await writeFile(
    filePath,
    `

    import { runApp, createElement, RouterProvider, Router, Column, CupertinoNavigationBar, CupertinoPageScaffold, Svg, Text, Container, Color } from 'scripting'
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
      const backgroundColor: Color = '#ffffff'
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
              <Text>Welcome to Scripting!</Text>
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

## Start dev server

\`npm run dev\`

## Build App

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

async function copyAssets(appName: string) {
  console.log(` > Creating ${appName}/src/scripting.d.ts ...`)
  await copyFile(
    path.join(__dirname, '../public/scripting.d.ts'),
    path.join(getAppDir(appName), 'src/scripting.d.ts')
  )
  console.log(
    chalk.green(` ✔️ Created ${appName}/src/scripting.d.ts`)
  )

  console.log(` > Creating ${appName}/src/assets.d.ts ...`)
  await copyFile(
    path.join(__dirname, '../public/assets.d.ts'),
    path.join(getAppDir(appName), 'src/assets.d.ts')
  )
  console.log(
    chalk.green(` ✔️ Created ${appName}/src/assets.d.ts`)
  )

  console.log(` > Creating ${appName}/src/svgs/logo.svg ...`)
  await copyFile(
    path.join(__dirname, '../public/logo.svg'),
    path.join(getAppDir(appName), 'src/svgs/logo.svg')
  )
  console.log(
    chalk.green(` ✔️ Created ${appName}/src/svgs/logo.svg`)
  )
}

async function createVSCodeSettings(appName: string) {
  const destDir = path.join(process.cwd(), '.vscode')

  if (!fs.existsSync(destDir)) {
    await mkdir(destDir)
  }

  await copyFile(
    path.join(__dirname, '../.vscode/settings.json'),
    path.join(getAppDir(appName), '.vscode/settings.json')
  )
}

function installDeps(appName: string) {
  execSync(`cd ${appName} && npm i -D ts-loader typescript file-loader`)

  console.log(
    chalk.green(` ✔️ Scripting application ${chalk.bold(appName)} created!`)
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
    await copyAssets(appName)
    await createVSCodeSettings(appName)

    installDeps(appName)

    console.log(
      ` ✔️ All done! Run ${chalk.bold(
        chalk.green('npm run dev')
      )} to start the dev server.`
    )

  } catch (e: any) {
    console.log(
      chalk.red(`✖️ Create Scripting application failed: ${e.message}`)
    )
  }
}