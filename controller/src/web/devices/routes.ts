import express, { Router } from 'express'
import { DevicesController } from './DevicesController'
import { MatterService } from '../../application/services/MatterService'

export function createRouter(matterService: MatterService): Router {
  const router = express.Router()
  const controller = new DevicesController(matterService)

  router.get('/devices', controller.getAllDevices.bind(controller))
  router.post('/devices/commission', controller.commissionDevice.bind(controller))
  // router.get('/devices/commission/:jobId', controller.getCommissionStatus.bind(controller))

  return router
}

/**

curl -X GET https://localhost:3000/api/devices

curl -X GET https://localhost:3000/api/devices/commission/123

curl -X POST https://localhost:3000/api/devices/commission \
     -H "Content-Type: application/json" \
     -d '{"setupCode": "1218-324-1590"}'
 */
