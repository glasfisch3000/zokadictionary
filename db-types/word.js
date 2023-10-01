let baseModule = require("./base.js")
let patternModule = require("./pattern.js")

class Word {
  constructor(id, string, base, pattern) {
    this.id = id
    this.string = string
    this.base = base
    this.pattern = pattern
  }

  async update(db) {
    this.string = await db.get("SELECT string FROM Word WHERE id = ?", [this.id]) || null

    let baseID = await db.get("SELECT base FROM Word WHERE id = ?", [this.id])
    if(baseID) this.base = await baseModule.get(db, baseID)

    let patternID = await db.get("SELECT pattern FROM Word WHERE id = ?", [this.id])
    if(patternID) this.pattern = await patternModule.get(db, patternID)
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
  await db.run("CREATE TABLE IF NOT EXISTS Word (id INTEGER PRIMARY KEY AUTOINCREMENT, string TEXT, base TEXT, pattern TEXT, FOREIGN KEY(base) REFERENCES Base, FOREIGN KEY(pattern) REFERENCES Pattern)")
  console.log("[db-setup][word] table Word exists")
}

module.exports.get = async (db, id) => {
  let query = await db.get("SELECT * FROM Word WHERE id = ?", [id])
  if(!query) return query
  let { string, base, pattern } = query

  var result = new Word(id, string, base, null)

  //if(base) result.base = await baseModule.get(db, base)
  if(pattern) result.pattern = await patternModule.get(db, pattern)

  return result
}

module.exports.create = async (db, string, base, pattern) => {
  if(base) {
    if(pattern) return (await db.run("INSERT INTO Word (string, base, pattern) VALUES (?, ?, ?)", [string, base, pattern])).lastID
    else return (await db.run("INSERT INTO Word (string, base) VALUES (?, ?)", [string, base])).lastID
  } else if(pattern) {
    return (await db.run("INSERT INTO Word (string, pattern) VALUES (?, ?)", [string, pattern])).lastID
  } else {
    return (await db.run("INSERT INTO Word (string) VALUES (?)", [string])).lastID
  }
}
