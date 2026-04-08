import express, { Router } from 'express'
import { RoomsController } from './RoomsController'
import { getDb } from '../../db/db'

export function createRouter(): Router {
  const router = express.Router()

  const db = getDb()
  const controller = new RoomsController(db)

  router.get('/rooms', controller.getAllRooms.bind(controller))
  router.post('/rooms', controller.addRoom.bind(controller))
  router.delete('/rooms/:roomId', controller.deleteRoom.bind(controller))
  router.post('/rooms/:roomId/devices/:deviceId', controller.addDeviceToRoom.bind(controller))
  router.delete('/rooms/:roomId/devices/:deviceId', controller.removeDeviceFromRoom.bind(controller))

  return router
}
