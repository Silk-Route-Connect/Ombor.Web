import React, { MouseEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import NotificationBell from "components/notifications/NotificationBell";
import GlobalSearch from "components/search/GlobalSearch";
import GhostButton from "components/shared/Buttons/GhostButton";
import { UI_LANGUAGES } from "i18n/languages";
import { observer } from "mobx-react-lite";
import { PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";

import AddIcon from "@mui/icons-material/Add";
import LanguageIcon from "@mui/icons-material/Language";
import { Avatar, Box, IconButton, ListItemText, Menu, MenuItem, Tooltip } from "@mui/material";

import OfflineIndicator from "./OfflineIndicator";

export const TOPBAR_HEIGHT = 60;

const CREATE_ACTIONS: Array<{ labelKey: string; to: string }> = [
	{ labelKey: "topbar.quickActions.sale", to: PATHS.newSale },
	{ labelKey: "topbar.quickActions.supply", to: PATHS.newSupply },
	{ labelKey: "topbar.quickActions.order", to: PATHS.newOrder },
	{ labelKey: "topbar.quickActions.payment", to: PATHS.newPayment },
];

const Topbar: React.FC = observer(() => {
	const { t, i18n } = useTranslation();
	const navigate = useNavigate();
	const { authStore } = useStore();

	const [createAnchor, setCreateAnchor] = useState<HTMLElement | null>(null);
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

			<GlobalSearch />

			{/* Ghost, not filled: each page keeps a single filled primary action of its own. */}
			<GhostButton icon={<AddIcon />} onClick={openMenu(setCreateAnchor)}>
				{t("topbar.create")}
			</GhostButton>
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

			<OfflineIndicator />

			<NotificationBell />

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
				{UI_LANGUAGES.map((lang) => (
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
