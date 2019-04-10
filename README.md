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
    const message = JSON.parse(resp.data);
    console.log("New message from: " + message.from + ": " + message.data);
}

function send(to, data) {
    const message = { to, data };
    socket.send(JSON.stringify(message));
}

send(USER2, DATA);
```

## Additionals
1. `GET /` 

Response: [ HTML ] docs and autotest

2. `GET /login`

Response: [ JSON ] 
```javascript
{
    "id":   "YOUR_ID",
    "port": "CURRENT_PORT"
}
```