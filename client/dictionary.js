let dictionaryContainer = document.getElementById("dictionary-container")
let fetchedWords = []

fetch("/dictionary-api/all-words", { method: "GET" }) // get list of all words from server
  .then((response) => response.json()) // convert to usable object
  .then((words) => {
    dictionaryContainer.innerHTML = "" // clear website contents

    if(!words) { // no data provided by server
      dictionaryContainer.innerHTML = "Something went wrong."
      return
    }

    fetchedWords = words

    // for every entry provided by the server, create a div box with information about it
    let wordElements = []
    for(const word of words) {
      // expandable box with information about the entry
      let element = document.createElement("div")
      element.id = "word-" + word.id
      element.classList.add("word")
      element.setAttribute("expanded", false)
      element.finalWord = word.string
      wordElements.push(element)


      // title section that is always visible
      let title = document.createElement("div")
      title.id = element.id + "-title"
      title.classList.add("word-title")
      title.onclick = (event) => {
        event.currentTarget.parentElement.setAttribute("expanded", event.currentTarget.parentElement.getAttribute("expanded") == "false")
      }
      element.appendChild(title)

      // the word itself
      let value = document.createElement("div")
      value.id = element.id + "-value"
      value.classList.add("word-value")
      value.innerHTML = word.string
      title.appendChild(value)

      // the word's type
      let type = document.createElement("div")
      type.id = element.id + "-type"
      type.classList.add("word-type")
      type.setAttribute("wordType", word.type || "none")
      type.innerHTML = wordTypeName(word.type)
      title.appendChild(type)


      // details section that is visible only when expanded
      let details = document.createElement("div")
      details.id = element.id + "-details"
      details.classList.add("word-details")
      element.appendChild(details)

      // a list of all the translations
      if(word.translations && word.translations.length > 0) {
        let translations = document.createElement("div")
        translations.id = element.id + "-translations"
        translations.classList.add("word-translations")
        details.appendChild(translations)

        for(const index in word.translations) {
          const translation = word.translations[index]
          if(!translation) continue

          let item = document.createElement("div")
          item.id = element.id + `-translation-${index}`
          item.classList.add("word-translation")
          item.innerHTML = translation
          translations.appendChild(item)
        }
      }

      // a description of the word and it's meaning
      let description = document.createElement("div")
      description.id = element.id + "-description"
      description.classList.add("word-description")
      description.innerHTML = word.description
      if(!word.description) description.style.display = "none"
      details.appendChild(description)

      // a list of all the linked entries
      if(word.references && word.references.length > 0) {
        let references = document.createElement("div")
        references.id = element.id + "-references"
        references.classList.add("word-references")
        details.appendChild(references)

        for(const reference of word.references) {
          if(!reference || !reference.id || !reference.string) continue

          let item = document.createElement("span")
          item.id = element.id + `-reference-${reference.id}`
          item.classList.add("word-reference")
          item.innerHTML = reference.string
          item.setAttribute("wordType", reference.type || "none")
          item.onclick = () => { wordLinkClick(reference.id) }
          references.appendChild(item)
        }
      }
    }

    let letters = ["a", "i", "u", "e", "o", "m", "v", "b", "l", "n", "z", "zh", "d", "dh", "y", "r", "k"]

    let results = {}
    letters.reverse()
    for(const wordElement of wordElements) {
      sortWordElement(wordElement, letters, results)
    }
    letters.reverse()
    letters.push("other")

    for(const letter of letters) {
      let elements = results[letter] || []

      const displayLetter = letter.substring(0, 1).toUpperCase() + letter.substring(1, letter.length)

      let section = document.createElement("div")
      section.id = "words-section-" + letter
      section.classList.add("words-section")
      if(!(elements.length > 0)) section.classList.add("words-section-empty")
      section.innerHTML = `<div id="${section.id}-title" class="words-section-title">${displayLetter}</div>`
      dictionaryContainer.appendChild(section)

      for(const element of elements) {
        section.appendChild(element)
      }
    }
  });

function wordLinkClick(linkedID) {
  let element = document.getElementById("word-" + linkedID)
  element.scrollIntoView({ block: "center" })

  element.classList.remove("highlighted")
  element.classList.add("highlighted")

  setTimeout(() => { element.classList.remove("highlighted") }, 1000)
}

