import "@matter/nodejs-ble"
import { Environment } from "@matter/main"
import { CommissioningController } from "@project-chip/matter.js"
import { getLogger } from "../../utils/logger"
import { ColorMode, CommissionJob, Device, IMatterService } from '../../domain/IMatterService'
import { GeneralCommissioning } from "@matter/main/clusters"
import { v4 as uuidv4 } from 'uuid'
import { EndpointNumber, ManualPairingData, NodeId } from "@matter/main/types"
import { OnOff, LevelControl, ColorControl } from "@matter/main/clusters"
import { ServiceResponse } from "./ServiceResponse"

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Device timed out')), ms)
  )
  return Promise.race([promise, timeout])
}

const getColorModeStringFromAttribute = (attribute: ColorControl.ColorMode): ColorMode => {
  switch (attribute) {
    case ColorControl.ColorMode.ColorTemperatureMireds:
      return ColorMode.ColorTemperature
    case ColorControl.ColorMode.CurrentHueAndCurrentSaturation:
      return ColorMode.HueSaturation
    default:
      throw new Error(`Invalid attribute: ${attribute}`)
  }
}

const jobs = new Map<string, CommissionJob>()
let commissioningInProgress = false

export class MatterService implements IMatterService {
  private controller: CommissioningController | null = null

  async getController(): Promise<CommissioningController> {
    if (!this.controller) {
      const environment = Environment.default

      this.controller = new CommissioningController({
        environment: { environment, id: "controller" },
        autoConnect: true,
        adminFabricLabel: "nanomatter",
      })

      await this.controller.start()
      getLogger().info("MatterService initialized")
    }

    return this.controller
  }

  async commissionDevice(
    pairingData: ManualPairingData,
    onComplete: (deviceId: string) => Promise<void>
  ): Promise<ServiceResponse<string>> {
    if (commissioningInProgress) {
      return {
        ok: false,
        message: `A commissioning is already in progress`
      }
    }

    const jobId = uuidv4()
    jobs.set(jobId, { status: 'pending' })
    commissioningInProgress = true

      // Run commissioning in background
      ; (async () => {
        try {
          const controller = await this.getController()
          const nodeId = await controller.commissionNode({
            passcode: pairingData.passcode,
            commissioning: {
              regulatoryLocation: GeneralCommissioning.RegulatoryLocationType.Indoor,
              regulatoryCountryCode: "XX",
            },
            discovery: {
              identifierData: {
                shortDiscriminator: pairingData.shortDiscriminator,
              },
            },
          })

          jobs.set(jobId, { status: 'completed', nodeId: Number(nodeId) })
          setTimeout(() => jobs.delete(jobId), 5 * 60 * 1000)
          getLogger().info(`Commissioning completed, nodeId: ${nodeId}`)
          await onComplete(nodeId.toString())
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          jobs.set(jobId, { status: 'failed', error: message })
          setTimeout(() => jobs.delete(jobId), 5 * 60 * 1000)
          getLogger().error(`Commissioning failed: ${message}`)
        } finally {
          commissioningInProgress = false
        }
      })()

    return {
      ok: true,
      data: jobId,
    }
  }

  getCommissionStatus(jobId: string): ServiceResponse<CommissionJob | undefined> {
    const job = jobs.get(jobId)

    return {
      ok: true,
      data: job
    }
  }

  async getAllDevices(): Promise<ServiceResponse<Device[]>> {
    const controller = await this.getController()

    const commissionedNodes = controller.getCommissionedNodes().map(node => Number(node))

    const devices = await Promise.all(
      commissionedNodes.map(async (commissionedNode) => {
        const nodeId = NodeId(commissionedNode)
        const node = await controller.getNode(nodeId)

        const onOff = node.getClusterClientForDevice(EndpointNumber(1), OnOff.Complete)
        const level = node.getClusterClientForDevice(EndpointNumber(1), LevelControl.Complete)
        const color = node.getClusterClientForDevice(EndpointNumber(1), ColorControl.Complete)

        let colorMode: ColorMode = ColorMode.ColorTemperature
        if (color) {
          const colorModeAttribute = color.getColorModeAttributeFromCache()
          colorMode = colorModeAttribute ? getColorModeStringFromAttribute(colorModeAttribute) : colorMode
        }

        return {
          id: commissionedNode.toString(),
          name: node.basicInformation?.productLabel,
          reachable: node.isConnected,
          on: onOff?.getOnOffAttributeFromCache() ?? false,
          brightness: level?.getCurrentLevelAttributeFromCache() ?? 0,
          colorMode,
          colorTemperature: color?.getColorTemperatureMiredsAttributeFromCache() ?? 0,
          hue: color?.getCurrentHueAttributeFromCache() ?? 0,
          saturation: color?.getCurrentSaturationAttributeFromCache() ?? 0,
        }
      })
    )

    return {
      ok: true,
      data: devices
    }
  }

