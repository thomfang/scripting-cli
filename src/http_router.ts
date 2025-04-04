import express from 'express';
import { Controller } from './controller';
import chalk from 'chalk';

const getFileContent: express.RequestHandler = (req, res) => {
  const {
    socketId,
    scriptName,
    relativePath,
  } = req.query as {
    scriptName: string;
    socketId: string;
    relativePath: string;
  };

  if (!socketId) {
    console.log(chalk.red(`Socket not found: ${socketId}`));
  }

  if (!scriptName || !relativePath) {
    res.json({
      error: "Missing parameters: scriptName or relativePath."
    });
    return;
  }

  const ctrl = Controller.get(socketId);
  if (!ctrl) {
    console.log(chalk.red(`Socket not found: ${socketId}`));
    res.json({
      error: "Socket not found."
    });
    return;
  }

  ctrl.handleGetFileContent({
    scriptName,
    relativePath,
  }, (result: any) => {
    if (result.error) {
      res.json({
        error: result.error
      });
      return;
    }
    res.json({
      content: result.content
    });
  })
}

const syncScriptFromClient: express.RequestHandler = (req, res) => {
  const params = req.body as {
    socketId: string;
    scriptName: string;
    scriptFiles: Record<string, string>;
    'global.d.ts': string;
    'scripting.d.ts': string;
  };

  const socketId = params.socketId;

  const ctrl = Controller.get(socketId);

  if (!ctrl) {
    console.log(chalk.red(`Socket not found: ${socketId}.`));
    res.json({
      error: "Socket not found."
    });
    return;
  }

  ctrl.handleSyncScriptFromClient(params, (result) => {
    if (result.error) {
      res.json({
        error: result.error
      });
      return;
    }
    res.json({
      success: true
    });
  })
};

const syncScriptFromServer: express.RequestHandler = (req, res) => {
  const params = req.body as {
    socketId: string;
    'global.d.ts': string,
    'scripting.d.ts': string,
    scriptName: string,
  };

  const socketId = params.socketId;

  const ctrl = Controller.get(socketId);

  if (!ctrl) {
    res.json({
      error: "Socket not found."
    });
    return;
  }

  ctrl.handleSyncScriptFromServer(params, (result) => {
    if (result.error) {
      res.json({
        error: result.error
      });
      return;
    }
    res.json({
      scriptFiles: result.scriptFiles
    });
  })
};

export function initHttpRouter(app: express.Express) {
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.get("/getFileContent", getFileContent);
  app.post("/syncScriptFromClient", syncScriptFromClient);
  app.post("/syncScriptFromServer", syncScriptFromServer);
}