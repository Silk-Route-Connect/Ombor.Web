import { ElementType } from "react";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
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
	{ label: "Главное", to: "/", icon: DashboardOutlinedIcon },

	{
		label: "Продукция",
		icon: Inventory2OutlinedIcon,
		children: [
			{ label: "Товары", to: "/products" },
			{ label: "Категории", to: "/categories" },
			{ label: "Теги", to: "/tags" },
		],
	},

	{
		label: "Партнёры",
		icon: GroupOutlinedIcon,
		children: [
			{ label: "Клиенты", to: "/customers" },
			{ label: "Поставщики", to: "/suppliers" },
		],
	},

	{
		label: "Транзакции",
		icon: SwapHorizOutlinedIcon,
		children: [
			{ label: "Продажи", to: "/sales" },
			{ label: "Поставки", to: "/supplies" },
		],
	},

	{
		label: "Финансы",
		icon: MonetizationOnOutlinedIcon,
		children: [
			{ label: "Доходы", to: "/finances/incomes" },
			{ label: "Расходы", to: "/finances/expenses" },
			{ label: "Долги", to: "/finances/debts" },
		],
	},

	{
		label: "Кадры",
		icon: PeopleAltOutlinedIcon,
		children: [
			{ label: "Сотрудники", to: "/employees" },
			{ label: "Зарплаты", to: "/payroll" },
		],
	},

	{ label: "Отчёты", to: "/reports", icon: BarChartOutlinedIcon },
	{ label: "Настройки", to: "/settings", icon: SettingsOutlinedIcon },
];
