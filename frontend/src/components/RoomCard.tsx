import { Typography } from '@mui/material'
import type { Room } from '../types/room'
import Switch from '@mui/material/Switch'
import TuneIcon from '@mui/icons-material/Tune'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toggleDevice } from '../api/devices.api'
import { useState } from 'react'
import { LampEditModal } from './LampEditModal'
import type { Device } from '../types/device'

type Props = {
	room: Room
	isEditable?: boolean
}

export function RoomCard({ room, isEditable = true }: Props) {
	const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)

	const queryClient = useQueryClient()

	const { mutate: toggle } = useMutation({
		mutationFn: (id: number) => toggleDevice(id),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] }),
	})

	return (
		<div className="border border-white rounded-lg p-4 mb-4 flex flex-col">
			<Typography
				variant="h6"
				className={`${isEditable ? 'underline' : ''} text-center`}
				fontWeight="bold"
			>
				{room.name}
			</Typography>
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
								{selectedDevice && (
									<LampEditModal
										open={selectedDevice !== null}
										onClose={() => setSelectedDevice(null)}
										device={selectedDevice}
										roomName={room.name}
									></LampEditModal>
								)}
							</div>
						</div>
					))
				) : (
					<Typography className="text-sm text-center">no devices</Typography>
				)}
			</div>
		</div>
	)
}
