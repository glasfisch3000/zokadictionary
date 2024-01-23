import fs from "node:fs"

export const keys = JSON.parse(fs.readFileSync("./security/keys.json"))