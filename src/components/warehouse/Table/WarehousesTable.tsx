import React from "react";
import { useTranslation } from "react-i18next";
import { Column, DataTable } from "components/shared/Table/DataTable/DataTable";
import { Loadable } from "helpers/Loading";
import { Warehouse } from "models/warehouse";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box, Button, CircularProgress, Paper, Typography } from "@mui/material";

interface WarehousesTableProps {
	rows: Loadable<Warehouse[]>;
	columns: Column<Warehouse>[];
	/** True when a search narrows the view (drives the empty-state copy). */
	isFiltering: boolean;
	/** Whether any warehouse exists at all (drives the empty-state copy). */
	hasAny: boolean;
	/** Whether any active (non-archived) warehouse exists. */
	hasActive: boolean;
	showArchived: boolean;
	onOpen: (warehouse: Warehouse) => void;
	onCreate: () => void;
}

const EmptyState: React.FC<{
	variant: "filtering" | "empty" | "allArchived";
	onCreate: () => void;
}> = ({ variant, onCreate }) => {
	const { t } = useTranslation();

	const copy = {
		filtering: { title: t("warehouse.empty.searchTitle"), body: t("warehouse.empty.searchBody") },
		empty: { title: t("warehouse.empty.title"), body: t("warehouse.empty.body") },
		allArchived: {
			title: t("warehouse.empty.allArchivedTitle"),
			body: t("warehouse.empty.allArchivedBody"),
		},
	}[variant];

	return (
		<Box sx={{ p: "52px 24px 58px", textAlign: "center" }}>
			<Box
				sx={{
					width: 56,
					height: 56,
					borderRadius: 2,
					mx: "auto",
					mb: 2,
					display: "grid",
					placeItems: "center",
					bgcolor: "grey.50",
					border: 1,
					borderColor: "divider",
					color: "text.disabled",
				}}
			>
				{variant === "filtering" ? (
					<SearchIcon sx={{ fontSize: 26 }} />
				) : (
					<WarehouseOutlinedIcon sx={{ fontSize: 26 }} />
				)}
			</Box>
			<Typography variant="h2" sx={{ mb: 0.75 }}>
				{copy.title}
			</Typography>
			<Typography
				variant="body2"
				sx={{ color: "text.secondary", maxWidth: 400, mx: "auto", lineHeight: 1.6 }}
			>
				{copy.body}
			</Typography>
			{variant === "empty" && (
				<Button variant="contained" startIcon={<AddIcon />} onClick={onCreate} sx={{ mt: 2.5 }}>
					{t("warehouse.create")}
				</Button>
			)}
		</Box>
	);
};

/**
 * Warehouse list: the shared DataTable (warm bands, 52px rows, client-side sort,
 * 10/25/50 pagination) plus first-run / filtered / all-archived empty states.
 * The list-level «Итого» totals live in the summary strip above the table (the
 * DataTable has no footer slot).
 */
export const WarehousesTable: React.FC<WarehousesTableProps> = ({
	rows,
	columns,
	isFiltering,
	hasAny,
	hasActive,
	showArchived,
	onOpen,
	onCreate,
}) => {
	if (rows === "loading") {
		return (
			<Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
				<CircularProgress />
			</Box>
		);
	}

	if (rows.length === 0) {
		const variant = isFiltering
			? "filtering"
			: !hasAny
				? "empty"
				: !hasActive && !showArchived
					? "allArchived"
					: "filtering";
		return (
			<Paper
				elevation={1}
				sx={{ border: 1, borderColor: "divider", borderRadius: "12px", overflow: "hidden" }}
			>
				<EmptyState variant={variant} onCreate={onCreate} />
			</Paper>
		);
	}

	return (
		<DataTable<Warehouse>
			rows={rows}
			columns={columns}
			pagination
			rowsPerPageOptions={[10, 25, 50]}
			defaultSort={{ key: "name", order: "asc" }}
			onRowClick={onOpen}
		/>
	);
};

export default WarehousesTable;
