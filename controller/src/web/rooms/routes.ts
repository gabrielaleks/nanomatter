import express, { Router } from 'express'
import { RoomsController } from './RoomsController'
import Database from 'better-sqlite3'
import { SqlRepository } from '../../infrastructure/SqlRepository'
import { IMatterService } from '../../domain/IMatterService'

export function createRouter(
  matterService: IMatterService,
  db: Database.Database
): Router {
  const router = express.Router()
  const sqlRepository = new SqlRepository(db)
  const controller = new RoomsController(matterService, sqlRepository)

  router.get('/rooms', controller.getAllRooms.bind(controller))
  router.post('/rooms', controller.addRoom.bind(controller))
  router.delete('/rooms/:roomId', controller.deleteRoom.bind(controller))
  router.put('/rooms/:roomId/devices/:deviceId', controller.moveDeviceToRoom.bind(controller))

  return router
}
