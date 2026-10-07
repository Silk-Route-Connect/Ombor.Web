import React, { MouseEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import NotificationBell from "components/notifications/NotificationBell";
import GlobalSearch from "components/search/GlobalSearch";
import { menuItemSx, menuSlotProps } from "components/shared/ActionMenuCell/menuPaper";
import GhostButton from "components/shared/Buttons/GhostButton";
import { UI_LANGUAGES } from "i18n/languages";
import { observer } from "mobx-react-lite";
import { PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";
import { layout, radius } from "theme";

import AddIcon from "@mui/icons-material/Add";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import LanguageIcon from "@mui/icons-material/Language";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import {
	Avatar,
	Box,
	IconButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	SvgIconProps,
	Tooltip,
} from "@mui/material";

import ConnectivityIndicator from "./ConnectivityIndicator";

export const TOPBAR_HEIGHT = layout.topbarHeight;

/** The same words and glyphs as each page's own create button and type chip. */
const CREATE_ACTIONS: Array<{
	labelKey: string;
	to: string;
	icon: React.ComponentType<SvgIconProps>;
}> = [
	{ labelKey: "topbar.quickActions.sale", to: PATHS.newSale, icon: LocalOfferOutlinedIcon },
	{ labelKey: "topbar.quickActions.supply", to: PATHS.newSupply, icon: LocalShippingOutlinedIcon },
	{ labelKey: "topbar.quickActions.order", to: PATHS.newOrder, icon: AssignmentOutlinedIcon },
	{ labelKey: "topbar.quickActions.payment", to: PATHS.newPayment, icon: PaymentsOutlinedIcon },
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
				// Tighter on a phone, so the icon-only search, «Создать», the bell and the avatar fit.
				gap: { xs: 1, sm: 2 },
				height: TOPBAR_HEIGHT,
				px: { xs: 1.5, sm: 3.25 },
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
				slotProps={menuSlotProps}
			>
				{CREATE_ACTIONS.map(({ labelKey, to, icon: Icon }) => (
					<MenuItem key={labelKey} onClick={() => handleCreateNavigate(to)} sx={menuItemSx}>
						<ListItemIcon sx={{ color: "text.secondary" }}>
							<Icon fontSize="small" />
						</ListItemIcon>
						<ListItemText primary={t(labelKey)} sx={{ my: 0 }} />
					</MenuItem>
				))}
			</Menu>

			<ConnectivityIndicator />

			<NotificationBell />

			{/* With one interface language the switcher would be a dead control. */}
			{UI_LANGUAGES.length > 1 && (
				<>
					<Tooltip title={t("topbar.language")} arrow enterDelay={200}>
						<IconButton
							onClick={openMenu(setLangAnchor)}
							sx={{
								width: 38,
								height: 38,
								borderRadius: `${radius.md}px`,
								color: "text.secondary",
							}}
						>
							<LanguageIcon sx={{ fontSize: 20 }} />
						</IconButton>
					</Tooltip>
					<Menu
						anchorEl={langAnchor}
						open={Boolean(langAnchor)}
						onClose={() => setLangAnchor(null)}
						anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
						transformOrigin={{ vertical: "top", horizontal: "right" }}
						slotProps={menuSlotProps}
					>
						{UI_LANGUAGES.map((lang) => (
							<MenuItem
								key={lang.code}
								selected={i18n.language === lang.code}
								onClick={() => handleLanguageSelect(lang.code)}
								sx={menuItemSx}
							>
								{lang.label}
							</MenuItem>
						))}
					</Menu>
				</>
			)}

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
				slotProps={menuSlotProps}
			>
				{fullName && (
					<MenuItem disabled sx={{ ...menuItemSx, "&.Mui-disabled": { opacity: 1 } }}>
						<ListItemText primary={fullName} slotProps={{ primary: { sx: { fontWeight: 600 } } }} />
					</MenuItem>
				)}
				<MenuItem onClick={handleLogout} sx={menuItemSx}>
					<ListItemIcon sx={{ color: "text.secondary" }}>
						<LogoutOutlinedIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText primary={t("topbar.logout")} sx={{ my: 0 }} />
				</MenuItem>
			</Menu>
		</Box>
	);
});

export default Topbar;
