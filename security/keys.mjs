import fs from "node:fs"

import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const __dirname = dirname(fileURLToPath(import.meta.url))

export const keys = JSON.parse(fs.readFileSync(__dirname + "/keys.json"))