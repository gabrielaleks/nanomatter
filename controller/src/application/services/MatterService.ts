import "@matter/nodejs-ble"
import { Environment } from "@matter/main"
import { CommissioningController } from "@project-chip/matter.js"
import { getLogger } from "../../utils/logger"

class MatterService {
  private controller: CommissioningController | null = null

  async initialize(): Promise<void> {
    const environment = Environment.default

    this.controller = new CommissioningController({
      environment: { environment, id: "controller" },
      autoConnect: false,
      adminFabricLabel: "nanomatter",
    })

    await this.controller.start()
    getLogger().info("MatterService initialized")
  }

  getController(): CommissioningController {
    if (!this.controller) throw new Error("MatterService not initialized")
    return this.controller
  }
}

export const matterService = new MatterService()
