import { Request, Response } from 'express'
import { v4 as uuidv4 } from 'uuid'
import { GeneralCommissioning } from "@matter/main/clusters"
import { ManualPairingCodeCodec } from "@matter/main/types"
import { matterService } from '../../application/services/MatterService'
import { getLogger } from '../../utils/logger'

type CommissionJob = {
  status: 'pending' | 'completed' | 'failed'
  nodeId?: number
  error?: string
}

const jobs = new Map<string, CommissionJob>()
let commissioningInProgress = false

export class DevicesController {
  async commissionDevice(req: Request, res: Response) {
    const { setupCode, ble = true } = req.body

    if (!setupCode || typeof setupCode !== 'string') {
      res.status(400).json({ error: 'setupCode is required' })
      return
    }

    let pairingData
    try {
      pairingData = ManualPairingCodeCodec.decode(setupCode)
    } catch {
      res.status(400).json({ error: 'Invalid setupCode' })
      return
    }

    if (commissioningInProgress) {
      res.status(409).json({ error: 'A commissioning is already in progress' })
      return
    }

    const jobId = uuidv4()
    jobs.set(jobId, { status: 'pending' })
    commissioningInProgress = true

      // Run commissioning in background — do not await
      ; (async () => {
        try {
          const controller = matterService.getController()
          const nodeId = await controller.commissionNode({
            passcode: pairingData.passcode,
            commissioning: {
              regulatoryLocation: GeneralCommissioning.RegulatoryLocationType.Indoor,
              regulatoryCountryCode: "XX",
            },
            discovery: {
              identifierData: {
                shortDiscriminator: pairingData.shortDiscriminator,
                ...(ble ? { transport: "ble" } : {}),
              },
            },
          })

          jobs.set(jobId, { status: 'completed', nodeId: Number(nodeId) })
          getLogger().info(`Commissioning completed, nodeId: ${nodeId}`)
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          jobs.set(jobId, { status: 'failed', error: message })
          getLogger().error(`Commissioning failed: ${message}`)
        } finally {
          commissioningInProgress = false
        }
      })()

    res.status(202).json({ jobId })
  }

  async getCommissionStatus(req: Request, res: Response) {
    const job = jobs.get(req.params.jobId)

    if (!job) {
      res.status(404).json({ error: 'Job not found' })
      return
    }

    res.status(200).json(job)
  }

  async getAllDevices(_req: Request, res: Response) {
    res.status(200).json({ message: 'success!' })
  }
}
