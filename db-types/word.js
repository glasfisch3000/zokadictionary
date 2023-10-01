let baseModule = require("./base.js")
let patternModule = require("./pattern.js")
let classModule = require("./class.js")

class Word {
  constructor(id, string, base, pattern, wordClass) {
    this.id = id
    this.string = string
    this.base = base
    this.pattern = pattern
    this.class = wordClass
  }

  async update(db) {
    let data = await db.get("SELECT * FROM Word WHERE id = ?", [this.id])

    this.string = data.string || null

    if(data.base) this.base = await baseModule.get(db, data.base)
    else this.base = null

    if(data.pattern) this.pattern = await patternModule.get(db, data.pattern)
    else this.pattern = null

    if(data.class) this.class = await classModule.get(db, data.class)
    else this.class = null
  }

  construct() {
    if(this.string) return this.string

    var patternString = "$"

    var pattern = this.pattern
    while(pattern) {
      patternString = patternString.replaceAll("$", pattern.patternString)
      pattern = pattern.parent
    }

    patternString = patternString.replaceAll("$", this.base)
    return patternString
  }
}

module.exports.name = "word"

module.exports.setup = async (db) => {
  await db.run("CREATE TABLE IF NOT EXISTS Word (id INTEGER PRIMARY KEY AUTOINCREMENT, string TEXT, base TEXT, pattern TEXT, class TEXT, FOREIGN KEY(base) REFERENCES Base, FOREIGN KEY(pattern) REFERENCES Pattern, FOREIGN KEY(class) REFERENCES Class)")
  console.log("[db-setup][word] table Word exists")
}

module.exports.get = async (db, id) => {
  let query = await db.get("SELECT * FROM Word WHERE id = ?", [id])
  if(!query) return query
  let { string, base, pattern } = query

  var result = new Word(id, string, base, null, null)

  //if(base) result.base = await baseModule.get(db, base)
  if(pattern) result.pattern = await patternModule.get(db, pattern)
  if(query.class) result.class = await classModule.get(db, query.class)

  return result
}

module.exports.create = async (db, string, base, pattern, wordClass) => {
  let id = (await db.run("INSERT INTO Word (string, base, pattern, class) VALUES (?, ?, ?, ?)", [string || null, null, null, null])).lastID
  if(!id) return false

  if(base) await db.run("UPDATE Word SET base = ? WHERE id = ?", [base, id])
  if(pattern) await db.run("UPDATE Word SET pattern = ? WHERE id = ?", [pattern, id])
  if(wordClass) await db.run("UPDATE Word SET class = ? WHERE id = ?", [wordClass, id])

  return id
}
