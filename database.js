const fs = require("fs").promises
const dbTypes = require("./db-types.js")

const dbFile = "./data/database.db"

async function init(logger) {
  const { log, err, childLogger } = logger("db-init")

  try {
    let sqlite = (await import("sqlite-async")).Database

    let db = await sqlite.open(dbFile)
    log("successfully connected to database")

    for(const dbType of dbTypes.all) {
      if(dbType && dbType.setup) {
        log(`running setup for db-type '${dbType.name}'`)
        await dbType.setup(db, childLogger)
      }
    }

    log("successfully created database")

    return db
  } catch(error) {
    err("error connecting to database")
    throw error
  }
}

module.exports = init
