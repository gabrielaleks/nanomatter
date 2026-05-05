import axios from "axios"
import type { Rooms } from "../types/room"

const client = axios.create({ baseURL: '/api' })

export async function fetchRooms(): Promise<Rooms> {
  const res = await client.get<Rooms>('/rooms')
  return res.data
}