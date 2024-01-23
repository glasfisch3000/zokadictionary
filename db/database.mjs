import promises from "node:fs"
import * as word from "./word.mjs"
import { Database } from "sqlite-async"

const dbFile = "./data/database.db"

export async function init(logger) {
  const { log, err, childLogger } = logger("db-init")

  try {
    let db = await Database.open(dbFile)
    log("successfully connected to database")

    log("running setup actions")
    word.setup(db, childLogger)

    log("successfully created database")
    return db
  } catch(error) {
    err("error connecting to database")
    throw error
  }
}