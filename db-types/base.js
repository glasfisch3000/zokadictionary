module.exports.name = "base"

module.exports.setup = async (db) => {
  await db.run("CREATE TABLE IF NOT EXISTS Base (text TEXT PRIMARY KEY)")
  console.log("[db-setup][base] table Base exists")
}

module.exports.get = async (db, id) => {
  return await db.get("SELECT text FROM Base WHERE text = ?", [id])
}

module.exports.create = async (db, text) => {
  await db.run("INSERT INTO Base (text) VALUES (?)", [text])
}
