import React, { ElementType, Fragment, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import OmborMark from "components/shared/brand/OmborMark";
import { observer } from "mobx-react-lite";
import { PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import {
	Box,
	Collapse,
	IconButton,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Paper,
	Popper,
	Tooltip,
	Typography,
} from "@mui/material";

import { ChildNavItem, NavItem, navItems } from "./config";

export const SIDEBAR_WIDTH = 248; // expanded column
const RAIL_WIDTH = 72; // collapsed icon rail
const NAV_ICON = 22; // nav + footer icon size (expanded and rail)
const NAV_CHEVRON = 18; // parent expand/collapse chevron

/* Collapse state persists across sessions (design: `ombor.sidebar.expanded`). */
const SB_KEY = "ombor.sidebar.expanded";
const readExpanded = (): boolean => {
	try {
		return localStorage.getItem(SB_KEY) !== "0";
	} catch {
		return true;
	}
};

function isRouteActive(pathname: string, to: string): boolean {
	if (to === PATHS.dashboard) {
		return pathname === to;
	}
	return pathname === to || pathname.startsWith(`${to}/`);
}

/* ───────────────────────────── Brand + toggle ───────────────────────────── */

const Brand = observer(function Brand({
	expanded,
	onToggle,
}: {
	expanded: boolean;
	onToggle: () => void;
}) {
	const { t } = useTranslation();
	const { authStore } = useStore();
	const businessName = authStore.getUser()?.organizationName;

	// Hamburger lives inside the sidebar (top-right when expanded, under the mark
	// when collapsed) — deliberately not in the topbar.
	const toggle = (
		<Tooltip title={t(expanded ? "sidebar.collapse" : "sidebar.expand")} placement="right" arrow>
			<IconButton
				onClick={onToggle}
				aria-label={t(expanded ? "sidebar.collapse" : "sidebar.expand")}
				sx={{
					width: 38,
					height: 38,
					borderRadius: 1,
					color: "text.secondary",
					flexShrink: 0,
					"&:hover": { bgcolor: "action.hover", color: "text.primary" },
				}}
			>
				<MenuIcon sx={{ fontSize: 20 }} />
			</IconButton>
		</Tooltip>
	);

	if (!expanded) {
		return (
			<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, pb: 1.5 }}>
				<OmborMark size={34} />
				{toggle}
			</Box>
		);
	}

	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1, pt: 0.75, pb: 1.75 }}>
			<OmborMark size={34} />
			<Box sx={{ minWidth: 0, flex: 1 }}>
				<Typography sx={{ fontSize: 19, fontWeight: 700, lineHeight: 1.2 }}>Ombor</Typography>
				{businessName && (
					<Typography noWrap sx={{ fontSize: 11, color: "text.disabled", mt: "1px" }}>
						{businessName}
					</Typography>
				)}
			</Box>
			{toggle}
		</Box>
	);
});

/* ─────────────────────── Expanded nav (labels + accordion) ─────────────────────── */

interface TopLevelItemProps {
	item: NavItem;
	active: boolean;
	expanded?: boolean;
	onClick: () => void;
}

function TopLevelItem({ item, active, expanded, onClick }: Readonly<TopLevelItemProps>) {
	const { t } = useTranslation();
	const Icon = item.icon;
	// Per design: an open/active parent darkens to ink and bolds; no tint.
	const emphasized = active || expanded;

	return (
		<ListItemButton
			onClick={onClick}
			sx={{
				borderRadius: 1,
				px: 1.25,
				py: 1.125,
				gap: 1.375,
				color: emphasized ? "text.primary" : "text.secondary",
				"&:hover": { bgcolor: "action.hover", color: "text.primary" },
			}}
		>
			<ListItemIcon sx={{ minWidth: 0, color: "inherit" }}>
				<Icon sx={{ fontSize: NAV_ICON }} />
			</ListItemIcon>
			<ListItemText
				primary={t(item.labelKey)}
				slotProps={{
					primary: { sx: { fontSize: 14, fontWeight: emphasized ? 600 : 500 } },
				}}
			/>
			{item.children &&
				(expanded ? (
					<ExpandLessIcon sx={{ fontSize: NAV_CHEVRON, opacity: 0.5 }} />
				) : (
					<ExpandMoreIcon sx={{ fontSize: NAV_CHEVRON, opacity: 0.5 }} />
				))}
		</ListItemButton>
	);
}

interface SubItemProps {
	item: ChildNavItem;
	active: boolean;
	onClick: () => void;
}

function SubItem({ item, active, onClick }: Readonly<SubItemProps>) {
	const { t } = useTranslation();

	return (
		<ListItemButton
			onClick={onClick}
			sx={{
				borderRadius: 1,
				py: 1,
				pr: 1.25,
				pl: 4.125,
				color: active ? "primary.main" : "text.secondary",
				bgcolor: active ? "primary.light" : "transparent",
				"&:hover": {
					bgcolor: active ? "primary.light" : "action.hover",
					color: active ? "primary.main" : "text.primary",
				},
			}}
		>
			<ListItemText
				primary={t(item.labelKey)}
				slotProps={{
					primary: { sx: { fontSize: 13.5, fontWeight: active ? 600 : 500 } },
				}}
			/>
		</ListItemButton>
	);
}

