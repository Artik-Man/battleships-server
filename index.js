"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const port = process.env.PORT || 3605;
const webSockets = {};
const parseData = (message) => {
    try {
        const d = JSON.parse(message.data);
        const from = d.from;
        const to = d.to;
        const data = d.data;
        return { from, to, data };
    }
    catch (e) {
        return null;
    }
};
const webSocketServer = new ws_1.Server({ port: port });
webSocketServer.on('connection', (webSocket, req) => {
    var userID = req.url.slice(1);
    if (!userID.length) {
        webSocket.close();
        console.warn('can not connect');
        return;
    }
    webSockets[userID] = webSocket;
    console.log('connected: ' + userID);
    webSocket.onmessage = message => {
        console.log('received from ' + userID + ': ' + JSON.stringify(message.data));
        const msg = parseData(message);
        if (msg && webSockets[msg.to]) {
            webSockets[msg.to].send(JSON.stringify(msg));
            console.log('send to ' + msg.to + ': ' + JSON.stringify(msg));
        }
    };
    webSocket.onclose = () => {
        try {
            delete webSockets[userID];
            console.log('close connection: ' + userID);
        }
        catch (e) {
            console.warn(e);
        }
    };
});
