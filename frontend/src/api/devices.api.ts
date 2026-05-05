import axios from "axios"

const client = axios.create({ baseURL: '/api' })

export async function toggleDevice(id: number): Promise<void> {
  await client.post(`/devices/${id}/toggle`)
}

export async function moveDeviceToRoom(
  roomId: number,
  deviceId: number
): Promise<void> {
  await client.post(`/rooms/${roomId}/devices/${deviceId}`)
}