import { ManualPairingData } from '@matter/main/types'
import { ServiceResponse } from '../application/services/ServiceResponse'

export type CommissionJob = {
  status: 'pending' | 'completed' | 'failed'
  nodeId?: number
  error?: string
}

export type Device = {
  id: string,
  name: string,
  reachable: boolean,
  on: boolean,
  brightness: number,
  colorMode: ColorMode,
  colorTemperature: number,
  hue: number,
  saturation: number
}

export const ColorMode = {
  HueSaturation: 'hue-saturation',
  ColorTemperature: 'color-temperature'
} as const

export type ColorMode = typeof ColorMode[keyof typeof ColorMode]


export interface IMatterService {
  commissionDevice(
    pairingData: ManualPairingData,
    onComplete: (deviceId: string) => Promise<void>
  ): Promise<ServiceResponse<string>>
  getCommissionStatus(jobId: string): ServiceResponse<CommissionJob | undefined>
  getAllDevices(): Promise<ServiceResponse<Device[]>>
  getDeviceById(id: string): Promise<ServiceResponse<Device>>
  toggleDevice(id: string): Promise<ServiceResponse<void>>
  turnDeviceOn(id: string): Promise<ServiceResponse<void>>
  turnDeviceOff(id: string): Promise<ServiceResponse<void>>
  adjustDeviceBrightness(
    id: string,
    brightnessLevel: number,
    transitionTime: number
  ): Promise<ServiceResponse<void>>
  adjustDeviceColor(
    id: string,
    colorTemperatureMireds: number,
    hue: number,
    saturation: number,
    transitionTime: number
  ): Promise<ServiceResponse<void>>
  decommissionDevice(id: string): Promise<ServiceResponse<void>>
}