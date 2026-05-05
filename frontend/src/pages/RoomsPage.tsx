import { RoomCard } from '../components/RoomCard'
import { useRooms } from '../hooks/useRooms'
import { Box, Typography, Alert, Container } from '@mui/material'

export default function DevicesPage() {
	const { data: rooms, isLoading: isLoadingRooms, error } = useRooms()

	if (!isLoadingRooms) {
		console.log(rooms)
	}

	return (
		<Container>
			<Box
				display="flex"
				flexDirection="column"
				alignItems="center"
				justifyContent="center"
				gap={2}
				m={5}
			>
				<Typography variant="h4" fontWeight="bold" whiteSpace="nowrap">
					nanomatter 🤏
				</Typography>

				{isLoadingRooms ? (
					<Alert severity="info" variant="outlined">
						Loading...
					</Alert>
				) : (
					<div>
						{rooms && rooms.unassigned.length > 0 ? (
							<RoomCard
								key={0}
								room={{
									id: 0,
									name: '⚠️ no room ⚠️',
									devices: rooms?.unassigned ?? [],
								}}
								isEditable={false}
							/>
						) : null}

						{rooms?.assigned.map((room) => (
							<RoomCard key={room.id} room={room}></RoomCard>
						))}
					</div>
				)}

				{error ? (
					<Alert severity="error" variant="outlined">
						Error: {error.message}
					</Alert>
				) : null}
			</Box>
		</Container>
	)
}
