import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { theme } from './theme'
import DevicesPage from './pages/DevicesPage'

export function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<DevicesPage />}></Route>
				</Routes>
			</BrowserRouter>
		</ThemeProvider>
	)
}
