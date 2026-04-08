import dotenv from 'dotenv'
if (process.env.DEPLOYMENT_ENVIRONMENT?.toLowerCase() === 'test') {
  dotenv.config({ path: '.env.test' })
} else {
  dotenv.config({ path: '.env' })
}

import { createServer } from './app'
import { MatterService } from './application/services/MatterService'
import { initDb } from './db/db'

const dbPath = process.env.DB_PATH ?? '/db/nanomatter.db'
initDb(dbPath)

const matterService = new MatterService()
const app = createServer(matterService)
const port = process.env.PORT

matterService.getController().then(() => {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
  })
})

