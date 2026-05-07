import { RoomCard } from '../components/RoomCard'
import { useRooms } from '../hooks/useRooms'
import {
	Box,
	Typography,
	Alert,
	Container,
	Accordion,
	AccordionSummary,
	AccordionDetails,
	TextField,
	Button,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { commissionDevice, getCommissionStatus } from '../api/devices.api'

export default function DevicesPage() {
	const { data: rooms, isLoading: isLoadingRooms, error } = useRooms()
	const [pairingCode, setPairingCode] = useState('')
	const [deviceName, setDeviceName] = useState('')
	const [commissionJobId, setCommissionJobId] = useState<string | null>(null)
	const queryClient = useQueryClient()

	const { data: commissionStatus } = useQuery({
		queryKey: ['commission-status', commissionJobId],
		queryFn: () => getCommissionStatus(commissionJobId!),
		enabled: !!commissionJobId,
		refetchInterval: (query) =>
			query.state.data?.status === 'pending' ? 2000 : false,
	})

	useEffect(() => {
		if (commissionStatus?.status === 'completed') {
			queryClient.invalidateQueries({ queryKey: ['rooms'] })
		}
	}, [commissionStatus?.status, queryClient])

	const isCommissioning =
		!!commissionJobId &&
		(!commissionStatus || commissionStatus.status === 'pending')
	const commissionFailed = commissionStatus?.status === 'failed'

	const handleCommissioning = async (
		pairingCode: string,
		deviceName: string,
	) => {
		if (!pairingCode || pairingCode.trim().length === 0) return
		if (!deviceName || deviceName.trim().length === 0) return
		const { jobId } = await commissionDevice(pairingCode, deviceName)
		setCommissionJobId(jobId)
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
						<Accordion className="mb-3" sx={{ maxWidth: 500 }}>
							<AccordionSummary
								expandIcon={<ExpandMoreIcon />}
								aria-controls="panel1-content"
								id="panel1-header"
							>
								<Typography
									component="span"
									sx={{ flexGrow: 1, textAlign: 'center' }}
								>
									commission new device
								</Typography>
							</AccordionSummary>
							<AccordionDetails className="flex flex-col gap-1">
								<span>
									you first need to commission the device on your app of choice,
									like apple home or home assistant. when that's done, create a
									pairing code on that app for that device so it can be added to
									nanomatter. copy that code, paste it here and use it for
									commissioning:
								</span>
								<form
									onSubmit={(e) => {
										e.preventDefault()
										const data = new FormData(e.currentTarget)
										console.log(data.get('pairingCode'), data.get('deviceName'))
										handleCommissioning(
											data.get('pairingCode') as string,
											data.get('deviceName') as string,
										)
									}}
								>
									<div className="flex flex-col gap-5">
										<div className="flex flex-row justify-around">
											<TextField
												name="pairingCode"
												label="pairing code"
												variant="standard"
												required
												value={pairingCode}
												onChange={(e) => setPairingCode(e.target.value)}
											></TextField>
											<TextField
												name="deviceName"
												label="device name"
												variant="standard"
												required
												value={deviceName}
												onChange={(e) => setDeviceName(e.target.value)}
											></TextField>
										</div>
										<Button
											type="submit"
											variant="contained"
											sx={{ maxWidth: 200, mx: 'auto' }}
											color="primary"
											disabled={!pairingCode || !deviceName || isCommissioning}
										>
											{isCommissioning ? 'commissioning...' : 'commission'}
										</Button>
										{commissionFailed && (
											<Alert severity="error" variant="outlined">
												commissioning failed
											</Alert>
										)}
									</div>
								</form>
							</AccordionDetails>
						</Accordion>
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
