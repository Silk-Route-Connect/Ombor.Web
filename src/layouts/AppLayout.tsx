import { Outlet } from "react-router-dom";
import { Box, CssBaseline, Toolbar } from "@mui/material";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout() {
	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />
			<Topbar />
			<Sidebar />
			<Box
				component="main"
				sx={{
					flexGrow: 1,
					p: 3,
					backgroundColor: "#f5f7fa",
					minHeight: "100vh",
				}}
			>
				<Toolbar />
				<Outlet />
			</Box>
		</Box>
	);
}
