const fs = require("fs").promises

module.exports = async (dir) => {
  try {
    let file = new String(await fs.readFile(`./client/html/${dir}`))
    let header = await fs.readFile("./client/header.html")

    file = file.replaceAll("<!-- $header -->", header)

    return file
  } catch(error) {
    console.log("[server][client] " + error)
    return false
  }
}
