import React, { MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { translate } from "i18n/i18n";

import AddIcon from "@mui/icons-material/Add";
import LanguageIcon from "@mui/icons-material/Language";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SearchIcon from "@mui/icons-material/Search";
import {
	AppBar,
	Avatar,
	Badge,
	Box,
	Button,
	IconButton,
	Menu,
	MenuItem,
	Toolbar,
	Tooltip,
	Typography,
} from "@mui/material";

interface TopbarProps {
	open: boolean;
	onToggle: () => void; // toggles the sidebar
}

const Topbar: React.FC<TopbarProps> = ({ open, onToggle }) => {
	const navigate = useNavigate();

	const [quickAnchor, setQuickAnchor] = React.useState<HTMLElement | null>(null);
	const [langAnchor, setLangAnchor] = React.useState<HTMLElement | null>(null);
	const [userAnchor, setUserAnchor] = React.useState<HTMLElement | null>(null);

	const handleQuickOpen = (e: MouseEvent<HTMLElement>) => setQuickAnchor(e.currentTarget);
	const handleQuickClose = () => setQuickAnchor(null);

	const handleQuickNavigate = (path: string) => {
		handleQuickClose();
		navigate(path);
	};

	return (
		<AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
			<Toolbar sx={{ gap: 2 }}>
				<IconButton edge="start" onClick={onToggle} sx={{ color: "text.secondary" }}>
					<MenuIcon
						sx={{
							transition: "transform .3s",
							transform: open ? "rotate(0deg)" : "rotate(-90deg)",
						}}
					/>
				</IconButton>

				{/* System search (decorative placeholder until search is wired) */}
				<Box
					sx={{
						display: { xs: "none", sm: "flex" },
						alignItems: "center",
						gap: 1,
						minWidth: 260,
						maxWidth: 420,
						px: 1.5,
						height: 38,
						borderRadius: 2,
						border: 1,
						borderColor: "divider",
						color: "text.disabled",
						cursor: "text",
					}}
				>
					<SearchIcon sx={{ fontSize: 18 }} />
					<Typography variant="body2" sx={{ flex: 1 }}>
						{translate("topbar.search")}
					</Typography>
					<Box
						component="kbd"
						sx={{
							fontSize: "0.6875rem",
							fontWeight: 600,
							px: 0.75,
							py: 0.125,
							borderRadius: 1,
							bgcolor: "grey.100",
							color: "text.secondary",
						}}
					>
						⌘K
					</Box>
				</Box>

				<Box sx={{ flex: 1 }} />

				<Button
					variant="contained"
					color="primary"
					startIcon={<AddIcon />}
					onClick={handleQuickOpen}
					sx={{ display: { xs: "none", sm: "inline-flex" } }}
				>
					{translate("topbar.create")}
				</Button>
				<IconButton
					onClick={handleQuickOpen}
					sx={{ display: { xs: "inline-flex", sm: "none" }, color: "primary.main" }}
				>
					<AddIcon />
				</IconButton>
				<Menu
					anchorEl={quickAnchor}
					open={Boolean(quickAnchor)}
					onClose={handleQuickClose}
					anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
					transformOrigin={{ vertical: "top", horizontal: "right" }}
				>
					<MenuItem onClick={() => handleQuickNavigate("/new/sales")}>
						{translate("topbar.quickActions.sale")}
					</MenuItem>
					<MenuItem onClick={() => handleQuickNavigate("/new/supplies")}>
						{translate("topbar.quickActions.supply")}
					</MenuItem>
					<MenuItem onClick={handleQuickClose}>{translate("topbar.quickActions.order")}</MenuItem>
					<MenuItem onClick={handleQuickClose}>{translate("topbar.quickActions.payment")}</MenuItem>
				</Menu>

				<Tooltip title={translate("topbar.notifications")} arrow enterDelay={200}>
					<IconButton sx={{ color: "text.secondary" }}>
						<Badge variant="dot" color="error">
							<NotificationsIcon />
						</Badge>
					</IconButton>
				</Tooltip>

				<Tooltip title={translate("topbar.language")} arrow enterDelay={200}>
					<IconButton
						onClick={(e) => setLangAnchor(e.currentTarget)}
						sx={{ color: "text.secondary" }}
					>
						<LanguageIcon />
					</IconButton>
				</Tooltip>
				<Menu
					anchorEl={langAnchor}
					open={Boolean(langAnchor)}
					onClose={() => setLangAnchor(null)}
					anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
					transformOrigin={{ vertical: "top", horizontal: "right" }}
				>
					<MenuItem onClick={() => setLangAnchor(null)}>RU</MenuItem>
					<MenuItem onClick={() => setLangAnchor(null)}>UZ</MenuItem>
				</Menu>

				<Tooltip title={translate("topbar.userMenu")} arrow enterDelay={200}>
					<IconButton onClick={(e) => setUserAnchor(e.currentTarget)} sx={{ ml: 0.5 }}>
						<Avatar
							sx={{
								width: 34,
								height: 34,
								bgcolor: "primary.main",
								fontSize: "0.875rem",
								fontWeight: 600,
							}}
						>
							БС
						</Avatar>
					</IconButton>
				</Tooltip>
				<Menu
					anchorEl={userAnchor}
					open={Boolean(userAnchor)}
					onClose={() => setUserAnchor(null)}
					anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
					transformOrigin={{ vertical: "top", horizontal: "right" }}
				>
					<MenuItem onClick={() => setUserAnchor(null)}>{translate("topbar.account")}</MenuItem>
					<MenuItem onClick={() => setUserAnchor(null)}>{translate("topbar.settings")}</MenuItem>
					<MenuItem onClick={() => setUserAnchor(null)}>{translate("topbar.logout")}</MenuItem>
				</Menu>
			</Toolbar>
		</AppBar>
	);
};

export default Topbar;
