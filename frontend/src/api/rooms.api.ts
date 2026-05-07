import axios from "axios"
import type { Rooms } from "../types/room"

const client = axios.create({ baseURL: '/api' })

export async function fetchRooms(): Promise<Rooms> {
  const res = await client.get<Rooms>('/rooms')
  return res.data
}

export async function createRoom(
  name: string
): Promise<void> {
  await client.post(`/rooms`, {
    name,
  })
}

export async function updateRoom(
  id: number,
  name?: string
): Promise<void> {
  await client.patch(`/rooms/${id}`, {
    name,
  })
}

export async function deleteRoom(id: number): Promise<void> {
  await client.delete(`/rooms/${id}`)
}