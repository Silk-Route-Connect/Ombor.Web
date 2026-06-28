import React from "react";
import { useTranslation } from "react-i18next";
import GhostButton from "components/shared/Buttons/GhostButton";
import PageHeader from "components/shared/PageHeader/PageHeader";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { PAYMENT_TYPES, PaymentType } from "models/payment";
import { PaymentTypeFilter } from "stores/PaymentStore";

import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import { Box } from "@mui/material";

import { PAYMENT_TYPE_META } from "../PaymentPresentation";
import PaymentFilterDropdown, { FilterOption } from "./PaymentFilterDropdown";

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
}) => {
	const { t } = useTranslation();

	const typeOptions: FilterOption<PaymentTypeFilter>[] = [
		{ value: "all", label: t("payment.filter.allTypes") },
		...PAYMENT_TYPES.map((type: PaymentType) => ({
			value: type,
			label: t(PAYMENT_TYPE_META[type].labelKey),
		})),
	];

	const walletFilterOptions: FilterOption<number | "all">[] = [
		{ value: "all", label: t("payment.filter.allWallets") },
		...walletOptions.map((w) => ({ value: w.id, label: w.name })),
	];

	return (
		<>
			<PageHeader
				title={t("payment.title")}
				actions={
					<>
						<GhostButton
							icon={<FileDownloadOutlinedIcon sx={{ fontSize: "17px !important" }} />}
							onClick={onExport}
						>
							{t("common.export")}
						</GhostButton>
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
					sx={{ width: { xs: "100%", sm: 350 } }}
				/>
				<PaymentFilterDropdown
					icon={<LayersOutlinedIcon sx={{ fontSize: 15 }} />}
					value={typeFilter}
					options={typeOptions}
					onChange={onTypeChange}
				/>
				<PaymentFilterDropdown
					icon={<AccountBalanceWalletOutlinedIcon sx={{ fontSize: 15 }} />}
					value={walletFilter}
					options={walletFilterOptions}
					onChange={onWalletChange}
					width={210}
				/>
			</Box>
		</>
	);
};

export default PaymentHeader;
