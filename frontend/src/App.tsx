import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { theme } from './theme'
import RoomsPage from './pages/RoomsPage'

export function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<RoomsPage />}></Route>
				</Routes>
			</BrowserRouter>
		</ThemeProvider>
	)
}
