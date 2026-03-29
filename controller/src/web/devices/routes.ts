import express, { Router } from 'express'
import { DevicesController } from './DevicesController'
import { MatterService } from '../../application/services/MatterService'

export function createRouter(matterService: MatterService): Router {
  const router = express.Router()
  const controller = new DevicesController(matterService)

  router.get('/devices', controller.getAllDevices.bind(controller))
  router.get('/devices/:id', controller.getDeviceById.bind(controller))

  router.post('/devices/commission', controller.commissionDevice.bind(controller))
  router.get('/devices/:jobId/commission', controller.getCommissionStatus.bind(controller))

  router.post('/devices/:id/toggle', controller.toggleDevice.bind(controller))
  router.post('/devices/:id/on', controller.turnDeviceOn.bind(controller))
  router.post('/devices/:id/off', controller.turnDeviceOff.bind(controller))
  router.post('/devices/:id/brightness', controller.adjustDeviceBrightness.bind(controller))
  router.post('/devices/:id/color', controller.adjustDeviceColor.bind(controller))

  router.delete('/devices/:id', controller.decommissionDevice.bind(controller))

  return router
}

/**
curl -X GET http://localhost:3000/api/devices

curl -X GET http://localhost:3000/api/devices/commission/123

curl -X POST http://localhost:3000/api/devices/commission \
  -H "Content-Type: application/json" \
  -d '{"pairingCode": "1114-693-2258"}'

curl -X POST http://localhost:3000/api/devices/1/toggle

curl -X POST http://localhost:3000/api/devices/1/on

curl -X POST http://localhost:3000/api/devices/1/off

curl -X POST http://localhost:3000/api/devices/1/brightness \
  -H "Content-Type: application/json" \
  -d '{"brightnessLevel": 100, "transitionTime": 1}'

curl -X POST http://localhost:3000/api/devices/1/color \
  -H "Content-Type: application/json" \
  -d '{"colorTemperatureMireds": 370, "hue": 0, "saturation": 254, "transitionTime": 1}'
 
curl -X DELETE http://localhost:3000/api/devices/1
*/
