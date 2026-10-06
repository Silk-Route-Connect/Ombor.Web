import React from "react";
import { useTranslation } from "react-i18next";
import StatCard from "components/shared/StatCard/StatCard";
import StatCardGrid from "components/shared/StatCard/StatCardGrid";
import StatUnit from "components/shared/StatCard/StatUnit";
import { Warehouse } from "models/warehouse";
import { formatCurrency, formatQuantity } from "utils/formatCurrency";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";

interface WarehouseKpisProps {
	warehouse: Warehouse;
}

/** Three summary KPI cards per the bundle: products, units, stock value (WAC). */
export const WarehouseKpis: React.FC<WarehouseKpisProps> = ({ warehouse }) => {
	const { t } = useTranslation();

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
				icon={<LayersOutlinedIcon />}
				tone="neutral"
				caption={t("warehouse.kpi.units")}
				value={formatQuantity(warehouse.totalUnits)}
				unit={<StatUnit>{t("warehouse.kpi.unitsSuffix")}</StatUnit>}
				footer={t("warehouse.kpi.unitsSub")}
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
