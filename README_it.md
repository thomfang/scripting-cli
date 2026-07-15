# Strumento da linea di comando per l'app Scripting

Benvenuto in `scripting-cli`, lo strumento da linea di comando progettato per l'integrazione con l'app Scripting. Questo strumento ti consente di sincronizzare e visualizzare in anteprima i tuoi script in tempo reale mentre li sviluppi utilizzando il tuo editor desktop preferito (VSCode, Cursor, Windsurf, Zed, WebStorm, Vim e altri).

[English](./README.md) | [中文](./README_zh.md) | [日本語](./README_ja.md) | [Deutsch](./README_de.md) | [Français](./README_fr.md)

## Prerequisiti

Prima di utilizzare `scripting-cli`, assicurati di avere quanto segue:

1. **Node.js**: Verifica di avere una versione recente di Node.js installata. Puoi controllare la tua versione eseguendo:

   ```bash
   node -v
   ```

2. **App Scripting**: L'app Scripting deve essere installata per potersi connettere al servizio locale avviato da `scripting-cli`.

## Installazione

Non è necessario installare `scripting-cli` globalmente. Puoi utilizzarlo direttamente con `npx`:

```bash
npx scripting-cli <command>
```

## Utilizzo

### 1. Creare una directory di lavoro

Crea una directory nel tuo computer dove archiviare gli script dell'app Scripting. Ad esempio:

```bash
mkdir my-scripting-project
cd my-scripting-project
```

### 2. Avviare il servizio locale

All'interno della directory di lavoro, esegui il comando seguente per avviare il servizio locale:

```bash
npx scripting-cli start
```

Per impostazione predefinita, il servizio verrà eseguito sulla porta `3000`. Se desideri utilizzare una porta diversa, puoi specificarla con l'opzione `--port`:

```bash
npx scripting-cli start --port=4000
```

