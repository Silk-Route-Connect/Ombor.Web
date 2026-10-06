import React from "react";
import { Outlet } from "react-router-dom";

import { Box } from "@mui/material";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

/**
 * App frame per design: fixed sidebar, topbar, scrolling content area on
 * the canvas background. Pages render their own header via PageHeader.
 * On paper only the page content prints: the sidebar and topbar hide and the
 * frame stops clipping its scroll area, so a long document flows over pages.
 */
export default function AppLayout() {
	return (
		<Box
			sx={{
				display: "flex",
				height: "100vh",
				bgcolor: "background.default",
				"@media print": { display: "block", height: "auto", bgcolor: "common.white" },
			}}
		>
			<Box sx={{ display: "contents", displayPrint: "none" }}>
				<Sidebar />
			</Box>
			<Box
				sx={{
					flex: 1,
					display: "flex",
					flexDirection: "column",
					minWidth: 0,
					"@media print": { display: "block" },
				}}
			>
				<Box sx={{ display: "contents", displayPrint: "none" }}>
					<Topbar />
				</Box>
				<Box
					component="main"
					sx={{
						flex: 1,
						overflow: "auto",
						scrollbarGutter: "stable",
						p: 3,
						"@media print": { overflow: "visible", p: 0 },
					}}
				>
					<Outlet />
				</Box>
			</Box>
		</Box>
	);
}
