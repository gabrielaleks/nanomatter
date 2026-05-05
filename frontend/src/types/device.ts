export type Device = {
  id: number
  name: string
  factoryName: string
  reachable: boolean
  on: boolean
  brightness: number
  colorMode: 'hue-saturation' | 'color-temperature'
  hue: number
  saturation: number
  colorTemperature: number
}