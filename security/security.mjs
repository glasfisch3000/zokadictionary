import { keys } from "./keys.mjs"
import * as crypto from "node:crypto"
import * as ecc from "@noble/ed25519"

export function checkTimestamp(timestamp) {
  let date = new Date()
  date.setTime(timestamp)

  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if(diff < 0) return false
  if(diff > 30000) return false

  return true
}

export async function checkRequest(logger, path, query, watchedComponents) {
  const { log, err, childLogger } = logger("security-check")

  const signature = query.signature
  if(!signature) {
    err("signature required")
    return null
  }

  const publicKey = query.publicKey
  if(!publicKey) {
    err("public key required")
    return null
  }

  const sender = keys[`${publicKey}`]
  if(!sender || !sender.publicKey) {
    err("invalid public key")
    return false
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

  for(const component of watchedComponents) {
    string += component
    string += query[component]
  }

  const textAsBuffer = new TextEncoder().encode(string)

  if(await ecc.verifyAsync(signature, textAsBuffer, sender.publicKey)) {
    return true
  } else {
    err("invalid signature")
    return false
  }
}