export class Word {
  constructor(id, string, type, description, references, translations) {
    this.id = id
    this.string = string
    this.type = type
    this.description = description
    this.references = references || []
    this.translations = translations || []
  }
}

export async function setup(db, logger) {
  const { log, err, childLogger } = logger("db-word-setup")

  await db.run("CREATE TABLE IF NOT EXISTS Word (id INTEGER PRIMARY KEY AUTOINCREMENT, string TEXT, type TEXT, description TEXT)")
  log(`table "Word" exists`)
  await db.run("CREATE TABLE IF NOT EXISTS Reference (id TEXT PRIMARY KEY, word INTEGER, reference INTEGER, FOREIGN KEY(word) REFERENCES Word, FOREIGN KEY(reference) REFERENCES Word)")
  log(`table "Reference" exists`)
  await db.run("CREATE TABLE IF NOT EXISTS Translation (id TEXT PRIMARY KEY, word INTEGER, translation TEXT, FOREIGN KEY(word) REFERENCES Word)")
  log(`table "Translation" exists`)
}

export async function getWord(db, logger, id) {
  const { log, err, childLogger } = logger("db-word-get")

  try {
    const word = await db.get("SELECT * FROM Word WHERE id = ?", [id])
    if(!word) {
      err(`no word found for id: "${id}"`)
      return null
    }

    if(!word.string) {
      err(`invalid database entry for id: "${id}"`)
      return false
    }

    let result = new Word(id, word.string, word.type || "", word.description || "")

    result.references = await getWordReferences(db, log, err, id)
    result.translations = await getWordTranslations(db, log, err, id)

    return result
  } catch(error) {
    err(error)
    return false
  }
}

async function getWordReferences(db, log, err, id) {
  let result = []

  const references = await db.all("SELECT * FROM Reference WHERE word = ?", [id])
  for(const reference of references) {
    if(!reference || !reference.reference) continue

    try {
      const referencedWord = await db.get("SELECT * FROM Word WHERE id = ?", [reference.reference])
      if(!referencedWord || !referencedWord.string) continue

      result.push({ id: reference.reference, string: referencedWord.string, type: referencedWord.type })
    } catch(error) {
      err(`error while retrieving reference ${reference.reference}: ${error}`)
    }
  }

  return result
}

async function getWordTranslations(db, log, err, id) {
  let result = []

  const translations = await db.all("SELECT * FROM Translation WHERE word = ?", [id])
  for(const translation of translations) {
    if(!translation || !translation.translation) continue

    result.push(translation.translation)
  }

  return result
}

export async function getAllWords(db, logger) {
  const { log, err, childLogger } = logger("db-word-getAll")

  try {
    let words = await db.all("SELECT * FROM Word")
    if(!words) {
      err("no words found")
      return null
    }
  
    let results = []
  
    for(const item of words) {
      if(!item || !item.id || !item.string) continue
  
      try {
        let word = new Word(item.id, item.string, item.type || "", item.description || "")
        word.references = await getWordReferences(db, log, err, item.id)
        word.translations = await getWordTranslations(db, log, err, item.id)
    
        results.push(word)
      } catch(error) {
        err(`error while assembling word ${item.id}: ${error}`)
      }
    }
  
    return results
  } catch(error) {
    err(error)
    return false
  }
}

export async function createWord(db, logger, word) {
  const { log, err, childLogger } = logger("db-word-create")

  try {
    if(!word) {
      err(`missing argument "word"`)
      return false
    }

    if(!word.string) {
      err(`invalid argument "word"`)
      return false
    }

    const result = await db.run("INSERT INTO Word (string, type, description) VALUES (?, ?, ?)", [word.string, word.type || "", word.description || ""])
    
    if(!result || !result.lastID) {
      err("database query failed")
      return false
    }
    const id = result.lastID

    if(word.references && word.references.length > 0) {
      for(const reference of word.references) {
        try {
          await db.run("INSERT INTO Reference (id, word, reference) VALUES (?, ?, ?)", [`${id} ${reference}`, id, reference])
        } catch(error) {
          err(`error while setting reference: ${error}`)
        }
      }
    }

    if(word.translations && word.translations.length > 0) {
      for(const translation of word.translations) {
        try {
          await db.run("INSERT INTO Translation (id, word, translation) VALUES (?, ?, ?)", [`${id} ${translation}`, id, translation])
        } catch(error) {
          err(`error while setting translation: ${error}`)
        }
      }
    }

    return id
  } catch(error) {
    err(error)
    return false
  }
}

