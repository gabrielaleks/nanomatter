import { Request, Response } from 'express'
import Database from 'better-sqlite3'

export class RoomsController {
  constructor(private db: Database.Database) { }

  async getAllRooms(_req: Request, res: Response) {
    const query = `SELECT
        r.id,
        r.name,
        json_group_array(rd.device_id) AS devices
      FROM rooms r
      LEFT JOIN room_devices rd ON r.id = rd.room_id
      GROUP BY r.id
    `

    const rows = this.db.prepare(query).all() as { id: number; name: string; devices: string }[]
    const rooms = rows.map(row => ({
      id: row.id,
      name: row.name,
      devices: JSON.parse(row.devices).filter((d: number | null) => d !== null)
    }))

    res.status(200).json({ rooms })
  }

  async addRoom(req: Request, res: Response) {
    const { name } = req.body

    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'name is required' })
      return
    }

    const query = `INSERT INTO rooms (name) VALUES (?)`

    this.db.prepare(query).run(name)

    res.status(200).json({ message: `Room ${name} was added successfully` })
  }

  async deleteRoom(req: Request, res: Response) {
    const roomId = req.params.roomId

    if (!roomId || typeof roomId !== 'string') {
      res.status(400).json({ error: 'id is required' })
      return
    }

    const query = `DELETE FROM rooms WHERE id = ?`

    this.db.prepare(query).run(roomId)

    res.status(200).json({ message: `Room with id ${roomId} was deleted successfully` })
  }

  async addDeviceToRoom(req: Request, res: Response) {
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

    const roomExistsQuery = `SELECT COUNT(*) AS room_exists FROM rooms WHERE id = ?`
    const row = this.db.prepare(roomExistsQuery).all(roomId)[0] as { room_exists: number }
    const roomExists = row.room_exists

    if (!roomExists) {
      res.status(404).json({ message: `Room ${roomId} does not exist on db` })
      return
    }

    const insertDeviceToRoomQuery = `INSERT INTO room_devices (room_id, device_id) VALUES (?, ?)`
    this.db.prepare(insertDeviceToRoomQuery).run(roomId, deviceId)

    res.status(200).json({ message: `Added device ${deviceId} to room ${roomId} successfully` })
  }

  async removeDeviceFromRoom(req: Request, res: Response) {
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

    const query = `DELETE FROM room_devices WHERE room_id = ? AND device_id = ?`

    this.db.prepare(query).run(roomId, deviceId)

    res.status(200).json({ message: `Removed device ${deviceId} from room ${roomId} successfully` })
  }
}
