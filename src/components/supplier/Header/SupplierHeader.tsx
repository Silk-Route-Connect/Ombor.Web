import React from "react";
import AddIcon from "@mui/icons-material/Add";
import { Box, Typography } from "@mui/material";
import { PrimaryButton } from "components/shared/PrimaryButton/PrimaryButton";
import { SearchInput } from "components/shared/SearchInput/SearchInput";
import { translate } from "i18n/i18n";

interface SupplierHeaderProps {
	searchValue: string;
	onSearch: (value: string) => void;
	onCreate: () => void;
}

const SupplierHeader: React.FC<SupplierHeaderProps> = ({ searchValue, onSearch, onCreate }) => (
	<Box
		display="flex"
		flexWrap="wrap"
		justifyContent="space-between"
		alignItems="center"
		mb={3}
		sx={{ gap: 2 }}
	>
		<Typography variant="h5">{translate("suppliers")}</Typography>
		<Box display="flex" alignItems="center" flexWrap="wrap" sx={{ gap: 2 }}>
			<SearchInput
				value={searchValue}
				onChange={onSearch}
				placeholder={translate("searchSuppliersPlaceholder")}
			/>
			<PrimaryButton icon={<AddIcon />} onClick={onCreate}>
				{translate("addSupplier")}
			</PrimaryButton>
		</Box>
	</Box>
);

export default SupplierHeader;
