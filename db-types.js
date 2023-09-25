let base = require("./db-types/base.js")
let pattern = require("./db-types/pattern.js")
let word = require("./db-types/word.js")

let all = [base, pattern, word]

module.exports = {
  all: all,
  base: base,
  pattern: pattern,
  word: word,
}
