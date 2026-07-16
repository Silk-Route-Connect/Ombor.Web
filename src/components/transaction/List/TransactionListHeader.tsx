import React from "react";
import { useTranslation } from "react-i18next";
import FilterDropdown from "components/partner/Detail/FilterDropdown";
import GhostButton from "components/shared/Buttons/GhostButton";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { DateRangeFilter, StatusFilter } from "stores/TransactionStore";
import { TransactionDirection } from "utils/transactionUtils";

import AddIcon from "@mui/icons-material/Add";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { Box } from "@mui/material";

interface TransactionListHeaderProps {
	direction: TransactionDirection;
	searchValue: string;
	statusFilter: StatusFilter;
	dateRange: DateRangeFilter;
	onSearch: (value: string) => void;
	onStatusChange: (status: StatusFilter) => void;
	onDateRangeChange: (range: DateRangeFilter) => void;
	onCreate: () => void;
	onExport: () => void;
}

export const TransactionListHeader: React.FC<TransactionListHeaderProps> = ({
	direction,
	searchValue,
	statusFilter,
	dateRange,
	onSearch,
	onStatusChange,
	onDateRangeChange,
	onCreate,
	onExport,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<PageHeader
				title={t(`transaction.list.title.${direction}`)}
				actions={
					<>
						<GhostButton
							icon={<FileDownloadOutlinedIcon sx={{ fontSize: "17px !important" }} />}
							onClick={onExport}
						>
							{t("transaction.list.exportCsv")}
						</GhostButton>
						<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
							{t(`transaction.list.new.${direction}`)}
						</PrimaryButton>
					</>
				}
			/>

			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
				<SearchInput
					value={searchValue}
					onChange={onSearch}
					placeholder={t(`transaction.list.search.${direction}`)}
				/>
				<SegmentedControl<StatusFilter>
					value={statusFilter}
					onChange={onStatusChange}
					options={[
						{ value: "all", label: t("transaction.statusFilter.all") },
						{ value: "Open", label: t("transaction.statusShort.Open") },
						{ value: "PartiallyPaid", label: t("transaction.statusShort.PartiallyPaid") },
						{ value: "Overdue", label: t("transaction.statusShort.Overdue") },
						{ value: "Closed", label: t("transaction.statusShort.Closed") },
					]}
				/>
				<Box sx={{ flexGrow: 1 }} />
				<FilterDropdown<DateRangeFilter>
					label={t("transaction.col.date")}
					icon={<CalendarTodayOutlinedIcon sx={{ fontSize: 15 }} />}
					value={dateRange}
					onChange={onDateRangeChange}
					options={[
						{ value: "all", label: t("transaction.range.all") },
						{ value: "7", label: t("transaction.range.7") },
						{ value: "30", label: t("transaction.range.30") },
						{ value: "90", label: t("transaction.range.90") },
					]}
				/>
			</Box>
		</>
	);
};

export default TransactionListHeader;
