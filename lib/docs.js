const fs = require('fs')
const showdown = require('showdown')

showdown.setFlavor('github')
const converter = new showdown.Converter()

let htmlCache
const html = (callback) => {
  if (htmlCache) {
    callback(htmlCache)
  } else {
    const files = ['/index.html', '/../README.md', '/footer.html']
    let remaining = files.length
    const map = {}
    const cb = function (file, text) {
      remaining--
      map[file] = text
      if (!remaining) {
        htmlCache = files.map((file) => {
          if (/\.md$/.test(file.toLowerCase())) {
            return converter.makeHtml(map[file])
          }
          return map[file]
        }).join('')
        callback(htmlCache)
      }
    }
    files.forEach((file) => {
      fs.readFile(__dirname + file, 'utf8', (_err, text) => {
        cb(file, text)
      })
    })
  }
}

module.exports = html
