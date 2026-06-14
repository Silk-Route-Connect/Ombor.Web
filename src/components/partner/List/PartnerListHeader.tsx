import React from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { PartnerTypeFilter } from "stores/PartnerStore";
import { designTokens, numericSx } from "theme";

import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Box, ButtonBase } from "@mui/material";

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

/** Archive toggle per the bundle's `.arch-toggle` (shared across list pages). */
const ArchiveToggle: React.FC<{
	on: boolean;
	count: number;
	onToggle: (show: boolean) => void;
}> = ({ on, count, onToggle }) => {
	const { t } = useTranslation();
	return (
		<ButtonBase
			onClick={() => onToggle(!on)}
			sx={{
				display: "inline-flex",
				alignItems: "center",
				gap: "8px",
				height: 40,
				px: "13px",
				borderRadius: "8px",
				border: "1px solid",
				borderColor: on ? designTokens.primaryLine : designTokens.gray300,
				bgcolor: on ? designTokens.primarySoft : "background.paper",
				fontSize: 13.5,
				fontWeight: 600,
				fontFamily: "inherit",
				color: on ? "primary.main" : designTokens.gray700,
				whiteSpace: "nowrap",
				"&:hover": { borderColor: on ? designTokens.primaryLine : designTokens.gray400 },
			}}
		>
			<Box
				component="span"
				sx={{
					width: 30,
					height: 18,
					borderRadius: "999px",
					bgcolor: on ? "primary.main" : designTokens.gray300,
					position: "relative",
					flex: "0 0 auto",
					"&::after": {
						content: '""',
						position: "absolute",
						top: 2,
						left: 2,
						width: 14,
						height: 14,
						borderRadius: "50%",
						bgcolor: "#fff",
						transform: on ? "translateX(12px)" : "none",
						transition: "transform .15s",
					},
				}}
			/>
			{t("partner.list.archiveToggle")}
			{count > 0 && (
				<Box component="span" sx={{ ...numericSx, fontWeight: 700 }}>
					{count}
				</Box>
			)}
		</ButtonBase>
	);
};

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
				<ArchiveToggle on={showArchived} count={archivedCount} onToggle={onToggleArchived} />
			</Box>
		</>
	);
};

export default PartnerListHeader;
