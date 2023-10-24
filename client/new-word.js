fetch("/dictionary-api/all-patterns", { method: "GET" })
  .then((response) => response.json())
  .then((patterns) => {
    let select = document.getElementById("input-pattern")
    select.innerHTML = ""

    for(let pattern of patterns) {
      if(!pattern) continue

      let element = document.createElement("option")
      element.setAttribute("value", pattern.id)
      element.innerHTML = decodeURI(pattern.title)
      select.appendChild(element)
    }
  })

fetch("/dictionary-api/all-classes", { method: "GET" })
  .then((response) => response.json())
  .then((classes) => {
    let select = document.getElementById("input-class")
    select.innerHTML = ""

    let element = document.createElement("option")
    element.setAttribute("value", "")
    element.innerHTML = "Automatic"
    select.appendChild(element)

    for(let wordClass of classes) {
      if(!wordClass) continue

      let element = document.createElement("option")
      element.setAttribute("value", wordClass.id)
      element.innerHTML = decodeURI(wordClass.title)
      select.appendChild(element)
    }
  })

document.getElementById("input-submit").onclick = (event) => {
  event.preventDefault()

  let base = document.getElementById("input-base").value
  let pattern = document.getElementById("input-pattern").value
  let wordClass = document.getElementById("input-class").value
  let string = document.getElementById("input-string").value

  fetch("/dictionary-api/post-base?string=" + base, { method: "GET" })
    .catch(() => {})
    .then(() => {
      fetch(`/dictionary-api/post-word?base=${base}&pattern=${pattern}&class=${wordClass}&string=${string}`, { method: "GET" })
        .catch((error) => {
          console.log(error)
        })
        .then((response) => response.json())
        .then((id) => {
          window.location = "/dictionary#word-" + id
        })
    })
}
