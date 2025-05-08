# Scripting-App-Befehlszeilentool

Willkommen beim `scripting-cli`, dem Befehlszeilentool für die Integration mit der Scripting-App. Dieses Tool ermöglicht es Ihnen, Ihre Skripte in Echtzeit zu synchronisieren und während der Entwicklung mit Ihrem bevorzugten Desktop-Editor, wie z. B. VSCode, anzuzeigen.

[English](./README.md) | [中文](./README_zh.md) | [日本語](./README_ja.md) | [Français](./README_fr.md) | [Italiano](./README_it.md)

## Voraussetzungen

Bevor Sie `scripting-cli` verwenden, stellen Sie sicher, dass die folgenden Anforderungen erfüllt sind:

1. **Node.js**: Stellen Sie sicher, dass eine aktuelle Version von Node.js installiert ist. Überprüfen Sie Ihre aktuelle Version mit:

   ```bash
   node -v
   ```

2. **Scripting-App**: Die Scripting-App muss installiert sein, um eine Verbindung mit dem lokalen Dienst herzustellen, der von `scripting-cli` gestartet wird.

## Installation

Es ist keine globale Installation von `scripting-cli` erforderlich. Führen Sie es einfach mit `npx` aus:

```bash
npx scripting-cli <command>
```

## Verwendung

### 1. Arbeitsverzeichnis erstellen

Erstellen Sie ein Verzeichnis, in dem Ihre Scripting-App-Skripte gespeichert werden. Zum Beispiel:

```bash
mkdir my-scripting-project
cd my-scripting-project
```

### 2. Lokalen Dienst starten

Führen Sie im Arbeitsverzeichnis den folgenden Befehl aus, um den lokalen Entwicklungsdienst zu starten:

```bash
npx scripting-cli start
```

Standardmäßig wird der Dienst auf Port `3000` gestartet. Um einen anderen Port anzugeben, verwenden Sie die Option `--port`:

```bash
npx scripting-cli start --port=4000
```

Um Bonjour-Unterstützung zu aktivieren, sodass die Scripting-App den lokalen Dienst automatisch erkennt, fügen Sie das Flag `--bonjour` hinzu:

```bash
npx scripting-cli start --bonjour
```

### 3. Scripting-App verbinden

Sobald der Dienst läuft, öffnen Sie die **Scripting-App** und verbinden Sie sich mit dem gerade gestarteten lokalen Dienst. Dadurch wird eine Verbindung zwischen der App und Ihrem Arbeitsverzeichnis hergestellt.

### 4. Code debuggen und synchronisieren

Nach der Verbindung wählen Sie das Skriptprojekt aus, das Sie debuggen möchten. Die Scripting-App synchronisiert den Code dieses Projekts automatisch mit Ihrem Arbeitsverzeichnis.

### 5. Echtzeit-Code-Synchronisierung

Wenn Sie Skripte in Ihrem Desktop-Editor (z. B. VSCode) schreiben und speichern, werden die Änderungen automatisch mit der Scripting-App synchronisiert und in Echtzeit ausgeführt, was die Entwicklung und das Debugging erheblich erleichtert.

## Beispiel-Workflow

1. Lokalen Dienst starten:

   ```bash
   npx scripting-cli start
   ```

2. Öffnen Sie Ihren Editor und schreiben Sie Ihr Skript.

3. Speichern Sie die Skriptdatei.

4. Der aktualisierte Code wird automatisch mit der Scripting-App synchronisiert und ausgeführt.

## Zusätzliche Informationen

* Der Standardport ist `3000`. Wenn dieser bereits verwendet wird, geben Sie mit der Option `--port` einen anderen an.
* Verwenden Sie das Flag `--no-auto-open`, um zu verhindern, dass das Tool automatisch `index.tsx` oder `widget.tsx` öffnet:

  ```bash
  npx scripting-cli start --no-auto-open
  ```
* Um den Bonjour-Dienst zu nutzen, stellen Sie sicher, dass Ihr System diese Funktion unterstützt. Unter Windows müssen Sie Bonjour möglicherweise manuell installieren. Verwenden Sie dann die Option `--bonjour`, um den Dienst zu aktivieren.
* Dieses Tool ist ideal für Benutzer, die Desktop-Editoren wie VSCode bevorzugen und eine nahtlose Code-Synchronisierung und Debugging mit der Scripting-App wünschen.

## Fehlerbehebung

Wenn Sie auf Probleme stoßen, stellen Sie sicher, dass:

* Sie Node.js Version 20 oder höher verwenden.
* Die Scripting-App korrekt mit dem lokalen Dienst verbunden ist.
* Der von Ihnen gewählte Port nicht von einem anderen Prozess verwendet wird.
* Sie das Tool immer mit `npx scripting-cli <command>` ausführen und sicherstellen, dass das Paket auf dem neuesten Stand ist.

---

Viel Spaß beim Verwenden von `scripting-cli` in Ihrem Scripting-App-Entwicklungsworkflow! Viel Erfolg beim Codieren!
