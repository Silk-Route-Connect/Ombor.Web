import React, { Fragment, useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import {
	alpha,
	Box,
	Collapse,
	Divider,
	Drawer,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Toolbar,
	useTheme,
} from "@mui/material";
import type { TouchRippleProps } from "@mui/material/ButtonBase/TouchRipple";
import { translate } from "i18n/i18n";

import { menuItems } from "./config";

interface SidebarProps {
	open: boolean;
	onToggle: () => void;
}

/* ───────────────────────────── NavItem ───────────────────────────── */
interface NavItemProps {
	icon?: React.ReactNode;
	label: string;
	to?: string;
	inset?: boolean;
	onClick?: () => void;
	trailing?: React.ReactNode;
	isSelected?: boolean;
	drawerOpen: boolean;
	selectedBgOpacity?: number;
}

function NavItem({
	icon,
	label,
	to,
	inset = false,
	onClick,
	trailing,
	isSelected,
	drawerOpen,
	selectedBgOpacity,
}: NavItemProps) {
	const theme = useTheme();
	const navigate = useNavigate();
	const { pathname } = useLocation();
	const rippleRef = useRef<{
		start: (e: React.MouseEvent) => void;
		stop: () => void;
	} | null>(null);

	const routeSelected = to ? pathname === to || (to !== "/" && pathname.startsWith(to)) : false;
	const selected = isSelected ?? routeSelected;

	const baseOpacity = selectedBgOpacity ?? 0.15;
	const hoverOpacity = Math.min(baseOpacity + 0.1, 1);

	const handleClick = (e: React.MouseEvent) => {
		rippleRef.current?.start(e);
		setTimeout(() => {
			if (to) navigate(to);
			else onClick?.();
		}, 50);
		setTimeout(() => rippleRef.current?.stop(), 100);
	};

	const touchProps: Partial<TouchRippleProps> = { center: true };

	return (
		<ListItemButton
			onClick={handleClick}
			TouchRippleProps={touchProps as TouchRippleProps}
			selected={selected}
			sx={{
				m: 0.5, // horizontal + vertical margin -> separates items from drawer edges
				borderRadius: 2,
				justifyContent: "flex-start",
				pl: theme.spacing(2 + (inset ? 2 : 0)),
				"&.Mui-selected": {
					bgcolor: alpha(theme.palette.primary.main, baseOpacity),
				},
				"&.Mui-selected:hover": {
					bgcolor: alpha(theme.palette.primary.main, hoverOpacity),
				},
				"&:hover": { bgcolor: "action.hover" },
				"& .MuiTouchRipple-root": { color: "primary.main" },
				"& .MuiTouchRipple-rippleVisible": {
					opacity: 0.3,
					transform: "scale(4)",
					animationDuration: "550ms !important",
				},
			}}
		>
			{icon && (
				<ListItemIcon
					sx={{
						minWidth: theme.spacing(3),
						justifyContent: "center",
						color: "primary.main",
						mr: 1,
					}}
				>
					{icon}
				</ListItemIcon>
			)}

			<ListItemText
				primary={label}
				sx={{
					flex: drawerOpen ? "1 1 auto" : "0 0 0",
					opacity: drawerOpen ? 1 : 0,
					whiteSpace: "nowrap",
					overflow: "hidden",
					transition: theme.transitions.create(["flex", "opacity"], {
						duration: theme.transitions.duration.standard,
						easing: theme.transitions.easing.easeInOut,
					}),
				}}
			/>

			{trailing && (
				<Box
					sx={{
						flex: drawerOpen ? "0 0 auto" : "0 0 0",
						opacity: drawerOpen ? 1 : 0,
						transition: theme.transitions.create(["flex", "opacity"], {
							duration: theme.transitions.duration.standard,
							easing: theme.transitions.easing.easeInOut,
						}),
					}}
				>
					{trailing}
				</Box>
			)}
		</ListItemButton>
	);
}

/* ───────────────────────────── Sidebar ───────────────────────────── */
export default function Sidebar({ open, onToggle }: SidebarProps) {
	const theme = useTheme();
	const location = useLocation();
	const [groups, setGroups] = useState<Record<string, boolean>>({});

	useEffect(() => {
		const auto: Record<string, boolean> = {};
		menuItems.forEach((item) => {
			if (item.children) {
				auto[item.label] = item.children.some((c) => location.pathname.startsWith(c.to));
			}
		});
		setGroups(auto);
	}, [location.pathname]);

	useEffect(() => {
		if (!open) setGroups({});
	}, [open]);

	const handleToggleGroup = (label: string) => {
		if (!open) {
			onToggle();
			setTimeout(() => setGroups({ [label]: true }), 0);
		} else {
			setGroups((prev) => ({ ...prev, [label]: !prev[label] }));
		}
	};

	return (
		<Drawer
			variant="permanent"
			open={open}
			slotProps={{
				paper: {
					sx: {
						width: open ? 240 : 64,
						boxSizing: "border-box",
						borderRight: "none",
						transition: theme.transitions.create("width", {
							duration: theme.transitions.duration.standard,
							easing: theme.transitions.easing.easeInOut,
						}),
						overflowX: "hidden",
						zIndex: theme.zIndex.appBar - 1,
						bgcolor: "background.paper",
					},
				},
			}}
		>
			<Toolbar sx={{ px: 1, minHeight: theme.mixins.toolbar.minHeight }}>
				{open && (
					<NavLink
						to="/"
						style={{
							display: "flex",
							alignItems: "center",
							textDecoration: "none",
						}}
					>
						<WarehouseIcon sx={{ fontSize: 28, color: "primary.main", mr: 1 }} />
						<ListItemText primary="Warehouse" primaryTypographyProps={{ fontWeight: 600 }} />
					</NavLink>
				)}
			</Toolbar>

			<Divider />

			<Box display="flex" flexDirection="column" height="100%">
				<List disablePadding sx={{ mt: 1.5 }}>
					{menuItems.map((item) => {
						const childActive = item.children?.some((c) => location.pathname.startsWith(c.to));
						const parentExpanded = open && groups[item.label];
						const parentOpacity = parentExpanded ? 0.05 : 0.15;

						return (
							<Fragment key={item.label}>
								<NavItem
									icon={<item.icon />}
									label={item.label}
									to={item.to}
									onClick={item.children ? () => handleToggleGroup(item.label) : undefined}
									trailing={
										item.children && open ? (
											groups[item.label] ? (
												<ExpandLessIcon fontSize="small" />
											) : (
												<ExpandMoreIcon fontSize="small" />
											)
										) : undefined
									}
									isSelected={childActive}
									selectedBgOpacity={childActive ? parentOpacity : undefined}
									drawerOpen={open}
								/>

								{item.children && (
									<Collapse in={open && groups[item.label]} timeout="auto" unmountOnExit>
										<List disablePadding>
											{item.children.map((child) => (
												<NavItem
													key={child.label}
													label={child.label}
													to={child.to}
													inset
													drawerOpen={open}
												/>
											))}
										</List>
									</Collapse>
								)}
							</Fragment>
						);
					})}
				</List>

				<Divider sx={{ mt: "auto" }} />

				<List disablePadding>
					<NavItem
						icon={<SettingsIcon />}
						label={translate("sidebar.settings")}
						to="/settings"
						drawerOpen={open}
					/>
					<NavItem
						icon={<LogoutIcon />}
						label={translate("sidebar.logout")}
						to="/logout"
						drawerOpen={open}
					/>
				</List>
			</Box>
		</Drawer>
	);
}
