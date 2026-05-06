import axios from "axios"

const client = axios.create({ baseURL: '/api' })

const transitionTime = 1

export async function commissionDevice(
  pairingCode: string,
  deviceName: string,
): Promise<void> {
  await client.post(`/devices/commission`, {
    pairingCode,
    deviceName
  })
}

export async function toggleDevice(id: number): Promise<void> {
  await client.post(`/devices/${id}/toggle`)
}

export async function updateBrightness(
  id: number,
  brightnessLevel: number
): Promise<void> {
  await client.post(`/devices/${id}/brightness`, {
    brightnessLevel,
    transitionTime
  })
}

export async function updateHueAndSaturation(
  id: number,
  hue: number,
  saturation: number
): Promise<void> {
  await client.post(`/devices/${id}/color`, {
    hue,
    saturation,
    transitionTime
  })
}

export async function updateColorTemperature(
  id: number,
  colorTemperatureMireds: number
): Promise<void> {
  await client.post(`/devices/${id}/color`, {
    colorTemperatureMireds,
    transitionTime
  })
}

export async function moveDeviceToRoom(
  roomId: number,
  deviceId: number
): Promise<void> {
  await client.put(`/rooms/${roomId}/devices/${deviceId}`)
}