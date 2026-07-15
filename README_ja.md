# Scripting アプリ コマンドラインツール

Scripting アプリとの統合用に設計された `scripting-cli` コマンドラインツールへようこそ。このツールを使用すると、お気に入りのデスクトップエディター（VSCode、Cursor、Windsurf、Zed、WebStorm、Vim など）でスクリプトを開発しながら、リアルタイムで同期およびプレビューできます。

[English](./README.md) | [中文](./README_zh.md) | [Deutsch](./README_de.md) | [Français](./README_fr.md) | [Italiano](./README_it.md)

## 前提条件

`scripting-cli` を使用する前に、以下の要件を満たしていることを確認してください：

1. **Node.js**：最新バージョンの Node.js がインストールされていることを確認してください。現在のバージョンを確認するには、次のコマンドを実行します：

   ```bash
   node -v
   ```

2. **Scripting アプリ**：`scripting-cli` が起動するローカルサービスに接続するために、Scripting アプリをインストールする必要があります。

## インストール

`scripting-cli` をグローバルにインストールする必要はありません。`npx` を使用して実行するだけです：

```bash
npx scripting-cli <command>
```

## 使用方法

### 1. 作業ディレクトリの作成

まず、Scripting アプリのスクリプトを保存するディレクトリを作成します。例：

```bash
mkdir my-scripting-project
cd my-scripting-project
```

### 2. ローカルサービスの起動

作業ディレクトリで、次のコマンドを実行してローカル開発サービスを起動します：

```bash
npx scripting-cli start
```

デフォルトでは、サービスはポート `3000` で起動します。別のポートを指定するには、`--port` オプションを使用します：

```bash
npx scripting-cli start --port=4000
```

Bonjour サポートを有効にして、Scripting アプリがローカルサービスを自動的に検出できるようにするには、`--bonjour` フラグを追加します：

```bash
npx scripting-cli start --bonjour
```

### 3. Scripting アプリの接続

サービスが起動したら、**Scripting アプリ** を開き、先ほど起動したローカルサービスに接続します。これにより、アプリと作業ディレクトリ間の接続が確立されます。

### 4. コードのデバッグと同期

接続後、デバッグしたいスクリプトプロジェクトを選択します。Scripting アプリは、プロジェクトのコードを自動的に作業ディレクトリと同期します。

### 5. リアルタイムコード同期

デスクトップエディター（例：VSCode）でスクリプトを作成して保存すると、変更内容が自動的に Scripting アプリと同期され、リアルタイムで実行されます。これにより、開発とデバッグがスムーズになります。

## エディターの選択と設定ファイル

`scripting-cli` は VSCode に縛られなくなりました。`npx scripting-cli start` を初めて実行すると、実際に使用するエディターを選択するように求められます。選択内容はプロジェクトのルートにある `scripting.config.json` に保存されるため、次回以降は確認されません。

### 対応エディター

VSCode、VSCode Insiders、VSCodium、Cursor、Windsurf、Trae、Zed、WebStorm、IntelliJ IDEA、Fleet、Sublime Text、Nova、Vim、Neovim、Emacs、さらに `custom`（任意のコマンド）と `none`（自動オープンを無効化）。

`PATH` 上で検出されたエディターには ✓ が付き、先頭に表示されます。

### 実行ごとの上書き

```bash
# 今回の実行のみ Cursor を使用（scripting.config.json は変更されません）
npx scripting-cli start --editor=cursor

# 対話式の選択をやり直し、保存済みの選択を上書き
npx scripting-cli start --reconfigure
```

### 設定ファイル

`scripting-cli` は以下の順序で最初に見つかった設定ファイルを使用します：

```
scripting.config.ts
scripting.config.mts
scripting.config.cts
scripting.config.js
scripting.config.mjs
scripting.config.cjs
scripting.config.json
```

