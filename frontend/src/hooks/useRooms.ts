import { useQuery } from '@tanstack/react-query'
import { fetchRooms } from "../api/rooms.api"

export function useRooms() {
  return useQuery({
    queryKey: ['rooms'],
    queryFn: fetchRooms,
    staleTime: 1000 * 60 * 5,
  })
}