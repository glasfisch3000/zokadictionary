import { logger } from "./logging.mjs"
const { log, err, childLogger } = logger(["app"])

log("importing modules")
import * as server from "./server.mjs"
import * as api from "./api.mjs"
import * as security from "./security/security.mjs"
import { init as initDB } from "./db/database.mjs"
import { Word } from "./db/word.mjs"

import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const dirname = dirname(fileURLToPath(import.meta.url))

log("starting database")
initDB(childLogger).then(data => { // actual database pointer
  log("setup done")

  server.GETFile("/main.css", dirname + "/client/main.css", childLogger)
  server.GETFile("/dictionary.css", dirname + "/client/dictionary.css", childLogger)
  server.GETFile("/dictionary.js", dirname + "/client/dictionary.js", childLogger)

  server.GETRedirect("/", "/dictionary", childLogger)
  server.GETRedirect("/index", "/dictionary", childLogger)
  server.GETRedirect("/index.html", "/dictionary", childLogger)
  server.GETRedirect("/dictionary.html", "/dictionary", childLogger)
  server.GETFile("/dictionary", dirname + "/client/dictionary.html", childLogger)

  server.GET("/dictionary-api/all-words", childLogger, async (req, res, log, err, childLogger) => {
    log("API request: get-all-words")

    try {
      // fetch words from db
      const words = await api.getAllWords(data, childLogger)

      if(words === null) { // words not found
        res.status(404).send("")
        return
      }

      if(words) {
        res.send(JSON.stringify(words))
      } else { // internal error
        res.status(500).send("")
      }
    } catch(error) {
      err(error)
      res.status(500).send("")
    }
  })

  server.GET("/dictionary-api/word", childLogger, async (req, res, log, err, childLogger) => {
    log("API request: get-word")

    try {
      // decode id value from url
      const id = req.query.id
      if(!id) {
        err(`query part "id" not found`)
        res.status(400).send("")
        return
      }
      log(`query part "id": "${id}"`)

      // fetch word from db
      const word = await api.getWord(data, childLogger)

      if(word === null) { // word not found
        res.status(404).send("")
        return
      }

      if(word) {
        res.send(JSON.stringify(word))
      } else { // internal error
        res.status(500).send("")
      }
    } catch(error) {
      err(error)
      res.status(500).send("")
    }
  })

  const postWord = async (req, res, log, err, childLogger) => {
    log("API request: post-word")

    try {
      const check = await security.checkRequest(childLogger, "dictionary-api/post-word", req.query, ["string", "type", "description", "references", "translations"])
      if(check) {
        log("authentication successful")
      } else if(check === null) {
        err("authentication missing")
        res.status(401).send("")
        return
      } else {
        err("authentication failed")
        res.status(403).send("")
        return
      }

      // decode args from url
      const string = req.query.string
      const type = req.query.type
      const description = req.query.description
      let references = req.query.references
      let translations = req.query.translations
  
      // check for string
      if(!string) {
        err(`query part "string" not found`)
        res.status(400).send("")
        return
      }

      // convert references (if existing) to array
      if(references) {
        references = references.split(",")
      }

      // convert translations (if existing) to array
      if(translations) {
        translations = translations.split(",")
      }

      // construct word with new information
      const word = new Word(0, string, type, description, references || null, translations || null)

      // update word in db
      const result = await api.postWord(data, childLogger, word)

      if(result) {
        res.status(200).send(JSON.stringify(result))
      } else {
        res.status(500).send("")
      }
    } catch(error) {
      err(error)
      res.status(500).send("")
    }
  }

  server.GET("/dictionary-api/post-word", childLogger, postWord)
  server.POST("/dictionary-api/word", childLogger, postWord)

  const putWord = async (req, res, log, err, childLogger) => {
    log("API request: put-word")

    try {
      const check = await security.checkRequest(childLogger, "dictionary-api/put-word", req.query, ["id", "string", "type", "description", "references", "translations"])
      if(check) {
        log("authentication successful")
      } else if(check === null) {
        err("authentication missing")
        res.status(401).send("")
        return
      } else {
        err("authentication failed")
        res.status(403).send("")
        return
      }

      // decode args from url
      const id = req.query.id
      const string = req.query.string
      const type = req.query.type
      const description = req.query.description
      let references = req.query.references
      let translations = req.query.translations
  
      // check for id
      if(!id) {
        err(`query part "id" not found`)
        res.status(400).send("")
        return
      }

      // convert references (if existing) to array
      if(references) {
        references = references.split(",")
      }

      // convert translations (if existing) to array
      if(translations) {
        translations = translations.split(",")
      }

      // construct word with new information
      const word = new Word(id, string || null, type, description, references || null, translations || null)

      // update word in db
      const result = await api.putWord(data, childLogger, word)

      if(result) {
        res.status(200).send("")
      } else {
        res.status(500).send("")
      }
    } catch(error) {
      err(error)
      res.status(500).send("")
    }
  }

  server.GET("/dictionary-api/put-word", childLogger, putWord)
  server.PUT("/dictionary-api/word", childLogger, putWord)

  const deleteWord = async (req, res, log, err, childLogger) => {
    log("API request: delete-word")

    try {
      const check = await security.checkRequest(childLogger, "dictionary-api/delete-word", req.query, ["id"])
      if(check) {
        log("authentication successful")
      } else if(check === null) {
        err("authentication missing")
        res.status(401).send("")
        return
      } else {
        err("authentication failed")
        res.status(403).send("")
        return
      }

      // decode args from url
      const id = req.query.id
  
      // check for id
      if(!id) {
        err(`query part "id" not found`)
        res.status(400).send("")
        return
      }

      // delete word in db
      const result = await api.deleteWord(data, childLogger, id)

      if(result) {
        res.status(200).send("")
      } else {
        res.status(500).send("")
      }
    } catch(error) {
      err(error)
      res.status(500).send("")
    }
  }

  server.GET("/dictionary-api/delete-word", childLogger, deleteWord)
  server.DELETE("/dictionary-api/word", childLogger, deleteWord)

  server.start(childLogger)
})
