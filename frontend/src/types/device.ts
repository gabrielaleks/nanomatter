type BaseDevice = {
  id: number
  name: string
  factoryName: string
  reachable: boolean
  on: boolean
  brightness: number
}

export type Device =
  | (BaseDevice & {
    colorMode: 'hue-saturation'
    hue: number
    saturation: number
    colorTemperature?: never
  })
  | (BaseDevice & {
    colorMode: 'color-temperature'
    colorTemperature: number
    hue?: never
    saturation?: never
  })