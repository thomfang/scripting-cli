# Outil en ligne de commande pour l'application Scripting

Bienvenue dans `scripting-cli`, l'outil en ligne de commande conçu pour l'intégration avec l'application Scripting. Cet outil vous permet de synchroniser et de prévisualiser vos scripts en temps réel pendant que vous les développez à l'aide de votre éditeur de bureau préféré (VSCode, Cursor, Windsurf, Zed, WebStorm, Vim, et plus encore).

[English](./README.md) | [中文](./README_zh.md) | [日本語](./README_ja.md) | [Deutsch](./README_de.md) | [Italiano](./README_it.md)

## Prérequis

Avant d'utiliser `scripting-cli`, assurez-vous que les conditions suivantes sont remplies :

1. **Node.js** : Assurez-vous qu'une version récente de Node.js est installée. Vérifiez votre version actuelle avec :

   ```bash
   node -v
   ```

2. **Application Scripting** : L'application Scripting doit être installée pour se connecter au service local lancé par `scripting-cli`.

## Installation

Il n'est pas nécessaire d'installer `scripting-cli` globalement. Exécutez-le simplement avec `npx` :

```bash
npx scripting-cli <command>
```

## Utilisation

### 1. Créer un répertoire de travail

Créez un répertoire où vos scripts de l'application Scripting seront stockés. Par exemple :

```bash
mkdir my-scripting-project
cd my-scripting-project
```

### 2. Démarrer le service local

Dans votre répertoire de travail, exécutez la commande suivante pour démarrer le service de développement local :

```bash
npx scripting-cli start
```

Par défaut, ce service démarre sur le port `3000`. Pour spécifier un autre port, utilisez l'option `--port` :

```bash
npx scripting-cli start --port=4000
```

Pour activer la prise en charge de Bonjour, permettant à l'application Scripting de détecter automatiquement le service local, ajoutez le drapeau `--bonjour` :

```bash
npx scripting-cli start --bonjour
```

### 3. Connecter l'application Scripting

Une fois le service en cours d'exécution, ouvrez l'**application Scripting** et connectez-vous au service local que vous venez de démarrer. Cela établira une connexion entre l'application et votre répertoire de travail.

### 4. Déboguer et synchroniser le code

Après la connexion, sélectionnez le projet de script que vous souhaitez déboguer. L'application Scripting synchronisera automatiquement le code de ce projet avec votre répertoire de travail.

### 5. Synchronisation du code en temps réel

Lorsque vous écrivez et enregistrez des scripts dans votre éditeur de bureau (par exemple, VSCode), les modifications seront automatiquement synchronisées avec l'application Scripting et exécutées en temps réel, rendant le développement et le débogage beaucoup plus fluides.

## Sélection de l'éditeur et fichier de configuration

`scripting-cli` n'est plus lié à VSCode. Lors du premier lancement de `npx scripting-cli start`, vous serez invité à choisir l'éditeur que vous utilisez réellement. Votre choix est enregistré dans `scripting.config.json` à la racine de votre projet, afin que l'invite ne réapparaisse plus.

### Éditeurs pris en charge

VSCode, VSCode Insiders, VSCodium, Cursor, Windsurf, Trae, Zed, WebStorm, IntelliJ IDEA, Fleet, Sublime Text, Nova, Vim, Neovim, Emacs, ainsi que `custom` (toute autre commande) et `none` (désactiver l'ouverture automatique).

Les éditeurs détectés dans votre `PATH` sont marqués d'un ✓ et listés en premier.

### Remplacement ponctuel

```bash
# Utiliser Cursor uniquement pour cette exécution (ne modifie pas scripting.config.json)
npx scripting-cli start --editor=cursor

# Relancer la sélection interactive et écraser le choix enregistré
npx scripting-cli start --reconfigure
```

### Fichier de configuration

`scripting-cli` recherche le premier fichier de configuration trouvé dans cet ordre :

```
scripting.config.ts
scripting.config.mts
scripting.config.cts
scripting.config.js
scripting.config.mjs
scripting.config.cjs
scripting.config.json
```

Le fichier par défaut est JSON afin que le flux npx reste sans installation. Les fichiers TypeScript et JavaScript sont chargés via [jiti](https://github.com/unjs/jiti).

```jsonc
// scripting.config.json
{
  "editor": "cursor",          // voir les éditeurs pris en charge ci-dessus
  "editorCommand": "cursor",   // optionnel, remplace la commande par défaut
  "editorArgs": [],            // optionnel, arguments CLI supplémentaires
  "port": 3000,
  "autoOpen": true,
  "generateTsConfig": true,    // mettre à false si vous gérez tsconfig.json vous-même
  "logLevel": "info"           // "silent" | "error" | "warn" | "info" | "debug"
}
```

Les drapeaux CLI ont la priorité sur le fichier de configuration.

### Complétion de types (configuration TypeScript)

Pour bénéficier de l'autocomplétion dans `scripting.config.ts`, installez scripting-cli en tant que dépendance de développement :

```bash
npm i -D scripting-cli
```

Puis :

```ts
// scripting.config.ts
import { defineConfig } from 'scripting-cli'

export default defineConfig({
  editor: 'cursor',
  port: 4000,
})
```

Vous pouvez également utiliser `.ts` sans installer le paquet — `npx scripting-cli start` le chargera toujours via `jiti`. Vous n'aurez simplement pas les indications de types dans l'IDE.

## Exemple de flux de travail

1. Démarrer le service local :

   ```bash
   npx scripting-cli start
   ```

2. Ouvrez votre éditeur et écrivez votre script.

3. Enregistrez le fichier de script.

4. Le code mis à jour est automatiquement synchronisé avec l'application Scripting et exécuté.

## Informations supplémentaires

* Le port par défaut est `3000`. S'il est déjà utilisé, spécifiez-en un autre avec l'option `--port`.
* Utilisez le drapeau `--no-auto-open` pour empêcher l'outil d'ouvrir automatiquement `index.tsx` ou `widget.tsx` :

  ```bash
  npx scripting-cli start --no-auto-open
  ```
* Utilisez `--editor=<key>` pour remplacer l'éditeur configuré pour une seule exécution, ou `--reconfigure` pour relancer la sélection interactive de l'éditeur.
* Pour utiliser le service Bonjour, assurez-vous que votre système le prend en charge. Sur Windows, vous devrez peut-être installer Bonjour manuellement. Ensuite, utilisez l'option `--bonjour` pour l'activer.
* Cet outil fonctionne avec n'importe quel éditeur de bureau et offre une synchronisation et un débogage du code sans faille avec l'application Scripting.

## Dépannage

Si vous rencontrez des problèmes, assurez-vous que :

* Vous utilisez Node.js version 20 ou supérieure.
* L'application Scripting est correctement connectée au service local.
* Aucun autre processus n'utilise le port que vous souhaitez utiliser.
* Vous exécutez toujours l'outil avec `npx scripting-cli <command>` et que le package est à jour.

---

Profitez de l'utilisation de `scripting-cli` dans votre flux de travail de développement avec l'application Scripting ! Bon codage !