/* ─────────────────────────── Collapsed rail ─────────────────────────── */

/** Icon-only rail button (leaf items + footer), with a label tooltip. */
function RailButton({
	label,
	icon: Icon,
	active,
	onClick,
}: Readonly<{ label: string; icon: ElementType; active: boolean; onClick: () => void }>) {
	return (
		<Tooltip title={label} placement="right" arrow enterDelay={200}>
			<ListItemButton onClick={onClick} aria-label={label} sx={railButtonSx(active)}>
				<Icon sx={{ fontSize: NAV_ICON }} />
			</ListItemButton>
		</Tooltip>
	);
}

const railButtonSx = (active: boolean) =>
	({
		width: 44,
		height: 42,
		minWidth: 0,
		mx: "auto",
		p: 0,
		borderRadius: 1,
		justifyContent: "center",
		color: active ? "primary.main" : "text.secondary",
		bgcolor: active ? "primary.light" : "transparent",
		"&:hover": {
			bgcolor: active ? "primary.light" : "action.hover",
			color: active ? "primary.main" : "text.primary",
		},
	}) as const;

/**
 * Collapsed parent: icon button that reveals a hover flyout of its sub-items
 * (design «nav-sub» popover). Clicking the icon expands the rail into that group.
 */
function RailGroup({
	item,
	branchActive,
	pathname,
	onNavigate,
	onExpandInto,
}: Readonly<{
	item: NavItem;
	branchActive: boolean;
	pathname: string;
	onNavigate: (to: string) => void;
	onExpandInto: (item: NavItem) => void;
}>) {
	const { t } = useTranslation();
	const [anchor, setAnchor] = useState<HTMLElement | null>(null);
	const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const Icon = item.icon;

	const open = () => {
		clearTimeout(closeTimer.current);
	};
	const scheduleClose = () => {
		closeTimer.current = setTimeout(() => setAnchor(null), 140);
	};
	useEffect(() => () => clearTimeout(closeTimer.current), []);

	return (
		<Box
			onMouseEnter={(e) => {
				open();
				setAnchor(e.currentTarget);
			}}
			onMouseLeave={scheduleClose}
		>
			<ListItemButton
				onClick={() => onExpandInto(item)}
				aria-label={t(item.labelKey)}
				sx={railButtonSx(branchActive)}
			>
				<Icon sx={{ fontSize: NAV_ICON }} />
			</ListItemButton>
			<Popper
				open={Boolean(anchor)}
				anchorEl={anchor}
				placement="right-start"
				sx={{ zIndex: (theme) => theme.zIndex.drawer + 2 }}
				modifiers={[{ name: "offset", options: { offset: [-4, 10] } }]}
			>
				<Paper
					elevation={0}
					onMouseEnter={open}
					onMouseLeave={scheduleClose}
					sx={{
						minWidth: 200,
						p: 1,
						borderRadius: 2,
						border: 1,
						borderColor: "divider",
						boxShadow: "0 14px 36px rgba(28,38,37,.20)",
					}}
				>
					<Typography
						sx={{
							px: 1.25,
							pt: 0.5,
							pb: 1,
							fontSize: 11,
							fontWeight: 700,
							letterSpacing: "0.04em",
							textTransform: "uppercase",
							color: "text.disabled",
						}}
					>
						{t(item.labelKey)}
					</Typography>
					{item.children?.map((child) => {
						const active = isRouteActive(pathname, child.to);
						return (
							<Box
								key={child.labelKey}
								onClick={() => {
									onNavigate(child.to);
									setAnchor(null);
								}}
								sx={{
									display: "flex",
									alignItems: "center",
									px: 1.5,
									py: 1,
									borderRadius: 1.5,
									fontSize: 13.5,
									fontWeight: active ? 600 : 500,
									cursor: "pointer",
									color: active ? "primary.main" : "text.secondary",
									bgcolor: active ? "primary.light" : "transparent",
									"&:hover": {
										bgcolor: active ? "primary.light" : "action.hover",
										color: active ? "primary.main" : "text.primary",
									},
								}}
							>
								{t(child.labelKey)}
							</Box>
						);
					})}
				</Paper>
			</Popper>
		</Box>
	);
}

/* ───────────────────────────── Sidebar ───────────────────────────── */

