import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import StatCard from "components/shared/StatCard/StatCard";
import StatCardGrid from "components/shared/StatCard/StatCardGrid";
import { isReady, Loadable } from "helpers/Loading";
import { Product } from "models/product";
import { StockReport } from "models/report";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";
import { countStockAlerts, stockAlerts } from "utils/stockAlerts";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface WarehouseSummaryStripProps {
	/** The served stock report over every warehouse, archived ones included (rule 31). */
	report: Loadable<StockReport>;
	/** Products with their served `isLowStock` — the source of the dashboard «Заканчивается». */
	products: Loadable<Product[]>;
	/** Opens Products filtered «Остаток: Заканчивается». */
	onLowStock: () => void;
}

/**
 * List summary strip over every warehouse: distinct products in stock and the
 * stock value, both served by the stock report (a product held in two
 * warehouses is one product), and «Заканчивается» — the very set the dashboard
 * panel and Products «Остаток: Заканчивается» show (served `isLowStock` on the
 * total across warehouses), which the card opens. «—» until each source is in.
 */
export const WarehouseSummaryStrip: React.FC<WarehouseSummaryStripProps> = ({
	report: reportState,
	products,
	onLowStock,
}) => {
	const { t } = useTranslation();
	const dash = t("common.dash");
	const report = isReady(reportState) ? reportState : null;
	const lowStock = useMemo(
		() => (isReady(products) ? countStockAlerts(stockAlerts(products)) : null),
		[products],
	);

	return (
		<StatCardGrid columns={3}>
			<StatCard
				icon={<Inventory2OutlinedIcon />}
				tone="neutral"
				caption={t("warehouse.summary.products")}
				value={report ? formatQuantity(report.totals.productCount) : dash}
				footer={t("warehouse.summary.productsSub")}
			/>
			<StatCard
				icon={<TrendingDownIcon />}
				tone="warning"
				caption={t("warehouse.lowStock.title")}
				hint
				tooltip={t("warehouse.summary.lowStockHint")}
				value={lowStock ? formatQuantity(lowStock.total) : dash}
				footer={lowStock ? t("warehouse.summary.lowStockSub", { count: lowStock.out }) : dash}
				onClick={onLowStock}
			/>
			<StatCard
				icon={<PaymentsOutlinedIcon />}
				tone="primary"
				caption={t("warehouse.summary.value")}
				value={report ? formatCurrency(report.totals.value) : dash}
				unit={report ? "uzs" : undefined}
				footer={t("warehouse.summary.valueSub")}
			/>
		</StatCardGrid>
	);
};

export default WarehouseSummaryStrip;
