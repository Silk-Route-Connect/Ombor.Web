import React from "react";
import { useTranslation } from "react-i18next";
import ExportButton from "components/shared/Buttons/ExportButton";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";

import AddIcon from "@mui/icons-material/Add";
import WarehouseOutlinedIcon from "@mui/icons-material/WarehouseOutlined";
import { Box } from "@mui/material";

/** Archive view: the «Активные | Архив» segmented control swaps the whole list. */
type ArchiveView = "active" | "archived";

interface WarehouseHeaderProps {
	/** The page's summary cards — under the title row, above the filters (pattern 11). */
	summary?: React.ReactNode;
	searchValue: string;
	showArchived: boolean;
	archivedCount: number;
	onSearch: (value: string) => void;
	onToggleArchived: (show: boolean) => void;
	onCreate: () => void;
	onExport: () => void;
	/** Rows the export would write (the filtered list). */
	exportCount: number;
}

/**
 * Warehouses page header. Per locked pattern 11: dataset-level actions (create,
 * «Экспорт») sit on the title row; the view-shaping search + «Активные | Архив»
 * segmented control sit on the filter row below (mirrors PartnerListHeader).
 */
const WarehouseHeader: React.FC<WarehouseHeaderProps> = ({
	summary,
	searchValue,
	showArchived,
	archivedCount,
	onSearch,
	onToggleArchived,
	onCreate,
	onExport,
	exportCount,
}) => {
	const { t } = useTranslation();

	const title = t("warehouse.title");

	return (
		<>
			<PageHeader
				title={title}
				icon={WarehouseOutlinedIcon}
				subtitle={t("page.intro.warehouses")}
				actions={
					<>
						<ExportButton onExport={onExport} rowCount={exportCount} />
						<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
							{t("warehouse.create")}
						</PrimaryButton>
					</>
				}
			/>

			{summary}

			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
				<SearchInput
					value={searchValue}
					onChange={onSearch}
					placeholder={t("warehouse.searchPlaceholder")}
				/>

				<Box sx={{ flexGrow: 1 }} />

				<SegmentedControl<ArchiveView>
					value={showArchived ? "archived" : "active"}
					onChange={(view) => onToggleArchived(view === "archived")}
					options={[
						{ value: "active", label: t("warehouse.filter.active") },
						{
							value: "archived",
							label:
								archivedCount > 0
									? `${t("warehouse.filter.archive")} (${archivedCount})`
									: t("warehouse.filter.archive"),
						},
					]}
				/>
			</Box>
		</>
	);
};

export default WarehouseHeader;