export async function updateWordString(db, logger, id, string) {
  const { log, err, childLogger } = logger("db-word-update-string")

  try {
    if(!id) {
      err(`missing argument "id"`)
      return false
    }

    if(!string) {
      err(`missing argument "string"`)
      return false
    }

    const result = await db.run("UPDATE Word SET string = ? WHERE id = ?", [string, id])
    
    if(!result) {
      err("database query failed")
      return null
    }

    return true
  } catch(error) {
    err(error)
    return false
  }
}

export async function updateWordType(db, logger, id, type) {
  const { log, err, childLogger } = logger("db-word-update-type")

  try {
    if(!id) {
      err(`missing argument "id"`)
      return false
    }

    if(!type && type !== "") {
      err(`missing argument "type"`)
      return false
    }

    const result = await db.run("UPDATE Word SET type = ? WHERE id = ?", [type, id])
    
    if(!result) {
      err("database query failed")
      return null
    }

    return true
  } catch(error) {
    err(error)
    return false
  }
}

export async function updateWordDescription(db, logger, id, description) {
  const { log, err, childLogger } = logger("db-word-update-description")

  try {
    if(!id) {
      err(`missing argument "id"`)
      return false
    }

    if(!description && description !== "") {
      err(`missing argument "description"`)
      return false
    }

    const result = await db.run("UPDATE Word SET description = ? WHERE id = ?", [description, id])
    
    if(!result) {
      err("database query failed")
      return null
    }

    return true
  } catch(error) {
    err(error)
    return false
  }
}

export async function updateWordReferences(db, logger, id, references) {
  const { log, err, childLogger } = logger("db-word-update-references")

  try {
    if(!id) {
      err(`missing argument "id"`)
      return false
    }

    if(!references) {
      err(`missing argument "references"`)
      return false
    }

    const oldReferences = await db.all("SELECT * FROM Reference WHERE word = ?", [id]) || []

    for(const reference of oldReferences) {
      if(reference && reference.reference && !references.includes(reference.reference)) {
        const result = await db.run("DELETE FROM Reference WHERE word = ? AND reference = ?", [id, reference.reference])
        if(!result) {
          err(`unable to delete reference: "${reference.reference}"`)
          return false
        }
      }
    }

    for(const reference of references) {
      if(reference && !oldReferences.includes(reference)) {
        const result = await db.run("INSERT INTO Reference (id, word, reference) VALUES (?, ?, ?)", [`${id} ${reference}`, id, reference])
        if(!result || !result.lastID) {
          err(`unable to insert reference: "${reference}"`)
          return false
        }
      }
    }

    return true
  } catch(error) {
    err(error)
    return false
  }
}

export async function updateWordTranslations(db, logger, id, translations) {
  const { log, err, childLogger } = logger("db-word-update-translations")

  try {
    if(!id) {
      err(`missing argument "id"`)
      return false
    }

    if(!translations) {
      err(`missing argument "translations"`)
      return false
    }

    const oldTranslations = await db.all("SELECT * FROM Translation WHERE word = ?", [id]) || []
    for(const translation of oldTranslations) {
      if(translation && translation.translation && !translations.includes(translation.translation)) {
        const result = await db.run("DELETE FROM Translation WHERE word = ? AND translation = ?", [id, translation.translation])
        if(!result) {
          err(`unable to delete translation: "${translation.translation}"`)
          return false
        }
      }
    }

    for(const translation of translations) {
      if(translation && !oldTranslations.find(element => element && element.translation == translation)) {
        const result = await db.run("INSERT INTO Translation (id, word, translation) VALUES (?, ?, ?)", [`${id} ${translation}`, id, translation])
        if(!result || !result.lastID) {
          err(`unable to insert translation: "${translation}"`)
          return false
        }
      }
    }

    return true
  } catch(error) {
    err(error)
    return false
  }
}

export async function deleteWord(db, logger, id) {
  const { log, err, childLogger } = logger("db-word-delete")

  try {
    if(!id) {
      err(`missing argument "id"`)
      return false
    }

    let result = await db.run("DELETE FROM Reference WHERE word = ? OR reference = ?", [id, id])
    if(!result) {
      err(`unable to delete references`)
      return false
    }

    result = await db.run("DELETE FROM Translation WHERE word = ?", [id])
    if(!result) {
      err(`unable to delete translations`)
      return false
    }

    result = await db.run("DELETE FROM Word WHERE id = ?", [id])
    if(!result) {
      err(`unable to delete word`)
      return false
    }

    return true
  } catch(error) {
    err(error)
    return false
  }
}