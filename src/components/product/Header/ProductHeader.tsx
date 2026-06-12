import React from "react";
import { useTranslation } from "react-i18next";
import CategoryAutocomplete from "components/category/Autocomplete/CategoryAutocomplete";
import GhostButton from "components/shared/Buttons/GhostButton";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { Category } from "models/category";
import { ProductTypeFilter } from "stores/ProductStore";
import { designTokens, numericSx } from "theme";

import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Box, ButtonBase } from "@mui/material";

interface ProductHeaderProps {
	/** Total dataset size (unfiltered, archived included) shown in the title. */
	totalCount: number | null;
	searchValue: string;
	selectedCategory: Category | null;
	typeFilter: ProductTypeFilter;
	showArchived: boolean;
	archivedCount: number;
	onSearch: (value: string) => void;
	onCategoryChange: (category: Category | null) => void;
	onTypeChange: (filter: ProductTypeFilter) => void;
	onToggleArchived: (show: boolean) => void;
	onCreate: () => void;
	onExport: () => void;
}

const TYPE_TABS: ProductTypeFilter[] = ["all", "sale", "supply", "both"];

/**
 * Archive toggle per the bundle's `.arch-toggle`: a white card (40px tall,
 * border-strong outline) holding a 30×18 switch pill, the label, and the
 * archived-count figure; the active state tints the card primary-soft.
 */
const ArchiveToggle: React.FC<{
	on: boolean;
	count: number;
	onToggle: (show: boolean) => void;
}> = ({ on, count, onToggle }) => {
	const { t } = useTranslation();

	return (
		<ButtonBase
			onClick={() => onToggle(!on)}
			title={t("product.filter.archiveTooltip")}
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
			{t("product.filter.archive")}
			{count > 0 && (
				<Box component="span" sx={{ ...numericSx, fontWeight: 700 }}>
					{count}
				</Box>
			)}
		</ButtonBase>
	);
};

/**
 * Products page header. Per locked pattern 11: dataset-level actions (create,
 * «Экспорт») sit on the title row; view-shaping controls (search, category
 * typeahead, type tabs, archive toggle) sit on the filter row below.
 */
const ProductHeader: React.FC<ProductHeaderProps> = ({
	totalCount,
	searchValue,
	selectedCategory,
	typeFilter,
	showArchived,
	archivedCount,
	onSearch,
	onCategoryChange,
	onTypeChange,
	onToggleArchived,
	onCreate,
	onExport,
}) => {
	const { t } = useTranslation();

	const title = totalCount == null ? t("product.title") : `${t("product.title")} (${totalCount})`;

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
							{t("product.create")}
						</PrimaryButton>
					</>
				}
			/>

			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
				<SearchInput
					value={searchValue}
					onChange={onSearch}
					placeholder={t("product.searchPlaceholder")}
					sx={{ width: { xs: "100%", sm: 300 } }}
				/>

				{/* Entity filters are typeahead (convention); small fixed sets stay tabs. */}
				<CategoryAutocomplete
					mode="entity"
					value={selectedCategory}
					size="small"
					label=""
					placeholder={t("product.filter.allCategories")}
					sx={{
						width: 220,
						// Bundle .sdrop-trig: surface bg with the strong border.
						"& .MuiOutlinedInput-root": { bgcolor: "background.paper" },
						"& .MuiOutlinedInput-notchedOutline": { borderColor: designTokens.gray300 },
					}}
					onChange={onCategoryChange}
				/>

				<SegmentedControl<ProductTypeFilter>
					options={TYPE_TABS.map((tab) => ({ value: tab, label: t(`product.filter.type.${tab}`) }))}
					value={typeFilter}
					onChange={onTypeChange}
				/>

				<Box sx={{ flexGrow: 1 }} />

				<ArchiveToggle on={showArchived} count={archivedCount} onToggle={onToggleArchived} />
			</Box>
		</>
	);
};

export default ProductHeader;
