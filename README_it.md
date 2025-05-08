# Strumento da linea di comando per l'app Scripting

Benvenuto in `scripting-cli`, lo strumento da linea di comando progettato per l'integrazione con l'app Scripting. Questo strumento ti consente di sincronizzare e visualizzare in anteprima i tuoi script in tempo reale mentre li sviluppi utilizzando il tuo editor desktop preferito, come VSCode.

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
* Se desideri utilizzare il servizio Bonjour, assicurati che il tuo computer lo supporti. Su Windows, potrebbe essere necessario installarlo manualmente. Poi utilizza l'opzione `--bonjour` per abilitarlo.
* Questo strumento è pensato per gli utenti che preferiscono editor desktop come VSCode e desiderano un'integrazione fluida con l'app Scripting per la sincronizzazione e il debug del codice.

## Risoluzione dei problemi

Se riscontri problemi, verifica che:

* Hai installato Node.js versione 20 o superiore.
* L'app Scripting è correttamente collegata al servizio locale.
* Nessun altro processo stia utilizzando la porta desiderata.
* Utilizzi sempre `npx scripting-cli <command>` per avviare il servizio e che il pacchetto sia aggiornato.

---

Buon divertimento con `scripting-cli` nel tuo flusso di lavoro di sviluppo per l'app Scripting! Buona programmazione!