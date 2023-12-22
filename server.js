const sessionID = require("./sessionid.js")

const express = require("express")
const server = express()
server.use(require("body-parser").urlencoded({ extended: false }))

const http = require("http").Server(server)
const port = 80

module.exports.get = (path, logger, callback) => {
  server.get(path, (req, res) => {
    const { log, err, childLogger } = logger(`session-${sessionID()}`)

    log(`GET request: "${path}"`)
    callback(req, res, log, err, childLogger)
  })
}

module.exports.getFile = (path, file, logger) => {
  server.get(path, (req, res) => {
    const { log, err, childLogger } = logger(`session-${sessionID()}`)

    log(`GET request: "${path}"`)
    log(`sending file: "${file}"`)
    res.sendFile(file)
  })
}

module.exports.getRedirect = (path, newPath, logger) => {
  server.get(path, (req, res) => {
    const { log, err, childLogger } = logger(`session-${sessionID()}`)

    log(`GET request: "${path}"`)
    log(`sending redirect: "${newPath}"`)
    res.redirect(newPath)
  })
}

module.exports.post = (path, logger, callback) => {
  server.post(path, (req, res) => {
    const { log, err, childLogger } = logger(`session-${sessionID()}`)

    log(`POST request: "${path}"`)
    callback(req, res, log, err, childLogger)
  })
}

module.exports.put = (path, logger, callback) => {
  server.put(path, (req, res) => {
    const { log, err, childLogger } = logger(`session-${sessionID()}`)

    log(`PUT request: "${path}"`)
    callback(req, res, log, err, childLogger)
  })
}

module.exports.delete = (path, logger, callback) => {
  server.delete(path, (req, res) => {
    const { log, err, childLogger } = logger(`session-${sessionID()}`)

    log(`DELETE request: "${path}"`)
    callback(req, res, log, err, childLogger)
  })
}

module.exports.start = (logger) => {
  http.listen(port, () => {
    logger("server").log("listening on port " + port)
  })
}
