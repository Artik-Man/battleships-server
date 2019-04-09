import express from 'express';
import expressWs from 'express-ws';

const port = process.env.PORT || 3605;

const connections: {
    [client: string]: any //WebSocket
} = {};

interface Message {
    from: string;
    to: string;
    data: string;
}

const parseData = (message: any, from: string = null): Message => {
    try {
        const d = JSON.parse(message);
        const to = d.to || null;
        const data = d.data || null;
        if (from !== null && to !== null && data !== null) {
            return { from, to, data }
        }
        return null;
    } catch (e) {
        return null;
    }
}

const app = expressWs(express()).app;

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
    const userID: string = req['id'] || '';
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
            connections[msg.to].send(JSON.stringify(msg))
            console.log('Send message: ' + JSON.stringify(msg));
        }
    };
    ws.onclose = () => {
        try {
            delete connections[userID]
            console.log('close connection: ' + userID)
        } catch (e) {
            console.warn(e)
        }
    }
    next();
});

app.listen(port)