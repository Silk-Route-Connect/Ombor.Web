import React from "react";
import { useTranslation } from "react-i18next";
import ExportButton from "components/shared/Buttons/ExportButton";
import DateRangeFilter from "components/shared/Date/DateRangeFilter";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { StatusFilter } from "stores/TransactionStore";
import { DateRangeValue } from "utils/dateRange";
import { TransactionDirection } from "utils/transactionUtils";

import AddIcon from "@mui/icons-material/Add";
import { Box } from "@mui/material";

interface TransactionListHeaderProps {
	direction: TransactionDirection;
	searchValue: string;
	statusFilter: StatusFilter;
	dateRange: DateRangeValue;
	onSearch: (value: string) => void;
	onStatusChange: (status: StatusFilter) => void;
	onDateRangeChange: (range: DateRangeValue) => void;
	onCreate: () => void;
	onExport: () => void;
	/** Rows the export would write (the filtered feed). */
	exportCount: number;
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
	exportCount,
}) => {
	const { t } = useTranslation();

	return (
		<>
			<PageHeader
				title={t(`transaction.list.title.${direction}`)}
				actions={
					<>
						<ExportButton onExport={onExport} rowCount={exportCount} />
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
				<DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
			</Box>
		</>
	);
};

export default TransactionListHeader;
