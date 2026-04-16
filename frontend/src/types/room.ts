import type { Device } from "./device"

export interface Room {
  id: string
  name: string
  devices: Device[]
}