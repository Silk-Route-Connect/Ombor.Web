import React from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { designTokens, numericSx } from "theme";

import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Box, ButtonBase } from "@mui/material";

interface WalletHeaderProps {
	searchValue: string;
	showArchived: boolean;
	archivedCount: number;
	onSearch: (value: string) => void;
	onToggleArchived: (show: boolean) => void;
	onCreate: () => void;
	onExport: () => void;
}

/** Archive toggle per the bundle's `.arch-toggle` (mirrors the Warehouses header). */
const ArchiveToggle: React.FC<{
	on: boolean;
	count: number;
	onToggle: (show: boolean) => void;
}> = ({ on, count, onToggle }) => {
	const { t } = useTranslation();

	return (
		<ButtonBase
			onClick={() => onToggle(!on)}
			title={t("wallet.filter.archiveTooltip")}
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
				transition: "border-color .14s, background .14s, color .14s",
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
					transition: "background .15s",
					"&::after": {
						content: '""',
						position: "absolute",
						top: 2,
						left: 2,
						width: 14,
						height: 14,
						borderRadius: "50%",
						bgcolor: "#fff",
						transition: "transform .15s",
						transform: on ? "translateX(12px)" : "none",
					},
				}}
			/>
			{t("wallet.filter.archive")}
			{count > 0 && (
				<Box component="span" sx={{ ...numericSx, fontWeight: 700 }}>
					{count}
				</Box>
			)}
		</ButtonBase>
	);
};

/**
 * Wallets («Касса») page header. Per locked pattern 11: dataset-level actions
 * (create, «Экспорт») sit on the title row; the view-shaping search + archive
 * toggle sit on the filter row below.
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
					sx={{ width: { xs: "100%", sm: 320 } }}
				/>

				<Box sx={{ flexGrow: 1 }} />

				<ArchiveToggle on={showArchived} count={archivedCount} onToggle={onToggleArchived} />
			</Box>
		</>
	);
};

export default WalletHeader;
