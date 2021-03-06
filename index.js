const express = require('express')
const expressWS = require('express-ws')
const helmet = require('helmet')
const db = require('./lib/db')
const docs = require('./lib/docs')
const parseData = require('./lib/parse')
const checkMessage = require('./lib/message')

const expressWs = expressWS(express())
const app = expressWs.app
app.listen(process.env.PORT || 3000)

const sendMessage = (msg) => {
  const connection = db.get(msg.to)
  if (connection && connection.OPEN) {
    try {
      connection.send(JSON.stringify(msg))
    } catch (e) {
      console.warn(e)
    }
  }
}

const broadcast = (message, without) => {
  const keys = db.getIDs()
  keys.forEach(key => {
    if (without !== key) {
      sendMessage({ ...message, to: key })
    }
  })
}

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
})

app.use(helmet())

app.get('/', (req, res) => {
  docs((string) => {
    res.type('html').send(string).end()
  })
})

app.ws('/', (ws, req, next) => {
  const xid = req.headers['sec-websocket-protocol'] || null;
  const userID = db.set(ws, xid)

  if (!userID) {
    const resp = {
      from: 'SERVER',
      to: null,
      data: null,
      error: 'Can not connect',
      status: 423
    }
    sendMessage(resp)
    console.warn('Can not connect')
    ws.close()
    return
  }

  console.log(`Connected: ${userID}`)
  sendMessage({
    from: 'SERVER',
    to: userID,
    data: null,
    error: null,
    status: 200,
    connections: db.getIDs()
  })
  broadcast({
    from: 'SERVER',
    to: null,
    data: null,
    error: null,
    status: 200,
    connected: userID
  }, userID)

  ws.on('message', (message) => {
    const msg = parseData(message, userID)
    const resp = checkMessage(userID, msg)
    sendMessage(resp)
  })

  function closeConnection() {
    db.remove(userID)
    console.log(`Close connection: ${userID}`)
    broadcast({
      from: 'SERVER',
      to: null,
      data: null,
      error: null,
      status: 200,
      disconnected: userID
    })
  }

  ws.on('close', closeConnection)

  ws.on('error', closeConnection)

  next()
})

module.exports = app
