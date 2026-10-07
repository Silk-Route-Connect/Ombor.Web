import React, { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { PATHS } from "routing/paths";
import { layout } from "theme";

import { Box, Collapse, List, useMediaQuery } from "@mui/material";

import { NavItem, navItems } from "../config";
import {
	isRouteActive,
	NARROW_VIEWPORT_QUERY,
	POS_ROUTES,
	readExpanded,
	writeExpanded,
} from "./navState";
import RailButton from "./RailButton";
import RailGroup from "./RailGroup";
import SidebarBrand from "./SidebarBrand";
import SidebarFooter from "./SidebarFooter";
import { asideSx, navListSx, navScrollSx, RAIL_WIDTH, SIDEBAR_WIDTH, subListSx } from "./styles";
import SubItem from "./SubItem";
import TopLevelItem from "./TopLevelItem";

export { SIDEBAR_WIDTH } from "./styles";

/**
 * The app's navigation panel — the brand's one large teal surface: a flat
 * two-tier list (pattern 10) that collapses to a 72px icon rail.
 */
const Sidebar: React.FC = () => {
	const { t } = useTranslation();
	const routerNavigate = useNavigate();
	const navigate = (to: string) => {
		void routerNavigate(to);
	};
	const { pathname } = useLocation();
	const narrow = useMediaQuery(NARROW_VIEWPORT_QUERY, { noSsr: true });
	const autoCollapse = narrow || POS_ROUTES.has(pathname);

	// Start collapsed when auto-collapse applies (avoids an expand→collapse flash).
	const [expanded, setExpandedState] = useState(() => (autoCollapse ? false : readExpanded()));
	const setExpanded = (value: boolean) => {
		setExpandedState(value);
		writeExpanded(value);
	};

	// Groups the user opened stay open while navigating; the group owning
	// the current route is expanded additively, never collapsing others.
	const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() =>
		Object.fromEntries(navItems.filter((i) => i.defaultOpen).map((i) => [i.labelKey, true])),
	);

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

	// Collapse to the rail on the dense POS pages and narrow viewports; elsewhere
	// reflect the saved preference. The auto-collapse is NOT persisted, so a manual
	// toggle wins until the next navigation and the stored choice comes back once
	// the reason (POS page / narrow window) is gone.
	useEffect(() => {
		setExpandedState(autoCollapse ? false : readExpanded());
	}, [pathname, autoCollapse]);

	// Publishes the panel's width so toasts sit past it, never over «Настройки».
	useEffect(() => {
		const root = document.documentElement;
		root.style.setProperty(layout.sidebarWidthVar, `${expanded ? SIDEBAR_WIDTH : RAIL_WIDTH}px`);
		return () => {
			root.style.removeProperty(layout.sidebarWidthVar);
		};
	}, [expanded]);

	const toggleGroup = (labelKey: string) =>
		setExpandedGroups((prev) => ({ ...prev, [labelKey]: !prev[labelKey] }));

	// Collapsed → clicking a parent icon expands the rail straight into that group.
	const expandInto = (item: NavItem) => {
		setExpanded(true);
		setExpandedGroups((prev) => ({ ...prev, [item.labelKey]: true }));
	};

	return (
		<Box component="aside" sx={asideSx(expanded)}>
			<SidebarBrand expanded={expanded} onToggle={() => setExpanded(!expanded)} />

			<List
				disablePadding
				sx={{
					flex: 1,
					overflowY: "auto",
					overflowX: "hidden",
					pt: 1.25,
					...navListSx,
					...navScrollSx,
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
									<List disablePadding sx={subListSx}>
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

			<SidebarFooter
				expanded={expanded}
				settingsActive={isRouteActive(pathname, PATHS.settings)}
				onSettings={() => navigate(PATHS.settings)}
			/>
		</Box>
	);
};

export default Sidebar;
