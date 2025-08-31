import React from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, FormControl, MenuItem, TextField, Typography } from "@mui/material";
import PartnerAutocomplete from "components/partner/Autocomplete/PartnerAutocomplete";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { translate } from "i18n/i18n";
import { Partner } from "models/partner";
import { PaymentDirection } from "models/payment";

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
}) => (
	<Box
		display="flex"
		flexWrap="wrap"
		justifyContent="space-between"
		alignItems="center"
		mb={3}
		sx={{ gap: 2 }}
	>
		<Typography variant="h5">
			{translate("payment.headerTitle")}({titleCount})
		</Typography>
		<Box display="flex" alignItems="center" flexWrap="wrap" sx={{ gap: 2 }}>
			<SearchInput
				value={searchTerm}
				onChange={onSearch}
				placeholder={translate("payment.searchPayments")}
			/>
			<TextField
				select
				size="small"
				margin="dense"
				sx={{ minWidth: 250 }}
				label={translate("payment.direction")}
				value={selectedDirection ?? "all"}
				onChange={(e) => {
					const value = e.target.value;
					onDirectionChange(value === "all" ? null : (value as PaymentDirection));
				}}
			>
				<MenuItem value="all">{translate("payment.direction.All")}</MenuItem>
				{PAYMENT_DIRECTIONS.map((d) => (
					<MenuItem key={d} value={d}>
						{translate(`payment.direction.${d}`)}
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
				{translate("add")}
			</PrimaryButton>
		</Box>
	</Box>
);

export default PaymentHeader;
