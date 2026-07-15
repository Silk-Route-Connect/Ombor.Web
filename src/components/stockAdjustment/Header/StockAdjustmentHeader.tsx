import React from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { Warehouse } from "models/warehouse";
import { DirectionFilter } from "stores/StockAdjustmentStore";
import { designTokens } from "theme";

import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box, MenuItem, TextField } from "@mui/material";

interface StockAdjustmentHeaderProps {
	totalCount: number | null;
	searchValue: string;
	warehouses: Warehouse[];
	warehouseFilter: number | null;
	directionFilter: DirectionFilter;
	onSearch: (value: string) => void;
	onWarehouseChange: (warehouseId: number | null) => void;
	onDirectionChange: (filter: DirectionFilter) => void;
	onCreate: () => void;
	onExport: () => void;
}

const ALL_WAREHOUSES = "__all__";
const DIRECTION_TABS: DirectionFilter[] = ["all", "Decrease", "Increase"];

/**
 * Stock-adjustments page header. Dataset-level actions (create, «Экспорт») on the
 * title row; view-shaping search + warehouse + direction filters on the row
 * below (locked pattern 11).
 */
const StockAdjustmentHeader: React.FC<StockAdjustmentHeaderProps> = ({
	totalCount,
	searchValue,
	warehouses,
	warehouseFilter,
	directionFilter,
	onSearch,
	onWarehouseChange,
	onDirectionChange,
	onCreate,
	onExport,
}) => {
	const { t } = useTranslation();

	const title =
		totalCount == null ? t("adjustment.title") : `${t("adjustment.title")} (${totalCount})`;

	return (
		<>
			<PageHeader
				title={title}
				actions={
					<>
						<GhostButton
							icon={<FileDownloadOutlinedIcon sx={{ fontSize: "17px !important" }} />}
							onClick={onExport}
						>
							{t("common.export")}
						</GhostButton>
						<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
							{t("adjustment.create")}
						</PrimaryButton>
					</>
				}
			/>

			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
				<SearchInput
					value={searchValue}
					onChange={onSearch}
					placeholder={t("adjustment.searchPlaceholder")}
				/>

				<TextField
					select
					size="small"
					value={warehouseFilter == null ? ALL_WAREHOUSES : String(warehouseFilter)}
					onChange={(e) =>
						onWarehouseChange(e.target.value === ALL_WAREHOUSES ? null : Number(e.target.value))
					}
					sx={{
						width: 200,
						"& .MuiOutlinedInput-root": { bgcolor: "background.paper" },
						"& .MuiOutlinedInput-notchedOutline": { borderColor: designTokens.gray300 },
					}}
					slotProps={{
						input: {
							startAdornment: (
								<WarehouseOutlinedIcon sx={{ fontSize: 16, color: "text.disabled", mr: "6px" }} />
							),
						},
					}}
				>
					<MenuItem value={ALL_WAREHOUSES}>{t("adjustment.filter.allWarehouses")}</MenuItem>
					{warehouses.map((warehouse) => (
						<MenuItem key={warehouse.id} value={String(warehouse.id)}>
							{warehouse.name}
						</MenuItem>
					))}
				</TextField>

				<SegmentedControl<DirectionFilter>
					options={DIRECTION_TABS.map((tab) => ({
						value: tab,
						label: t(`adjustment.filter.direction.${tab}`),
					}))}
					value={directionFilter}
					onChange={onDirectionChange}
				/>

				<Box sx={{ flexGrow: 1 }} />
			</Box>
		</>
	);
};

export default StockAdjustmentHeader;
