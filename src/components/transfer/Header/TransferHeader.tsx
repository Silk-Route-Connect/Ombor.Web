import React from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { Warehouse } from "models/warehouse";
import { designTokens } from "theme";

import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box, MenuItem, TextField } from "@mui/material";

interface TransferHeaderProps {
	totalCount: number | null;
	warehouses: Warehouse[];
	warehouseFilter: number | null;
	onWarehouseChange: (warehouseId: number | null) => void;
	search: string;
	onSearchChange: (value: string) => void;
	onCreate: () => void;
	onExport: () => void;
}

const ALL_WAREHOUSES = "__all__";

/**
 * Transfers page header. Dataset-level actions (create, «Экспорт») on the title
 * row; the view-shaping warehouse filter on the row below (locked pattern 11).
 * The filter matches a warehouse appearing as source OR destination.
 */
const TransferHeader: React.FC<TransferHeaderProps> = ({
	totalCount,
	warehouses,
	warehouseFilter,
	onWarehouseChange,
	search,
	onSearchChange,
	onCreate,
	onExport,
}) => {
	const { t } = useTranslation();

	const title = totalCount == null ? t("transfer.title") : `${t("transfer.title")} (${totalCount})`;

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
				<TextField
					select
					size="small"
					value={warehouseFilter == null ? ALL_WAREHOUSES : String(warehouseFilter)}
					onChange={(e) =>
						onWarehouseChange(e.target.value === ALL_WAREHOUSES ? null : Number(e.target.value))
					}
					sx={{
						width: 220,
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
					<MenuItem value={ALL_WAREHOUSES}>{t("transfer.filter.allWarehouses")}</MenuItem>
					{warehouses.map((warehouse) => (
						<MenuItem key={warehouse.id} value={String(warehouse.id)}>
							{warehouse.name}
						</MenuItem>
					))}
				</TextField>

				<Box sx={{ flexGrow: 1 }} />
			</Box>
		</>
	);
};

export default TransferHeader;
