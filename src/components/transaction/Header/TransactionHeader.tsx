import React from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, FormControl, Typography } from "@mui/material";
import PartnerAutocomplete from "components/shared/Autocomplete/PartnerAutocomplete";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { translate } from "i18n/i18n";
import { Partner } from "models/partner";

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
			{mode === "Sale"
				? translate("transactions.salesHeader")
				: translate("transactions.suppliesHeader")}
			({titleCount})
		</Typography>
		<Box display="flex" alignItems="center" flexWrap="wrap" sx={{ gap: 2 }}>
			<SearchInput
				value={searchTerm}
				onChange={onSearch}
				placeholder={
					mode === "Sale"
						? translate("transactions.searchSales")
						: translate("transactions.searchSupplies")
				}
			/>
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

export default TransactionHeader;