function sortWordElement(wordElement, letters, results) {
  for(let letter of letters) {
    if(wordElement.finalWord.startsWith(letter)) {
      if(!results[letter]) results[letter] = []
      results[letter].push(wordElement)
      return
    }
  }

  if(!results.other) results.other = []
  results.other.push(wordElement)
}


let searchField = document.getElementById("header-search")
let searchContainer = document.getElementById("search-container")
searchField.oninput = () => {
  const searchValue = searchField.value
  if(!searchValue) {
    dictionaryContainer.style.display = "block"
    searchContainer.style.display = "none"
    searchContainer.innerHTML = ""
    return
  }

  dictionaryContainer.style.display = "none"
  searchContainer.style.display = "block"
  searchContainer.innerHTML = ""

  let searchedWords = []
  for(const word of fetchedWords) {
    const match = searchMatch(searchValue, word)
    if(!match) continue

    searchedWords.push({
      id: word.id,
      string: word.string,
      type: word.type,
      translations: word.translations,
      match: {
        pattern: match.pattern,
        i: match.i,
        index: match.index
      }
    })
  }

  searchedWords.sort((a, b) => {
    if(a.match.index < b.match.index) return -1
    if(a.match.index > b.match.index) return 1
    if(a.match.type == "string" && b.match.type == "translation") return -1
    if(a.match.type == "translation" && b.match.type == "string") return 1
    if(a.string < b.string) return -1
    return 1
  })

  for(const word of searchedWords) {
    // expandable box with information about the entry
    let element = document.createElement("div")
    element.id = "search-word-" + word.id
    element.classList.add("search-word")
    searchContainer.appendChild(element)

    element.onclick = (event) => {
      searchField.value = ""
      
      dictionaryContainer.style.display = "block"
      searchContainer.style.display = "none"
      searchContainer.innerHTML = ""

      wordLinkClick(word.id)
    }

    // the word itself
    let value = document.createElement("div")
    value.id = element.id + "-value"
    value.classList.add("search-word-value")
    element.appendChild(value)

    if(word.match.pattern == "string") {
      value.innerHTML = word.string.substring(0, word.match.index) + `<span class="search-word-match">${searchValue}</span>` + word.string.substring(word.match.index + searchValue.length, word.string.length)
    } else {
      value.innerHTML = word.string
    }

    // the word's type
    let type = document.createElement("div")
    type.id = element.id + "-type"
    type.classList.add("search-word-type")
    type.setAttribute("wordType", word.type || "none")
    type.innerHTML = wordTypeName(word.type)
    element.appendChild(type)

    // a list of all the translations
    let translations = document.createElement("div")
    translations.id = element.id + "-translations"
    translations.classList.add("search-word-translations")
    element.appendChild(translations)

    for(const index in word.translations) {
      const translation = word.translations[index]
      if(!translation) continue

      let item = document.createElement("span")
      item.id = element.id + `-translation-${index}`
      item.classList.add("search-word-translation")
      translations.appendChild(item)

      if(word.match.pattern == "translation" && word.match.i == index) {
        item.innerHTML = translation.substring(0, word.match.index) + `<span class="search-word-match">${searchValue}</span>` + translation.substring(word.match.index + searchValue.length, translation.length)
      } else {
        item.innerHTML = translation
      }
    }
  }
}

function searchMatch(search, word) {
  let result = null

  const matchIndex = word.string.indexOf(search)
  if(matchIndex != -1) result = { pattern: "string", index: matchIndex }

  for(const i in word.translations) {
    const translation = word.translations[i]

    const matchIndex = translation.indexOf(search)
    if(matchIndex != -1) {
      if(!result || result.matchIndex > matchIndex) {
        result = { pattern: "translation", i: i, index: matchIndex }
      }
    }
  }

  return result
}

function wordTypeName(type) {
  switch(type) {
    case "adjective": return "Adjektiv"
    case "noun": return "Substantiv"
    case "number": return "Zahlwort"
    case "partice": return "Partikel"
    case "preposition": return "Präposition"
    case "question word": return "Fragewort"
    case "verb": return "Verb"
    default: return "none"
  }
}