import { Request, Response } from 'express'
import { ManualPairingCodeCodec, ManualPairingData } from "@matter/main/types"
import { IMatterService } from '../../domain/IMatterService'
import { IRepository } from '../../domain/IRepository'

export class DevicesController {
  constructor(
    private matterService: IMatterService,
    private repository: IRepository
  ) { }

  async commissionDevice(req: Request, res: Response) {
    const { pairingCode, deviceName } = req.body

    if (!pairingCode || typeof pairingCode !== 'string') {
      res.status(400).json({ error: 'pairingCode is required' })
      return
    }

    if (!deviceName || typeof deviceName !== 'string') {
      res.status(400).json({ error: 'deviceName is required' })
      return
    }

    let pairingData: ManualPairingData
    try {
      pairingData = ManualPairingCodeCodec.decode(pairingCode)
    } catch {
      res.status(400).json({ error: 'Invalid pairingCode' })
      return
    }

    const result = await this.matterService.commissionDevice(
      pairingData,
      async (deviceId) => {
        await this.repository.createDevice(deviceId, deviceName)
      }
    )

    if (result.ok) {
      res.status(202).json({ jobId: result.data })
      return
    }

    res.status(500).json({ message: result.message })
  }

  async getCommissionStatus(req: Request, res: Response) {
    const result = this.matterService.getCommissionStatus(
      req.params.jobId.toString()
    )

    if (!result.data) {
      res.status(404).json({ error: 'Job not found' })
      return
    }

    res.status(200).json(result.data)
  }

  async getAllDevices(_req: Request, res: Response) {
    const result = await this.matterService.getAllDevices()

    if (result.ok) {
      res.status(200).json({ devices: result.data })
      return
    }

    res.status(500).json({ message: result.message })
  }

  async getDeviceById(req: Request, res: Response) {
    const id = req.params.id

    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Device id is required' })
      return
    }

    const result = await this.matterService.getDeviceById(id)

    if (result.ok) {
      res.status(200).json({ device: result.data })
      return
    }

    res.status(500).json({ message: result.message })
  }

  async toggleDevice(req: Request, res: Response) {
    const id = req.params.id

    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Device id is required' })
      return
    }

    const result = await this.matterService.toggleDevice(id)

    if (result.ok) {
      res.status(200).json({ success: true, message: `Device with id ${id} was toggled successfully` })
      return
    }

    res.status(500).json({ message: result.message })
  }

  async turnDeviceOn(req: Request, res: Response) {
    const id = req.params.id

    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Device id is required' })
      return
    }

    const result = await this.matterService.turnDeviceOn(id)

    if (result.ok) {
      res.status(200).json({ success: true, message: `Device with id ${id} was turned on successfully` })
      return
    }

    res.status(500).json({ message: result.message })
  }

  async turnDeviceOff(req: Request, res: Response) {
    const id = req.params.id

    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Device id is required' })
      return
    }

    const result = await this.matterService.turnDeviceOff(id)

    if (result.ok) {
      res.status(200).json({ success: true, message: `Device with id ${id} was turned off successfully` })
      return
    }

    res.status(500).json({ message: result.message })
  }

  async adjustDeviceBrightness(req: Request, res: Response) {
    const id = req.params.id
    const { brightnessLevel, transitionTime = 1 } = req.body

    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Device id is required' })
      return
    }

    if (brightnessLevel == undefined || typeof brightnessLevel !== 'number') {
      res.status(400).json({ error: 'brightnessLevel is required' })
      return
    }

    if (brightnessLevel < 0 || brightnessLevel > 254) {
      res.status(400).json({ error: 'brightnessLevel should be a number between 0 and 254' })
      return
    }

    if (transitionTime && typeof transitionTime !== 'number') {
      res.status(400).json({ error: 'transitionTime must be a number' })
      return
    }

    const result = await this.matterService.adjustDeviceBrightness(id, brightnessLevel, transitionTime)

    if (result.ok) {
      res.status(200).json({ success: true, message: `Adjusted brightness of device with id ${id}` })
      return
    }

    res.status(500).json({ message: result.message })
  }

  async adjustDeviceColor(req: Request, res: Response) {
    const id = req.params.id
    const { colorTemperatureMireds, hue, saturation, transitionTime = 1 } = req.body

    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Device id is required' })
      return
    }

    const hasColorTemp = colorTemperatureMireds !== undefined
    const hasHueSat = hue !== undefined || saturation !== undefined

    if (!hasColorTemp && !hasHueSat) {
      res.status(400).json({ error: 'Provide colorTemperatureMireds or hue/saturation' })
      return
    }

    if (hasColorTemp && typeof colorTemperatureMireds !== 'number') {
      res.status(400).json({ error: 'colorTemperatureMireds must be a number' })
      return
    }

    if (hasHueSat) {
      if (hue !== undefined && (typeof hue !== 'number' || hue < 0 || hue > 254)) {
        res.status(400).json({ error: 'hue must be a number between 0 and 254' })
        return
      }
      if (saturation !== undefined && (typeof saturation !== 'number' || saturation < 0 || saturation > 254)) {
        res.status(400).json({ error: 'saturation must be a number between 0 and 254' })
        return
      }
    }

    if (typeof transitionTime !== 'number') {
      res.status(400).json({ error: 'transitionTime must be a number' })
      return
    }

    const result = await this.matterService.adjustDeviceColor(
      id,
      colorTemperatureMireds,
      hue,
      saturation,
      transitionTime
    )

    if (result.ok) {
      res.status(200).json({ success: true, message: `Adjusted color of device with id ${id}` })
      return
    }

    res.status(500).json({ message: result.message })
  }

  async decommissionDevice(req: Request, res: Response) {
    const id = req.params.id

    if (!id || typeof id !== 'string') {
      res.status(400).json({ error: 'Device id is required' })
      return
    }

    const result = await this.matterService.decommissionDevice(id)

    if (!result.ok) {
      res.status(500).json({ message: result.message })
      return
    }

    await this.repository.removeDevice(id)
    res.status(200).json({ success: true, message: `Device ${id} removed` })
  }
}
