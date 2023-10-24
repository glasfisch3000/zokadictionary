const express = require("express")
const server = express()
server.use(require("body-parser").urlencoded({ extended: false }))

const http = require("http").Server(server)
const port = 80

const client = require("./client.js")

// collection of database functions
const db = require("./db-types.js")

require("./database.js")().then(data => { // actual database pointer
  logGet("/", null, async (res) => {
    res.send(await client("index.html"))
  })

  logGet("/main.css", null, async (res) => {
    res.sendFile(__dirname + "/client/main.css")
  })

  logGet("/dictionary", null, async (res) => {
    res.send(await client("dictionary.html"))
  })

  logGet("/dictionary.css", null, async (res) => {
    res.sendFile(__dirname + "/client/dictionary.css")
  })

  logGet("/dictionary.js", null, async (res) => {
    res.sendFile(__dirname + "/client/dictionary.js")
  })

  logGet("/new-word", null, async (res) => {
    res.send(await client("new-word.html"))
  })

  logGet("/main-form.css", null, async (res) => {
    res.sendFile(__dirname + "/client/main-form.css")
  })

  logGet("/new-word.js", null, async (res) => {
    res.sendFile(__dirname + "/client/new-word.js")
  })

  logGet("/dictionary-api/all-words", null, async (res) => {
    try {
      var words = await db.word.getAll(data)
      if(words) {
        for(var word of words) {
          word.constructed = word.construct()
        }
        res.send(JSON.stringify(words))
        return
      } else {
        res.status(404).send("")
      }
    } catch(error) {
      console.log("[server][get-all-words] " + error)
      res.status(500).send("")
    }
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
        console.log("[server][get-word] " + error)
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
          res.status(500).send("")
        }
      } catch(error) {
        console.log("[server][post-word] " + error)
        res.status(500).send("")
      }
    } else {
      res.status(400).send("")
    }
  })

  logGet("/dictionary-api/all-bases", null, async (res) => {
    try {
      let bases = await db.base.getAll(data)
      if(bases) {
        res.send(JSON.stringify(bases))
      } else {
        res.status(404).send("")
      }
    } catch(error) {
      console.log("[server][get-all-bases] " + error)
      res.status(500).send("")
    }
  })

  logGet("/dictionary-api/base", ["id"], async (res, query) => {
    if(query.id) {
      try {
        let base = await db.base.get(data, query.id)
        if(base) {
          res.send(JSON.stringify(base))
        } else {
          res.status(404).send("")
        }
      } catch(error) {
        console.log("[server][get-base] " + error)
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
          res.status(500).send("")
        }
      } catch(error) {
        console.log("[server][post-base] " + error)
        res.status(500).send("")
      }
    } else {
      res.status(400).send("")
    }
  })

  logGet("/dictionary-api/all-patterns", null, async (res) => {
    try {
      let patterns = await db.pattern.getAll(data)
      if(patterns) {
        res.send(JSON.stringify(patterns))
      } else {
        res.status(404).send("")
      }
    } catch(error) {
      console.log("[server][get-all-patterns] " + error)
      res.status(500).send("")
    }
  })

  logGet("/dictionary-api/pattern", ["id"], async (res, query) => {
    if(query.id) {
      try {
        let pattern = await db.pattern.get(data, query.id)
        if(pattern) {
          res.send(JSON.stringify(pattern))
        } else {
          res.status(404).send("")
        }
      } catch(error) {
        console.log("[server][get-pattern] " + error)
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
          res.status(500).send("")
        }
      } catch(error) {
        console.log("[server][post-pattern] " + error)
        res.status(500).send("")
      }
    } else {
      res.status(400).send("")
    }
  })

  logGet("/dictionary-api/all-classes", null, async (res) => {
    try {
      let classes = await db.class.getAll(data)
      if(classes) {
        res.send(JSON.stringify(classes))
      } else {
        res.status(404).send("")
      }
    } catch(error) {
      console.log("[server][get-all-classes] " + error)
      res.status(500).send("")
    }
  })

  logGet("/dictionary-api/class", ["id"], async (res, query) => {
    if(query.id) {
      try {
        let wordClass = await db.class.get(data, query.id)
        if(wordClass) {
          res.send(JSON.stringify(wordClass))
        } else {
          res.status(404).send("")
        }
      } catch(error) {
        console.log("[server][get-class] " + error)
        res.status(500).send("")
      }
    } else {
      res.status(400).send("")
    }
  })

  logGet("/dictionary-api/post-class", ["id", "title"], async (res, query) => {
    if(query.id && query.title) {
      try {
        let wordClass = await db.class.create(data, query.id, query.title)
        if(wordClass) {
          res.send(JSON.stringify(wordClass))
        } else {
          res.status(500).send("")
        }
      } catch(error) {
        console.log("[server][post-class] " + error)
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
