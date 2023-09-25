const sqlite = require("sqlite-async")
const fs = require("fs").promises
const dbTypes = require("./db-types.js")

const dbFile = "./database.db"

async function init() {
  try {
    let db = await sqlite.open(dbFile)
    console.log("[db-setup] successfully connected to database")

    for(let dbType of dbTypes.all) {
      if(dbType && dbType.setup) {
        console.log(`[db-setup] setting up db-type '${dbType.name}'`)
        await dbType.setup(db)
      }
    }

    console.log("[db-setup] successfully created database")

    return db
  } catch(err) {
    console.log("[db-setup] error connecting to database")
    throw err
  }
}

module.exports = init
