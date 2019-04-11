
const db = require('./db')

const checkMessage = (userID, msg) => {
  const response = {
    from: userID,
    to: null,
    data: null,
    error: null,
    status: 200
  }
  if (msg && msg.to === 'SERVER') {
    response.to = userID
    response.from = 'SERVER'
    response.error = msg.error || null
    response.status = msg.status || null
    response['connections'] = db.getIDs()
    if (msg.data === 'ping') {
      response.data = 'pong'
    } else {
      response.data = 'what?'
    }
  } else if (msg && db.get(msg.to)) {
    response.to = msg.to
    response.data = msg.data
  } else if (msg && !db.get(msg.to)) {
    response.to = msg.to
    response.data = msg.data
    response.error = `Connection not found: ${msg.to}`
    response.status = 404
  } else {
    response.to = msg.to || null
    response.data = msg.data || null
    response.error = 'Parse error. Message must have "to:string" and "data:any" fields'
    response.status = 400
  }
  return response
}

module.exports = checkMessage
