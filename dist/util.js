"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.md5 = md5;
exports.isBinaryFile = isBinaryFile;
exports.getPath = getPath;
exports.getScriptPath = getScriptPath;
exports.createTsConfig = createTsConfig;
exports.ensureScriptsDirectory = ensureScriptsDirectory;
exports.ensureDirectoryExistence = ensureDirectoryExistence;
exports.writeDtsFiles = writeDtsFiles;
exports.getRelativePath = getRelativePath;
exports.isIgnoredPath = isIgnoredPath;
exports.migrateOldFiles = migrateOldFiles;
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const chalk_1 = __importDefault(require("chalk"));
const const_1 = require("./const");
function md5(content) {
    return crypto_1.default
        .createHash('md5')
        .update(content)
        .digest('hex');
}
// Drop an incomplete trailing UTF-8 multibyte sequence so a text file whose
// character happens to straddle the read boundary isn't misjudged as binary.
function trimIncompleteUtf8Tail(chunk) {
    let i = chunk.length - 1;
    let cont = 0;
    // Walk back over continuation bytes (10xxxxxx).
    while (i >= 0 && (chunk[i] & 0xc0) === 0x80) {
        cont++;
        i--;
    }
    if (i < 0)
        return chunk;
    const lead = chunk[i];
    let seqLen;
    if ((lead & 0x80) === 0x00)
        seqLen = 1; // ASCII
    else if ((lead & 0xe0) === 0xc0)
        seqLen = 2;
    else if ((lead & 0xf0) === 0xe0)
        seqLen = 3;
    else if ((lead & 0xf8) === 0xf0)
        seqLen = 4;
    else
        return chunk; // invalid lead — let the decoder flag it
    // Fewer bytes than the sequence needs → it's cut off; trim it.
    if (cont + 1 < seqLen) {
        return chunk.subarray(0, i);
    }
    return chunk;
}
// Detect whether a file is binary by content instead of extension.
// Reads the first 1024 bytes: a NUL byte or non-UTF-8 content means binary.
// Conceptually mirrors FileManagerService.isBinaryFileSync on the iOS side.
function isBinaryFile(filePath) {
    let fd = null;
    try {
        fd = fs_1.default.openSync(filePath, 'r');
        const buffer = Buffer.alloc(1024);
        const bytesRead = fs_1.default.readSync(fd, buffer, 0, 1024, 0);
        const chunk = buffer.subarray(0, bytesRead);
        if (chunk.includes(0)) {
            return true;
        }
        try {
            new TextDecoder('utf-8', { fatal: true }).decode(trimIncompleteUtf8Tail(chunk));
            return false;
        }
        catch {
            return true;
        }
    }
    catch (err) {
        console.log(chalk_1.default.red(`Failed to inspect file: ${filePath}, ${err}`));
        // On failure, fall back to treating it as text (previous default behavior).
        return false;
    }
    finally {
        if (fd != null) {
            fs_1.default.closeSync(fd);
        }
    }
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
        "./dts/${const_1.scriptingDtsFileName}"
      ]
    }
  },
  "include": [
    "./dts/*.d.ts",
    "scripts"
  ],
  "exclude": [
    "./dts/${const_1.scriptingDtsFileName}"
  ]
}`;
    const filePath = getPath('tsconfig.json');
    ensureDirectoryExistence(filePath);
    if (!fs_1.default.existsSync(filePath)) {
        fs_1.default.writeFileSync(filePath, tsconfigContent);
        console.log(chalk_1.default.green('tsconfig.json created.'));
        return;
    }
    // Migrate an existing tsconfig to the current include/exclude shape:
    // - all ambient dts are picked up via the "./dts/*.d.ts" glob (so newly synced
    //   node.d.ts / web-fetch.d.ts / safari-ext.d.ts are covered automatically),
    // - scripting.d.ts is excluded from the root program (it stays importable via
    //   the "scripting" paths mapping). Existing custom entries are preserved.
    const tsconfig = JSON.parse(fs_1.default.readFileSync(filePath, 'utf-8'));
    const include = Array.isArray(tsconfig.include) ? [...tsconfig.include] : [];
    const exclude = Array.isArray(tsconfig.exclude) ? [...tsconfig.exclude] : [];
    // Drop the stale explicit global entry now covered by the glob.
    let nextInclude = include.filter((x) => x !== `./dts/${const_1.globalDtsFileName}`);
    if (!nextInclude.includes('./dts/*.d.ts'))
        nextInclude.unshift('./dts/*.d.ts');
    if (!nextInclude.includes('scripts'))
        nextInclude.push('scripts');
    const nextExclude = exclude.includes(`./dts/${const_1.scriptingDtsFileName}`)
        ? exclude
        : [...exclude, `./dts/${const_1.scriptingDtsFileName}`];
    const includeChanged = JSON.stringify(nextInclude) !== JSON.stringify(include);
    const excludeChanged = JSON.stringify(nextExclude) !== JSON.stringify(exclude);
    if (includeChanged || excludeChanged) {
        tsconfig.include = nextInclude;
        tsconfig.exclude = nextExclude;
        fs_1.default.writeFileSync(filePath, JSON.stringify(tsconfig, null, 2));
        console.log(chalk_1.default.yellow('tsconfig.json updated to sync all ambient type declarations.'));
    }
    else {
        console.log(chalk_1.default.gray('tsconfig.json already exists.'));
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
        // These names arrive over the wire; only allow a plain `.d.ts` basename so
        // a crafted name can't escape the dts/ directory.
        if (typeof content !== 'string' ||
            filename !== path_1.default.basename(filename) ||
            !filename.endsWith('.d.ts')) {
            console.log(chalk_1.default.red(`Skipped writing dts file with unexpected name: ${filename}`));
            return;
        }
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
// Whether a script-relative path should be excluded from syncing.
// Always ignores dotfiles/dot-directories and node_modules; `patterns` adds
// user-configured excludes. Kept in sync with the iOS default ignore logic.
function isIgnoredPath(relativePath, patterns = []) {
    const normalized = relativePath.replaceAll("\\", "/");
    const segments = normalized.split("/").filter(Boolean);
    // Default ignores.
    for (const seg of segments) {
        if (seg.startsWith(".") || seg === "node_modules") {
            return true;
        }
    }
    // User-configured patterns.
    const basename = segments[segments.length - 1] ?? "";
    for (const raw of patterns) {
        const pattern = raw.trim();
        if (!pattern)
            continue;
        if (pattern.startsWith("*.")) {
            // Extension match, e.g. "*.log".
            if (basename.endsWith(pattern.slice(1)))
                return true;
        }
        else if (pattern.includes("/")) {
            // Path match (relative), prefix or exact.
            const p = pattern.replace(/^\/+|\/+$/g, "");
            if (normalized === p || normalized.startsWith(p + "/"))
                return true;
        }
        else {
            // Directory or file name match on any segment.
            if (segments.includes(pattern))
                return true;
        }
    }
    return false;
}
async function migrateOldFiles() {
    try {
        const list = await fs_1.default.promises.readdir(process.cwd());
        let hasMigrated = false;
        for (const file of list) {
            if (file === 'dts' || file == "scripts" || file === 'tsconfig.json' || file === 'package.json' || file === 'node_modules' || file.startsWith('.')) {
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
            hasMigrated = true;
            console.log(chalk_1.default.blue(`Moving ${filePath} to ${newFilePath}`));
            await fs_1.default.promises.rename(filePath, newFilePath);
        }
        if (hasMigrated) {
            console.log(chalk_1.default.green('Old files migrated to the scripts directory.'));
        }
        else {
            console.log(chalk_1.default.gray('No old files to migrate.'));
        }
    }
    catch (err) {
        console.log(`Failed to migrate old files: ${chalk_1.default.red(`${err}`)}`);
    }
}
