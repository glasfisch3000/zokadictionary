const key = require("./key.js")
const crypto = require("crypto")

async function hash(text) {
  const textAsBuffer = new TextEncoder().encode(text)
  const hashBuffer = await crypto.subtle.digest("SHA-256", textAsBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hash = hashArray.map(item => item.toString(16).padStart(2, "0")).join("")
  return hash
}

function checkTimestamp(timestamp) {
  let date = new Date()
  date.setTime(timestamp)

  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if(diff < 0) return false
  if(diff > 30000) return false

  return true
}

async function checkRequest(logger, path, query, watchedComponents) {
  const { log, err, childLogger } = logger("security-check")

  const sentHash = query.hash
  if(!sentHash) {
    err("hash value required")
    return null
  }

  const timestamp = query.time
  if(!timestamp) {
    err("timestamp value required")
    return false
  }

  if(!checkTimestamp(timestamp)) {
    err(`invalid timestamp: "${timestamp}"`)
    return false
  }
  
  let string = ""

  string += "path"
  string += path

  string += "timestamp"
  string += timestamp

  string += "key"
  string += key

  for(const component of watchedComponents) {
    string += component
    string += query[component]
  }

  const calculatedHash = await hash(string)
  if(calculatedHash == sentHash) {
    return true
  } else {
    err("invalid hash value")
    return false
  }
}

module.exports.hash = hash
module.exports.checkTimestamp = checkTimestamp
module.exports.checkRequest = checkRequest