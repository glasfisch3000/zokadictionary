const express = require("express")
const server = express()
server.use(require("body-parser").urlencoded({ extended: false }))

const http = require("http").Server(server)
const port = 80

// collection of database functions
const db = require("./db-types.js")

require("./database.js")().then(data => { // actual database pointer
  logGet("/", null, (res) => {
    res.redirect("/dictionary")
  })

  logGet("/dictionary-api/word", ["id"], async (res, query) => {
    if(query.id) {
      try {
        var word = await db.word.get(data, query.id)
        if(word) {
          word.constructed = word.construct()
          res.send(JSON.stringify(word))
          return
        } else {
          res.status(404).send("")
        }
      } catch(error) {
        console.log("[server] [get-word] " + error)
        res.status(500).send("")
      }
    } else {
      res.status(400).send("")
    }
  })

  logGet("/dictionary-api/post-word", ["string", "base", "pattern"], async (res, query) => {
    if(query.string || (query.base && query.pattern)) {
      try {
        let word = await db.word.create(data, query.string, query.base, query.pattern)
        if(word) {
          res.send(JSON.stringify(word))
        } else {
          res.status(404).send("")
        }
      } catch(error) {
        console.log("[server] [post-word] " + error)
        res.status(500).send("")
      }
    } else {
      res.status(400).send("")
    }
  })

  logGet("/dictionary-api/post-base", ["string"], async (res, query) => {
    if(query.string) {
      try {
        let base = await db.base.create(data, query.string)
        if(base) {
          res.send(JSON.stringify(base))
        } else {
          res.status(404).send("")
        }
      } catch(error) {
        console.log("[server] [post-base] " + error)
        res.status(500).send("")
      }
    } else {
      res.status(400).send("")
    }
  })

  logGet("/dictionary-api/post-pattern", ["id", "title", "string", "parent"], async (res, query) => {
    if(query.id && query.title && query.string) {
      try {
        let pattern = await db.pattern.create(data, query.id, query.title, query.string, query.parent)
        if(pattern) {
          res.send(JSON.stringify(pattern))
        } else {
          res.status(404).send("")
        }
      } catch(error) {
        console.log("[server] [post-pattern] " + error)
        res.status(500).send("")
      }
    } else {
      res.status(400).send("")
    }
  })

  http.listen(port, () => { console.log("[server] listening on port " + port) })
})

function logGet(path, wantedQueryComponents, callback) {
  server.get(path, (req, res) => {
    var message = ""

    let queryResults = []
    if(wantedQueryComponents) for(let component of wantedQueryComponents) {
      let result = req.query[component]

      queryResults[component] = result

      message += message ? "&" : "?"
      message += component + "=" + result
    }

    message = "[server] GET request: " + path + message
    console.log(message)

    callback(res, queryResults, req)
  })
}

function logPost(path, wantedQueryComponents, callback) {
  server.post(path, (req, res) => {
    var message = ""

    let queryResults = []
    if(wantedQueryComponents) for(let component of wantedQueryComponents) {
      let result = req.query[component]

      queryResults[component] = result

      message += message ? "&" : "?"
      message += component + "=" + result
    }

    message = "[server] POST request: " + path + message
    console.log(message)

    callback(res, queryResults, req)
  })
}
