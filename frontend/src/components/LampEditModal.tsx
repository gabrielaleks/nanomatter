import type { Device } from '../types/device'
import {
	Modal,
	Box,
	Typography,
	Stack,
	FormControl,
	MenuItem,
	Select,
	InputLabel,
	Button,
	type SelectChangeEvent,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import Delete from '@mui/icons-material/Delete'
import Slider from '@mui/material/Slider'
import { Wheel, type ColorResult } from '@uiw/react-color'
import { useState, useRef } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
	decommissionDevice,
	moveDeviceToRoom,
	updateBrightness,
	updateColorTemperature,
	updateHueAndSaturation,
} from '../api/devices.api'
import debounce from 'lodash/debounce'
import { useRooms } from '../hooks/useRooms'

type Props = {
	device: Device
	roomName: string
	roomId: number
	open: boolean
	onClose: () => void
}

export function LampEditModal({
	device,
	roomName,
	roomId,
	open,
	onClose,
}: Props) {
	const { data: rooms } = useRooms()
	const [selectedRoomId, setSelectedRoomId] = useState(roomId)
	const [confirming, setConfirming] = useState(false)

	const currentRoomName =
		rooms?.assigned.find((r) => r.id === selectedRoomId)?.name ?? roomName

	const queryClient = useQueryClient()

	const [color, setColor] = useState({
		h: Math.round((device.hue! / 254) * 360),
		s: (device.saturation! / 254) * 100,
		v: 90,
		a: 1,
	})

	const style = {
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: 470,
		bgcolor: 'background.paper',
		border: '1px solid #000',
		'border-color': 'white',
		boxShadow: 20,
		p: 4,
		outline: 'none',
	}

	const { mutate: handleBrightnessUpdate } = useMutation({
		mutationFn: ({ id, brightness }: { id: number; brightness: number }) =>
			updateBrightness(id, brightness),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] }),
	})

	const { mutate: handleColorTemperatureUpdate } = useMutation({
		mutationFn: ({
			id,
			colorTemperature,
		}: {
			id: number
			colorTemperature: number
		}) => updateColorTemperature(id, colorTemperature),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] }),
	})

	const { mutate: handleHueAndSaturationUpdate } = useMutation({
		mutationFn: ({ id, color }: { id: number; color: ColorResult }) =>
			updateHueAndSaturation(
				id,
				Math.round((color.hsva.h / 360) * 254),
				Math.round((color.hsva.s / 100) * 254),
			),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['rooms'] })
		},
	})

	const debouncedUpdate = useRef(
		debounce((value: ColorResult) => {
			handleHueAndSaturationUpdate({ id: device.id, color: value })
		}, 300),
	).current

	const { mutate: handleMoveToRoom } = useMutation({
		mutationFn: ({ roomId, deviceId }: { roomId: number; deviceId: number }) =>
			moveDeviceToRoom(roomId, deviceId),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] }),
	})

	const handleChangeRoom = (event: SelectChangeEvent<number>) => {
		const newRoomId = Number(event.target.value)
		setSelectedRoomId(newRoomId)
		handleMoveToRoom({ roomId: newRoomId, deviceId: device.id })
	}

	const { mutate: handleDecommissioning } = useMutation({
		mutationFn: ({ deviceId }: { deviceId: number }) =>
			decommissionDevice(deviceId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['rooms'] })
			onClose()
		},
		onError: () => setConfirming(false),
	})

	return (
		<Modal open={open} onClose={onClose}>
			<Box className="flex flex-col items-center gap-1" sx={style}>
				<CloseIcon
					className="absolute top-1 right-1 cursor-pointer hover:scale-105"
					onClick={() => onClose()}
					sx={{ fontSize: '1.8em' }}
				/>
				<Typography variant="h5" className="underline">
					{device.name}
				</Typography>
				<Typography variant="body2">{currentRoomName}</Typography>
				<Typography variant="body2">model: {device.factoryName}</Typography>
				<div className="flex gap-6 items-end mt-5 mb-3">
					<div className="flex flex-col items-center gap-3">
						<Stack sx={{ height: 200 }}>
							<Slider
								onChangeCommitted={(_e, value) =>
									handleBrightnessUpdate({
										id: device.id,
										brightness: value as number,
									})
								}
								orientation="vertical"
								size="medium"
								defaultValue={device.brightness}
								min={0}
								max={254}
								valueLabelDisplay="on"
								sx={{
									'& .MuiSlider-track': {
										background: 'transparent',
										border: 'none',
									},
									'& .MuiSlider-rail': {
										background: 'linear-gradient(to top, #222222, #ffffff)',
										opacity: 1,
									},
									'& .MuiSlider-valueLabel': {
										backgroundColor: 'unset',
										right: '25px',
									},
									'& .MuiSlider-thumb': {
										color: '#fff',
									},
								}}
							></Slider>
						</Stack>
						<Typography variant="caption">Brightness</Typography>
					</div>

					<div className="flex flex-col items-center gap-3">
						<Wheel
							color={color}
							onChange={(value) => {
								setColor(value.hsva)
								debouncedUpdate(value)
							}}
						/>
						<Typography variant="caption">Color</Typography>
					</div>

					<div className="flex flex-col items-center gap-3">
						<Stack sx={{ height: 200 }}>
							<Slider
								onChangeCommitted={(_e, value) =>
									handleColorTemperatureUpdate({
										id: device.id,
										colorTemperature: value as number,
									})
								}
								orientation="vertical"
								size="medium"
								defaultValue={device.colorTemperature}
								min={150}
								max={500}
								valueLabelDisplay="on"
								sx={{
									'& .MuiSlider-track': {
										background: 'transparent',
										border: 'none',
									},
									'& .MuiSlider-rail': {
										background: 'linear-gradient(to top, #2196f3, #ff5722)',
										opacity: 1,
									},
									'& .MuiSlider-valueLabel': {
										backgroundColor: 'unset',
										left: '34px',
									},
									'& .MuiSlider-thumb': {
										color: '#fff',
									},
								}}
							></Slider>
						</Stack>
						<Typography variant="caption">Temperature</Typography>
					</div>
				</div>
				<div className="flex justify-between items-center gap-2 cursor-pointer hover:scale-105">
					<FormControl sx={{ m: 1, width: 200 }}>
						<InputLabel id="room-select-label">room</InputLabel>
						<Select
							labelId="room-select-label"
							id="room-select"
							value={selectedRoomId}
							label="room"
							onChange={handleChangeRoom}
						>
							{rooms && rooms.assigned.length > 0
								? rooms.assigned!.map((room) => (
										<MenuItem value={room.id}>{room.name}</MenuItem>
									))
								: null}
						</Select>
					</FormControl>
				</div>
				{confirming ? (
					<div className="flex items-center gap-2">
						<Typography variant="body2">are you sure?</Typography>
						<Button
							size="small"
							variant="outlined"
							onClick={() => setConfirming(false)}
						>
							cancel
						</Button>
						<Button
							size="small"
							color="error"
							variant="contained"
							onClick={() => handleDecommissioning({ deviceId: device.id })}
						>
							confirm
						</Button>
					</div>
				) : (
					<div
						className="flex justify-between items-center gap-2 cursor-pointer hover:scale-105"
						onClick={() => setConfirming(true)}
					>
						<Typography>decommission</Typography>
						<Delete fontSize="small" />
					</div>
				)}
			</Box>
		</Modal>
	)
}
