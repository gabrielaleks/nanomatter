import { useRooms } from '../hooks/useRooms'

export default function DevicesPage() {
	const { data: rooms, isLoading, error } = useRooms()

	return (
		<div className="p-8">
			<h1 className="text-2xl font-bold">Devices</h1>
		</div>
	)
}
