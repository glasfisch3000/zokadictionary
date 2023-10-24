let classModule = require("./class.js")

class Pattern {
  constructor(id, title, pattern, parent, wordClass) {
    this.id = id
    this.title = title
    this.patternString = pattern
    this.parent = parent
    this.class = wordClass
  }

  async update(db) {
    let data = await db.get("SELECT * FROM Pattern WHERE id = ?", [this.id])

    this.title = data.title || null
    this.patternString = data.pattern || null

    if(data.parent) this.parent = await module.exports.get(db, data.parent)
    else this.parent = null

    if(data.class) this.class = await classModule.get(db, data.class)
    else this.parent = null
  }
}

module.exports.name = "pattern"

module.exports.setup = async (db) => {
  await db.run("CREATE TABLE IF NOT EXISTS Pattern (id TEXT PRIMARY KEY, title TEXT, pattern TEXT, parent TEXT, class TEXT, FOREIGN KEY(parent) REFERENCES Pattern, FOREIGN KEY(class) REFERENCES Class)")
  console.log("[db-setup][pattern] table Pattern exists")
}

module.exports.get = async (db, id) => {
  let query = await db.get("SELECT * FROM Pattern WHERE id = ?", [id])
  let { title, pattern, parent } = query

  var result = new Pattern(id, title, pattern, null, null)
  if(parent) result.parent = await module.exports.get(db, parent)
  if(query.class) result.class = await classModule.get(db, query.class)

  return result
}

module.exports.getAll = async (db) => {
  let query = await db.all("SELECT * FROM Pattern")
  if(!query) return false

  var results = []

  for(var item of query) {
    var pattern = new Pattern(item.id, item.title, item.pattern, null, null)

    if(item.parent) pattern.parent = await module.exports.get(db, item.parent)
    if(item.class) pattern.class = await classModule.get(db, item.class)

    results.push(pattern)
  }

  return results
}

module.exports.create = async (db, id, title, pattern, parent, wordClass) => {
  let query = await db.run("INSERT INTO Pattern (id, title, pattern, parent, class) VALUES (?, ?, ?, ?, ?)", [id, title, pattern, null, null])
  if(!query) return false

  if(parent) await db.run("UPDATE Pattern SET parent = ? WHERE id = ?", [parent, id])
  if(wordClass) await db.run("UPDATE Pattern SET class = ? WHERE id = ?", [wordClass, id])

  return id
}
