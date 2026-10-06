import React from "react";
import { useTranslation } from "react-i18next";
import StatCard from "components/shared/StatCard/StatCard";
import StatCardGrid from "components/shared/StatCard/StatCardGrid";
import StatUnit from "components/shared/StatCard/StatUnit";
import { WarehouseTotals } from "stores/WarehouseStore";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";

interface WarehouseSummaryStripProps {
	totals: WarehouseTotals;
}

/**
 * List summary strip: total inventory across ALL warehouses — including archived
 * ones that still hold stock (business-rules rule 31). The Partners-style
 * 3-card strip replaces the old in-table «Итого» row dropped when the list moved
 * onto the shared DataTable (which has no footer slot).
 */
export const WarehouseSummaryStrip: React.FC<WarehouseSummaryStripProps> = ({ totals }) => {
	const { t } = useTranslation();

	return (
		<StatCardGrid columns={3}>
			<StatCard
				icon={<Inventory2OutlinedIcon />}
				tone="neutral"
				caption={t("warehouse.summary.products")}
				value={formatQuantity(totals.productCount)}
				footer={t("warehouse.summary.productsSub", { count: totals.productCount })}
			/>
			<StatCard
				icon={<LayersOutlinedIcon />}
				tone="neutral"
				caption={t("warehouse.summary.units")}
				value={formatQuantity(totals.totalUnits)}
				unit={<StatUnit>{t("warehouse.kpi.unitsSuffix")}</StatUnit>}
				footer={t("warehouse.summary.unitsSub")}
			/>
			<StatCard
				icon={<PaymentsOutlinedIcon />}
				tone="primary"
				caption={t("warehouse.summary.value")}
				value={formatCurrency(totals.stockValue)}
				unit="uzs"
				footer={t("warehouse.summary.valueSub")}
			/>
		</StatCardGrid>
	);
};

export default WarehouseSummaryStrip;
