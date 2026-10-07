import React from "react";
import { useTranslation } from "react-i18next";
import StatCard from "components/shared/StatCard/StatCard";
import StatCardGrid from "components/shared/StatCard/StatCardGrid";
import { Warehouse } from "models/warehouse";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface WarehouseKpisProps {
	warehouse: Warehouse;
	/** The served `lowStockCount` of this warehouse; null until the stock report is in. */
	lowStock: number | null;
	/** Opens «Остатки» filtered «Заканчивается»; omit while the tab is not shown. */
	onLowStock?: () => void;
}

/**
 * Three summary KPI cards: products, «Заканчивается» (rows at or below the
 * product's «Минимальный остаток», out of stock included — the served count,
 * which opens the «Остатки» rows it counts) and the stock value (WAC).
 */
export const WarehouseKpis: React.FC<WarehouseKpisProps> = ({
	warehouse,
	lowStock,
	onLowStock,
}) => {
	const { t } = useTranslation();
	const dash = t("common.dash");

	return (
		<StatCardGrid columns={3}>
			<StatCard
				icon={<Inventory2OutlinedIcon />}
				tone="neutral"
				caption={t("warehouse.kpi.products")}
				value={formatQuantity(warehouse.productCount)}
				footer={t("warehouse.kpi.productsSub", { count: warehouse.productCount })}
			/>
			<StatCard
				icon={<TrendingDownIcon />}
				tone="warning"
				caption={t("warehouse.lowStock.title")}
				hint={onLowStock ? true : t("warehouse.lowStock.hint")}
				tooltip={onLowStock ? t("warehouse.lowStock.hint") : undefined}
				value={lowStock === null ? dash : formatQuantity(lowStock)}
				footer={t("warehouse.kpi.lowStockSub")}
				onClick={onLowStock}
			/>
			<StatCard
				icon={<PaymentsOutlinedIcon />}
				tone="primary"
				caption={t("warehouse.kpi.value")}
				value={formatCurrency(warehouse.stockValue)}
				unit="uzs"
				footer={t("warehouse.kpi.valueSub")}
			/>
		</StatCardGrid>
	);
};

export default WarehouseKpis;
