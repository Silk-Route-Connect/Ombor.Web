import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Box, CssBaseline, Toolbar, useTheme } from "@mui/material";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const FULL_WIDTH = 240;
const COLLAPSED_WIDTH = 64;

export default function AppLayout() {
	const theme = useTheme();
	const [isDrawerOpen, setIsDrawerOpen] = useState(true);
	const drawerWidth = isDrawerOpen ? FULL_WIDTH : COLLAPSED_WIDTH;

	const toggleDrawer = () => setIsDrawerOpen((prev) => !prev);

	return (
		<Box sx={{ display: "flex" }}>
			<CssBaseline />

			<Topbar open={isDrawerOpen} onToggle={toggleDrawer} />

			{/* reserve space for the drawer */}
			<Box
				component="nav"
				sx={{
					width: drawerWidth,
					flexShrink: 0,
					transition: theme.transitions.create("width", {
						duration: theme.transitions.duration.standard,
						easing: theme.transitions.easing.easeInOut,
					}),
				}}
			>
				<Sidebar open={isDrawerOpen} onToggle={toggleDrawer} />
			</Box>

			<Box
				component="main"
				sx={{
					flexGrow: 1,
					width: `calc(100% - ${drawerWidth}px)`,
					p: 3,
					bgcolor: "background.default",
					minHeight: "100vh",
					transition: theme.transitions.create("width", {
						duration: theme.transitions.duration.standard,
						easing: theme.transitions.easing.easeInOut,
					}),
				}}
			>
				<Toolbar />
				<Outlet />
			</Box>
		</Box>
	);
}
