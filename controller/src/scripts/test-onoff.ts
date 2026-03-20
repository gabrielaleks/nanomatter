/**
 * Adapted from @matter/examples src/control-onoff/OnOffController.ts
 *
 * Fixed process.argv parsing: the original uses `process.argv.slice(2)` and then
 * destructures with `[, , command]`, skipping two elements — which worked with the
 * compiled binary but not with tsx (tsx sets argv[1] to the script path, so
 * slice(2) only contains user args and the double-skip lands on undefined).
 */

import { ServerNode } from '@matter/main'
import { OnOffClient } from '@matter/main/behaviors/on-off';

async function main() {
    const controller = await ServerNode.create();

    const [command, ...args] = process.argv.slice(2);

    switch (command) {
        case "commission":
            if (controller.nodes.get("device")) {
                die("There is already a device commissioned");
            }
            if (args.length !== 1) {
                die(`Usage: tsx ${process.argv[1]} commission <pairingcode>`);
            }
            await controller.nodes.commission({ id: "device", pairingCode: args[0] });
            break;

        case "toggle": {
            const endpointNo = Number.parseInt(args[0]);
            if (args.length !== 1 || Number.isNaN(endpointNo)) {
                die(`Usage: tsx ${process.argv[1]} toggle <endpoint number>`);
            }
            const node = controller.nodes.get("device");
            if (node === undefined) {
                die("Cannot toggle because there is no commissioned device");
            }
            const endpoint = node.parts.get(endpointNo);
            if (endpoint === undefined) {
                die(`Cannot toggle because endpoint ${endpointNo} does not exist`);
            }
            await endpoint.commandsOf(OnOffClient).toggle();
            break;
        }

        case "decommission": {
            const node = controller.nodes.get("device");
            if (node === undefined) {
                die("Cannot decommission because there is no commissioned device");
            }
            await node.delete();
            break;
        }

        default:
            die(`Unsupported command "${command ?? "(none)"}". Supported commands: commission, toggle, decommission`);
    }
}

function die(message: string): never {
    console.log(message);
    process.exit(1);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
