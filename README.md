# nanomatter 🤏
Lightweight Matter controller used for comissioning and controlling devices.

## backend
### `devices` endpoints

```
GET    /api/devices                     → all commissioned devices + state
GET    /api/devices/:id                 → single device state
POST   /api/devices/commission          → start commissioning (returns jobId)
GET    /api/devices/commission/:jobId   → poll commissioning status
POST   /api/devices/:id/on              → turn on
POST   /api/devices/:id/off             → turn off
POST   /api/devices/:id/toggle          → toggle
POST   /api/devices/:id/brightness      → set brightness (0–254)
POST   /api/devices/:id/color           → set color (CT or hue/saturation)
DELETE /api/devices/:id                 → decommission
```

### `rooms` endpoints

```
GET    /api/rooms                             → get all rooms + devices
POST   /api/rooms                             → create room
DELETE /api/rooms/:roomId                     → delete room
POST   /api/rooms/:roomId/devices/:deviceId   → add device to room
DELETE /api/rooms/:roomId/devices/:deviceId   → delete device from room
```

## frontend