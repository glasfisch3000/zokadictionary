const db = require("./db-types.js")

module.exports.getAllWords = async (data, logger) => {
  const { log, err, childLogger } = logger("api-get-all-words")

  try {
    log("fetching words")
    var words = await db.word.getAll(data, childLogger)

    if(!words) {
      err("no words found")
      return null
    }

    return words
  } catch(error) {
    err(error)
    return false
  }
}

module.exports.getWord = async (data, logger, id) => {
  const { log, err, childLogger } = logger("api-get-word")

  try {
    log("fetching word")
    var word = await db.word.get(data, childLogger, id)

    if(!word) {
      err("no content found")
      return null
    }

    return word
  } catch(error) {
    err(error)
    return false
  }
}

module.exports.postWord = async (data, logger, word) => {
  const { log, err, childLogger } = logger("api-post-word")

  try {
    log("posting word")
    let result = await db.word.create(data, childLogger, word)
    
    if(!result) {
      err("word could not be created")
      return null
    }

    return result
  } catch(error) {
    err(error)
    return false
  }
}

module.exports.putWord = async (data, logger, word) => {
  const { log, err, childLogger } = logger("api-put-word")

  try {
    if(word.string) {
      log(`updating attribute "string"`)

      let result = await db.word.updateString(data, childLogger, word.id, word.string)
      if(!result) {
        err(`attribute "string" could not be updated`)
        return false
      }
    }

    if(word.type || word.type === "") {
      log(`updating attribute "type"`)

      let result = await db.word.updateType(data, childLogger, word.id, word.type)
      if(!result) {
        err(`attribute "type" could not be updated`)
        return false
      }
    }

    if(word.description || word.description === "") {
      log(`updating attribute "description"`)

      let result = await db.word.updateDescription(data, childLogger, word.id, word.description)
      if(!result) {
        err(`attribute "description" could not be updated`)
        return false
      }
    }

    if(word.references) {
      log(`updating attribute "references"`)

      let result = await db.word.updateReferences(data, childLogger, word.id, word.references)
      if(!result) {
        err(`attribute "references" could not be updated`)
        return false
      }
    }

    if(word.translations) {
      log(`updating attribute "translation"`)

      let result = await db.word.updateTranslations(data, childLogger, word.id, word.translations)
      if(!result) {
        err(`attribute "translations" could not be updated`)
        return false
      }
    }

    return true
  } catch(error) {
    err(error)
    return false
  }
}

module.exports.deleteWord = async (data, logger, word) => {
  const { log, err, childLogger } = logger("api-delete-word")

  try {
    log("deleting word")
    let result = await db.word.delete(data, childLogger, word)
    
    if(!result) {
      err("word could not be deleted")
      return null
    }

    return result
  } catch(error) {
    err(error)
    return false
  }
}