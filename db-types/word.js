let baseModule = require("./base.js")
let patternModule = require("./pattern.js")

class Word {
  init(id, string, base, pattern) {
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

    var patternString = "%"

    var pattern = this.pattern
    while(pattern) {
      patternString.replaceAll("%", pattern.patternString)
      pattern = pattern.parent
    }

    patternString.replaceAll("%", this.base)
    return patternString
  }
}

module.exports.name = "word"

module.exports.setup = async (db) => {
  await db.run("CREATE TABLE IF NOT EXISTS Word (id INTEGER PRIMARY KEY AUTOINCREMENT, string TEXT, base TEXT, pattern TEXT, FOREIGN KEY(base) REFERENCES Base, FOREIGN KEY(pattern) REFERENCES Pattern)")
  console.log("[db-setup][word] table Word exists")
}

module.exports.get = async (db, id) => {
  let { id, string, base, pattern } = await db.get("SELECT * FROM Word WHERE id = ?", [id])

  var result = new Word(id, string, null, null)

  if(base) result.base = baseModule.get(db, base)
  if(pattern) result.pattern = patternModule.get(db, pattern)

  return result
}

module.exports.create = async (db, string, base, pattern) => {
  if(base) {
    if(pattern) await db.run("INSERT INTO Word (string, base, pattern) VALUES (?, ?, ?)", [string, base, pattern])
    else await db.run("INSERT INTO Word (string, base) VALUES (?, ?)", [string, base])
  } else if(pattern) {
    await db.run("INSERT INTO Word (string, pattern) VALUES (?, ?)", [string, pattern])
  } else {
    await db.run("INSERT INTO Word (string) VALUES (?)", [string])
  }
}
