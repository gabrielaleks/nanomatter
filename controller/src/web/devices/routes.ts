import express, { Router } from 'express'
import { DevicesController } from './DevicesController'
import { MatterService } from '../../application/services/MatterService'

export function createRouter(matterService: MatterService): Router {
  const router = express.Router()
  const controller = new DevicesController(matterService)

  router.get('/devices', controller.getAllDevices.bind(controller))
  router.post('/devices/commission', controller.commissionDevice.bind(controller))
  router.get('/devices/:jobId/commission', controller.getCommissionStatus.bind(controller))
  router.post('/devices/:id/toggle', controller.toggleDevice.bind(controller))
  router.post('/devices/:id/on', controller.turnDeviceOn.bind(controller))
  router.post('/devices/:id/off', controller.turnDeviceOff.bind(controller))

  return router
}

/**
curl -X GET http://localhost:3000/api/devices

curl -X GET http://localhost:3000/api/devices/commission/123

curl -X POST http://localhost:3000/api/devices/commission \
     -H "Content-Type: application/json" \
     -d '{"setupCode": "1278-800-9522"}'

curl -X POST http://localhost:3000/api/devices/1/toggle

curl -X POST http://localhost:3000/api/devices/1/on

curl -X POST http://localhost:3000/api/devices/1/off
*/
