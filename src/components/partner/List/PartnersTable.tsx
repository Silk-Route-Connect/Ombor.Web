import React from "react";
import { useTranslation } from "react-i18next";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { Column, DataTable } from "components/shared/Table/DataTable/DataTable";
import { Loadable } from "helpers/Loading";
import { Partner } from "models/partner";

import AddIcon from "@mui/icons-material/Add";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import SearchIcon from "@mui/icons-material/Search";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";

interface PartnersTableProps {
	rows: Loadable<Partner[]>;
	columns: Column<Partner>[];
	/** True when a search/type filter narrows the view (drives empty-state copy). */
	isFiltering: boolean;
	/** True when at least one active (non-archived) partner exists. */
	hasActive: boolean;
	showArchived: boolean;
	onOpen: (partner: Partner) => void;
	onCreate: () => void;
}

const EmptyState: React.FC<{ variant: "empty" | "filtering"; onCreate: () => void }> = ({
	variant,
	onCreate,
}) => {
	const { t } = useTranslation();
	const copy =
		variant === "empty"
			? { title: t("partner.empty.title"), body: t("partner.empty.body") }
			: { title: t("partner.empty.searchTitle"), body: t("partner.empty.searchBody") };

	return (
		<Box sx={{ p: "56px 24px 60px", textAlign: "center" }}>
			<Box
				sx={{
					width: 56,
					height: 56,
					borderRadius: "14px",
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
				{variant === "empty" ? (
					<PeopleOutlineIcon sx={{ fontSize: 26 }} />
				) : (
					<SearchIcon sx={{ fontSize: 26 }} />
				)}
			</Box>
			<Typography variant="h2" sx={{ mb: 0.75 }}>
				{copy.title}
			</Typography>
			<Typography
				variant="body2"
				sx={{ color: "text.secondary", maxWidth: 360, mx: "auto", lineHeight: 1.6 }}
			>
				{copy.body}
			</Typography>
			{variant === "empty" && (
				<Box sx={{ mt: 2.25 }}>
					<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
						{t("partner.list.create")}
					</PrimaryButton>
				</Box>
			)}
		</Box>
	);
};

/** Partner list table: shared DataTable with pagination, plus first-run / filtered empty states. */
export const PartnersTable: React.FC<PartnersTableProps> = ({
	rows,
	columns,
	isFiltering,
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
		const variant = !isFiltering && !hasActive && !showArchived ? "empty" : "filtering";
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
		<DataTable<Partner>
			rows={rows}
			columns={columns}
			pagination
			rowsPerPageOptions={[10, 25, 50]}
			defaultSort={{ key: "name", order: "asc" }}
			onRowClick={onOpen}
		/>
	);
};

export default PartnersTable;
