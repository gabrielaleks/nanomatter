import axios from "axios"
import type { Room } from "../types/room"

const client = axios.create({ baseURL: '/api' })

export async function fetchRooms(): Promise<Room[]> {
  const res = await client.get<Room[]>('/rooms')
  return res.data
}