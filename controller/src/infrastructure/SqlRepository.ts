import Database from 'better-sqlite3'
import { Device, IRepository, Room } from '../domain/IRepository'

export class SqlRepository implements IRepository {
  constructor(private db: Database.Database) { }

  // Devices
  async createDevice(id: string, name: string): Promise<void> {
    const query = `INSERT INTO devices (id, name) VALUES (?, ?)`
    this.db.prepare(query).run(
      id,
      name
    )
  }

  async getDevices(): Promise<Device[]> {
    const query = `SELECT id, name FROM devices`
    const rows = this.db.prepare(query).all() as Device[]
    return rows
  }

  async getDeviceById(id: string): Promise<Device | null> {
    const query = `SELECT id, name FROM devices WHERE id = ?`
    const row = this.db.prepare(query).get(id) as Device | null
    return row
  }

  async removeDevice(id: string): Promise<void> {
    const query = `DELETE FROM devices WHERE id = ?`
    this.db.prepare(query).run(id)
  }

  // Rooms
  async createRoom(room: Room): Promise<void> {
    const query = `INSERT INTO rooms (name) VALUES (?)`
    this.db.prepare(query).run(room.name)
  }

  async getRooms(): Promise<Room[]> {
    const selectRoomsQuery = `SELECT id, name FROM rooms r`

    const selectDevicesQuery = `SELECT
        d.id,
        d.name,
        rd.room_id
      FROM devices d
      JOIN room_devices rd ON rd.device_id = d.id
    `

    const roomsRows = this.db.prepare(selectRoomsQuery).all() as { id: string; name: string }[]
    const devicesRows = this.db.prepare(selectDevicesQuery).all() as { id: string; name: string; room_id: string }[]

    const rooms = roomsRows.map(row => ({
      id: row.id,
      name: row.name,
      devices: devicesRows
        .filter(device => device.room_id === row.id)
        .map(({ room_id: _, ...device }) => device)
    }))

    return rooms
  }

  async getRoomById(id: string): Promise<Room | null> {
    const query = `SELECT id, name FROM rooms WHERE id = ?`
    const row = this.db.prepare(query).get(id) as Room | null
    return row
  }

  async deleteRoom(roomId: string): Promise<void> {
    const query = `DELETE FROM rooms WHERE id = ?`
    this.db.prepare(query).run(roomId)
  }

  async moveDeviceToRoom(deviceId: string, roomId: string): Promise<void> {
    const query = `INSERT OR REPLACE INTO room_devices (device_id, room_id) VALUES (?, ?)`
    this.db.prepare(query).run(deviceId, roomId)
  }
}