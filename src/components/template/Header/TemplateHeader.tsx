import React from "react";
import { useTranslation } from "react-i18next";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import SegmentedControl, {
	SegmentedOption,
} from "components/shared/SegmentedControl/SegmentedControl";
import { TemplateTypeFilter } from "stores/TemplateStore";

import AddIcon from "@mui/icons-material/Add";
import { Box } from "@mui/material";

interface TemplateHeaderProps {
	totalCount: number | null;
	searchValue: string;
	typeFilter: TemplateTypeFilter;
	onSearch: (value: string) => void;
	onTypeChange: (value: TemplateTypeFilter) => void;
	onCreate: () => void;
}

/**
 * Templates page header. Dataset-level create on the title row; the view-shaping
 * search + type segment on the row below (locked pattern 11). The prototype
 * carries no export action, so none is added.
 */
const TemplateHeader: React.FC<TemplateHeaderProps> = ({
	totalCount,
	searchValue,
	typeFilter,
	onSearch,
	onTypeChange,
	onCreate,
}) => {
	const { t } = useTranslation();

	const title = totalCount == null ? t("template.title") : `${t("template.title")} (${totalCount})`;

	const typeOptions: SegmentedOption<TemplateTypeFilter>[] = [
		{ value: "all", label: t("template.filter.all") },
		{ value: "Sale", label: t("template.type.Sale") },
		{ value: "Supply", label: t("template.type.Supply") },
	];

	return (
		<>
			<PageHeader
				title={title}
				actions={
					<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
						{t("template.create")}
					</PrimaryButton>
				}
			/>

			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
				<SearchInput
					value={searchValue}
					onChange={onSearch}
					placeholder={t("template.searchPlaceholder")}
				/>
				<SegmentedControl<TemplateTypeFilter>
					options={typeOptions}
					value={typeFilter}
					onChange={onTypeChange}
				/>
				<Box sx={{ flexGrow: 1 }} />
			</Box>
		</>
	);
};

export default TemplateHeader;
