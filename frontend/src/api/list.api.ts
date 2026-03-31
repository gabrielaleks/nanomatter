import axios from "axios"
import type { Device } from "../types/device"

const client = axios.create({ baseURL: '/api' })

export async function fetchDevices(): Promise<Device[]> {
}