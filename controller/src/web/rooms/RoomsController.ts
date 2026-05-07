import { Request, Response } from 'express'
import { IRepository } from '../../domain/IRepository'
import { IMatterService } from '../../domain/IMatterService'

export class RoomsController {
  constructor(
    private matterService: IMatterService,
    private repository: IRepository
  ) { }

  async getAllRooms(_req: Request, res: Response) {
    const rooms = await this.repository.getRooms()
    const dbDevices = await this.repository.getDevices()
    const matterDevices = await this.matterService.getAllDevices()

    const assignedIds = new Set(rooms.flatMap(room => room.devices.map(d => String(d.id))))

    const enrichedRooms = rooms.map(room => ({
      ...room,
      devices: room.devices.map(device => {
        const matterDevice = matterDevices.data?.find(d => d.id === String(device.id))
        return {
          ...matterDevice,
          id: device.id,
          name: device.name,
          factoryName: matterDevice?.name,
        }
      })
    }))

    const unassigned = (matterDevices.data ?? [])
      .filter(d => !assignedIds.has(d.id))
      .flatMap(d => {
        const dbDevice = dbDevices.find(db => String(db.id) === d.id)
        if (!dbDevice) return []
        return [{
          ...d,
          id: dbDevice.id,
          name: dbDevice.name,
          factoryName: d.name,
        }]
      })

    res.status(200).json({ assigned: enrichedRooms, unassigned })
  }

  async addRoom(req: Request, res: Response) {
    const { name } = req.body

    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'name is required' })
      return
    }

    this.repository.createRoom({ name })

    res.status(200).json({ message: `Room ${name} was added successfully` })
  }

  async deleteRoom(req: Request, res: Response) {
    const roomId = req.params.roomId

    if (!roomId || typeof roomId !== 'string') {
      res.status(400).json({ error: 'id is required' })
      return
    }

    await this.repository.deleteRoom(roomId)

    res.status(200).json({ message: `Room with id ${roomId} was deleted successfully` })
  }

  async moveDeviceToRoom(req: Request, res: Response) {
    const roomId = req.params.roomId

    if (!roomId || typeof roomId !== 'string') {
      res.status(400).json({ error: 'roomId is required' })
      return
    }

    const deviceId = req.params.deviceId

    if (!deviceId || typeof deviceId !== 'string') {
      res.status(400).json({ error: 'deviceId is required' })
      return
    }

    const roomExists = await this.repository.getRoomById(roomId)
    if (!roomExists) {
      res.status(404).json({ message: `Room with id ${roomId} does not exist` })
      return
    }

    const deviceExists = await this.repository.getDeviceById(deviceId)
    if (!deviceExists) {
      res.status(404).json({ message: `Device with id ${deviceId} does not exist` })
      return
    }

    await this.repository.moveDeviceToRoom(deviceId, roomId)

    res.status(200).json({ message: `Moved device ${deviceId} to room ${roomId} successfully` })
  }
}
