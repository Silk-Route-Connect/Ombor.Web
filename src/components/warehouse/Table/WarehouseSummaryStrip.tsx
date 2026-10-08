import React from "react";
import { useTranslation } from "react-i18next";
import StatCard from "components/shared/StatCard/StatCard";
import StatCardGrid from "components/shared/StatCard/StatCardGrid";
import { isReady, Loadable } from "helpers/Loading";
import { StockReport } from "models/report";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

interface WarehouseSummaryStripProps {
	/** The served stock report over every warehouse, archived ones included (rule 31). */
	report: Loadable<StockReport>;
	/** Opens the stock report over every warehouse filtered «Остаток: Заканчивается». */
	onLowStock: () => void;
}

/**
 * List summary strip over every warehouse, all served by the stock report:
 * distinct products in stock (a product held in two warehouses is one product),
 * «Заканчивается» — `totals.lowStockCount`, the rows with a threshold at or
 * below it over all warehouses (DR-41), which the card opens in the report —
 * and the stock value. «—» until the report is in.
 */
export const WarehouseSummaryStrip: React.FC<WarehouseSummaryStripProps> = ({
	report: reportState,
	onLowStock,
}) => {
	const { t } = useTranslation();
	const dash = t("common.dash");
	const report = isReady(reportState) ? reportState : null;

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
				value={report ? formatQuantity(report.totals.lowStockCount) : dash}
				footer={t("warehouse.summary.lowStockSub")}
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
