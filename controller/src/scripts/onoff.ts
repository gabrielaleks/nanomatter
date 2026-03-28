import { Environment, Logger, NodeId } from "@matter/main";
import { EndpointNumber } from "@matter/types";
import { OnOff } from "@matter/main/clusters";
import { CommissioningController } from "@project-chip/matter.js";

const logger = Logger.get("OnOff");
const environment = Environment.default;

const nodeId = NodeId(parseInt(process.argv[2] ?? "1", 10));

async function main() {
  const commissioningController = new CommissioningController({
    environment: { environment, id: "controller" },
    autoConnect: false,
    adminFabricLabel: "nanomatter",
  });

  await commissioningController.start();

  const node = await commissioningController.getNode(nodeId);
  await node.connect();

  const onOff = node.getClusterClientForDevice(EndpointNumber(1), OnOff.Complete);
  if (!onOff) throw new Error(`No OnOff cluster found on endpoint 1 for node ${nodeId}`);

  const currentState = await onOff.getOnOffAttribute();
  console.log(`Current state: ${currentState ? "on" : "off"}`);

  await onOff.toggle();
  console.log(`Toggled lamp ${currentState ? "off" : "on"}`);

  await commissioningController.close();
}

main().catch(err => logger.error(err));