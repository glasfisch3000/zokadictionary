import promises from "node:fs"
import * as word from "./word.mjs"
import { Database } from "sqlite-async"

import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const dirname = dirname(fileURLToPath(import.meta.url))

const dbFile = dirname + "/../data/database.db"

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