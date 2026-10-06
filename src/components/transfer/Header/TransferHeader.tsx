import React from "react";
import { useTranslation } from "react-i18next";
import ExportButton from "components/shared/Buttons/ExportButton";
import DateRangeFilter from "components/shared/Date/DateRangeFilter";
import EntityFilterSelect from "components/shared/EntityFilterSelect/EntityFilterSelect";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { Warehouse } from "models/warehouse";
import { DateRangeValue } from "utils/dateRange";

import AddIcon from "@mui/icons-material/Add";
import SwapHorizOutlinedIcon from "@mui/icons-material/SwapHorizOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box } from "@mui/material";

interface TransferHeaderProps {
	warehouses: Warehouse[];
	warehouseFilter: number | null;
	onWarehouseChange: (warehouseId: number | null) => void;
	search: string;
	onSearchChange: (value: string) => void;
	dateRange: DateRangeValue;
	onDateRangeChange: (range: DateRangeValue) => void;
	onCreate: () => void;
	onExport: () => void;
	/** Rows the export would write (the filtered list). */
	exportCount: number;
}

const ALL_WAREHOUSES = "__all__";

/**
 * Transfers page header. Dataset-level actions (create, «Экспорт») on the title
 * row; search, the warehouse filter and the period on the row below (locked
 * pattern 11). The warehouse filter matches a source OR a destination.
 */
const TransferHeader: React.FC<TransferHeaderProps> = ({
	warehouses,
	warehouseFilter,
	onWarehouseChange,
	search,
	onSearchChange,
	dateRange,
	onDateRangeChange,
	onCreate,
	onExport,
	exportCount,
}) => {
	const { t } = useTranslation();

	const title = t("transfer.title");

	return (
		<>
			<PageHeader
				title={title}
				icon={SwapHorizOutlinedIcon}
				subtitle={t("page.intro.transfers")}
				actions={
					<>
						<ExportButton onExport={onExport} rowCount={exportCount} />
						<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
							{t("transfer.create")}
						</PrimaryButton>
					</>
				}
			/>

			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
				<SearchInput
					value={search}
					onChange={onSearchChange}
					placeholder={t("transfer.searchPlaceholder")}
				/>
				<EntityFilterSelect
					label={t("transfer.filter.warehouseLabel")}
					value={warehouseFilter == null ? ALL_WAREHOUSES : String(warehouseFilter)}
					allValue={ALL_WAREHOUSES}
					allLabel={t("transfer.filter.allWarehouses")}
					options={warehouses.map((warehouse) => ({
						value: String(warehouse.id),
						label: warehouse.name,
					}))}
					onChange={(v) => onWarehouseChange(v === ALL_WAREHOUSES ? null : Number(v))}
					icon={<WarehouseOutlinedIcon />}
				/>

				<Box sx={{ flexGrow: 1 }} />
				<DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
			</Box>
		</>
	);
};

export default TransferHeader;
