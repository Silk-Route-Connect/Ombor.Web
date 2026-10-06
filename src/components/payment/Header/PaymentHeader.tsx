import React from "react";
import { useTranslation } from "react-i18next";
import ExportButton from "components/shared/Buttons/ExportButton";
import DateRangeFilter from "components/shared/Date/DateRangeFilter";
import EntityFilterSelect, {
	FilterOption,
} from "components/shared/EntityFilterSelect/EntityFilterSelect";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import SegmentedControl from "components/shared/SegmentedControl/SegmentedControl";
import { PaymentDirection } from "models/payment";
import { PAYMENT_TYPES, PaymentType } from "models/payment";
import { PaymentTypeFilter } from "stores/PaymentStore";
import { DateRangeValue } from "utils/dateRange";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AddIcon from "@mui/icons-material/Add";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import { Box } from "@mui/material";

import { PAYMENT_TYPE_META } from "../PaymentPresentation";

interface PaymentHeaderProps {
	/** The page's summary cards — under the title row, above the filters (pattern 11). */
	summary?: React.ReactNode;
	searchValue: string;
	typeFilter: PaymentTypeFilter;
	directionFilter: PaymentDirection | "all";
	walletFilter: number | "all";
	walletOptions: { id: number; name: string }[];
	dateRange: DateRangeValue;
	onSearch: (value: string) => void;
	onTypeChange: (value: PaymentTypeFilter) => void;
	onDirectionChange: (value: PaymentDirection | "all") => void;
	onWalletChange: (value: number | "all") => void;
	onDateRangeChange: (range: DateRangeValue) => void;
	onCreate: () => void;
	onExport: () => void;
	/** Rows the export would write (the filtered list). */
	exportCount: number;
}

/**
 * Payments page header. Per locked pattern 11: dataset-level actions (create,
 * «Экспорт») sit on the title row; the view-shaping search + type + wallet
 * filters and the shared period filter sit on the filter row below.
 */
const PaymentHeader: React.FC<PaymentHeaderProps> = ({
	summary,
	searchValue,
	typeFilter,
	directionFilter,
	walletFilter,
	walletOptions,
	dateRange,
	onSearch,
	onTypeChange,
	onDirectionChange,
	onWalletChange,
	onDateRangeChange,
	onCreate,
	onExport,
	exportCount,
}) => {
	const { t } = useTranslation();

	const typeOptions: FilterOption<PaymentTypeFilter>[] = [
		{ value: "all", label: t("payment.filter.allTypes") },
		...PAYMENT_TYPES.map((type: PaymentType) => ({
			value: type,
			label: t(PAYMENT_TYPE_META[type].labelKey),
		})),
	];

	const walletFilterOptions: FilterOption[] = [
		{ value: "all", label: t("payment.filter.allWallets") },
		...walletOptions.map((w) => ({ value: String(w.id), label: w.name })),
	];

	return (
		<>
			<PageHeader
				title={t("payment.title")}
				actions={
					<>
						<ExportButton onExport={onExport} rowCount={exportCount} />
						<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
							{t("payment.create")}
						</PrimaryButton>
					</>
				}
			/>

			{summary}

			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
				<SearchInput
					value={searchValue}
					onChange={onSearch}
					placeholder={t("payment.searchPlaceholder")}
				/>
				<SegmentedControl<PaymentDirection | "all">
					options={[
						{ value: "all", label: t("payment.direction.All") },
						{ value: "Income", label: t("payment.direction.Income") },
						{ value: "Expense", label: t("payment.direction.Expense") },
					]}
					value={directionFilter}
					onChange={onDirectionChange}
				/>
				<EntityFilterSelect<PaymentTypeFilter>
					label={t("payment.filter.typeLabel")}
					icon={<LayersOutlinedIcon />}
					value={typeFilter}
					options={typeOptions}
					onChange={onTypeChange}
				/>
				<EntityFilterSelect
					label={t("payment.filter.walletLabel")}
					icon={<AccountBalanceWalletOutlinedIcon />}
					value={String(walletFilter)}
					options={walletFilterOptions}
					onChange={(v) => onWalletChange(v === "all" ? "all" : Number(v))}
				/>
				<Box sx={{ flexGrow: 1 }} />
				<DateRangeFilter value={dateRange} onChange={onDateRangeChange} />
			</Box>
		</>
	);
};

export default PaymentHeader;
