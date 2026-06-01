import React, { Fragment, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { translate } from "i18n/i18n";
import { useStore } from "stores/StoreContext";

import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import {
	Box,
	Chip,
	Collapse,
	Divider,
	Drawer,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Toolbar,
	Typography,
	useTheme,
} from "@mui/material";

import { ChildMenuItem, MenuItem, navSections } from "./config";

const FULL_WIDTH = 248;
const COLLAPSED_WIDTH = 64;

interface SidebarProps {
	open: boolean;
	onToggle: () => void;
}

/* ─────────────────────────── Brand ─────────────────────────── */
function Brand({ open }: Readonly<{ open: boolean }>) {
	return (
		<Toolbar sx={{ px: 1.5, gap: 1.25, minHeight: 64 }}>
			<Box
				sx={{
					width: 34,
					height: 34,
					flexShrink: 0,
					borderRadius: "9px",
					bgcolor: "primary.main",
					color: "primary.contrastText",
					display: "grid",
					placeItems: "center",
					boxShadow: 1,
				}}
			>
				<WarehouseIcon sx={{ fontSize: 20 }} />
			</Box>
			{open && (
				<Box sx={{ overflow: "hidden" }}>
					<Typography
						sx={{
							fontSize: "1.1875rem",
							fontWeight: 700,
							letterSpacing: "-0.02em",
							lineHeight: 1.1,
						}}
					>
						Ombor
					</Typography>
					<Typography sx={{ fontSize: "0.6875rem", color: "text.disabled", lineHeight: 1.2 }}>
						{translate("sidebar.brandSubtitle")}
					</Typography>
				</Box>
			)}
		</Toolbar>
	);
}

/* ───────────────────────── Sidebar ───────────────────────── */
export default function Sidebar({ open, onToggle }: Readonly<SidebarProps>) {
	const theme = useTheme();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const { authStore } = useStore();
	const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

	const isActive = (to: string) =>
		to === "/"
			? pathname === "/"
			: pathname === to || pathname.startsWith(to + "/") || pathname.startsWith(to);

	const childActive = (item: MenuItem) => item.children?.some((c) => isActive(c.to)) ?? false;

	// Expand the group owning the current route whenever the URL changes or the drawer opens.
	useEffect(() => {
		if (!open) return;
		const next: Record<string, boolean> = {};
		navSections.forEach((section) =>
			section.items.forEach((item) => {
				if (item.children) next[item.label] = childActive(item);
			}),
		);
		setOpenGroups((prev) => ({ ...prev, ...next }));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname, open]);

	const toggleGroup = (label: string) => {
		if (!open) {
			onToggle();
			setTimeout(() => setOpenGroups({ [label]: true }), 0);
			return;
		}
		setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
	};

	const handleLogout = () => void authStore.logout();

	const itemSx = {
		mx: 1,
		my: 0.25,
		borderRadius: 2,
		minHeight: 40,
		justifyContent: open ? "flex-start" : "center",
		px: open ? 1.25 : 0,
		color: "text.secondary",
		"&:hover": { bgcolor: "grey.50", color: "text.primary" },
	} as const;

	const renderIcon = (Icon: MenuItem["icon"], active: boolean) => (
		<ListItemIcon
			sx={{
				minWidth: 0,
				mr: open ? 1.5 : 0,
				justifyContent: "center",
				color: active ? "primary.main" : "primary.main",
			}}
		>
			<Icon style={{ fontSize: 20 }} />
		</ListItemIcon>
	);

	const renderSubItem = (child: ChildMenuItem) => {
		const active = isActive(child.to);
		return (
			<ListItemButton
				key={child.to}
				selected={active}
				onClick={() => navigate(child.to)}
				sx={{
					mx: 1,
					my: 0.125,
					borderRadius: 2,
					minHeight: 36,
					pl: 5.25,
					color: "text.secondary",
					"&:hover": { bgcolor: "grey.50", color: "text.primary" },
				}}
			>
				<ListItemText
					primary={child.label}
					primaryTypographyProps={{
						sx: { fontSize: "0.84375rem", fontWeight: active ? 600 : 500 },
					}}
				/>
				{child.badge && (
					<Chip
						label={child.badge.value}
						size="small"
						color={child.badge.tone === "error" ? "error" : "warning"}
						sx={{ height: 18, "& .MuiChip-label": { px: 0.75, fontSize: "0.6875rem" } }}
					/>
				)}
			</ListItemButton>
		);
	};

	const renderItem = (item: MenuItem) => {
		const hasChildren = Boolean(item.children?.length);
		const active = item.to ? isActive(item.to) : childActive(item);
		const groupOpen = open && Boolean(openGroups[item.label]);

		return (
			<Fragment key={item.label}>
				<ListItemButton
					selected={active && !hasChildren}
					onClick={() => (hasChildren ? toggleGroup(item.label) : item.to && navigate(item.to))}
					sx={{
						...itemSx,
						...(active && {
							color: "text.primary",
							"& .MuiListItemText-primary": { fontWeight: 600 },
						}),
					}}
				>
					{renderIcon(item.icon, active)}
					{open && (
						<>
							<ListItemText
								primary={item.label}
								primaryTypographyProps={{
									sx: { fontSize: "0.875rem", fontWeight: active ? 600 : 500 },
								}}
							/>
							{hasChildren &&
								(groupOpen ? (
									<ExpandLessIcon sx={{ fontSize: 18, color: "text.disabled" }} />
								) : (
									<ExpandMoreIcon sx={{ fontSize: 18, color: "text.disabled" }} />
								))}
						</>
					)}
				</ListItemButton>

				{hasChildren && (
					<Collapse in={groupOpen} timeout="auto" unmountOnExit>
						<List disablePadding>{item.children!.map(renderSubItem)}</List>
					</Collapse>
				)}
			</Fragment>
		);
	};

	return (
		<Drawer
			variant="permanent"
			open={open}
			slotProps={{
				paper: {
					sx: {
						width: open ? FULL_WIDTH : COLLAPSED_WIDTH,
						boxSizing: "border-box",
						overflowX: "hidden",
						zIndex: theme.zIndex.appBar - 1,
						transition: theme.transitions.create("width", {
							duration: theme.transitions.duration.standard,
							easing: theme.transitions.easing.easeInOut,
						}),
					},
				},
			}}
		>
			<Brand open={open} />
			<Divider />

			<Box display="flex" flexDirection="column" height="100%">
				<Box sx={{ flex: 1, overflowY: "auto", overflowX: "hidden", py: 1 }}>
					{navSections.map((section) => (
						<Fragment key={section.label}>
							{open && (
								<Typography
									variant="overline"
									sx={{
										display: "block",
										px: 2,
										pt: 1.5,
										pb: 0.5,
										color: "text.disabled",
										lineHeight: 1.4,
									}}
								>
									{section.label}
								</Typography>
							)}
							<List disablePadding>{section.items.map(renderItem)}</List>
						</Fragment>
					))}
				</Box>

				<Divider />
				<List disablePadding sx={{ py: 0.5 }}>
					<ListItemButton onClick={() => navigate("/settings")} sx={itemSx}>
						<ListItemIcon
							sx={{
								minWidth: 0,
								mr: open ? 1.5 : 0,
								justifyContent: "center",
								color: "text.secondary",
							}}
						>
							<SettingsIcon style={{ fontSize: 20 }} />
						</ListItemIcon>
						{open && (
							<ListItemText
								primary={translate("sidebar.settings")}
								primaryTypographyProps={{ sx: { fontSize: "0.875rem", fontWeight: 500 } }}
							/>
						)}
					</ListItemButton>
					<ListItemButton onClick={handleLogout} sx={itemSx}>
						<ListItemIcon
							sx={{
								minWidth: 0,
								mr: open ? 1.5 : 0,
								justifyContent: "center",
								color: "text.secondary",
							}}
						>
							<LogoutIcon style={{ fontSize: 20 }} />
						</ListItemIcon>
						{open && (
							<ListItemText
								primary={translate("sidebar.logout")}
								primaryTypographyProps={{ sx: { fontSize: "0.875rem", fontWeight: 500 } }}
							/>
						)}
					</ListItemButton>
				</List>
			</Box>
		</Drawer>
	);
}
