"use strict";
const PARAMS = {
    MAX_CLIENTS: 100
};

const express = require('express');
const expressWS = require('express-ws');
const helmet = require('helmet');
const path = require('path');
const showdown = require('showdown');
const fs = require('fs');

showdown.setFlavor('github');
const converter = new showdown.Converter();
const expressWs = expressWS(express());
const app = expressWs.app;
const server = app.listen(process.env.PORT || null);
const port = JSON.stringify(server.address()['port']);
const connections = {};
console.log('Server running on port: ' + port);

const parseData = (message, from) => {
    try {
        const d = JSON.parse(message);
        const to = d.to || null;
        const data = d.data || null;
        if (to !== null && data !== null) {
            return { from, to, data };
        }
        return null;
    } catch (e) {
        return null;
    }
};

app.use(helmet());

app.param('id', function (req, res, next, id) {
    req['id'] = id || '';
    return next();
});

app.get('/info', function (req, res, next) {
    res.json({ port: port });
    next();
});

app.get('/', function (req, res, next) {
    fs.readFile(__dirname + '/README.md', 'utf8', function (err, text) {
        const container = fs.readFileSync(__dirname + '/index.html');
        const html = converter.makeHtml(text);
        res.set('Content-Type', 'text/html')
            .status(200)
            .send(container + html + '</body></html>')
            .end();
        next();
    });
});

app.ws('/:id', function (ws, req, next) {
    const userID = req['id'] || '';
    if (!userID.length || connections[userID] || Object.keys(connections).length > PARAMS.MAX_CLIENTS) {
        ws.send(JSON.stringify({ error: 'Can not connect' }));
        console.warn('Can not connect');
        ws.close();
        return;
    }
    connections[userID] = ws;
    console.log('Connected: ' + userID);
    ws.on('message', function (message) {
        const msg = parseData(message, userID);
        if (msg && connections[msg.to]) {
            connections[msg.to].send(JSON.stringify(msg));
            console.log('Send message: ' + JSON.stringify(msg));
        } else if (msg) {
            setTimeout(() => {
                connections[userID].send(JSON.stringify(Object.assign({}, msg, { error: 'Connection not found: ' + msg.to })));
            }, 1000);
        } else {
            connections[userID].send(JSON.stringify({ error: 'Parse error' }));
        }
    });
    ws.on('close', function (msg) {
        delete connections[userID];
        console.log('Close connection: ' + userID);
    });
    next();
});

module.exports = app;
