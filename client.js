const fs = require("fs").promises

module.exports = async (dir, context) => {
  try {
    let file = new String(await fs.readFile(`./client/html/${dir}`))
    let header = await fs.readFile("./client/header.html")

    let contextScript = "<script> const documentContext = " + JSON.stringify(context) + "; </script>"

    file = file.replaceAll("<!-- $header -->", header)
    file = file.replaceAll("<!-- $context-script -->", contextScript)

    return file
  } catch(error) {
    console.log("[server][client] " + error)
    return false
  }
}
