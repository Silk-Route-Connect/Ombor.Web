import { ElementType } from "react";
import i18next from "i18n/config";

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
	{ label: i18next.t("sidebar.dashboard"), to: "/", icon: DashboardOutlinedIcon },

	{
		label: i18next.t("sidebar.production"),
		icon: Inventory2OutlinedIcon,
		children: [
			{ label: i18next.t("sidebar.products"), to: "/products" },
			{ label: i18next.t("sidebar.categories"), to: "/categories" },
		],
	},

	{
		label: i18next.t("sidebar.transactions"),
		icon: SwapHorizOutlinedIcon,
		children: [
			{ label: i18next.t("sidebar.partners"), to: "/partners" },
			{ label: i18next.t("sidebar.sales"), to: "/sales" },
			{ label: i18next.t("sidebar.supplies"), to: "/supplies" },
			{ label: i18next.t("sidebar.templates"), to: "/templates" },
		],
	},

	{
		label: i18next.t("sidebar.finance"),
		icon: MonetizationOnOutlinedIcon,
		children: [
			{ label: i18next.t("sidebar.payments"), to: "/payments" },
			{ label: i18next.t("sidebar.debts"), to: "/finances/debts" },
		],
	},

	{
		label: i18next.t("sidebar.personnel"),
		icon: PeopleAltOutlinedIcon,
		children: [
			{ label: i18next.t("sidebar.employees"), to: "/employees" },
			{ label: i18next.t("sidebar.salaries"), to: "/payrolls" },
		],
	},

	{ label: "Отчёты", to: i18next.t("sidebar.reports"), icon: BarChartOutlinedIcon },
];
