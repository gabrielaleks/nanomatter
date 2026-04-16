import { useQuery } from '@tanstack/react-query'
import { fetchRooms } from "../api/rooms.api"

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms,
  })
}