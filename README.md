# WebSocket Post Server

## Links
Server:
https://ws-post.herokuapp.com/

Repo:
https://github.com/Artik-Man/ws-post-server

## Connection
1. Create connection to server
```javascript
const socket = new WebSocket('wss://[HOST]:[PORT]/[USER]');
```
2. Send message
```javascript
const message = JSON.stringify({
    to:   SOME_USER,
    data: DATA
});
socket.send(message);
```

## Simple chat
```javascript
const socket = new WebSocket('wss://[HOST]:[PORT]/[USER1]');

socket.onmessage = function(resp) {
    try {
        const message = JSON.parse(resp.data);
        console.log(message.data);
    } catch(e) {
        console.warn(message, e)
    }
}

function send(user, data){
    const message = {
        to: user,
        data: data
    };
    socket.send(JSON.stringify(message));
}

send(USER2, DATA);
```

## Additionals
1. `GET /` 

Response:[ HTML ] docs and autotest

2. `GET /info`

Response: [ JSON ] ```{ port: CURRENT_PORT }```