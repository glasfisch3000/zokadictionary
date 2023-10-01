class Class {
  constructor(id, title) {
    this.id = id
    this.title = title
  }

  async update(db) {
    this.title = await db.get("SELECT title FROM Class WHERE id = ?", [this.id]) || null
  }
}

module.exports.name = "class"

module.exports.setup = async (db) => {
  await db.run("CREATE TABLE IF NOT EXISTS Class (id TEXT PRIMARY KEY, title TEXT)")
  console.log("[db-setup][class] table Class exists")
}

module.exports.get = async (db, id) => {
  let query = await db.get("SELECT * FROM Class WHERE id = ?", [id])
  if(!query) return query

  var result = new Class(query.id, query.title)

  return result
}

module.exports.create = async (db, id, title) => {
  let query = await db.run("INSERT INTO Class (id, title) VALUES (?, ?)", [id, title])
  if(!query) return false

  return id
}
