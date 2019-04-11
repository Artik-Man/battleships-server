const uuidv4 = require('uuid/v4')

const PARAMS = {
  MAX_CLIENTS: 100
}
const connections = {}

module.exports = {
  get: id => connections[id] || null,
  getIDs: () => Object.keys(connections),
  set: (ws) => {
    if (Object.keys(connections).length > PARAMS.MAX_CLIENTS) {
      return null
    }
    let id
    do {
      id = uuidv4()
    } while (connections[id])
    connections[id] = ws
    return id
  },
  remove: (id) => {
    delete connections[id]
  }
}
