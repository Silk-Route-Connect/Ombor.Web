import React from "react";
import { useTranslation } from "react-i18next";
import PartnerAutocomplete from "components/partner/Autocomplete/PartnerAutocomplete";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { Partner } from "models/partner";
import { PaymentDirection } from "models/payment";

import AddIcon from "@mui/icons-material/Add";
import { Box, FormControl, MenuItem, TextField, Typography } from "@mui/material";

const PAYMENT_DIRECTIONS: PaymentDirection[] = ["Income", "Expense"];

interface PaymentHeaderProps {
	titleCount: number;
	selectedDirection: PaymentDirection | null;
	selectedPartner: Partner | null;
	searchTerm: string;
	onSearch: (value: string) => void;
	onDirectionChange: (value: PaymentDirection | null) => void;
	onPartnerChange: (value: Partner | null) => void;
	onCreate: () => void;
}

const PaymentHeader: React.FC<PaymentHeaderProps> = ({
	titleCount,
	selectedDirection,
	selectedPartner,
	searchTerm,
	onSearch,
	onDirectionChange,
	onPartnerChange,
	onCreate,
}) => {
	const { t } = useTranslation();

	return (
		<Box
			display="flex"
			flexWrap="wrap"
			justifyContent="space-between"
			alignItems="center"
			mb={3}
			sx={{ gap: 2 }}
		>
			<Typography variant="h5">
				{t("payment.headerTitle")}({titleCount})
			</Typography>
			<Box display="flex" alignItems="center" flexWrap="wrap" sx={{ gap: 2 }}>
				<SearchInput
					value={searchTerm}
					onChange={onSearch}
					placeholder={t("payment.searchPayments")}
				/>
				<TextField
					select
					size="small"
					margin="dense"
					sx={{ minWidth: 250 }}
					label={t("payment.direction")}
					value={selectedDirection ?? "all"}
					onChange={(e) => {
						const value = e.target.value;
						onDirectionChange(value === "all" ? null : (value as PaymentDirection));
					}}
				>
					<MenuItem value="all">{t("payment.direction.All")}</MenuItem>
					{PAYMENT_DIRECTIONS.map((d) => (
						<MenuItem key={d} value={d}>
							{t(`payment.direction.${d}`)}
						</MenuItem>
					))}
				</TextField>
				<FormControl size="small" margin="dense" sx={{ minWidth: 250 }}>
					<PartnerAutocomplete
						value={selectedPartner}
						type="Supplier"
						size="small"
						onChange={onPartnerChange}
					/>
				</FormControl>
				<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
					{t("add")}
				</PrimaryButton>
			</Box>
		</Box>
	);
};

export default PaymentHeader;
