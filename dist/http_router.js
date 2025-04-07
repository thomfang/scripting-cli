"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initHttpRouter = initHttpRouter;
const express_1 = __importDefault(require("express"));
const controller_1 = require("./controller");
const chalk_1 = __importDefault(require("chalk"));
const getFileContent = (req, res) => {
    const { socketId, scriptName, relativePath, } = req.query;
    if (!socketId) {
        console.log(chalk_1.default.red(`Socket not found: ${socketId}`));
    }
    if (!scriptName || !relativePath) {
        res.json({
            error: "Missing parameters: scriptName or relativePath."
        });
        return;
    }
    const ctrl = controller_1.Controller.get(socketId);
    if (!ctrl) {
        console.log(chalk_1.default.red(`Socket not found: ${socketId}`));
        res.json({
            error: "Socket not found."
        });
        return;
    }
    ctrl.handleGetFileContent({
        scriptName,
        relativePath,
    }, (result) => {
        if (result.error) {
            res.json({
                error: result.error
            });
            return;
        }
        res.json({
            content: result.content
        });
    });
};
const syncScriptFromClient = (req, res) => {
    const params = req.body;
    const socketId = params.socketId;
    const ctrl = controller_1.Controller.get(socketId);
    if (!ctrl) {
        console.log(chalk_1.default.red(`Socket not found: ${socketId}.`));
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
    });
};
const syncScriptFromServer = (req, res) => {
    const params = req.body;
    const socketId = params.socketId;
    const ctrl = controller_1.Controller.get(socketId);
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
    });
};
function initHttpRouter(app) {
    app.use(express_1.default.json({ limit: '50mb' }));
    app.use(express_1.default.urlencoded({ extended: true }));
    app.get("/getFileContent", getFileContent);
    app.post("/syncScriptFromClient", syncScriptFromClient);
    app.post("/syncScriptFromServer", syncScriptFromServer);
}
