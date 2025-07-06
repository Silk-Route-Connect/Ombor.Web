import React, { MouseEvent, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LanguageIcon from "@mui/icons-material/Language";
import LightModeIcon from "@mui/icons-material/LightMode";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNoneOutlined";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import {
	AppBar,
	Avatar,
	Badge,
	Box,
	IconButton,
	Menu,
	MenuItem,
	SxProps,
	Theme,
	Toolbar,
	Tooltip,
	Typography,
	useTheme,
} from "@mui/material";

const Topbar: React.FC = () => {
	const theme = useTheme();

	const [quickAnchor, setQuickAnchor] = useState<HTMLElement | null>(null);
	const handleQuickOpen = (e: MouseEvent<HTMLElement>) => setQuickAnchor(e.currentTarget);
	const handleQuickClose = () => setQuickAnchor(null);

	const [langAnchor, setLangAnchor] = useState<HTMLElement | null>(null);
	const handleLangOpen = (e: MouseEvent<HTMLElement>) => setLangAnchor(e.currentTarget);
	const handleLangClose = () => setLangAnchor(null);

	const [userAnchor, setUserAnchor] = useState<HTMLElement | null>(null);
	const handleUserOpen = (e: MouseEvent<HTMLElement>) => setUserAnchor(e.currentTarget);
	const handleUserClose = () => setUserAnchor(null);

	const [darkMode, setDarkMode] = useState(false);
	const toggleDarkMode = () => setDarkMode((m) => !m);

	const iconSx: SxProps<Theme> = { color: theme.palette.text.primary, ml: 1 };

	return (
		<AppBar
			position="fixed"
			elevation={1}
			sx={{
				zIndex: theme.zIndex.drawer + 1,
				bgcolor: theme.palette.background.paper,
			}}
		>
			<Toolbar sx={{ justifyContent: "space-between" }}>
				<Box display="flex" alignItems="center">
					<WarehouseIcon sx={{ fontSize: 32, color: "primary.main", mr: 1 }} />
					<Typography variant="h6" color="text.primary">
						Inventory Management
					</Typography>
				</Box>

				<Box display="flex" alignItems="center">
					<Tooltip title="Quick actions" arrow>
						<IconButton
							onClick={handleQuickOpen}
							sx={{
								bgcolor: "primary.main",
								color: "primary.contrastText",
								"&:hover": { bgcolor: "primary.dark" },
								ml: 1,
							}}
						>
							<AddIcon />
						</IconButton>
					</Tooltip>
					<Menu
						anchorEl={quickAnchor}
						open={Boolean(quickAnchor)}
						onClose={handleQuickClose}
						anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
						transformOrigin={{ vertical: "top", horizontal: "right" }}
					>
						<MenuItem onClick={handleQuickClose}>Продажа</MenuItem>
						<MenuItem onClick={handleQuickClose}>Покупка</MenuItem>
						<MenuItem onClick={handleQuickClose}>Заказ</MenuItem>
						<MenuItem onClick={handleQuickClose}>Оплата</MenuItem>
					</Menu>

					<Tooltip title="Notifications" arrow>
						<IconButton sx={iconSx}>
							<Badge badgeContent={3} color="error">
								<NotificationsNoneIcon />
							</Badge>
						</IconButton>
					</Tooltip>

					<Tooltip title={darkMode ? "Light mode" : "Dark mode"} arrow>
						<IconButton onClick={toggleDarkMode} sx={iconSx}>
							{darkMode ? <LightModeIcon /> : <DarkModeIcon />}
						</IconButton>
					</Tooltip>

					<Tooltip title="Language" arrow>
						<IconButton onClick={handleLangOpen} sx={iconSx}>
							<LanguageIcon />
						</IconButton>
					</Tooltip>
					<Menu
						anchorEl={langAnchor}
						open={Boolean(langAnchor)}
						onClose={handleLangClose}
						anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
						transformOrigin={{ vertical: "top", horizontal: "right" }}
					>
						<MenuItem onClick={handleLangClose}>RU</MenuItem>
						<MenuItem onClick={handleLangClose}>UZ</MenuItem>
					</Menu>

					<Tooltip title="User menu" arrow>
						<IconButton onClick={handleUserOpen} sx={iconSx}>
							<Avatar
								sx={{
									width: 30,
									height: 30,
									bgcolor: "secondary.main",
									color: "secondary.contrastText",
								}}
							>
								BS
							</Avatar>
						</IconButton>
					</Tooltip>
					<Menu
						anchorEl={userAnchor}
						open={Boolean(userAnchor)}
						onClose={handleUserClose}
						anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
						transformOrigin={{ vertical: "top", horizontal: "right" }}
					>
						<MenuItem onClick={handleUserClose}>Profile</MenuItem>
						<MenuItem onClick={handleUserClose}>Settings</MenuItem>
						<MenuItem onClick={handleUserClose}>Logout</MenuItem>
					</Menu>
				</Box>
			</Toolbar>
		</AppBar>
	);
};

export default Topbar;