  async getDeviceById(id: string): Promise<ServiceResponse<any>> {
    const controller = await this.getController()
    const nodeId = NodeId(id)

    if (!controller.isNodeCommissioned(nodeId)) {
      return {
        ok: false,
        message: `Node ${id} is not commissioned`
      }
    }

    const node = await controller.getNode(nodeId)

    const onOff = node.getClusterClientForDevice(EndpointNumber(1), OnOff.Complete)
    const level = node.getClusterClientForDevice(EndpointNumber(1), LevelControl.Complete)
    const color = node.getClusterClientForDevice(EndpointNumber(1), ColorControl.Complete)

    let colorMode: ColorMode = ColorMode.ColorTemperature
    if (color) {
      const colorModeAttribute = color.getColorModeAttributeFromCache()
      colorMode = colorModeAttribute ? getColorModeStringFromAttribute(colorModeAttribute) : colorMode
    }

    const device = {
      id,
      name: node.basicInformation?.productLabel,
      reachable: node.isConnected,
      on: onOff?.getOnOffAttributeFromCache() ?? false,
      brightness: level?.getCurrentLevelAttributeFromCache() ?? 0,
      colorMode,
      colorTemperature: color?.getColorTemperatureMiredsAttributeFromCache() ?? 0,
      hue: color?.getCurrentHueAttributeFromCache() ?? 0,
      saturation: color?.getCurrentSaturationAttributeFromCache() ?? 0,
    }

    return {
      ok: true,
      data: device
    }
  }

  async toggleDevice(id: string): Promise<ServiceResponse<void>> {
    const controller = await this.getController()
    const nodeId = NodeId(id)
    const node = await controller.getNode(nodeId)

    const onOff = node.getClusterClientForDevice(EndpointNumber(1), OnOff.Complete);
    if (!onOff) {
      return {
        ok: false,
        message: `No OnOff cluster found on endpoint 1 for node ${nodeId}`
      }
    }

    try {
      const currentState = await onOff.getOnOffAttribute()
      console.log(`Current state: ${currentState ? "on" : "off"}`)
      await withTimeout(onOff.toggle(), 5000)
      console.log(`Toggled lamp ${currentState ? "off" : "on"}`)

      return {
        ok: true
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      throw new Error(message)
    }
  }

  async turnDeviceOn(id: string): Promise<ServiceResponse<void>> {
    const controller = await this.getController()
    const nodeId = NodeId(id)
    const node = await controller.getNode(nodeId)

    const onOff = node.getClusterClientForDevice(EndpointNumber(1), OnOff.Complete);
    if (!onOff) {
      return {
        ok: false,
        message: `No OnOff cluster found on endpoint 1 for node ${nodeId}`
      }
    }

    await withTimeout(onOff.on(), 5000)
    console.log('Toggled lamp on')
    return {
      ok: true
    }
  }

  async turnDeviceOff(id: string): Promise<ServiceResponse<void>> {
    const controller = await this.getController()
    const nodeId = NodeId(id)
    const node = await controller.getNode(nodeId)
    node.connect()

    const onOff = node.getClusterClientForDevice(EndpointNumber(1), OnOff.Complete);
    if (!onOff) {
      return {
        ok: false,
        message: `No OnOff cluster found on endpoint 1 for node ${nodeId}`
      }
    }

    await withTimeout(onOff.off(), 5000)

    console.log('Toggled lamp off')

    return {
      ok: true
    }
  }

  async adjustDeviceBrightness(
    id: string,
    brightnessLevel: number,
    transitionTime: number
  ): Promise<ServiceResponse<void>> {
    const controller = await this.getController()
    const nodeId = NodeId(id)

    if (!controller.isNodeCommissioned(nodeId)) {
      return {
        ok: false,
        message: `Node ${id} is not commissioned`
      }
    }

    const node = await controller.getNode(nodeId)

    const level = node.getClusterClientForDevice(EndpointNumber(1), LevelControl.Complete)

    if (!level) {
      return {
        ok: false,
        message: `No LevelControl cluster found on endpoint 1 for node ${nodeId}`
      }
    }

    await withTimeout(
      level.moveToLevelWithOnOff({
        level: brightnessLevel,
        transitionTime,
        optionsMask: {},
        optionsOverride: {}
      }),
      5000
    )

    console.log(`Adjusted brightness to ${brightnessLevel} with transition time ${transitionTime}`);

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
    const controller = await this.getController()
    const nodeId = NodeId(id)

    if (!controller.isNodeCommissioned(nodeId)) {
      return {
        ok: false,
        message: `Node ${id} is not commissioned`
      }
    }

    const node = await controller.getNode(nodeId)
    const color = node.getClusterClientForDevice(EndpointNumber(1), ColorControl.Complete)

    if (!color) {
      return {
        ok: false,
        message: `No ColorControl cluster found on endpoint 1 for node ${nodeId}`
      }
    }

    if (colorTemperatureMireds !== undefined) {
      await withTimeout(
        color.moveToColorTemperature({
          colorTemperatureMireds,
          transitionTime,
          optionsMask: {},
          optionsOverride: {}
        }),
        5000
      )
    } else {
      const currentHue = hue ?? color?.getCurrentHueAttributeFromCache() ?? 0
      const currentSat = saturation ?? color?.getCurrentSaturationAttributeFromCache() ?? 0

      await withTimeout(
        color.moveToHueAndSaturation({
          hue: currentHue,
          saturation: currentSat,
          transitionTime,
          optionsMask: {},
          optionsOverride: {}
        }),
        5000
      )
    }

    return {
      ok: true
    }
  }

  async decommissionDevice(id: string): Promise<ServiceResponse<void>> {
    const controller = await this.getController()
    const nodeId = NodeId(id)

    if (!controller.isNodeCommissioned(nodeId)) {
      return {
        ok: false,
        message: `Node ${id} is not commissioned`
      }
    }

    const node = await controller.getNode(nodeId)
    try {
      await node.decommission()
    } catch {
      // Device unreachable, remove locally anyway
      await controller.removeNode(nodeId, false)
    }

    return {
      ok: true
    }
  }
}
