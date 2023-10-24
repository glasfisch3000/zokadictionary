let dictionaryContainer = document.getElementById("dictionary-container")

fetch("/dictionary-api/all-words", { method: "GET" })
  .then((response) => response.json())
  .then((words) => {
    dictionaryContainer.innerHTML = ""

    if(!words) {
      dictionaryContainer.innerHTML = "Something went wrong."
      return
    }

    var wordElements = []

    for(var word of words) {
      var element = document.createElement("div")
      element.id = "word-" + word.id
      element.class = "word"
      element.classList.add("word")
      element.setAttribute("expanded", false)
      element.finalWord = word.string || word.constructed
      wordElements.push(element)

      var title = document.createElement("div")
      title.id = element.id + "-title"
      title.class = element.class + "-title"
      title.classList.add(element.class + "-title")
      title.innerHTML = wordConstructMarkdown(word)
      title.onclick = (event) => {
        event.currentTarget.parentElement.setAttribute("expanded", event.currentTarget.parentElement.getAttribute("expanded") == "false")
      }
      element.appendChild(title)

      var details = document.createElement("div")
      details.id = element.id + "-details"
      details.class = element.class + "-details"
      details.classList.add(element.class + "-details")
      element.appendChild(details)

      var patterns = document.createElement("div")
      patterns.id = details.id + "-patterns"
      patterns.class = details.class + "-patterns"
      patterns.classList.add(details.class + "-patterns")
      details.appendChild(patterns)

      var equalCandidates = words.filter(w => w.base == word.base)

      for(let pattern of wordMakePatterns(word, equalCandidates)) {
        var patternBox = document.createElement("div")
        patternBox.id = patterns.id + "-box-" + pattern.id
        patternBox.class = patterns.class + "-box"
        patternBox.classList.add(patterns.class + "-box")
        patternBox.innerHTML = `<b class="${patternBox.class}-index">${pattern.index}</b>. ${pattern.title}: <i class="${patternBox.class}-word">${pattern.string}</i>`
        patterns.appendChild(patternBox)
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

function wordMakePatterns(word, equalCandidates) {
  var patterns = []
  var pattern = word.pattern
  while(pattern) {
    patterns.splice(0, 0, pattern)
    pattern = pattern.parent
  }

  var string = word.base
  var results = [{ index: 0, string: string, title: "Base", id: "" }]
  for(var i in patterns) {
    let pattern = patterns[i]

    string = pattern.patternString.replaceAll("$", `<b>${string}</b>`)
    var result = { index: 1+parseInt(i), string: string, title: decodeURI(pattern.title), id: pattern.id }

    let equal = equalCandidates.filter(w => w.pattern.id == pattern.id && (w.string || w.constructed) == w.constructed && w.id != word.id)
    if(equal.length == 1) {
      let linkedID = equal[0].id
      result.string = `<a href="#word-${linkedID}" onclick="wordLinkClick(${linkedID})">${result.string}</a>`
    }

    results.push(result)
  }

  return results
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
