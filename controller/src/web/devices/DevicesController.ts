import { v4 as uuidv4 } from 'uuid'
import { Request, Response } from 'express'
import { GeneralCommissioning } from "@matter/main/clusters"
import { EndpointNumber, ManualPairingCodeCodec, NodeId } from "@matter/main/types"
import { MatterService } from '../../application/services/MatterService'
import { getLogger } from '../../utils/logger'
import { OnOff, LevelControl, ColorControl } from "@matter/main/clusters"

type CommissionJob = {
  status: 'pending' | 'completed' | 'failed'
  nodeId?: number
  error?: string
}

const jobs = new Map<string, CommissionJob>()
let commissioningInProgress = false

export class DevicesController {
  constructor(private matterService: MatterService) { }

  async commissionDevice(req: Request, res: Response) {
    const { pairingCode } = req.body

    if (!pairingCode || typeof pairingCode !== 'string') {
      res.status(400).json({ error: 'pairingCode is required' })
      return
    }

    let pairingData
    try {
      pairingData = ManualPairingCodeCodec.decode(pairingCode)
    } catch {
      res.status(400).json({ error: 'Invalid pairingCode' })
      return
    }

    if (commissioningInProgress) {
      res.status(409).json({ error: 'A commissioning is already in progress' })
      return
    }

    const jobId = uuidv4()
    jobs.set(jobId, { status: 'pending' })
    commissioningInProgress = true

      // Run commissioning in background
      ; (async () => {
        try {
          const controller = await this.matterService.getController()
          const nodeId = await controller.commissionNode({
            passcode: pairingData.passcode,
            commissioning: {
              regulatoryLocation: GeneralCommissioning.RegulatoryLocationType.Indoor,
              regulatoryCountryCode: "XX",
            },
            discovery: {
              identifierData: {
                shortDiscriminator: pairingData.shortDiscriminator,
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
    const job = jobs.get(req.params.jobId.toString())

    if (!job) {
      res.status(404).json({ error: 'Job not found' })
      return
    }

    res.status(200).json(job)
  }

  async getAllDevices(_req: Request, res: Response) {
    const controller = await this.matterService.getController()

    const activeSessionInformation = controller.getActiveSessionInformation()
    const commissionedNodes = controller.getCommissionedNodes().map(node => Number(node))

    let sessionInformation = {}
    if (activeSessionInformation[0] && activeSessionInformation[0].fabric)
      sessionInformation = {
        fabricInformation: {
          label: activeSessionInformation[0].fabric.label,
          fabricId: Number(activeSessionInformation[0].fabric.fabricId),
          nodeId: Number(activeSessionInformation[0].fabric.nodeId),
        },
        lastInteraction:
          activeSessionInformation[0].lastInteractionTimestamp ?
            new Date(activeSessionInformation[0].lastInteractionTimestamp).toISOString() :
            '-',
        lastActive:
          activeSessionInformation[0].lastActiveTimestamp ?
            new Date(activeSessionInformation[0].lastActiveTimestamp).toISOString() :
            '-',
      }

    const devicesStatus = await Promise.all(
      commissionedNodes.map(async (commissionedNode) => {
        const nodeId = NodeId(commissionedNode)
        const node = await controller.getNode(nodeId)

        const onOff = node.getClusterClientForDevice(EndpointNumber(1), OnOff.Complete)
        const level = node.getClusterClientForDevice(EndpointNumber(1), LevelControl.Complete)
        const color = node.getClusterClientForDevice(EndpointNumber(1), ColorControl.Complete)

        return {
          id: commissionedNode,
          on: onOff?.getOnOffAttributeFromCache(),
          brightness: level?.getCurrentLevelAttributeFromCache(),
          colorTemperature: color?.getColorTemperatureMiredsAttributeFromCache(),
          hue: color?.getCurrentHueAttributeFromCache(),
          saturation: color?.getCurrentSaturationAttributeFromCache(),
        }
      })
    )

    res.status(200).json({ ...sessionInformation, devicesStatus })
  }

  async toggleDevice(req: Request, res: Response) {
    const id = req.params.id

    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Device id is required' })
      return
    }

    const controller = await this.matterService.getController()
    const nodeId = NodeId(id)
    const node = await controller.getNode(nodeId)
    node.connect()

    const onOff = node.getClusterClientForDevice(EndpointNumber(1), OnOff.Complete);
    if (!onOff) throw new Error(`No OnOff cluster found on endpoint 1 for node ${nodeId}`);

    const currentState = await onOff.getOnOffAttribute();
    console.log(`Current state: ${currentState ? "on" : "off"}`);

    await onOff.toggle();
    console.log(`Toggled lamp ${currentState ? "off" : "on"}`);

    res.status(200).json({ success: true, message: `Device with id ${id} was toggled successfully` })
  }

  async turnDeviceOn(req: Request, res: Response) {
    const id = req.params.id

    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Device id is required' })
      return
    }

    const controller = await this.matterService.getController()
    const nodeId = NodeId(id)
    const node = await controller.getNode(nodeId)
    node.connect()

    const onOff = node.getClusterClientForDevice(EndpointNumber(1), OnOff.Complete);
    if (!onOff) throw new Error(`No OnOff cluster found on endpoint 1 for node ${nodeId}`);

    await onOff.on()

    console.log('Toggled lamp on');

    res.status(200).json({ success: true, message: `Device with id ${id} was turned onsuccessfully` })
  }

  async turnDeviceOff(req: Request, res: Response) {
    const id = req.params.id

    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Device id is required' })
      return
    }

    const controller = await this.matterService.getController()
    const nodeId = NodeId(id)
    const node = await controller.getNode(nodeId)
    node.connect()

    const onOff = node.getClusterClientForDevice(EndpointNumber(1), OnOff.Complete);
    if (!onOff) throw new Error(`No OnOff cluster found on endpoint 1 for node ${nodeId}`);

    await onOff.off()

    console.log('Toggled lamp off');

    res.status(200).json({ success: true, message: `Device with id ${id} was turned off successfully` })
  }

  async decommissionDevice(req: Request, res: Response) {
    const id = req.params.id

    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Device id is required' })
      return
    }

    const controller = await this.matterService.getController()
    const nodeId = NodeId(id)

    if (!controller.isNodeCommissioned(nodeId)) {
      res.status(404).json({ error: `Node ${id} is not commissioned` })
      return
    }

    const node = await controller.getNode(nodeId)
    try {
      await node.decommission()
    } catch {
      // Device unreachable, remove locally anyway
      await controller.removeNode(nodeId, false)
    }

    res.status(200).json({ success: true, message: `Device ${id} removed` })
  }
}
