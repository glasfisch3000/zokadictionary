class Pattern {
  init(id, title, pattern, parent) {
    this.id = id
    this.title = title
    this.patternString = pattern
    this.parent = parent
  }

  async update(db) {
    this.title = await db.get("SELECT title FROM Pattern WHERE id = ?", [this.id])
    this.patternString = await db.get("SELECT pattern FROM Pattern WHERE id = ?", [this.id])

    let parentID = await db.get("SELECT parent FROM Pattern WHERE id = ?", [this.id])
    if(parentID) this.parent = await module.exports.get(db, parentID)
    else this.parent = null
  }
}

module.exports.name = "pattern"

module.exports.setup = async (db) => {
  await db.run("CREATE TABLE IF NOT EXISTS Pattern (id TEXT PRIMARY KEY, title TEXT, pattern TEXT, parent TEXT, FOREIGN KEY(parent) REFERENCES Pattern)")
  console.log("[db-setup][pattern] table Pattern exists")
}

module.exports.get = async (db, id) => {
  let { id, title, pattern, parent } = await db.get("SELECT * FROM Pattern WHERE id = ?", [id])

  var result = new Pattern(id, title, pattern, null)
  if(parent) {
    result.parent = module.exports.get(db, parent)
  }

  return result
}

module.exports.create = async (db, id, title, pattern, parent) => {
  if(parent) await db.run("INSERT INTO Pattern (id, title, pattern, parent) VALUES (?, ?, ?, ?)", [id, title, pattern, parent])
  else await db.run("INSERT INTO Pattern (id, title, pattern) VALUES (?, ?, ?)", [id, title, pattern])
}
