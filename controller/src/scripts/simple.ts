import "@matter/nodejs-ble"
import { Environment, Logger, StorageService, Time } from "@matter/main";
import { GeneralCommissioning } from "@matter/main/clusters";
import { ManualPairingCodeCodec } from "@matter/main/types";
import { CommissioningController, NodeCommissioningOptions } from "@project-chip/matter.js";


const logger = Logger.get("Controller");
const environment = Environment.default;
const storageService = environment.get(StorageService);

class ControllerNode {
  async start() {
    logger.info(`node-matter Controller started`);

    const uniqueId = Time.nowMs.toString();
    const adminFabricLabel = "matter.js Controller";

    const commissioningController = new CommissioningController({
      environment: { environment, id: "controller" },
      autoConnect: false,
      adminFabricLabel
    });

    const storageManager = await storageService.open("controller");
    const controllerStorage = storageManager.createContext("data");
    await controllerStorage.set("fabricLabel", adminFabricLabel);
    await controllerStorage.set("uniqueId", uniqueId);

    await commissioningController.start();

    console.log(`Commissioning controller started with id ${uniqueId} and label "${adminFabricLabel}"`);

    // 🔹 HA-provided manual pairing code
    const manualSetupCode = "3058-911-8233"
    const pairingData = ManualPairingCodeCodec.decode(manualSetupCode);

    console.log("Decoded pairing data:", pairingData);

    const useBle = process.argv.includes("--ble");

    const options: NodeCommissioningOptions = {
      passcode: pairingData.passcode,
      commissioning: {
        regulatoryLocation: GeneralCommissioning.RegulatoryLocationType.Indoor,
        regulatoryCountryCode: "XX",
      },
      discovery: {
        identifierData: {
          shortDiscriminator: pairingData.shortDiscriminator,
          transport: "ble"
        },
      }
    };

    try {
      const nodeId = await commissioningController.commissionNode(options);
      console.log(`Commissioning successfully done with nodeId ${nodeId}`);
      console.log(`\nNode ID: ${nodeId}\n`);
      await commissioningController.close();
      process.exit(0);
    } catch (err) {
      logger.error("Commissioning failed:", err);
      process.exit(1);
    }
  }
}

new ControllerNode().start().catch(err => logger.error(err));