const Sidebar: React.FC = observer(() => {
	const { t } = useTranslation();
	const { authStore } = useStore();
	const navigate = useNavigate();
	const { pathname } = useLocation();

	const [expanded, setExpandedState] = useState(readExpanded);
	const setExpanded = (value: boolean) => {
		setExpandedState(value);
		try {
			localStorage.setItem(SB_KEY, value ? "1" : "0");
		} catch {
			/* storage unavailable — in-memory state still holds for the session */
		}
	};

	// Groups the user opened stay open while navigating; the group owning
	// the current route is expanded additively, never collapsing others.
	const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

	useEffect(() => {
		const owner = navItems.find((item) =>
			item.children?.some((child) => isRouteActive(pathname, child.to)),
		);
		if (owner) {
			setExpandedGroups((prev) =>
				prev[owner.labelKey] ? prev : { ...prev, [owner.labelKey]: true },
			);
		}
	}, [pathname]);

	const toggleGroup = (labelKey: string) =>
		setExpandedGroups((prev) => ({ ...prev, [labelKey]: !prev[labelKey] }));

	// Collapsed → clicking a parent icon expands the rail straight into that group.
	const expandInto = (item: NavItem) => {
		setExpanded(true);
		setExpandedGroups((prev) => ({ ...prev, [item.labelKey]: true }));
	};

	const handleLogout = () => {
		void authStore.logout();
	};

	const settingsActive = isRouteActive(pathname, PATHS.settings);

	return (
		<Box
			component="aside"
			sx={{
				width: expanded ? SIDEBAR_WIDTH : RAIL_WIDTH,
				flexShrink: 0,
				height: "100%",
				display: "flex",
				flexDirection: "column",
				bgcolor: "background.paper",
				borderRight: 1,
				borderColor: "divider",
				px: 1.5,
				py: 1.75,
				overflow: "hidden",
				transition: (theme) =>
					theme.transitions.create("width", {
						duration: 260,
						easing: theme.transitions.easing.easeInOut,
					}),
			}}
		>
			<Brand expanded={expanded} onToggle={() => setExpanded(!expanded)} />

			<List
				disablePadding
				sx={{
					flex: 1,
					overflowY: "auto",
					overflowX: "hidden",
					pt: 1.25,
					// 1px rhythm between items per the bundle's .nav/.nav-sub gap
					"& .MuiListItemButton-root": { mb: "1px" },
				}}
			>
				{navItems.map((item) => {
					const childActive =
						item.children?.some((child) => isRouteActive(pathname, child.to)) ?? false;
					const directActive = item.to ? isRouteActive(pathname, item.to) : false;

					if (!expanded) {
						return item.children ? (
							<RailGroup
								key={item.labelKey}
								item={item}
								branchActive={childActive}
								pathname={pathname}
								onNavigate={navigate}
								onExpandInto={expandInto}
							/>
						) : (
							<RailButton
								key={item.labelKey}
								label={t(item.labelKey)}
								icon={item.icon}
								active={directActive}
								onClick={() => item.to && navigate(item.to)}
							/>
						);
					}

					const groupOpen = item.children ? Boolean(expandedGroups[item.labelKey]) : undefined;
					return (
						<Fragment key={item.labelKey}>
							<TopLevelItem
								item={item}
								active={directActive || childActive}
								expanded={groupOpen}
								onClick={() =>
									item.children ? toggleGroup(item.labelKey) : item.to && navigate(item.to)
								}
							/>
							{item.children && (
								<Collapse in={groupOpen} timeout="auto">
									<List disablePadding sx={{ pl: 1 }}>
										{item.children.map((child) => (
											<SubItem
												key={child.labelKey}
												item={child}
												active={isRouteActive(pathname, child.to)}
												onClick={() => navigate(child.to)}
											/>
										))}
									</List>
								</Collapse>
							)}
						</Fragment>
					);
				})}
			</List>

			<List
				disablePadding
				sx={{
					mt: 1,
					pt: 1.25,
					borderTop: 1,
					borderColor: "divider",
					"& .MuiListItemButton-root": { mb: "1px" },
				}}
			>
				{!expanded ? (
					<>
						<RailButton
							label={t("sidebar.settings")}
							icon={SettingsOutlinedIcon}
							active={settingsActive}
							onClick={() => navigate(PATHS.settings)}
						/>
						<RailButton
							label={t("sidebar.logout")}
							icon={LogoutOutlinedIcon}
							active={false}
							onClick={handleLogout}
						/>
					</>
				) : (
					<>
						<ListItemButton
							onClick={() => navigate(PATHS.settings)}
							sx={{
								borderRadius: 1,
								px: 1.25,
								py: 1.125,
								gap: 1.375,
								color: settingsActive ? "text.primary" : "text.secondary",
								"&:hover": { bgcolor: "action.hover", color: "text.primary" },
							}}
						>
							<ListItemIcon sx={{ minWidth: 0, color: "inherit" }}>
								<SettingsOutlinedIcon sx={{ fontSize: NAV_ICON }} />
							</ListItemIcon>
							<ListItemText
								primary={t("sidebar.settings")}
								slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 500 } } }}
							/>
						</ListItemButton>
						<ListItemButton
							onClick={handleLogout}
							sx={{
								borderRadius: 1,
								px: 1.25,
								py: 1.125,
								gap: 1.375,
								color: "text.secondary",
								"&:hover": { bgcolor: "action.hover", color: "text.primary" },
							}}
						>
							<ListItemIcon sx={{ minWidth: 0, color: "inherit" }}>
								<LogoutOutlinedIcon sx={{ fontSize: NAV_ICON }} />
							</ListItemIcon>
							<ListItemText
								primary={t("sidebar.logout")}
								slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 500 } } }}
							/>
						</ListItemButton>
					</>
				)}
			</List>
		</Box>
	);
});

export default Sidebar;
