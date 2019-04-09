# WebSocket Post Server

## Links
Server:
https://ws-post.herokuapp.com/

Repo:
https://github.com/Artik-Man/ws-post-server

## Connection
1. Create connection to server
```JavaScript
const socket = new WebSocket('wss://[HOST]:[PORT]/[USER]');
```
2. Send message
```JavaScript
const message = JSON.stringify({
    to:   SOME_USER,
    data: DATA
});
socket.send(message);
```

## Simple chat
```JavaScript
const socket = new WebSocket('wss://[HOST]:[PORT]/[USER1]');

socket.onmessage = function(resp) {
    try {
        const message = JSON.parse(resp.data);
        console.log(message.data);
    } catch(e) {
        console.warn(message, e)
    }
}

function send(data){
    const message = {
        to:   USER2,
        data: data
    };
    socket.send(JSON.stringify(message));
}

send(DATA);
```

## Additionals
1. `GET /` 

Response:[ HTML ] docs and autotest

2. `GET /info`

Response: [ JSON ] ```{ port: CURRENT_PORT }```