import express, { Request, Response, Express } from 'express'
import { createRouter as createDevicesRouter } from './web/devices/routes'
import { createRouter as createRoomsRouter } from './web/rooms/routes'
import { corsMiddleware } from './middlewares/cors.middleware'
import { notFoundMiddleware } from './middlewares/notfound.middleware'
import { getLogger } from './utils/logger'
import { errorMiddleware } from './middlewares/error.middleware'
import { IMatterService } from './domain/IMatterService'
import Database from 'better-sqlite3'

export function createServer(
  matterService: IMatterService,
  db: Database.Database
): Express {
  const app = express()

  app.use(corsMiddleware())
  app.use(express.json())

  app.use((req: Request, _res: Response, next) => {
    getLogger().info('Incoming request', {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    })
    next()
  })

  app.use(
    '/api',
    createDevicesRouter(matterService, db),
    createRoomsRouter(matterService, db),
  )

  app.use(notFoundMiddleware)
  app.use(errorMiddleware)

  return app
}