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

interface WalletHeaderProps {
	searchValue: string;
	showArchived: boolean;
	archivedCount: number;
	onSearch: (value: string) => void;
	onToggleArchived: (show: boolean) => void;
	onCreate: () => void;
	onExport: () => void;
}

/**
 * Wallets («Касса») page header. Per locked pattern 11: dataset-level actions
 * (create, «Экспорт») sit on the title row; the view-shaping search + «Активные |
 * Архив» segmented control sit on the filter row below (archived-only, D1).
 */
const WalletHeader: React.FC<WalletHeaderProps> = ({
	searchValue,
	showArchived,
	archivedCount,
	onSearch,
	onToggleArchived,
	onCreate,
	onExport,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<PageHeader
				title={t("wallet.title")}
				actions={
					<>
						<GhostButton
							icon={<FileDownloadOutlinedIcon sx={{ fontSize: "17px !important" }} />}
							onClick={onExport}
						>
							{t("common.export")}
						</GhostButton>
						<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
							{t("wallet.create")}
						</PrimaryButton>
					</>
				}
			/>

			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
				<SearchInput
					value={searchValue}
					onChange={onSearch}
					placeholder={t("wallet.searchPlaceholder")}
				/>

				<Box sx={{ flexGrow: 1 }} />

				<SegmentedControl<ArchiveView>
					value={showArchived ? "archived" : "active"}
					onChange={(view) => onToggleArchived(view === "archived")}
					options={[
						{ value: "active", label: t("wallet.filter.active") },
						{
							value: "archived",
							label:
								archivedCount > 0
									? `${t("wallet.filter.archive")} (${archivedCount})`
									: t("wallet.filter.archive"),
						},
					]}
				/>
			</Box>
		</>
	);
};

export default WalletHeader;
