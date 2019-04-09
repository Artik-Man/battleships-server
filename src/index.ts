const express = require('express');
const expressWS = require('express-ws');
const helmet = require('helmet');

const expressWs = expressWS(express());
const app = expressWs.app;
const server = app.listen(process.env.PORT || null);

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

const connections: {
    [client: string]: any //WebSocket
} = {};

app.use(helmet())

app.param('id', function (req, res, next, id) {
    req['id'] = id || '';
    return next();
});

app.get('/', function (req, res, next) {
    const port = JSON.stringify(server.address()['port']);
    res.set('Content-Type', 'text/html')
        .status(200)
        .send(`
            <h1>WebSockets Post</h1>
            <ol>
                <li>Connect to wss://<span id="host">[host]</span>:${port}/[user_id]</li>
                <li>Send message <code>{ to: [some_user_id], data: [some_data] }</code></li>
            </ol>
            <span id="test"></span>
            <script>
                document.getElementById('host').innerHTML = location.host;
                const protocol = location.protocol.replace('http','ws');
                const testmessage = JSON.stringify({from:'1',to:'2',data:'ololo'});
                const socket1 = new WebSocket(protocol+'//'+location.host+'/1');
                const socket2 = new WebSocket(protocol+'//'+location.host+'/2');
                socket2.onmessage = function(message){
                    if(testmessage==message.data){
                        document.getElementById('test').innerHTML = 'All ok';
                    }else{
                        console.log(message)
                        document.getElementById('test').innerHTML = 'Something wrong...';
                    }
                    socket1.close();
                    socket2.close();
                }
                socket1.onopen=function(){socket1.send(testmessage)}
            </script>
        `);
    res.end();
    next();
});

app.ws('/:id', function (ws, req, next) {
    const userID: string = req['id'] || '';
    if (!userID.length) {
        ws.close();
        console.warn('Can not connect');
        return;
    }
    connections[userID] = ws;
    console.log('Connected: ' + userID);

    ws.on('message', function (message) {
        const msg = parseData(message, userID);
        console.log(msg);
        if (msg && connections[msg.to]) {
            connections[msg.to].send(JSON.stringify(msg))
            console.log('Send message: ' + JSON.stringify(msg));
        }
    });

    ws.on('close', function (msg) {
        delete connections[userID]
        console.log('Close connection: ' + userID)
    });

    next();
});

module.exports = app;