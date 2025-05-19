import React, { Fragment, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
	Collapse,
	Drawer,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Toolbar,
} from "@mui/material";

import { menuItems } from "./config";

const drawerWidth = 240;

export default function Sidebar() {
	const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
	const location = useLocation();

	// Auto-expand based on current URL
	useEffect(() => {
		const newOpen: Record<string, boolean> = {};
		menuItems.forEach((item) => {
			if (item.children) {
				newOpen[item.label] = item.children.some((child) => location.pathname.startsWith(child.to));
			}
		});
		setOpenGroups(newOpen);
	}, [location.pathname]);

	const handleToggle = (label: string) =>
		setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

	const commonSx = {
		mx: 1,
		borderRadius: 2,
		"&.active": { bgcolor: "action.selected" },
	};

	return (
		<Drawer
			variant="permanent"
			sx={{
				width: drawerWidth,
				flexShrink: 0,
				"& .MuiDrawer-paper": {
					width: drawerWidth,
					boxSizing: "border-box",
					borderRight: "none",
				},
			}}
		>
			<Toolbar />
			<List>
				{menuItems.map((item) => (
					<Fragment key={item.label}>
						<ListItemButton
							{...(item.to
								? { component: NavLink, to: item.to }
								: { onClick: () => handleToggle(item.label) })}
							sx={commonSx}
						>
							<ListItemIcon sx={{ color: "primary.main", minWidth: 36 }}>
								<item.icon />
							</ListItemIcon>
							<ListItemText primary={item.label} />
							{item.children && (openGroups[item.label] ? <ExpandLess /> : <ExpandMore />)}
						</ListItemButton>

						{item.children && (
							<Collapse in={openGroups[item.label]} timeout="auto" unmountOnExit>
								<List component="div" disablePadding>
									{item.children.map((child) => (
										<ListItemButton
											key={child.label}
											component={NavLink}
											to={child.to}
											sx={{ pl: 4, ...commonSx }}
										>
											<ListItemText primary={child.label} />
										</ListItemButton>
									))}
								</List>
							</Collapse>
						)}
					</Fragment>
				))}
			</List>
		</Drawer>
	);
}
