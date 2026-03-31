# POST /api/devices/commission

Request:

```bash
curl -X POST http://localhost:3000/api/devices/commission \
  -H "Content-Type: application/json" \
  -d '{"pairingCode": "0297-283-6578"}'
```

Matter operations:

```md
# Flow
## Discovery
Device discovered via mDNS

## Secure pairing (PASE)
Handshake completed
✔ Secure session established

## Commissioning
Starting commissioning

→ Read basic device info
← OK

→ Arm failsafe
← OK

→ Configure regulatory info
← OK

## Device verification
→ Request certificates
← Received

→ Verify attestation
← OK

## Provisioning
→ Request CSR
← Received

→ Install root certificate
← OK

→ Add operational certificate (NOC)
← OK

## Done
✔ Device successfully commissioned
✔ Added to fabric

Final log message: Commissioning completed, nodeId: 5

# Technical summary
→ Discover (mDNS)
→ Establish PASE session
← Success

→ Read (BasicInformation, Descriptor, etc.)
← OK

→ Invoke GeneralCommissioning.armFailSafe
← Success

→ Invoke setRegulatoryConfig
← Success

→ Invoke certificateChainRequest (DAC/PAI)
← Certificates

→ Invoke attestationRequest
← Verified

→ Invoke csrRequest
← CSR

→ Invoke addTrustedRootCertificate
← Success

→ Invoke addNoc
← Success

✔ Commissioning completed (nodeId: 5)
✔ Device added to fabric
```

Response:

```json
{
  "jobId":"d8775183-22a9-498a-8ff3-4f1e277b5740"
}
```

# GET /api/devices
Request:

```bash
curl -X GET http://localhost:3000/api/devices
```

Matter operations:
```md
Nothing - attributes are fetched from the controller's cache
```

Response:

```json
{
  "devices": [
    {
      "id": 1,
      "name": "WiZ A.E27",
      "reachable": true,
      "on": true,
      "brightness": 254,
      "colorMode": 2,
      "colorTemperature": 370,
      "hue": 36,
      "saturation": 44
    }
  ]
}
```

The behavior of `GET /api/devices/:id` is exactly the same, but instead of an array of devices it just returns a single device object:

```json
{
  "device": {
    "id": "1",
    "name": "WiZ A.E27",
    "reachable": true,
    "on": true,
    "brightness": 135,
    "colorMode": 0,
    "colorTemperature": 153,
    "hue": 170,
    "saturation": 215
  }
}
```

# POST /api/devices/:id/toggle | /api/devices/:id/on | /api/devices/:id/off
Request:

```bash
curl -X POST http://localhost:3000/api/1/devices/toggle
```

Matter processing:
```md
→ Invoke OnOff.Toggle
← Success
← ReportData (OnOff = true)

✔ State = ON
```

```json
{ "success":true, "message":"Device with id 1 was toggled successfully" }
```

The toggle, on and off actions are all commands within the OnOff cluster:

0x0: Off
0x1: On
0x2: Toggle

Functionally, these operations follow the same process, the only difference is the command ID sent to the device.

# POST /api/devices/:id/brightness
Request:

```bash
curl -X POST http://localhost:3000/api/devices/1/brightness \
  -H "Content-Type: application/json" \
  -d '{"brightnessLevel": 100, "transitionTime": 1}'
```

Matter processing:

```md
→ Invoke LevelControl.MoveToLevel (100)
← Success
← ReportData (OnOff = true)
← ReportData (Level = 100)
```

Response:

```json
{ "success":true, "message":"Adjusted brightness of device with id 1" }
```

# POST /api/devices/:id/color
Request:

```bash
curl -X POST http://localhost:3000/api/devices/1/color \
  -H "Content-Type: application/json" \
  -d '{"hue": 170, "saturation": 215, "transitionTime": 1}'
```

Matter processing:

```md
→ Invoke ColorControl.MoveToHueAndSaturation (170, 215)
← Success

✔ Color updated
```

Response:

```json
{ "success":true, "message":"Adjusted color of device with id 1" }
```

# DELETE /api/devices/:id
Request:

```bash
curl -X DELETE http://localhost:3000/api/devices/1
```

Matter processing:

```md
→ Invoke OperationalCredentials.removeFabric
← Success
← Event: leave

✔ Device removed from fabric
✔ Connection terminated
```

Response:

```json
{ "success":true, "message":"Device 1 removed" }
```