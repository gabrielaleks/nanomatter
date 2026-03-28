import "@matter/nodejs-ble"
import { Environment } from "@matter/main"
import { CommissioningController } from "@project-chip/matter.js"
import { getLogger } from "../../utils/logger"

export class MatterService {
  private controller: CommissioningController | null = null

  async getController(): Promise<CommissioningController> {
    if (!this.controller) {
      const environment = Environment.default

      this.controller = new CommissioningController({
        environment: { environment, id: "controller" },
        autoConnect: false,
        adminFabricLabel: "nanomatter",
      })

      await this.controller.start()
      getLogger().info("MatterService initialized")
    }

    return this.controller
  }
}
