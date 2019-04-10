"use strict";
const PARAMS = {
    MAX_CLIENTS: 100
};

const express = require('express');
const expressWS = require('express-ws');
const helmet = require('helmet');
const showdown = require('showdown');
const fs = require('fs');
const uuidv4 = require('uuid/v4');

showdown.setFlavor('github');
const converter = new showdown.Converter();
const expressWs = expressWS(express());
const app = expressWs.app;
const server = app.listen(process.env.PORT || null || 3000);
const port = server.address()['port'];
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

const broadcast = (message, without) => {
    Object.values(connections).forEach(ws => {
        if (without !== ws) {
            ws.send(JSON.stringify(message));
        }
    });
}

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

app.use(helmet());

// app.param('id', function (req, res, next, id) {
//     req['id'] = id || '';
//     return next();
// });

// app.get('/login', function (req, res, next) {
//     let id;
//     do {
//         id = uuidv4();
//     } while (!!connections[id])
//     res.json({ port, id });
//     next();
// });

app.get('/', function (req, res, next) {
    const files = ['/index.html', '/README.md', '/footer.html'];
    let remaining = files.length;
    const map = {};
    const callback = function (file, text) {
        remaining--;
        map[file] = text;
        if (!remaining) {
            const string = files.map(file => {
                if (/\.md$/.test(file.toLowerCase())) {
                    return converter.makeHtml(map[file]);
                }
                return map[file];
            }).join('');
            res.set('Content-Type', 'text/html')
                .status(200)
                .send(string)
                .end();
        }
    };
    files.forEach(function (file) {
        fs.readFile(__dirname + file, 'utf8', (err, text) => {
            callback(file, text);
        });
    });
});

// app.ws('/:id', function (ws, req, next) {
//     const userID = req['id'] || '';
//     if (!userID.length || connections[userID] || Object.keys(connections).length > PARAMS.MAX_CLIENTS) {
//         ws.send(JSON.stringify({ error: 'Can not connect' }));
//         console.warn('Can not connect');
//         ws.close();
//         return;
//     }
//     connections[userID] = ws;
//     console.log('Connected: ' + userID);
//     ws.on('message', function (message) {
//         const msg = parseData(message, userID);
//         if (msg && connections[msg.to]) {
//             connections[msg.to].send(JSON.stringify(msg));
//             console.log('Send message: ' + JSON.stringify(msg));
//         } else if (msg) {
//             setTimeout(() => {
//                 connections[userID].send(JSON.stringify(Object.assign({}, msg, { error: 'Connection not found: ' + msg.to })));
//             }, 1000);
//         } else {
//             connections[userID].send(JSON.stringify({ error: 'Parse error' }));
//         }
//     });
//     ws.on('close', function (msg) {
//         delete connections[userID];
//         console.log('Close connection: ' + userID);
//     });
//     next();
// });

app.ws('/', function (ws, req, next) {
    const userID = uuidv4();

    if (connections[userID] || Object.keys(connections).length > PARAMS.MAX_CLIENTS) {
        ws.send(JSON.stringify({ error: 'Can not connect' }));
        console.warn('Can not connect:"' + userID + '"; ' + Object.keys(connections).length);
        ws.close();
        return;
    }

    ws.send(JSON.stringify({ from: 'SERVER', data: { id: userID } }));
    connections[userID] = ws;
    console.log('Connected: ' + userID);
    broadcast({ from: 'SERVER', data: { login: userID } }, ws);

    ws.on('message', function (message) {
        const msg = parseData(message, userID);
        if (msg && msg.to === 'SERVER') {
            const response = { from: 'SERVER' };
            if (msg.data === 'ping') {
                response.data = 'pong';
            } else if (msg.data === 'connections') {
                response.data = { connections: Object.keys(connections) }
            }
            ws.send(JSON.stringify(response));
        } else if (msg && connections[msg.to]) {
            connections[msg.to].send(JSON.stringify(msg));
            console.log('Send message: ' + JSON.stringify(msg));
        } else if (msg && !connections[msg.to]) {
            setTimeout(() => {
                connections[userID].send(JSON.stringify(Object.assign({}, msg, { error: 'Connection not found: ' + msg.to })));
            }, 1000);
        } else {
            connections[userID].send(JSON.stringify(Object.assign({}, msg, { error: 'Parse error. Message must have "to:string" and "data:any" fields' })));
        }
    });

    ws.on('close', function (msg) {
        delete connections[userID];
        console.log('Close connection: ' + userID);
        broadcast({ from: 'SERVER', data: { logout: userID } });
    });

    next();
});

module.exports = app;
