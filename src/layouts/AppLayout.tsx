import React from "react";
import { Outlet } from "react-router-dom";

import { Box } from "@mui/material";

import OfflineBanner from "./OfflineBanner";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

/**
 * App frame per design: fixed sidebar, topbar, scrolling content area on
 * the canvas background. Pages render their own header via PageHeader.
 */
export default function AppLayout() {
	return (
		<Box sx={{ display: "flex", height: "100vh", bgcolor: "background.default" }}>
			<Sidebar />
			<Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
				<Topbar />
				<OfflineBanner />
				<Box component="main" sx={{ flex: 1, overflow: "auto", p: 3 }}>
					<Outlet />
				</Box>
			</Box>
		</Box>
	);
}
