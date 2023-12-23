const { log, err, childLogger } = require("./logging.js")(["app"])

log("importing modules")
const server = require("./server.js")
const api = require("./api.js")
const security = require("./security/security.js")

log("starting database")
require("./db/database.js")(childLogger).then(data => { // actual database pointer
  log("setup done")

  server.getFile("/main.css", __dirname + "/client/main.css", childLogger)
  server.getFile("/dictionary.css", __dirname + "/client/dictionary.css", childLogger)
  server.getFile("/dictionary.js", __dirname + "/client/dictionary.js", childLogger)

  server.getRedirect("/", "/dictionary", childLogger)
  server.getRedirect("/index", "/dictionary", childLogger)
  server.getRedirect("/index.html", "/dictionary", childLogger)
  server.getRedirect("/dictionary.html", "/dictionary", childLogger)
  server.getFile("/dictionary", __dirname + "/client/dictionary.html", childLogger)

  server.get("/dictionary-api/all-words", childLogger, async (req, res, log, err, childLogger) => {
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

  server.get("/dictionary-api/word", childLogger, async (req, res, log, err, childLogger) => {
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
      const { Word } = require("./db/db-types.js").word
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

  server.get("/dictionary-api/post-word", childLogger, postWord)
  server.post("/dictionary-api/word", childLogger, postWord)

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
      const { Word } = require("./db/db-types.js").word
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

  server.get("/dictionary-api/put-word", childLogger, putWord)
  server.put("/dictionary-api/word", childLogger, putWord)

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

  server.get("/dictionary-api/delete-word", childLogger, deleteWord)
  server.delete("/dictionary-api/word", childLogger, deleteWord)

  server.start(childLogger)
})
