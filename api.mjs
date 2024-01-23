import * as wordsDB from "./db/word.mjs"

export async function getAllWords(data, logger) {
  const { log, err, childLogger } = logger("api-get-all-words")

  try {
    log("fetching words")
    var words = await wordsDB.getAllWords(data, childLogger)

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

export async function getWord(data, logger, id) {
  const { log, err, childLogger } = logger("api-get-word")

  try {
    log("fetching word")
    var word = await wordsDB.getWord(data, childLogger, id)

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

export async function postWord(data, logger, word) {
  const { log, err, childLogger } = logger("api-post-word")

  try {
    log("posting word")
    let result = await wordsDB.createWord(data, childLogger, word)
    
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

export async function putWord(data, logger, word) {
  const { log, err, childLogger } = logger("api-put-word")

  try {
    if(word.string) {
      log(`updating attribute "string"`)

      let result = await wordsDB.updateWordString(data, childLogger, word.id, word.string)
      if(!result) {
        err(`attribute "string" could not be updated`)
        return false
      }
    }

    if(word.type || word.type === "") {
      log(`updating attribute "type"`)

      let result = await wordsDB.updateWordType(data, childLogger, word.id, word.type)
      if(!result) {
        err(`attribute "type" could not be updated`)
        return false
      }
    }

    if(word.description || word.description === "") {
      log(`updating attribute "description"`)

      let result = await wordsDB.updateWordDescription(data, childLogger, word.id, word.description)
      if(!result) {
        err(`attribute "description" could not be updated`)
        return false
      }
    }

    if(word.references) {
      log(`updating attribute "references"`)

      let result = await wordsDB.updateWordReferences(data, childLogger, word.id, word.references)
      if(!result) {
        err(`attribute "references" could not be updated`)
        return false
      }
    }

    if(word.translations) {
      log(`updating attribute "translation"`)

      let result = await wordsDB.updateWordTranslations(data, childLogger, word.id, word.translations)
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

export async function deleteWord(data, logger, word) {
  const { log, err, childLogger } = logger("api-delete-word")

  try {
    log("deleting word")
    let result = await wordsDB.deleteWord(data, childLogger, word)
    
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