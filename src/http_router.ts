import express from 'express';
import { Controller } from './controller';
import chalk from 'chalk';
import { developmentWorkspace, syncDocumentation } from './documentation_sync';
import { failure } from './agent_protocol';

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

const getFileData: express.RequestHandler = (req, res) => {
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

  ctrl.handleGetFilePath({
    scriptName,
    relativePath,
  }, (result: any) => {
    if (result.error) {
      res.status(500).send(result.error);
      return;
    }
    res.sendFile(result.filePath);
  })
}

const putFileData: express.RequestHandler = (req, res) => {
  const {
    socketId,
    scriptName,
    relativePath,
  } = req.query as {
    scriptName: string;
    socketId: string;
    relativePath: string;
  };

  if (!scriptName || !relativePath) {
    res.json({
      error: "Missing parameters: scriptName or relativePath."
    });
    return;
  }

  if (!Buffer.isBuffer(req.body)) {
    res.json({
      error: "Missing file data in request body."
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

  ctrl.handlePutFileData({
    scriptName,
    relativePath,
    data: req.body,
  }, (result) => {
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
  app.get('/developmentWorkspace', (req, res) => {
    const ctrl = typeof req.query.socketId === 'string' ? Controller.get(req.query.socketId) : undefined;
    if (!ctrl?.socket?.connected) { res.status(409).json({ error: { code: 'disconnected', message: 'Connect to a development server first.' } }); return; }
    res.json({ success: true, ...developmentWorkspace(ctrl.workspace) });
  });
  app.post('/syncDocumentation', async (req, res) => {
    const ctrl = typeof req.body?.socketId === 'string' ? Controller.get(req.body.socketId) : undefined;
    if (!ctrl?.socket?.connected) { res.status(409).json({ error: { code: 'disconnected', message: 'The development connection ended.' } }); return; }
    try { res.json(await syncDocumentation(ctrl.workspace, req.body, () => ctrl.socket?.connected === true)); }
    catch (e) { res.status(409).json({ error: failure(e) }); }
  });
  app.get("/getFileContent", getFileContent);
  app.get("/getFileData", getFileData);
  app.post("/putFileData", express.raw({ type: 'application/octet-stream', limit: '100mb' }), putFileData);
  app.post("/syncScriptFromClient", syncScriptFromClient);
  app.post("/syncScriptFromServer", syncScriptFromServer);
}
