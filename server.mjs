import { sessionID } from "./sessionid.mjs"

import express from "express"
import { Server as HTTPServer } from "node:http"
import bodyParser from "body-parser"
import { promises as fs } from "node:fs"

const server = express()
server.use(bodyParser.urlencoded({ extended: false }))

const http = HTTPServer(server)

const port = parseInt(await fs.readFile("./port.txt"))

export function GET(path, logger, callback) {
  server.get(path, (req, res) => {
    const { log, err, childLogger } = logger(`session-${sessionID()}`)

    log(`GET request: "${path}"`)
    callback(req, res, log, err, childLogger)
  })
}

export function GETFile(path, file, logger) {
  server.get(path, (req, res) => {
    const { log, err, childLogger } = logger(`session-${sessionID()}`)

    log(`GET request: "${path}"`)
    log(`sending file: "${file}"`)
    res.sendFile(file)
  })
}

export function GETRedirect(path, newPath, logger) {
  server.get(path, (req, res) => {
    const { log, err, childLogger } = logger(`session-${sessionID()}`)

    log(`GET request: "${path}"`)
    log(`sending redirect: "${newPath}"`)
    res.redirect(newPath)
  })
}

export function POST(path, logger, callback) {
  server.post(path, (req, res) => {
    const { log, err, childLogger } = logger(`session-${sessionID()}`)

    log(`POST request: "${path}"`)
    callback(req, res, log, err, childLogger)
  })
}

export function PUT(path, logger, callback) {
  server.put(path, (req, res) => {
    const { log, err, childLogger } = logger(`session-${sessionID()}`)

    log(`PUT request: "${path}"`)
    callback(req, res, log, err, childLogger)
  })
}

export function DELETE(path, logger, callback) {
  server.delete(path, (req, res) => {
    const { log, err, childLogger } = logger(`session-${sessionID()}`)

    log(`DELETE request: "${path}"`)
    callback(req, res, log, err, childLogger)
  })
}

export function start(logger) {
  http.listen(port, () => {
    logger("server").log("listening on port " + port)
  })
}
