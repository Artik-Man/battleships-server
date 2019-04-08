// const express = require('express')
// const helmet = require('helmet')

// const app = express()

// // add some security-related headers to the response
// app.use(helmet())

// app.get('*', (req, res) => {
//     res.set('Content-Type', 'text/html')
//     res.send(200, `
//         <h1><marquee direction=right>Hello from Express path '/' on Now 2.0!</marquee></h1>
//         <h2>Go to <a href="/about">/about</a></h2>
//     `)
// })

// module.exports = app

var port = process.env.PORT || 5000;
var webSocketServer = new (require('ws')).Server({ port: port }),
    webSockets = {} // userID: webSocket
// CONNECT /:userID
// wscat -c ws://localhost:5000/1
webSocketServer.on('connection', function (webSocket, req) {
    var userID = req.url.slice(1);
    if (!userID.length) {
        webSocket.close();
        console.warn('can not connect');
        return;
    }
    webSockets[userID] = webSocket
    console.log('connected: ' + userID)

    // Forward Message
    //
    // Receive               Example
    // [toUserID, text]      [2, "Hello, World!"]
    //
    // Send                  Example
    // [fromUserID, text]    [1, "Hello, World!"]
    webSocket.on('message', function (message) {
        console.log('received from ' + userID + ': ' + message)
        try {
            var messageArray = JSON.parse(message)
            var toUserWebSocket = webSockets[messageArray[0]]
            if (toUserWebSocket) {
                console.log('sent to ' + messageArray[0] + ': ' + JSON.stringify(messageArray))
                messageArray[0] = userID
                toUserWebSocket.send(JSON.stringify(messageArray))
            }
        } catch (e) {
            console.warn('invalid message', e)
        }
    })

    webSocket.on('close', function () {
        try {
            delete webSockets[userID]
            console.log('deleted: ' + userID)
        } catch (e) {
            console.warn(e)
        }
    })
})