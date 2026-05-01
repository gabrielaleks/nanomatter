import dotenv from 'dotenv'
if (process.env.ENVIRONMENT?.toLowerCase() === 'test') {
  dotenv.config({ path: '.env.test' })
} else {
  dotenv.config({ path: '.env' })
}

import { createServer } from './app'
import { initDb } from './db/db'
import { FakeMatterService } from './application/services/FakeMatterService'
import { MatterService } from './application/services/MatterService'

const dbPath = process.env.DB_PATH ?? '/db/nanomatter.db'
initDb(dbPath)
const environment = process.env.ENVIRONMENT?.toLowerCase()

const matterService = environment === 'test' ? new FakeMatterService() : new MatterService()
const app = createServer(matterService)
const port = process.env.PORT

matterService.getController().then(() => {
  app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
  })
})

