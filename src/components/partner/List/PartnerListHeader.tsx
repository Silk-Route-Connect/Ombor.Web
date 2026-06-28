import React from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { PartnerTypeFilter } from "stores/PartnerStore";

import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Box } from "@mui/material";

/** Archive view: the «Активные | Архив» segmented control swaps the whole list. */
type ArchiveView = "active" | "archived";

interface PartnerListHeaderProps {
	searchValue: string;
	typeFilter: PartnerTypeFilter;
	showArchived: boolean;
	archivedCount: number;
	onSearch: (value: string) => void;
	onTypeChange: (type: PartnerTypeFilter) => void;
	onToggleArchived: (show: boolean) => void;
	onCreate: () => void;
	onExport: () => void;
}

/** Partners list header (locked pattern 11): create/export on the title row, search/type/archive below. */
export const PartnerListHeader: React.FC<PartnerListHeaderProps> = ({
	searchValue,
	typeFilter,
	showArchived,
	archivedCount,
	onSearch,
	onTypeChange,
	onToggleArchived,
	onCreate,
	onExport,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<PageHeader
				title={t("partner.title")}
				actions={
					<>
						<GhostButton
							icon={<FileDownloadOutlinedIcon sx={{ fontSize: "17px !important" }} />}
							onClick={onExport}
						>
							{t("partner.list.exportCsv")}
						</GhostButton>
						<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
							{t("partner.list.create")}
						</PrimaryButton>
					</>
				}
			/>

			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
				<SearchInput
					value={searchValue}
					onChange={onSearch}
					placeholder={t("partner.list.searchPlaceholder")}
					sx={{ width: { xs: "100%", sm: 320 } }}
				/>
				<SegmentedControl<PartnerTypeFilter>
					value={typeFilter}
					onChange={onTypeChange}
					options={[
						{ value: "All", label: t("partner.filter.all") },
						{ value: "Customer", label: t("partner.filter.client") },
						{ value: "Supplier", label: t("partner.filter.supplier") },
					]}
				/>
				<Box sx={{ flexGrow: 1 }} />
				<SegmentedControl<ArchiveView>
					value={showArchived ? "archived" : "active"}
					onChange={(view) => onToggleArchived(view === "archived")}
					options={[
						{ value: "active", label: t("partner.filter.active") },
						{
							value: "archived",
							label:
								archivedCount > 0
									? `${t("partner.filter.archive")} (${archivedCount})`
									: t("partner.filter.archive"),
						},
					]}
				/>
			</Box>
		</>
	);
};

export default PartnerListHeader;
