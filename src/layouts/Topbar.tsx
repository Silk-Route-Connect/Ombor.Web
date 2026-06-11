import React, { MouseEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";

import AddIcon from "@mui/icons-material/Add";
import LanguageIcon from "@mui/icons-material/Language";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import SearchIcon from "@mui/icons-material/Search";
import {
	Avatar,
	Box,
	Button,
	IconButton,
	ListItemText,
	Menu,
	MenuItem,
	Popover,
	Tooltip,
	Typography,
} from "@mui/material";

export const TOPBAR_HEIGHT = 60;

const LANGUAGES: Array<{ code: string; label: string }> = [
	{ code: "ru", label: "Русский" },
	{ code: "uz", label: "O‘zbekcha" },
	// uz-Cyrl joins this list when its resources land (wired in i18n/config.ts).
];

const CREATE_ACTIONS: Array<{ labelKey: string; to: string }> = [
	{ labelKey: "topbar.quickActions.sale", to: PATHS.newSale },
	{ labelKey: "topbar.quickActions.supply", to: PATHS.newSupply },
	{ labelKey: "topbar.quickActions.order", to: PATHS.newOrder },
	{ labelKey: "topbar.quickActions.payment", to: PATHS.newPayment },
];

/** Visual-only global search per design — the feature is a later task. */
function SearchField() {
	const { t } = useTranslation();

	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				gap: 1.125,
				width: 300,
				px: 1.625,
				py: 1,
				bgcolor: "background.default",
				border: 1,
				borderColor: "divider",
				borderRadius: 1,
				color: "text.disabled",
			}}
		>
			<SearchIcon sx={{ fontSize: 17 }} />
			<Typography sx={{ fontSize: 13.5, color: "inherit", flex: 1 }} noWrap>
				{t("topbar.search.placeholder")}
			</Typography>
			<Box
				component="kbd"
				sx={{
					fontFamily: "inherit",
					fontSize: 11,
					px: 0.75,
					py: 0.125,
					bgcolor: "background.paper",
					border: 1,
					borderColor: "divider",
					borderRadius: "5px",
					color: "text.secondary",
				}}
			>
				⌘K
			</Box>
		</Box>
	);
}

const Topbar: React.FC = observer(() => {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const { authStore } = useStore();

	const [createAnchor, setCreateAnchor] = useState<HTMLElement | null>(null);
	const [bellAnchor, setBellAnchor] = useState<HTMLElement | null>(null);
	const [langAnchor, setLangAnchor] = useState<HTMLElement | null>(null);
	const [userAnchor, setUserAnchor] = useState<HTMLElement | null>(null);

	const user = authStore.getUser();
	const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
	const initials = [user?.firstName, user?.lastName]
		.filter(Boolean)
		.map((part) => part?.[0]?.toUpperCase())
		.join("");

	const handleCreateNavigate = (to: string) => {
		setCreateAnchor(null);
		navigate(to);
	};

	const handleLanguageSelect = (code: string) => {
		void i18n.changeLanguage(code);
		setLangAnchor(null);
	};

	const handleLogout = () => {
		setUserAnchor(null);
		void authStore.logout();
	};

	const openMenu = (setter: (el: HTMLElement) => void) => (e: MouseEvent<HTMLElement>) =>
		setter(e.currentTarget);

	return (
		<Box
			component="header"
			sx={{
				display: "flex",
				alignItems: "center",
				gap: 2,
				height: TOPBAR_HEIGHT,
				px: 3.25,
				bgcolor: "background.paper",
				borderBottom: 1,
				borderColor: "divider",
				flexShrink: 0,
			}}
		>
			<Box sx={{ flex: 1 }} />

			<SearchField />

			<Button
				variant="contained"
				size="small"
				startIcon={<AddIcon />}
				onClick={openMenu(setCreateAnchor)}
			>
				{t("topbar.create")}
			</Button>
			<Menu
				anchorEl={createAnchor}
				open={Boolean(createAnchor)}
				onClose={() => setCreateAnchor(null)}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
			>
				{CREATE_ACTIONS.map((action) => (
					<MenuItem key={action.labelKey} onClick={() => handleCreateNavigate(action.to)}>
						{t(action.labelKey)}
					</MenuItem>
				))}
			</Menu>

			<Tooltip title={t("topbar.notifications")} arrow enterDelay={200}>
				<IconButton
					onClick={openMenu(setBellAnchor)}
					sx={{ width: 38, height: 38, borderRadius: 1, color: "text.secondary" }}
				>
					<NotificationsNoneOutlinedIcon sx={{ fontSize: 19 }} />
				</IconButton>
			</Tooltip>
			<Popover
				anchorEl={bellAnchor}
				open={Boolean(bellAnchor)}
				onClose={() => setBellAnchor(null)}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
			>
				<Typography sx={{ px: 2.5, py: 2, fontSize: 13.5, color: "text.secondary" }}>
					{t("topbar.notifications.empty")}
				</Typography>
			</Popover>

			<Tooltip title={t("topbar.language")} arrow enterDelay={200}>
				<IconButton
					onClick={openMenu(setLangAnchor)}
					sx={{ width: 38, height: 38, borderRadius: 1, color: "text.secondary" }}
				>
					<LanguageIcon sx={{ fontSize: 19 }} />
				</IconButton>
			</Tooltip>
			<Menu
				anchorEl={langAnchor}
				open={Boolean(langAnchor)}
				onClose={() => setLangAnchor(null)}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
			>
				{LANGUAGES.map((lang) => (
					<MenuItem
						key={lang.code}
						selected={i18n.language === lang.code}
						onClick={() => handleLanguageSelect(lang.code)}
					>
						{lang.label}
					</MenuItem>
				))}
			</Menu>

			<Tooltip title={t("topbar.userMenu")} arrow enterDelay={200}>
				<IconButton onClick={openMenu(setUserAnchor)} sx={{ p: 0.25 }}>
					<Avatar
						sx={{ width: 34, height: 34, bgcolor: "primary.main", fontSize: 14, fontWeight: 600 }}
					>
						{initials}
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
				{fullName && (
					<MenuItem disabled sx={{ "&.Mui-disabled": { opacity: 1 } }}>
						<ListItemText primary={fullName} slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
					</MenuItem>
				)}
				<MenuItem onClick={handleLogout}>{t("topbar.logout")}</MenuItem>
			</Menu>
		</Box>
	);
});

export default Topbar;
