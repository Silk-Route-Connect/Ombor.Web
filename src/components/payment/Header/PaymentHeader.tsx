import React from "react";
import { useTranslation } from "react-i18next";
import ExportButton from "components/shared/Buttons/ExportButton";
import EntityFilterSelect, {
	FilterOption,
} from "components/shared/EntityFilterSelect/EntityFilterSelect";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { PAYMENT_TYPES, PaymentType } from "models/payment";
import { PaymentTypeFilter } from "stores/PaymentStore";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AddIcon from "@mui/icons-material/Add";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import { Box } from "@mui/material";

import { PAYMENT_TYPE_META } from "../PaymentPresentation";

interface PaymentHeaderProps {
	searchValue: string;
	typeFilter: PaymentTypeFilter;
	walletFilter: number | "all";
	walletOptions: { id: number; name: string }[];
	onSearch: (value: string) => void;
	onTypeChange: (value: PaymentTypeFilter) => void;
	onWalletChange: (value: number | "all") => void;
	onCreate: () => void;
	onExport: () => void;
	/** Rows the export would write (the filtered list). */
	exportCount: number;
}

/**
 * Payments page header. Per locked pattern 11: dataset-level actions (create,
 * «Экспорт») sit on the title row; the view-shaping search + type + wallet
 * filters sit on the filter row below (the prototype's period date filter is
 * omitted — locked pattern 12).
 */
const PaymentHeader: React.FC<PaymentHeaderProps> = ({
	searchValue,
	typeFilter,
	walletFilter,
	walletOptions,
	onSearch,
	onTypeChange,
	onWalletChange,
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

			<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
				<SearchInput
					value={searchValue}
					onChange={onSearch}
					placeholder={t("payment.searchPlaceholder")}
				/>
				<EntityFilterSelect<PaymentTypeFilter>
					icon={<LayersOutlinedIcon />}
					value={typeFilter}
					options={typeOptions}
					onChange={onTypeChange}
				/>
				<EntityFilterSelect
					icon={<AccountBalanceWalletOutlinedIcon />}
					value={String(walletFilter)}
					options={walletFilterOptions}
					onChange={(v) => onWalletChange(v === "all" ? "all" : Number(v))}
					width={210}
				/>
			</Box>
		</>
	);
};

export default PaymentHeader;
