// import { useMutation, useQueryClient } from '@tanstack/react-query'
// import { moveDeviceToRoom } from '../api/devices.api'
import type { Device } from '../types/device'
import { Modal, Box, Typography, Stack } from '@mui/material'
import RedoIcon from '@mui/icons-material/Redo'
import CloseIcon from '@mui/icons-material/Close'
import Delete from '@mui/icons-material/Delete'
import Slider from '@mui/material/Slider'

type Props = {
	device: Device
	roomName: string
	open: boolean
	onClose: () => void
}

export function LampEditModal({ device, roomName, open, onClose }: Props) {
	// const queryClient = useQueryClient()

	// const { mutate: move } = useMutation({
	// 	mutationFn: (roomId: number, deviceId: number) =>
	// 		moveDeviceToRoom(roomId, deviceId),
	// 	onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rooms'] }),
	// })

	const style = {
		position: 'absolute',
		top: '50%',
		left: '50%',
		transform: 'translate(-50%, -50%)',
		width: 400,
		bgcolor: 'background.paper',
		border: '1px solid #000',
		'border-color': 'white',
		boxShadow: 20,
		p: 4,
		outline: 'none',
	}

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
				<Typography variant="body2">{roomName}</Typography>
				<Typography variant="body2">model: {device.factoryName}</Typography>
				<div className="flex gap-6 items-end mt-5 mb-3">
					<div className="flex flex-col items-center gap-3">
						<Stack sx={{ height: 200 }}>
							<Slider
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

					<div className="flex flex-col items-center">
						{/* rgb wheel */}
						<Typography variant="caption">Color</Typography>
					</div>

					<div className="flex flex-col items-center gap-3">
						<Stack sx={{ height: 200 }}>
							<Slider
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
					<Typography>change room</Typography>
					<RedoIcon fontSize="small"></RedoIcon>
				</div>
				<div className="flex justify-between items-center gap-2 cursor-pointer hover:scale-105">
					<Typography>decommission</Typography>
					<Delete fontSize="small"></Delete>
				</div>
			</Box>
		</Modal>
	)
}
