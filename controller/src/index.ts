import dotenv from 'dotenv'
if (process.env.DEPLOYMENT_ENVIRONMENT?.toLowerCase() === 'test') {
  dotenv.config({ path: '.env.test' })
} else {
  dotenv.config({ path: '.env' })
}

import { createServer } from './app'
import { matterService } from './application/services/MatterService'

const frontendHost = process.env.LOCAL_FRONTEND_HOST
const port = process.env.PORT

async function start() {
  await matterService.initialize()

  const app = createServer()
  app.listen(port, () => {
    console.log(`Server is running at ${frontendHost}:${port}`)
  })
}

start()
