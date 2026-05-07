import { TextField, Typography } from '@mui/material'
import type { Room } from '../types/room'
import Switch from '@mui/material/Switch'
import TuneIcon from '@mui/icons-material/Tune'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toggleDevice } from '../api/devices.api'
import { useState } from 'react'
import { LampEditModal } from './LampEditModal'
import type { Device } from '../types/device'
import ClearIcon from '@mui/icons-material/Clear'
import CheckIcon from '@mui/icons-material/Check'
import { deleteRoom, updateRoom } from '../api/rooms.api'
import Delete from '@mui/icons-material/Delete'

type Props = {
	room: Room
	isEditable?: boolean
}

export function RoomCard({ room, isEditable = true }: Props) {
	const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
	const [editingName, setEditingName] = useState<boolean>(false)
	const [newName, setNewName] = useState(room.name)

	const queryClient = useQueryClient()

	const { mutate: toggle } = useMutation({
		mutationFn: (id: number) => toggleDevice(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] }),
	})

	const { mutate: deleteRoomById } = useMutation({
		mutationFn: (id: number) => deleteRoom(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] }),
	})

	const { mutate: updateRoomName } = useMutation({
		mutationFn: (name: string) => updateRoom(room.id, name),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['rooms'] })
			setEditingName(false)
		},
	})

	return (
		<div className="border border-white rounded-lg p-4 mb-4 flex flex-col">
			{editingName ? null : (
				<Typography
					variant="h6"
					className={`${isEditable ? 'underline cursor-pointer hover:scale-102' : ''}`}
					fontWeight="bold"
					width="fit-content"
					mx="auto"
					onClick={isEditable ? () => setEditingName(true) : () => {}}
				>
					{room.name}
				</Typography>
			)}

			{editingName ? (
				<div className="flex flex-row justify-center items-center gap-1">
					<TextField
						label="room name"
						variant="standard"
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
						error={newName.trim().length === 0}
					/>
					<ClearIcon
						className="cursor-pointer hover:scale-115"
						onClick={() => {
							setEditingName(false)
							setNewName(room.name)
						}}
					/>
					<CheckIcon
						className={
							newName.trim().length === 0
								? 'opacity-30'
								: 'cursor-pointer hover:scale-115'
						}
						onClick={() => {
							if (newName.trim().length > 0) updateRoomName(newName)
						}}
					/>
					<span className="text-white/40 select-none mr-1 ml-1">|</span>
					<Delete
						fontSize="medium"
						className="cursor-pointer hover:scale-115 mr-3"
						onClick={() => deleteRoomById(room.id)}
					/>
				</div>
			) : null}
			<div className="mt-2 flex flex-col gap-1">
				{room.devices.length > 0 ? (
					room.devices.map((device) => (
						<div
							key={device.id}
							className="flex justify-between items-center gap-15"
						>
							<Typography className="text-sm">{device.name}</Typography>
							<div className="flex justify-baseline gap-2">
								<Switch
									size="small"
									color="primary"
									defaultChecked={device.on}
									onChange={() => toggle(device.id)}
								></Switch>
								<TuneIcon
									onClick={() => setSelectedDevice(device)}
									className="cursor-pointer hover:scale-105"
								/>
							</div>
						</div>
					))
				) : (
					<Typography className="text-sm text-center">no devices</Typography>
				)}
			</div>
			{selectedDevice && (
				<LampEditModal
					open={true}
					onClose={() => setSelectedDevice(null)}
					device={selectedDevice}
					roomId={room.id}
					roomName={room.name}
				/>
			)}
		</div>
	)
}
