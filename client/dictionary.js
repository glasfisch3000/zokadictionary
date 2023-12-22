let dictionaryContainer = document.getElementById("dictionary-container")

fetch("/dictionary-api/all-words", { method: "GET" }) // get list of all words from server
  .then((response) => response.json()) // convert to usable object
  .then((words) => {
    dictionaryContainer.innerHTML = "" // clear website contents

    if(!words) { // no data provided by server
      dictionaryContainer.innerHTML = "Something went wrong."
      return
    }

    // for every entry provided by the server, create a div box with information about it
    let wordElements = []
    for(var word of words) {
      // expandable box with information about the entry
      let element = document.createElement("div")
      element.id = "word-" + word.id
      element.classList.add("word")
      element.setAttribute("expanded", false)
      element.finalWord = word.string || word.constructed
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
      value.innerHTML = wordConstructMarkdown(word)
      title.appendChild(value)

      // the word's type
      let type = document.createElement("div")
      type.id = element.id + "-type"
      type.classList.add("word-type")
      type.wordType = word.type || "other"
      type.innerHTML = word.type || "other"
      title.appendChild(type)


      // details section that is visible only when expanded
      let details = document.createElement("div")
      details.id = element.id + "-details"
      details.classList.add("word-details")
      element.appendChild(details)

      // a description of the word and it's meaning
      let description = document.createElement("div")
      description.id = element.id + "-description"
      description.classList.add("word-description")
      description.innerHTML = word.description ? `${word.description}` : "no description"
      details.appendChild(description)

      // a list of all the linked entries
      if(word.references && word.references.length > 0) {
        let references = document.createElement("div")
        references.id = element.id + "-references"
        references.classList.add("word-references")
        details.appendChild(references)

        for(const reference of word.references) {
          if(!reference || !reference.id || !reference.string) continue

          let item = document.createElement("a")
          item.id = element.id + `-reference-${reference.id}`
          item.classList.add("word-reference")
          item.innerHTML = reference.string
          item.href = `#word-${reference.id}`
          item.onclick = () => { wordLinkClick(reference.id) }
          references.appendChild(item)
        }
      }
    }

    var letters = ["a", "e", "i", "o", "u", "m", "v", "b", "l", "n", "z", "zh", "d", "dh", "y", "r", "k"]

    var results = {}
    for(let wordElement of wordElements) {
      sortWordElement(wordElement, letters, results)
    }

    letters.push("other")

    for(let letter of letters) {
      var elements = results[letter] || []
      elements.sort()

      let displayLetter = letter.substring(0, 1).toUpperCase() + letter.substring(1, letter.length)

      var section = document.createElement("div")
      section.id = "words-section-" + letter
      section.classList.add("words-section")
      if(!(elements.length > 0)) section.classList.add("words-section-empty")
      section.innerHTML = `<div id="${section.id}-title" class="words-section-title">${displayLetter}</div>`
      dictionaryContainer.appendChild(section)

      for(let element of elements) {
        section.appendChild(element)
      }
    }
  });

function wordConstructMarkdown(word) {
  if(word.string) return word.string

  var result = "$"

  var pattern = word.pattern
  while(pattern) {
    result = result.replaceAll("$", pattern.patternString)
    pattern = pattern.parent
  }

  return result.replaceAll("$", "<b>" + word.base + "</b>")
}

function wordLinkClick(linkedID) {
  let element = document.getElementById("word-" + linkedID)

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
