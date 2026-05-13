import axios from "axios"

const client = axios.create({ baseURL: '/api' })

const transitionTime = 1

export async function commissionDevice(
  pairingCode: string,
  deviceName: string,
): Promise<{ jobId: string }> {
  const res = await client.post(`/devices/commission`, {
    pairingCode,
    deviceName
  })
  return res.data
}

export async function getCommissionStatus(
  jobId: string,
): Promise<{ status: 'pending' | 'completed' | 'failed' }> {
  const res = await client.get(`/devices/${jobId}/commission`)
  return res.data
}

export async function toggleDevice(id: number): Promise<void> {
  await client.post(`/devices/${id}/toggle`)
}

export async function turnDeviceOn(id: number): Promise<void> {
  await client.post(`/devices/${id}/on`)
}

export async function turnDeviceOff(id: number): Promise<void> {
  await client.post(`/devices/${id}/off`)
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

export async function updateDevice(
  id: number,
  name?: string
): Promise<void> {
  await client.patch(`/devices/${id}`, {
    name,
  })
}

export async function moveDeviceToRoom(
  roomId: number,
  deviceId: number
): Promise<void> {
  await client.put(`/rooms/${roomId}/devices/${deviceId}`)
}

export async function decommissionDevice(
  id: number,
): Promise<void> {
  await client.delete(`/devices/${id}`)
}