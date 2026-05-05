import type { Device } from "./device"

export interface Room {
  id: number
  name: string
  devices: Device[]
}

export interface Rooms {
  assigned: Room[]
  unassigned: Device[]
}