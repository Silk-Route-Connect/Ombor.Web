import React, { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useNavigate } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LanguageIcon from "@mui/icons-material/Language";
import LightModeIcon from "@mui/icons-material/LightMode";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/NotificationsNoneOutlined";
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
} from "@mui/material";

interface TopbarProps {
	open: boolean;
	onToggle: () => void; // toggles the sidebar
}

const iconStyle: SxProps<Theme> = { color: "text.primary", ml: 1 };

const Topbar: React.FC<TopbarProps> = ({ open, onToggle }) => {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();

	const [quickAnchor, setQuickAnchor] = React.useState<HTMLElement | null>(null);
	const [langAnchor, setLangAnchor] = React.useState<HTMLElement | null>(null);
	const [userAnchor, setUserAnchor] = React.useState<HTMLElement | null>(null);
	const [darkMode, setDarkMode] = React.useState(false);

	const handleQuickOpen = (e: MouseEvent<HTMLElement>) => setQuickAnchor(e.currentTarget);
	const handleQuickClose = () => setQuickAnchor(null);

	const handleLangOpen = (e: MouseEvent<HTMLElement>) => setLangAnchor(e.currentTarget);
	const handleLangClose = () => setLangAnchor(null);

	const handleLangSelect = (lng: string) => {
		i18n.changeLanguage(lng);
		handleLangClose();
	};

	const handleUserOpen = (e: MouseEvent<HTMLElement>) => setUserAnchor(e.currentTarget);
	const handleUserClose = () => setUserAnchor(null);

	const handleDarkToggle = () => setDarkMode((m) => !m);

	const handleQuickNavigate = (path: string) => {
		handleQuickClose();
		navigate(path);
		if (open) {
			onToggle(); // collapse the sidebar
		}
	};

	return (
		<AppBar
			position="fixed"
			elevation={1}
			sx={{ bgcolor: "background.paper", zIndex: (t) => t.zIndex.drawer + 1 }}
		>
			<Toolbar sx={{ justifyContent: "space-between" }}>
				<Box display="flex" alignItems="center">
					<IconButton edge="start" onClick={onToggle} sx={{ mr: 2 }}>
						<MenuIcon
							sx={{
								transition: "transform .3s",
								transform: open ? "rotate(0deg)" : "rotate(-90deg)",
							}}
						/>
					</IconButton>

					<NavLink
						to="/"
						style={{
							display: "flex",
							alignItems: "center",
							textDecoration: "none",
							color: "inherit",
						}}
					>
						<WarehouseIcon sx={{ fontSize: 32, color: "primary.main", mr: 1 }} />
						<Typography variant="h6">{t("topbar.title")}</Typography>
					</NavLink>
				</Box>

				<Box display="flex" alignItems="center">
					<Tooltip title={t("topbar.quickActions")} arrow enterDelay={200}>
						<IconButton
							onClick={handleQuickOpen}
							sx={{
								bgcolor: "primary.main",
								color: "primary.contrastText",
								transition: "transform .15s, background .15s",
								"&:hover": { bgcolor: "primary.dark", transform: "scale(1.05)" },
							}}
						>
							<AddIcon />
						</IconButton>
					</Tooltip>
					<Menu
						anchorEl={quickAnchor}
						open={Boolean(quickAnchor)}
						onClose={handleQuickClose}
						anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
						transformOrigin={{ vertical: "top", horizontal: "center" }}
					>
						<MenuItem onClick={() => handleQuickNavigate("/new/sales")}>
							{t("topbar.quickActions.sale")}
						</MenuItem>
						<MenuItem onClick={() => handleQuickNavigate("/new/supplies")}>
							{t("topbar.quickActions.supply")}
						</MenuItem>
						<MenuItem onClick={handleQuickClose}>{t("topbar.quickActions.order")}</MenuItem>
						<MenuItem onClick={handleQuickClose}>{t("topbar.quickActions.payment")}</MenuItem>
					</Menu>

					<Tooltip title={t("topbar.notifications")} arrow enterDelay={200}>
						<IconButton sx={iconStyle}>
							<Badge variant="dot" color="error">
								<NotificationsIcon />
							</Badge>
						</IconButton>
					</Tooltip>

					<Tooltip
						title={darkMode ? t("topbar.lightMode") : t("topbar.darkMode")}
						arrow
						enterDelay={200}
					>
						<IconButton onClick={handleDarkToggle} sx={iconStyle}>
							{darkMode ? <LightModeIcon /> : <DarkModeIcon />}
						</IconButton>
					</Tooltip>

					<Tooltip title={t("topbar.language")} arrow enterDelay={200}>
						<IconButton onClick={handleLangOpen} sx={iconStyle}>
							<LanguageIcon />
						</IconButton>
					</Tooltip>

					<Menu
						anchorEl={langAnchor}
						open={Boolean(langAnchor)}
						onClose={handleLangClose}
						anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
						transformOrigin={{ vertical: "top", horizontal: "center" }}
					>
						<MenuItem onClick={() => handleLangSelect("ru")}>RU</MenuItem>
						<MenuItem onClick={() => handleLangSelect("uz")}>UZ</MenuItem>
					</Menu>

					<Tooltip title={t("topbar.userMenu")} arrow enterDelay={200}>
						<IconButton onClick={handleUserOpen} sx={iconStyle}>
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
						anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
						transformOrigin={{ vertical: "top", horizontal: "center" }}
					>
						<MenuItem onClick={handleUserClose}>{t("topbar.account")}</MenuItem>
						<MenuItem onClick={handleUserClose}>{t("topbar.settings")}</MenuItem>
						<MenuItem onClick={handleUserClose}>{t("topbar.logout")}</MenuItem>
					</Menu>
				</Box>
			</Toolbar>
		</AppBar>
	);
};

export default Topbar;
