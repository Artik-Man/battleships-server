
const parseData = (message, from) => {
  try {
    const d = JSON.parse(message)
    const to = d.to || null
    const data = d.data || null
    if (typeof to === 'string' && data !== null) {
      return { from, to, data }
    }
    return null
  } catch (e) {
    return null
  }
}

module.exports = parseData
