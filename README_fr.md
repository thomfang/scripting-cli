# Outil en ligne de commande pour l'application Scripting

Bienvenue dans `scripting-cli`, l'outil en ligne de commande conçu pour l'intégration avec l'application Scripting. Cet outil vous permet de synchroniser et de prévisualiser vos scripts en temps réel pendant que vous les développez à l'aide de votre éditeur de bureau préféré, tel que VSCode.

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
* Pour utiliser le service Bonjour, assurez-vous que votre système le prend en charge. Sur Windows, vous devrez peut-être installer Bonjour manuellement. Ensuite, utilisez l'option `--bonjour` pour l'activer.
* Cet outil est idéal pour les utilisateurs qui préfèrent les éditeurs de bureau comme VSCode et souhaitent une synchronisation et un débogage du code sans faille avec l'application Scripting.

## Dépannage

Si vous rencontrez des problèmes, assurez-vous que :

* Vous utilisez Node.js version 20 ou supérieure.
* L'application Scripting est correctement connectée au service local.
* Aucun autre processus n'utilise le port que vous souhaitez utiliser.
* Vous exécutez toujours l'outil avec `npx scripting-cli <command>` et que le package est à jour.

---

Profitez de l'utilisation de `scripting-cli` dans votre flux de travail de développement avec l'application Scripting ! Bon codage !