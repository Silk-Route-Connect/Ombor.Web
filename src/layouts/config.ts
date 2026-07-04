import { ElementType } from "react";
import { PATHS } from "routing/paths";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
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
}

/**
 * Sidebar navigation per design + locked pattern 10: flat two-tier,
 * no section-label headings, no «Отчёты» (v2). «Настройки» / «Выход»
 * are rendered by the Sidebar footer, not listed here.
 */
export const navItems: NavItem[] = [
	{ labelKey: "sidebar.dashboard", icon: SpaceDashboardOutlinedIcon, to: PATHS.dashboard },
	{
		// «Каталог» — intentional divergence from the bundle's «Продукция» (product decision).
		labelKey: "sidebar.production",
		icon: Inventory2OutlinedIcon,
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
	{
		labelKey: "sidebar.transactions",
		icon: SwapHorizOutlinedIcon,
		children: [
			{ labelKey: "sidebar.partners", to: PATHS.partners },
			{ labelKey: "sidebar.orders", to: PATHS.orders },
			{ labelKey: "sidebar.sales", to: PATHS.sales },
			{ labelKey: "sidebar.supplies", to: PATHS.supplies },
			{ labelKey: "sidebar.templates", to: PATHS.templates },
		],
	},
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
		labelKey: "sidebar.personnel",
		icon: PeopleOutlinedIcon,
		children: [{ labelKey: "sidebar.employees", to: PATHS.employees }],
	},
];
