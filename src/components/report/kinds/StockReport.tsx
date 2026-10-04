import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import EntityFilterSelect from "components/shared/EntityFilterSelect/EntityFilterSelect";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { isReady, mapLoadable, readyOr } from "helpers/Loading";
import { observer } from "mobx-react-lite";
import { useStore } from "stores/StoreContext";
import { formatDate } from "utils/dateUtils";
import { StockFilter } from "utils/productFilters";
import { byLabel } from "utils/sortUtils";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";

import ReportFrame, { ReportMode } from "../Layout/ReportFrame";
import { buildStockView } from "../views/stockView";

const ALL = "all";
const STOCK_FILTERS: StockFilter[] = ["all", "low", "out"];

/**
 * «Остатки и стоимость склада» — today's stock, so no period: a warehouse filter
 * (served), plus a search and the «Остаток» filter that narrow the rows on screen.
 * Archived warehouses stay pickable — their stock still counts (rule 31).
 */
const StockReport: React.FC<{ mode: ReportMode }> = observer(({ mode }) => {
	const { t } = useTranslation();
	const { reportStore, warehouseStore } = useStore();

	useEffect(() => {
		void reportStore.open("stock");
		if (!isReady(warehouseStore.allWarehouses)) {
			void warehouseStore.getAll();
		}
	}, [reportStore, warehouseStore]);

	const warehouses = byLabel(readyOr(warehouseStore.allWarehouses, []), (w) => w.name);
	const picked = warehouses.find((w) => w.id === reportStore.stockWarehouseId);
	const warehouseLabel = picked?.name ?? t("report.stock.allWarehouses");

	const data = reportStore.stock.data;
	const rows = reportStore.filteredStockRows;
	const view = useMemo(
		() =>
			mapLoadable(data, (report) => buildStockView(report, readyOr(rows, []), warehouseLabel, t)),
		[data, rows, warehouseLabel, t],
	);

	const filters = (
		<>
			<SearchInput
				value={reportStore.stockSearch}
				onChange={reportStore.setStockSearch}
				placeholder={t("report.stock.search")}
			/>
			<EntityFilterSelect<string>
				label={t("report.group.Warehouse")}
				icon={<WarehouseOutlinedIcon />}
				value={reportStore.stockWarehouseId == null ? ALL : String(reportStore.stockWarehouseId)}
				allValue={ALL}
				allLabel={t("report.stock.allWarehouses")}
				options={warehouses.map((w) => ({
					value: String(w.id),
					label: w.isArchived ? t("report.stock.archivedWarehouse", { name: w.name }) : w.name,
				}))}
				onChange={(value) => reportStore.setStockWarehouse(value === ALL ? null : Number(value))}
			/>
			<EntityFilterSelect<StockFilter>
				label={t("product.filter.stock.label")}
				icon={<Inventory2OutlinedIcon />}
				value={reportStore.stockLevel}
				options={STOCK_FILTERS.map((filter) => ({
					value: filter,
					label: t(`product.filter.stock.${filter}`),
				}))}
				onChange={reportStore.setStockLevel}
			/>
		</>
	);

	return (
		<ReportFrame
			kind="stock"
			mode={mode}
			view={view}
			periodLabel={t("report.stock.asOf", { date: formatDate(new Date()) })}
			filters={filters}
			onRetry={() => void reportStore.reload()}
		/>
	);
});

export default StockReport;
