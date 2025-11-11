import { ElementType } from "react";
import { translate } from "i18n/i18n";

import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";

export interface ChildMenuItem {
	label: string;
	to: string;
}

export interface MenuItem {
	label: string;
	icon: ElementType;
	to?: string;
	children?: ChildMenuItem[];
}

export const menuItems: MenuItem[] = [
	{ label: translate("sidebar.dashboard"), to: "/", icon: DashboardOutlinedIcon },

	{
		label: translate("sidebar.production"),
		icon: Inventory2OutlinedIcon,
		children: [
			{ label: translate("sidebar.products"), to: "/products" },
			{ label: translate("sidebar.categories"), to: "/categories" },
		],
	},

	{
		label: translate("sidebar.transactions"),
		icon: SwapHorizOutlinedIcon,
		children: [
			{ label: translate("sidebar.partners"), to: "/partners" },
			{ label: translate("sidebar.sales"), to: "/sales" },
			{ label: translate("sidebar.supplies"), to: "/supplies" },
			{ label: translate("sidebar.templates"), to: "/templates" },
		],
	},

	{
		label: translate("sidebar.finance"),
		icon: MonetizationOnOutlinedIcon,
		children: [
			{ label: translate("sidebar.payments"), to: "/payments" },
			{ label: translate("sidebar.debts"), to: "/finances/debts" },
		],
	},

	{
		label: translate("sidebar.personnel"),
		icon: PeopleAltOutlinedIcon,
		children: [
			{ label: translate("sidebar.employees"), to: "/employees" },
			{ label: translate("sidebar.salaries"), to: "/payrolls" },
		],
	},

	{ label: "Отчёты", to: translate("sidebar.reports"), icon: BarChartOutlinedIcon },
];
