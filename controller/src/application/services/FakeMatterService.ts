import { ManualPairingData } from "@matter/main/types";
import { ColorMode, IMatterService } from "../../domain/IMatterService";
import { CommissionJob, Device } from "../../domain/IMatterService"
import { ServiceResponse } from "./ServiceResponse";

const getRandomNumber = (min: number, max: number): number => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export class FakeMatterService implements IMatterService {
  private devices: Device[] = []

  async getController(): Promise<void> {
    console.log('Fake Matter controller')
  }

  async commissionDevice(pairingData: ManualPairingData): Promise<ServiceResponse<string>> {
    console.log(`Pairing data: ${JSON.stringify(pairingData)}`)
    const newDeviceId = String(this.devices.length > 0 ? Number(this.devices.at(-1)!.id) + 1 : 1)
    const colorMode = getRandomNumber(1, 2) % 2 == 0 ? ColorMode.HueSaturation : ColorMode.HueSaturation

    this.devices.push({
      id: newDeviceId,
      name: 'WiZ A.E27',
      reachable: true,
      on: true,
      brightness: getRandomNumber(0, 254),
      colorMode,
      colorTemperature: getRandomNumber(0, 1000),
      hue: getRandomNumber(0, 254),
      saturation: getRandomNumber(0, 254)
    })

    return {
      ok: true,
      data: `Commissioned device id ${newDeviceId}`
    }
  }

  getCommissionStatus(jobId: string): ServiceResponse<CommissionJob | undefined> {
    console.log(`JobId: ${jobId}`)

    return {
      ok: true,
      data: { status: 'completed' }
    }
  }

  async getAllDevices(): Promise<ServiceResponse<Device[]>> {
    return {
      ok: true,
      data: this.devices
    }
  }

  async getDeviceById(id: string): Promise<any> {
    return {
      ok: true,
      data: this.devices.find(device => device.id == id)
    }
  }

  async toggleDevice(id: string): Promise<ServiceResponse<void>> {
    const device = this.devices.find(device => device.id === id)
    if (device) device.on = !device.on

    return {
      ok: true
    }
  }

  async turnDeviceOn(id: string): Promise<ServiceResponse<void>> {
    const device = this.devices.find(device => device.id === id)
    if (device) device.on = true

    return {
      ok: true
    }
  }

  async turnDeviceOff(id: string): Promise<ServiceResponse<void>> {
    const device = this.devices.find(device => device.id === id)
    if (device) device.on = false

    return {
      ok: true
    }
  }

  async adjustDeviceBrightness(id: string, brightnessLevel: number, transitionTime: number): Promise<ServiceResponse<void>> {
    const device = this.devices.find(device => device.id === id)

    if (device) {
      device.brightness = brightnessLevel
      const message = `Adjusted brightness to ${brightnessLevel} of device ${id}` +
        `with transition time of ${transitionTime}`

      console.log(message)
    }

    return {
      ok: true
    }
  }

  async adjustDeviceColor(
    id: string,
    colorTemperatureMireds: number,
    hue: number,
    saturation: number,
    transitionTime: number
  ): Promise<ServiceResponse<void>> {
    const device = this.devices.find(device => device.id === id)

    if (device) {
      device.colorTemperature = colorTemperatureMireds
      device.hue = hue
      device.saturation = saturation

      const message = `Adjusted color temperature of device ${id} to ${colorTemperatureMireds}, ` +
        `hue to ${hue}, ` +
        `saturation to ${saturation} with transition time of ${transitionTime}`

      console.log(message)
    }

    return {
      ok: true
    }
  }

  async decommissionDevice(id: string): Promise<ServiceResponse<void>> {
    const index = this.devices.findIndex(device => device.id = id)

    if (index !== -1) {
      this.devices.splice(index, 1)
    }

    return {
      ok: true
    }
  }
}