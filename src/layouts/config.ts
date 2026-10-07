import { ElementType } from "react";
import { PATHS } from "routing/paths";

import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";

export interface ChildNavItem {
	/** i18n key — resolved at render time, never at module import. */
	labelKey: string;
	to: string;
}

export interface NavItem {
	labelKey: string;
	icon: ElementType;
	/** Direct link for items without children. */
	to?: string;
	children?: ChildNavItem[];
	/** Group starts open on a first visit — the daily-work groups a new user needs first. */
	defaultOpen?: boolean;
}

/**
 * Sidebar navigation per locked pattern 10: flat two-tier, no section-label
 * headings. Ordered by how often a shopkeeper uses it: selling and buying first,
 * then the people, money and stock behind it, then the look-back pages
 * («Отчёты», «Журнал действий»). A group with a single child is a direct link
 * instead (no extra click). «Настройки» is rendered by the Sidebar footer, not
 * listed here.
 */
export const navItems: NavItem[] = [
	{ labelKey: "sidebar.dashboard", icon: SpaceDashboardOutlinedIcon, to: PATHS.dashboard },
	{
		labelKey: "sidebar.trade",
		icon: PointOfSaleOutlinedIcon,
		defaultOpen: true,
		children: [
			{ labelKey: "sidebar.sales", to: PATHS.sales },
			{ labelKey: "sidebar.supplies", to: PATHS.supplies },
			{ labelKey: "sidebar.orders", to: PATHS.orders },
			{ labelKey: "sidebar.templates", to: PATHS.templates },
		],
	},
	{ labelKey: "sidebar.partners", icon: HandshakeOutlinedIcon, to: PATHS.partners },
	{
		labelKey: "sidebar.finance",
		icon: MonetizationOnOutlinedIcon,
		children: [
			{ labelKey: "sidebar.payments", to: PATHS.payments },
			{ labelKey: "sidebar.debts", to: PATHS.debts },
			{ labelKey: "sidebar.wallets", to: PATHS.wallets },
		],
	},
	{
		labelKey: "sidebar.production",
		icon: Inventory2OutlinedIcon,
		defaultOpen: true,
		children: [
			{ labelKey: "sidebar.products", to: PATHS.products },
			{ labelKey: "sidebar.categories", to: PATHS.categories },
		],
	},
	{
		labelKey: "sidebar.warehouse",
		icon: WarehouseOutlinedIcon,
		children: [
			{ labelKey: "sidebar.warehouses", to: PATHS.warehouses },
			{ labelKey: "sidebar.adjustments", to: PATHS.adjustments },
			{ labelKey: "sidebar.transfers", to: PATHS.transfers },
		],
	},
	{ labelKey: "sidebar.employees", icon: BadgeOutlinedIcon, to: PATHS.employees },
	{ labelKey: "sidebar.reports", icon: AssessmentOutlinedIcon, to: PATHS.reports },
	{ labelKey: "sidebar.activityLog", icon: HistoryOutlinedIcon, to: PATHS.activityLog },
];
