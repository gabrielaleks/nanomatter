export type Device = {
  id: string,
  name: string,
}

export type Room = {
  id: string,
  name: string,
  devices: Device[]
}

export interface IRepository {
  // Devices
  createDevice(id: string, name: string): Promise<void>
  getDevices(): Promise<Device[]>
  getDeviceById(id: string): Promise<Device | null>
  removeDevice(id: string): Promise<void>

  // Rooms
  createRoom(room: Omit<Room, 'id' | 'devices'>): Promise<void>
  getRooms(): Promise<Room[]>
  getRoomById(id: string): Promise<Room | null>
  deleteRoom(roomId: string): Promise<void>
  moveDeviceToRoom(deviceId: string, roomId: string): Promise<void>
}