デフォルトは JSON ファイルで、npx フローをゼロインストールに保ちます。TypeScript および JavaScript ファイルは [jiti](https://github.com/unjs/jiti) 経由で読み込まれます。

```jsonc
// scripting.config.json
{
  "editor": "cursor",          // 上記の対応エディターを参照
  "editorCommand": "cursor",   // 任意、デフォルトコマンドを上書き
  "editorArgs": [],            // 任意、追加の CLI 引数
  "port": 3000,
  "autoOpen": true,
  "generateTsConfig": true,    // 自分で tsconfig.json を管理する場合は false に設定
  "logLevel": "info",          // "silent" | "error" | "warn" | "info" | "debug"
  "ignore": ["*.log", "dist", "assets/large.mp4"]  // 同期から除外する追加ファイル
}
```

CLI フラグは設定ファイルより優先されます。

### 同期からファイルを除外する（`ignore`）

同期はスクリプトディレクトリ内の**すべて**のファイル（ソースコードに加え、画像・フォント・その他任意のアセット）を、
双方向（アプリ ⇄ デスクトップ）で対象とします。
テキストファイルは変更追跡付きで同期され、それ以外は生バイトとして転送されます。

ドットファイル / ドットディレクトリ（`.git`、`.vscode`、`.DS_Store` など）と `node_modules` は
**デフォルトで常に除外**されます。さらにファイルを除外するには `ignore` を使います：

```jsonc
{
  "ignore": [
    "*.log",            // 拡張子グロブ —— .log で終わる任意のファイルに一致
    "dist",             // 名前 —— 任意の階層で "dist" という名前のファイルまたはディレクトリに一致
    "assets/big.mp4"    // パス —— スクリプトルートからの相対パスとしてこのファイルに一致
  ]
}
```

各項目は次の 3 つの形式のいずれかで照合されます：

- `*.ext` —— 拡張子でファイルに一致。
- 単純な名前（`/` を含まない）—— その名前を持つ任意のパスセグメント（ファイルまたはディレクトリ）に一致。
- `/` を含むパス —— そのスクリプト相対パス（完全一致またはディレクトリの接頭辞）に一致。

`ignore` は両方の同期方向に適用されます。

### 型補完（TypeScript 設定）

`scripting.config.ts` で自動補完を得るには、scripting-cli を開発依存関係としてインストールします：

```bash
npm i -D scripting-cli
```

その後：

```ts
// scripting.config.ts
import { defineConfig } from 'scripting-cli'

export default defineConfig({
  editor: 'cursor',
  port: 4000,
})
```

パッケージをインストールせずに `.ts` を使用することもできます — `npx scripting-cli start` は引き続き `jiti` 経由で読み込みます。ただし IDE の型ヒントは得られません。

## 例：ワークフロー

1. ローカルサービスを起動します：

   ```bash
   npx scripting-cli start
   ```

2. エディターを開いてスクリプトを作成します。

3. スクリプトファイルを保存します。

4. 更新されたコードが自動的に Scripting アプリと同期され、実行されます。

## 追加情報

* デフォルトのポートは `3000` です。既に使用されている場合は、`--port` オプションで別のポートを指定してください。
* `--no-auto-open` フラグを使用すると、`index.tsx` または `widget.tsx` ファイルが自動的に開かれるのを防げます：

  ```bash
  npx scripting-cli start --no-auto-open
  ```
* `--editor=<key>` を使用すると、1 回の実行のみ設定済みのエディターを上書きでき、`--reconfigure` を使用すると対話式のエディター選択をやり直せます。
* Bonjour サービスを使用するには、システムがその機能をサポートしていることを確認してください。Windows では、Bonjour を手動でインストールする必要がある場合があります。その後、`--bonjour` オプションを使用してサービスを有効にします。
* このツールはあらゆるデスクトップエディターで動作し、Scripting アプリとのシームレスなコード同期とデバッグを提供します。

## トラブルシューティング

問題が発生した場合は、以下を確認してください：

* Node.js バージョン 20 以上を使用していること。
* Scripting アプリがローカルサービスに正しく接続されていること。
* 選択したポートが他のプロセスによって使用されていないこと。
* 常に `npx scripting-cli <command>` を使用してツールを実行し、パッケージが最新であることを確認してください。

---

Scripting アプリの開発ワークフローで `scripting-cli` をご活用ください。楽しいコーディングを！