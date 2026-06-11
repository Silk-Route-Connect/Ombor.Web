import React from "react";
import { useTranslation } from "react-i18next";
import PartnerAutocomplete from "components/partner/Autocomplete/PartnerAutocomplete";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { Partner } from "models/partner";

import AddIcon from "@mui/icons-material/Add";
import { Box, FormControl, Typography } from "@mui/material";

interface TransactionHeaderProps {
	mode: "Sale" | "Supply";
	titleCount: number;
	selectedPartner: Partner | null;
	searchTerm: string;
	onSearch: (value: string) => void;
	onPartnerChange: (value: Partner | null) => void;
	onCreate: () => void;
}

const TransactionHeader: React.FC<TransactionHeaderProps> = ({
	mode,
	titleCount,
	selectedPartner,
	searchTerm,
	onSearch,
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
				{mode === "Sale" ? t("transactions.salesHeader") : t("transactions.suppliesHeader")}(
				{titleCount})
			</Typography>
			<Box display="flex" alignItems="center" flexWrap="wrap" sx={{ gap: 2 }}>
				<SearchInput
					value={searchTerm}
					onChange={onSearch}
					placeholder={
						mode === "Sale" ? t("transactions.searchSales") : t("transactions.searchSupplies")
					}
				/>
				<FormControl size="small" margin="dense" sx={{ minWidth: 250 }}>
					<PartnerAutocomplete
						value={selectedPartner}
						type={mode === "Sale" ? "Customer" : "Supplier"}
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

export default TransactionHeader;
