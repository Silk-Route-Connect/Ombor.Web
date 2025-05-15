import AccountCircleIcon from "@mui/icons-material/AccountCircleOutlined";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNoneOutlined";
import { AppBar, Badge, Box, IconButton, Toolbar, Typography } from "@mui/material";

export default function Topbar() {
	return (
		<AppBar
			position="fixed"
			elevation={0}
			sx={{
				zIndex: (theme) => theme.zIndex.drawer + 1,
				backgroundColor: "#fff",
				borderBottom: "1px solid #e0e0e0",
				color: "#333",
			}}
		>
			<Toolbar sx={{ justifyContent: "space-between" }}>
				<Typography variant="h6">Inventory Management</Typography>
				<Box sx={{ display: "flex", gap: 2 }}>
					<IconButton color="inherit">
						<Badge badgeContent={3} color="error">
							<NotificationsNoneIcon />
						</Badge>
					</IconButton>
					<IconButton color="inherit">
						<AccountCircleIcon />
					</IconButton>
				</Box>
			</Toolbar>
		</AppBar>
	);
}
