"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_ws_1 = __importDefault(require("express-ws"));
const port = process.env.PORT || 3605;
const connections = {};
const parseData = (message, from = null) => {
    try {
        const d = JSON.parse(message);
        const to = d.to || null;
        const data = d.data || null;
        if (from !== null && to !== null && data !== null) {
            return { from, to, data };
        }
        return null;
    }
    catch (e) {
        return null;
    }
};
const app = express_ws_1.default(express_1.default()).app;
app.param('id', (req, res, next, id) => {
    req['id'] = id || '';
    return next();
});
app.get('/:id', (req, res, next) => {
    console.log('hello', req['id']);
    res.end();
    next();
});
app.ws('/:id', (ws, req, next) => {
    const userID = req['id'] || '';
    if (!userID.length) {
        ws.close();
        console.warn('Can not connect');
        return;
    }
    connections[userID] = ws;
    console.log('connected: ' + userID);
    ws.onmessage = message => {
        const msg = parseData(message.data, userID);
        console.log(msg);
        if (msg && connections[msg.to]) {
            connections[msg.to].send(JSON.stringify(msg));
            console.log('Send message: ' + JSON.stringify(msg));
        }
    };
    ws.onclose = () => {
        try {
            delete connections[userID];
            console.log('close connection: ' + userID);
        }
        catch (e) {
            console.warn(e);
        }
    };
    next();
});
app.listen(port);
