import React from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";

import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Box } from "@mui/material";

/** Archive view: the «Активные | Архив» segmented control swaps the whole list. */
type ArchiveView = "active" | "archived";

interface WarehouseHeaderProps {
	/** Total dataset size (unfiltered, archived included) shown in the title. */
	totalCount: number | null;
	searchValue: string;
	showArchived: boolean;
	archivedCount: number;
	onSearch: (value: string) => void;
	onToggleArchived: (show: boolean) => void;
	onCreate: () => void;
	onExport: () => void;
}

/**
 * Warehouses page header. Per locked pattern 11: dataset-level actions (create,
 * «Экспорт») sit on the title row; the view-shaping search + «Активные | Архив»
 * segmented control sit on the filter row below (mirrors PartnerListHeader).
 */
const WarehouseHeader: React.FC<WarehouseHeaderProps> = ({
	totalCount,
	searchValue,
	showArchived,
	archivedCount,
	onSearch,
	onToggleArchived,
	onCreate,
	onExport,
}) => {
	const { t } = useTranslation();

	const title =
		totalCount == null ? t("warehouse.title") : `${t("warehouse.title")} (${totalCount})`;

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
							{t("warehouse.create")}
						</PrimaryButton>
					</>
				}
			/>

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
