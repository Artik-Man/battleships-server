# WebSocket Post Server

## Links
Server:
https://ws-post.herokuapp.com/

Repo:
https://github.com/Artik-Man/ws-post-server

## Connection
### 1. Create connection to server
```javascript
const socket = new WebSocket('wss://ws-post.herokuapp.com/');
```
You will get YOUR_ID in first message from the server:
```json
{
    "to": "YOUR_ID",
    "from": "SERVER",
    "data": null,
    "error": null,
    "status": 200,
    "connections": ["USER1_ID", "USER2_ID", "..."]
}
```
Other users will receive the same message

### 2. Send message
```javascript
const message = JSON.stringify({
    to:   "SOME_USER",
    data: "SOME_DATA"
});
socket.send(message);
```
### 3. Messages format:
```json
{
    "to": "YOUR_ID",
    "from": "USER_ID",
    "data": null,
    "error": null,
    "status": 200
}
```
### 4. Status codes:
200 - OK
400 - Bad request
404 - User not found
423 - Connection error

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

socket.onmessage = function(resp) {
    const message = JSON.parse(resp.data);
    if (resp.data.from === 'SERVER') {
        if (resp.connections) {
            users = resp.connections;
            startChat();
        }
    } else {
        console.log("New message from: " + message.from + ": " + message.data);
    }
}
```
