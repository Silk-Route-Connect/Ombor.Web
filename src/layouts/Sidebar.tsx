import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { PATHS } from "routing/paths";
import { useStore } from "stores/StoreContext";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import {
	Box,
	Collapse,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Typography,
} from "@mui/material";

import { ChildNavItem, NavItem, navItems } from "./config";

export const SIDEBAR_WIDTH = 248;

function isRouteActive(pathname: string, to: string): boolean {
	if (to === PATHS.dashboard) {
		return pathname === to;
	}
	return pathname === to || pathname.startsWith(`${to}/`);
}

/* ───────────────────────────── Brand ───────────────────────────── */

const Brand = observer(function Brand() {
	const { authStore } = useStore();
	const businessName = authStore.getUser()?.organizationName;

	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1, pt: 0.75, pb: 1.75 }}>
			<Box
				sx={{
					width: 34,
					height: 34,
					borderRadius: 1,
					bgcolor: "primary.main",
					color: "primary.contrastText",
					display: "grid",
					placeItems: "center",
					boxShadow: 1,
					flexShrink: 0,
				}}
			>
				<WarehouseOutlinedIcon sx={{ fontSize: 20 }} />
			</Box>
			<Box sx={{ minWidth: 0 }}>
				<Typography sx={{ fontSize: 19, fontWeight: 700, lineHeight: 1.2 }}>Ombor</Typography>
				{businessName && (
					<Typography noWrap sx={{ fontSize: 11, color: "text.disabled", mt: "1px" }}>
						{businessName}
					</Typography>
				)}
			</Box>
		</Box>
	);
});

/* ─────────────────────────── Nav items ─────────────────────────── */

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
				py: 1,
				gap: 1.25,
				color: emphasized ? "text.primary" : "text.secondary",
				"&:hover": { bgcolor: "action.hover", color: "text.primary" },
			}}
		>
			<ListItemIcon sx={{ minWidth: 0, color: "inherit" }}>
				<Icon sx={{ fontSize: 19 }} />
			</ListItemIcon>
			<ListItemText
				primary={t(item.labelKey)}
				slotProps={{
					primary: { sx: { fontSize: 14, fontWeight: emphasized ? 600 : 500 } },
				}}
			/>
			{item.children &&
				(expanded ? (
					<ExpandLessIcon sx={{ fontSize: 15, opacity: 0.5 }} />
				) : (
					<ExpandMoreIcon sx={{ fontSize: 15, opacity: 0.5 }} />
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
				pl: 4,
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

/* ───────────────────────────── Sidebar ───────────────────────────── */

const Sidebar: React.FC = observer(() => {
	const { t } = useTranslation();
	const { authStore } = useStore();
	const navigate = useNavigate();
	const { pathname } = useLocation();

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

	const handleLogout = () => {
		void authStore.logout();
	};

	return (
		<Box
			component="aside"
			sx={{
				width: SIDEBAR_WIDTH,
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
			}}
		>
			<Brand />

			<List disablePadding sx={{ flex: 1, overflowY: "auto", pt: 1.25 }}>
				{navItems.map((item) => {
					const childActive =
						item.children?.some((child) => isRouteActive(pathname, child.to)) ?? false;
					const directActive = item.to ? isRouteActive(pathname, item.to) : false;
					const expanded = item.children ? Boolean(expandedGroups[item.labelKey]) : undefined;

					return (
						<Fragment key={item.labelKey}>
							<TopLevelItem
								item={item}
								active={directActive || childActive}
								expanded={expanded}
								onClick={() =>
									item.children ? toggleGroup(item.labelKey) : item.to && navigate(item.to)
								}
							/>
							{item.children && (
								<Collapse in={expanded} timeout="auto">
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

			<List disablePadding sx={{ mt: 1, pt: 1.25, borderTop: 1, borderColor: "divider" }}>
				<ListItemButton
					onClick={() => navigate(PATHS.settings)}
					sx={{
						borderRadius: 1,
						px: 1.25,
						py: 1,
						gap: 1.25,
						color: isRouteActive(pathname, PATHS.settings) ? "text.primary" : "text.secondary",
						"&:hover": { bgcolor: "action.hover", color: "text.primary" },
					}}
				>
					<ListItemIcon sx={{ minWidth: 0, color: "inherit" }}>
						<SettingsOutlinedIcon sx={{ fontSize: 19 }} />
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
						py: 1,
						gap: 1.25,
						color: "text.secondary",
						"&:hover": { bgcolor: "action.hover", color: "text.primary" },
					}}
				>
					<ListItemIcon sx={{ minWidth: 0, color: "inherit" }}>
						<LogoutOutlinedIcon sx={{ fontSize: 19 }} />
					</ListItemIcon>
					<ListItemText
						primary={t("sidebar.logout")}
						slotProps={{ primary: { sx: { fontSize: 14, fontWeight: 500 } } }}
					/>
				</ListItemButton>
			</List>
		</Box>
	);
});

export default Sidebar;
