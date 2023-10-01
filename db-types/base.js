module.exports.name = "base"

module.exports.setup = async (db) => {
  await db.run("CREATE TABLE IF NOT EXISTS Base (id TEXT PRIMARY KEY)")
  console.log("[db-setup][base] table Base exists")
}

module.exports.get = async (db, id) => {
  return (await db.get("SELECT * FROM Base WHERE id=?", [id])).id
}

module.exports.create = async (db, id) => {
  let query = await db.run("INSERT INTO Base (id) VALUES (?)", [id])
  if(!query) return false

  return id
}
