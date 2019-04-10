# WebSocket Post Server

## Links
Server:
https://ws-post.herokuapp.com/

Repo:
https://github.com/Artik-Man/ws-post-server

## Connection
1. Create connection to server
```javascript
const socket = new WebSocket('wss://ws-post.herokuapp.com/');
```
You will get your ID in first message from server:
```json
{
    "from":"SERVER",
    "id":  "YOUR_ID"
}
```
2. Get connections
```javascript
const message = JSON.stringify({
    to:   "SERVER",
    data: "connections"
});
socket.send(message);
```
You will get current connections:
```json
{
    "from":"SERVER",
    "connections":  [USER1_ID, USER2_ID]
}
```

3. Send message
```javascript
const message = JSON.stringify({
    to:   SOME_USER,
    data: DATA
});
socket.send(message);
```

## Simple chat
```javascript
const socket = new WebSocket('wss://ws-post.herokuapp.com/');
let users = [];

function send(to, data) {
    const message = { to, data };
    socket.send(JSON.stringify(message));
}

function startChat() {
    users.forEach(user => {
        send(user, "hello");
    });
}

socket.onopen = function() {
    send('SERVER', "connections");
}

socket.onmessage = function(resp) {
    const message = JSON.parse(resp.data);
    if (resp.data.from === 'SERVER') {
        if (resp.data.connections) {
            users = resp.data.connections;
            startChat();
        }
    } else {
        console.log("New message from: " + message.from + ": " + message.data);
    }
}
```