Per attivare il servizio Bonjour (che consente all'app Scripting di rilevare automaticamente il servizio locale), utilizza l'opzione `--bonjour`:

```bash
npx scripting-cli start --bonjour
```

### 3. Collegare l'app Scripting

Una volta che il servizio è in esecuzione, apri l'**app Scripting** e collegati al servizio locale appena avviato. Questo stabilirà la connessione tra l'app e la tua directory di lavoro.

### 4. Debug e sincronizzazione del codice

Dopo la connessione, seleziona il progetto di script che desideri eseguire il debug. L'app Scripting sincronizzerà automaticamente il codice del progetto con la tua directory locale.

### 5. Sincronizzazione del codice in tempo reale

Mentre scrivi e salvi gli script nel tuo editor desktop (ad esempio, VSCode), il codice aggiornato verrà automaticamente sincronizzato con l'app Scripting ed eseguito in tempo reale. Questo rende lo sviluppo e il debug molto più efficienti.

## Selezione dell'editor e file di configurazione

`scripting-cli` non è più legato a VSCode. Al primo avvio di `npx scripting-cli start`, ti verrà chiesto di scegliere l'editor che usi effettivamente. La tua scelta viene salvata in `scripting.config.json` nella radice del progetto, in modo che la richiesta non venga più visualizzata.

### Editor supportati

VSCode, VSCode Insiders, VSCodium, Cursor, Windsurf, Trae, Zed, WebStorm, IntelliJ IDEA, Fleet, Sublime Text, Nova, Vim, Neovim, Emacs, oltre a `custom` (qualsiasi altro comando) e `none` (disabilita l'apertura automatica).

Gli editor rilevati nel tuo `PATH` sono contrassegnati con ✓ ed elencati per primi.

### Sovrascrittura per singola esecuzione

```bash
# Usa Cursor solo per questa esecuzione (non modifica scripting.config.json)
npx scripting-cli start --editor=cursor

# Riesegui la selezione interattiva e sovrascrivi la scelta salvata
npx scripting-cli start --reconfigure
```

### File di configurazione

`scripting-cli` cerca il primo file di configurazione trovato in questo ordine:

```
scripting.config.ts
scripting.config.mts
scripting.config.cts
scripting.config.js
scripting.config.mjs
scripting.config.cjs
scripting.config.json
```

Il file predefinito è JSON, in modo che il flusso npx rimanga a zero installazioni. I file TypeScript e JavaScript vengono caricati tramite [jiti](https://github.com/unjs/jiti).

```jsonc
// scripting.config.json
{
  "editor": "cursor",          // vedi gli editor supportati sopra
  "editorCommand": "cursor",   // opzionale, sovrascrive il comando predefinito
  "editorArgs": [],            // opzionale, argomenti CLI aggiuntivi
  "port": 3000,
  "autoOpen": true,
  "generateTsConfig": true,    // imposta a false se gestisci tsconfig.json autonomamente
  "logLevel": "info",          // "silent" | "error" | "warn" | "info" | "debug"
  "ignore": ["*.log", "dist", "assets/large.mp4"]  // file aggiuntivi da escludere dalla sincronizzazione
}
```

I flag della CLI hanno la precedenza sul file di configurazione.

### Escludere file dalla sincronizzazione (`ignore`)

La sincronizzazione copre **tutti** i file in una directory di script — il codice sorgente,
oltre a immagini, font e qualsiasi altro asset — in entrambe le direzioni (app ⇄ desktop).
I file di testo si sincronizzano con il tracciamento delle modifiche; tutto il resto viene trasferito come byte grezzi.

I file/directory che iniziano con un punto (come `.git`, `.vscode`, `.DS_Store`) e `node_modules`
sono **sempre esclusi per impostazione predefinita**. Usa `ignore` per escludere altri file:

```jsonc
{
  "ignore": [
    "*.log",            // glob di estensione — corrisponde a qualsiasi file che termina con .log
    "dist",             // nome — corrisponde a qualsiasi file o directory chiamato "dist" a qualsiasi livello
    "assets/big.mp4"    // percorso — corrisponde a questo file relativo alla radice dello script
  ]
}
```

Ogni voce viene confrontata secondo una di tre forme:

- `*.ext` — corrisponde ai file per estensione.
- un nome semplice (senza `/`) — corrisponde a qualsiasi segmento di percorso (file o directory) con quel nome.
- un percorso contenente `/` — corrisponde a quel percorso relativo allo script (esatto o come prefisso di directory).

`ignore` si applica a entrambe le direzioni di sincronizzazione.

### Completamento dei tipi (configurazione TypeScript)

Per ottenere l'autocompletamento in `scripting.config.ts`, installa scripting-cli come dipendenza di sviluppo:

```bash
npm i -D scripting-cli
```

Quindi:

```ts
// scripting.config.ts
import { defineConfig } from 'scripting-cli'

export default defineConfig({
  editor: 'cursor',
  port: 4000,
})
```

Puoi anche usare `.ts` senza installare il pacchetto — `npx scripting-cli start` lo caricherà comunque tramite `jiti`. Semplicemente non avrai i suggerimenti di tipo nell'IDE.

## Esempio di flusso di lavoro

1. Avvia il servizio locale:

   ```bash
   npx scripting-cli start
   ```

2. Apri il tuo editor e scrivi lo script.

3. Salva il file dello script.

4. Il codice aggiornato viene sincronizzato automaticamente con l'app Scripting e viene eseguito.

## Informazioni aggiuntive

* La porta predefinita del servizio è `3000`. Se è già in uso, specificane un'altra con l'opzione `--port`.
* Utilizza l'opzione `--no-auto-open` per avviare il server di sviluppo senza aprire automaticamente `index.tsx` o `widget.tsx` nell'editor:

  ```bash
  npx scripting-cli start --no-auto-open
  ```
* Usa `--editor=<key>` per sovrascrivere l'editor configurato per una singola esecuzione, oppure `--reconfigure` per rieseguire la selezione interattiva dell'editor.
* Se desideri utilizzare il servizio Bonjour, assicurati che il tuo computer lo supporti. Su Windows, potrebbe essere necessario installarlo manualmente. Poi utilizza l'opzione `--bonjour` per abilitarlo.
* Questo strumento funziona con qualsiasi editor desktop e offre una sincronizzazione e un debug del codice senza interruzioni con l'app Scripting.

## Risoluzione dei problemi

Se riscontri problemi, verifica che:

* Hai installato Node.js versione 20 o superiore.
* L'app Scripting è correttamente collegata al servizio locale.
* Nessun altro processo stia utilizzando la porta desiderata.
* Utilizzi sempre `npx scripting-cli <command>` per avviare il servizio e che il pacchetto sia aggiornato.

---

Buon divertimento con `scripting-cli` nel tuo flusso di lavoro di sviluppo per l'app Scripting! Buona programmazione!